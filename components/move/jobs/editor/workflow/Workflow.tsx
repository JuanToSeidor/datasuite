"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { createUUID, DEFAULT_EDGE_MARKER, useJobsStore } from "@/components/move/jobs/JobsStore";
import { orderNodes } from "@/lib/move/jobs/utils";
import { areArraysEqualForSelectedKeys } from "@/lib/move/jobs/compare";
import type {
  TEdgeWorkflow,
  TExecution,
  TExtractionNode,
  TExtractionNodesJobInput,
  TJob,
  TJobInput,
  TNodeWorkflow,
  TNodesAddOrDelete,
  TOrderedNode,
} from "@/lib/move/jobs/types";
import type { TPermissionsJob } from "../permissions";
import ExtractorNodeFlow from "./ExtractorNodeFlow";
import StartNodeFlow from "./StartNodeFlow";
import ModalConfigExtractionNode from "./ModalConfigExtractionNode";
import CompletedExecution from "./CompletedExecution";
import TriggersConfig from "./TriggersConfig";
import { ExecutionActiveContext } from "./ExecutionContext";
import { useEditorPreferences } from "../EditorPreferences";

interface WorkflowProps {
  extractionNodes: TExtractionNode[];
  job: TJob;
  handleUpdateWorkflow: (data: TExtractionNodesJobInput) => void;
  handleUpdateJob: (jobId: string, data: TJobInput) => void;
  handleRunJob: (jobId: string) => void;
  isStartingJob: boolean;
  isValidWorkflow: boolean;
  setIsValidWorkflow: (isValid: boolean) => void;
  isEqualWorkflow: boolean;
  setIsEqualWorkflow: (isEqual: boolean) => void;
  permissionsJobs: TPermissionsJob;
  executionActive: TExecution | null;
  handleCancelExecution: (executionId: string) => void;
  /** Cierra el resumen de una ejecución terminada (descarta la ejecución activa). */
  handleCloseCompletedExecution: () => void;
  /** Estado y toggle del panel lateral del editor (botón de la barra de herramientas). */
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  isTriggersOpen: boolean;
  onTriggersOpenChange: (isOpen: boolean) => void;
}

/** Monitor de Move (mismo destino que el ítem "Monitor" del sidebar de Move en config/suite.ts). */
const MONITOR_HREF = "/move/activity";

/** Botón con borde visible: el reset de caralstable anula el borde de `hasBorder` en ghost. */
const OUTLINE_BUTTON_CLASS =
  "border! border-neutral-800! text-neutral-900 cursor-pointer disabled:bg-transparent! disabled:opacity-40 disabled:cursor-not-allowed";

// Tipos de nodo del workflow
const nodeTypes = {
  extractorNodeFlow: ExtractorNodeFlow,
  startNodeFlow: StartNodeFlow,
} as unknown as NodeTypes;

const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: DEFAULT_EDGE_MARKER.color,
  width: DEFAULT_EDGE_MARKER.width,
  height: DEFAULT_EDGE_MARKER.height,
};

/**
 * Arma el nodo con sus variables: las que expone el nodo de extracción (array u objeto con
 * valores por defecto) más los valores ya guardados en el job, que tienen prioridad.
 * En datasync se leían de `transformation_config.source` (variables y filtros `@var`).
 */
const buildNodeWithVariables = (
  node: TNodeWorkflow,
  extractionNodes: TExtractionNode[],
  job: TJob,
  invalidNodes: string[]
): TNodeWorkflow => {
  const extractionNode = extractionNodes.find((n) => n.extraction_node_id === node?.data?.extractionNodeId);
  const isValid = !invalidNodes.includes(node?.data?.extractionNodeId);
  const nodeVariables: string[] = [];
  const variableValues: Record<string, string> = {};

  if (extractionNode) {
    const rawVars = extractionNode.variables as unknown;
    if (Array.isArray(rawVars)) {
      rawVars.forEach((key: string) => {
        if (!nodeVariables.includes(key)) {
          nodeVariables.push(key);
          variableValues[key] = "";
        }
      });
    } else if (rawVars && typeof rawVars === "object") {
      Object.entries(rawVars as Record<string, unknown>).forEach(([key, val]) => {
        if (!nodeVariables.includes(key)) {
          nodeVariables.push(key);
          variableValues[key] = typeof val === "string" ? val : "";
        }
      });
    }
    if (node?.data?.variableValues) {
      Object.assign(variableValues, node.data.variableValues);
    }
  }

  return {
    ...node,
    data: {
      ...node.data,
      isValid,
      variables: nodeVariables,
      variableValues,
      error: false,
      jobId: job.job_id,
      workspaceId: job.workspace_id,
    },
  };
};

const toNodeChange = (node: TNodeWorkflow, jobId: string): TNodesAddOrDelete => ({
  extraction_node_job_id: node.id,
  extraction_node_id: node?.data?.extractionNodeId,
  job_id: jobId,
  type: node.type ?? "",
});

/** Canvas del workflow de un job (React Flow): drag & drop, conexiones, guardado y ejecución. */
const Workflow = ({
  extractionNodes,
  job,
  handleRunJob,
  isStartingJob,
  handleUpdateWorkflow,
  isValidWorkflow,
  setIsValidWorkflow,
  isEqualWorkflow,
  setIsEqualWorkflow,
  permissionsJobs,
  executionActive,
  handleCancelExecution,
  handleCloseCompletedExecution,
  isPanelOpen,
  onTogglePanel,
  isTriggersOpen,
  onTriggersOpenChange,
}: WorkflowProps) => {
  const { t } = useLanguage();
  const { notify } = useJobsStore();
  const [initialNodesCopy, setInitialNodesCopy] = useState<TNodeWorkflow[]>([]);
  const [initialEdgesCopy, setInitialEdgesCopy] = useState<TEdgeWorkflow[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<TNodeWorkflow>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<TEdgeWorkflow>([]);
  const reactFlow = useReactFlow<TNodeWorkflow, TEdgeWorkflow>();
  const [openIdNode, setOpenIdNode] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  // El aviso de cambios sin guardar se puede cerrar; vuelve a aparecer en la próxima edición.
  const [isUnsavedDismissed, setIsUnsavedDismissed] = useState(false);
  // El botón de colapsar/ampliar el panel va del mismo lado que la barra lateral.
  const isSidebarRight = useEditorPreferences().preferences.sidebarPosition === "right";

  const isExecuting = executionActive?.status === "running" || executionActive?.status === "initiated";
  const isEditable = !isExecuting;

  /** Valida que los nodos de extracción usados estén habilitados; devuelve los ids inválidos. */
  const handleValidateNodesInWorkflow = useCallback(
    (workflowNodes: TNodeWorkflow[], extNodes: TExtractionNode[]) => {
      const idsNodesValid = extNodes.filter((node) => node.status === "enabled").map((node) => node.extraction_node_id);
      const invalidNodes = (workflowNodes ?? [])
        .filter((node) => node.type === "extractorNodeFlow")
        .map((node) => node.data.extractionNodeId)
        .filter((id) => !idsNodesValid.includes(id));
      setIsValidWorkflow(invalidNodes.length === 0);
      return invalidNodes;
    },
    [setIsValidWorkflow]
  );

  // Carga inicial del workflow guardado del job (sincroniza el canvas con el store, como en datasync).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const invalidNodes = handleValidateNodesInWorkflow(job?.workflow_detail?.nodes, extractionNodes);
    if (invalidNodes.length > 0) notify("danger", t("moveJobsEditor.workflow.canvas.invalidNodes"));
    else notify("success", t("moveJobsEditor.workflow.canvas.validNodes"));

    const initialNodes =
      job?.workflow_detail?.nodes?.map((node) => buildNodeWithVariables(node, extractionNodes, job, invalidNodes)) || [];
    setNodes(initialNodes);
    setInitialNodesCopy(initialNodes);

    const initialEdges = (job.workflow_detail?.edges ?? []).map((edge) => ({ ...edge, markerEnd: { ...EDGE_MARKER } }));
    setEdges(initialEdges);
    setInitialEdgesCopy(initialEdges);
    // Igual que en datasync: solo se re-sincroniza si cambian los nodos de extracción disponibles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractionNodes]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /** Quita un nodo del canvas junto con sus conexiones. */
  const handleDeleteWorkflow = (nodeId: string | null) => {
    if (!nodeId) return;
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodeId(null);
    setOpenIdNode("");
  };

  /** Valida y guarda el workflow: calcula el orden de ejecución y el diff de nodos agregados/eliminados. */
  const handleSaveWorkflow = (currentNodes: TNodeWorkflow[], currentEdges: TEdgeWorkflow[]) => {
    const invalidNodes = handleValidateNodesInWorkflow(currentNodes, extractionNodes);
    const hasStartNode = currentNodes.find((node) => node.type === "startNodeFlow");

    if (currentNodes.length === 0) {
      notify("danger", t("moveJobsEditor.workflow.canvas.noNodes"));
      return;
    }
    if (!hasStartNode) {
      notify("danger", t("moveJobsEditor.workflow.canvas.noHomeNode"));
      return;
    }
    if (currentEdges.length === 0) {
      notify("danger", t("moveJobsEditor.workflow.canvas.noStartConnection"));
      return;
    }
    // Nodos sin conexión de entrada. (datasync comparaba `nodes.length - 1 > edges.length`, que deja
    // pasar nodos sueltos cuando otro nodo tiene varias entradas; aquí se revisa nodo por nodo.)
    const noConnected = new Set(
      currentNodes
        .filter((node) => node.type !== "startNodeFlow" && !currentEdges.find((edge) => edge.target === node.id))
        .map((node) => node.id)
    );
    if (noConnected.size > 0) {
      notify("danger", t("moveJobsEditor.workflow.canvas.noConnections"));
      // Marca con error los nodos sin conexión de entrada.
      setNodes((nds) => nds.map((node) => (noConnected.has(node.id) ? { ...node, data: { ...node.data, error: true } } : node)));
      return;
    }

    let orderedNodes: TOrderedNode[][];
    try {
      orderedNodes = orderNodes(currentEdges, currentNodes);
    } catch {
      notify("danger", t("moveJobsEditor.workflow.canvas.saveError"));
      return;
    }

    const workflow_detail = {
      orderedNodes,
      edges: currentEdges,
      nodes: currentNodes,
      config: { ...job?.workflow_detail?.config },
    };
    const addNodes = currentNodes
      .filter((node) => !initialNodesCopy.find((initialNode) => initialNode.id === node.id))
      .map((node) => toNodeChange(node, job.job_id));
    const nodesIds = currentNodes.map((node) => node.id);
    const deleteNodes = initialNodesCopy
      .filter((initialNode) => !nodesIds.includes(initialNode.id))
      .map((node) => toNodeChange(node, job.job_id));

    try {
      handleUpdateWorkflow({
        nodes_add: addNodes,
        nodes_delete: deleteNodes,
        workflow_detail,
        job_id: job.job_id,
      });
      setInitialNodesCopy(currentNodes);
      setInitialEdgesCopy(currentEdges);
      // Si no hay nodos inválidos, el workflow queda habilitado para ejecutarse.
      if (currentNodes.filter((node) => invalidNodes.includes(node?.data?.extractionNodeId)).length === 0) {
        setIsValidWorkflow(true);
      }
      setIsEqualWorkflow(true);
    } catch {
      notify("danger", t("moveJobsEditor.workflow.canvas.saveError"));
    }
  };

  /** Soltar un nodo de la librería en el canvas. */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!isEditable) return;
      const typeNode = event.dataTransfer.getData("nodes/type");
      const position = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });

      if (typeNode === "extraction") {
        const nodeExtractionData = JSON.parse(event.dataTransfer.getData("nodes/extraction")) as TExtractionNode;
        const tempNode = {
          id: createUUID(),
          type: "extractorNodeFlow",
          position,
          data: { extractionNodeId: nodeExtractionData.extraction_node_id, label: nodeExtractionData.name },
          executionConfig: { errorDependencies: "continue_execution" },
        } as TNodeWorkflow;
        const invalidNodes = handleValidateNodesInWorkflow([...nodes, tempNode], extractionNodes);
        const nodeWithVars = buildNodeWithVariables(tempNode, extractionNodes, job, invalidNodes);
        setNodes((nds) => nds.concat(nodeWithVars));
      }

      if (typeNode === "control") {
        if (nodes.some((node) => node.type === "startNodeFlow")) {
          notify("danger", t("moveJobsEditor.workflow.canvas.oneHomeNode"));
          return;
        }
        setNodes((nds) =>
          nds.concat({ id: createUUID(), type: "startNodeFlow", position, data: {} as TNodeWorkflow["data"] })
        );
      }
    },
    [reactFlow, nodes, extractionNodes, job, isEditable, handleValidateNodesInWorkflow, setNodes, notify, t]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      // El nodo destino deja de estar marcado con error de conexión.
      setNodes((nds) =>
        nds.map((node) => (node.id === params.target ? { ...node, data: { ...node.data, error: false } } : node))
      );
    },
    [setEdges, setNodes]
  );

  /**
   * Restaura el último workflow guardado. (En datasync leía un snapshot de localStorage que se
   * escribía antes de cargar los nodos, por lo que podía vaciar el canvas.)
   */
  const onRestore = useCallback(() => {
    setNodes(initialNodesCopy);
    setEdges(initialEdgesCopy);
    setIsEqualWorkflow(true);
  }, [initialNodesCopy, initialEdgesCopy, setNodes, setEdges, setIsEqualWorkflow]);

  const handleClick: NodeMouseHandler<TNodeWorkflow> = (_event, node) => {
    if (node.type === "startNodeFlow") return;
    setOpenIdNode(node.id);
    setSelectedNodeId(node.id);
  };

  // isEqualWorkflow habilita/deshabilita guardar, restaurar, ejecutar y programar.
  useEffect(() => {
    const isEqual =
      areArraysEqualForSelectedKeys(nodes, initialNodesCopy, ["data", "id", "executionConfig", "position"]) &&
      areArraysEqualForSelectedKeys(edges, initialEdgesCopy, ["id", "source", "target"]);
    setIsEqualWorkflow(isEqual);
    if (isEqual) setIsUnsavedDismissed(false); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const isFinished =
    executionActive?.status === "completed" ||
    executionActive?.status === "failed" ||
    executionActive?.status === "cancelled" ||
    executionActive?.status === "warning";

  const panelToggle = (
    <Button
      variant={isPanelOpen ? "info" : "ghost"}
      hasBorder
      isIconButton
      iconName={isSidebarRight ? "closeSidebarLeft" : "closeSidebarRigt"}
      className={isPanelOpen ? "border! border-info-hard! cursor-pointer" : OUTLINE_BUTTON_CLASS}
      aria-pressed={isPanelOpen}
      title={isPanelOpen ? t("moveJobsEditor.workflow.canvas.closePanel") : t("moveJobsEditor.workflow.canvas.openPanel")}
      onClick={onTogglePanel}
    />
  );

  return (
    <ExecutionActiveContext.Provider value={executionActive}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col self-stretch">
        {/* Barra de herramientas del job (segunda navbar del diseño). */}
        <div className="flex shrink-0 items-center justify-between gap-2.5 bg-container-50 p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {!isSidebarRight && panelToggle}
            <h1 className="truncate font-poppins text-lg font-semibold text-seidor-main-text" title={job.name}>
              {job.name}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {!executionActive?.status && (
              <Button
                variant="ghost"
                hasBorder
                isIconButton
                iconName="sync"
                className={OUTLINE_BUTTON_CLASS}
                title={t("moveJobsEditor.workflow.canvas.restore")}
                disabled={isEqualWorkflow}
                onClick={onRestore}
              />
            )}
            {permissionsJobs?.editJob && !executionActive?.status && (
              <Button
                variant="ghost"
                hasBorder
                isIconButton
                iconName="save"
                className={OUTLINE_BUTTON_CLASS}
                title={t("moveJobsEditor.workflow.canvas.save")}
                disabled={isEqualWorkflow}
                onClick={() => handleSaveWorkflow(nodes, edges)}
              />
            )}
            {permissionsJobs?.runJob && (
              <TriggersConfig job={job} isOpen={isTriggersOpen} onOpenChange={onTriggersOpenChange} />
            )}
            <Link href={MONITOR_HREF}>
              <Button variant="ghost" hasBorder iconName="screenBar" className={OUTLINE_BUTTON_CLASS}>
                {t("moveJobsEditor.workflow.canvas.monitor")}
              </Button>
            </Link>
            {executionActive?.status && (
              <Button
                variant="danger"
                iconName="cancelExecution"
                disabled={!isValidWorkflow || !isEqualWorkflow || nodes.length === 0}
                onClick={() => handleCancelExecution(executionActive.execution_id)}
              >
                {t("moveJobsEditor.workflow.canvas.cancel")}
              </Button>
            )}
            {permissionsJobs?.runJob && (
              <Button
                variant="success"
                hasBorder
                iconName="play"
                className="cursor-pointer"
                isLoading={isStartingJob}
                disabled={
                  isStartingJob || Boolean(executionActive?.status) || !isValidWorkflow || !isEqualWorkflow || nodes.length === 0
                }
                onClick={() => {
                  if (!executionActive?.status && !isStartingJob) handleRunJob(job.job_id);
                }}
              >
                {isStartingJob ? t("moveJobsEditor.workflow.canvas.starting") : t("moveJobsEditor.workflow.canvas.startJob")}
              </Button>
            )}
            {isSidebarRight && panelToggle}
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-full">
          <ReactFlow<TNodeWorkflow, TEdgeWorkflow>
            nodes={nodes}
            edges={edges}
            onNodeClick={handleClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            defaultEdgeOptions={{ markerEnd: { ...EDGE_MARKER } }}
            edgesReconnectable={isEditable}
            edgesFocusable={isEditable}
            nodesDraggable={isEditable}
            nodesConnectable={isEditable}
            nodesFocusable={isEditable}
            elementsSelectable={isEditable}
            proOptions={{ hideAttribution: true }}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          >
            <Controls className="shadow-md" />
            <MiniMap nodeColor="var(--color-seidor-hard)" />
            {!executionActive?.status && <Background gap={12} size={1} />}

            {!isEqualWorkflow && !isUnsavedDismissed && (
              <Panel position="top-center" className="w-[min(795px,calc(100%-2rem))]">
                <div
                  role="status"
                  className="flex overflow-hidden rounded-md border! border-warning-main bg-neutral-400 font-poppins shadow-sm"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-5 py-2.5">
                    <span className="flex shrink-0 text-warning-main">
                      <CaralIcon name="triangleExclamation" size={24} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xl leading-5 font-semibold tracking-tight text-warning-main">
                        {t("moveJobsEditor.workflow.canvas.unsaved")}
                      </p>
                      <p className="text-base text-neutral-900">{t("moveJobsEditor.workflow.canvas.unsavedDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center border-l! border-warning-main px-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-warning-main! cursor-pointer"
                      onClick={() => setIsUnsavedDismissed(true)}
                    >
                      {t("moveJobsEditor.workflow.canvas.close")}
                    </Button>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Los modales van fuera de <ReactFlow> para no quedar dentro de su contexto de apilamiento. */}
      {openIdNode && (
        <ModalConfigExtractionNode
          nodes={nodes}
          setNodes={setNodes}
          openIdNode={openIdNode}
          setOpenIdNode={setOpenIdNode}
          selectedNodeId={selectedNodeId}
          handleDeleteWorkflow={handleDeleteWorkflow}
        />
      )}
      {isFinished && executionActive && (
        <CompletedExecution execution={executionActive} onClose={handleCloseCompletedExecution} />
      )}
    </ExecutionActiveContext.Provider>
  );
};

export default Workflow;
