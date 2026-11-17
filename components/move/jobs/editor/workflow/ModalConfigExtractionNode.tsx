"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, Tabs } from "caralstable";
import { Brand, type CaralBrandName } from "@/components/icons";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJobsStore } from "@/components/move/jobs/JobsStore";
import type { TExtractionNode, TNodeWorkflow } from "@/lib/move/jobs/types";
import WidgetStatus from "../WidgetStatus";
import ConfirmDeleteNode from "./ConfirmDeleteNode";

interface ModalConfigExtractionNodeProps {
  openIdNode: string;
  nodes: TNodeWorkflow[];
  setOpenIdNode: (id: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<TNodeWorkflow[]>>;
  selectedNodeId: string | null;
  handleDeleteWorkflow: (id: string | null) => void;
}

/** Equivalente local de `ConnectionsView` de datasync: origen y destino del nodo de extracción. */
function ConnectionsView({ node }: { node: TExtractionNode }) {
  const { t } = useLanguage();
  const items = [
    { label: t("moveJobsEditor.workflow.modal.origin"), conn: node.origin },
    { label: t("moveJobsEditor.workflow.modal.destination"), conn: node.destination },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {items.map(({ label, conn }) => (
        <div key={label} className="flex items-center gap-3 rounded-lg border! border-neutral-300 p-2.5">
          <Brand name={conn.brandName as CaralBrandName} size={32} />
          <div className="flex min-w-0 flex-col">
            <p className="font-poppins text-xs text-neutral-800">{label}</p>
            <p className="truncate font-poppins text-sm font-semibold text-neutral-900">{conn.name}</p>
            <p className="font-poppins text-xs text-neutral-800">{conn.type}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

type TabId = "info" | "configuration" | "variables";

/** Modal de configuración de un nodo del workflow: info, nombre/escucha de errores y variables. */
const ModalConfigExtractionNode = ({
  openIdNode,
  nodes,
  setOpenIdNode,
  setNodes,
  selectedNodeId,
  handleDeleteWorkflow,
}: ModalConfigExtractionNodeProps) => {
  const { t } = useLanguage();
  const { extractionNodes, notify } = useJobsStore();
  const nodeWorkflowData = nodes?.find((node) => node.id === openIdNode);
  const extractionNodeData = extractionNodes.find(
    (n) => n.extraction_node_id === nodeWorkflowData?.data?.extractionNodeId
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const nodeVariables = (nodeWorkflowData?.data?.variables as string[] | undefined) ?? [];
  const variablesExist = nodeVariables.length > 0;
  const tabIds: TabId[] = variablesExist ? ["info", "configuration", "variables"] : ["info", "configuration"];
  const [tab, setTab] = useState<TabId>("info");

  const [value, setValue] = useState<string>(
    nodeWorkflowData?.executionConfig?.errorDependencies || "continue_execution"
  );
  const [nameNode, setNameNode] = useState(nodeWorkflowData?.data?.label);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    nodeWorkflowData?.data?.variableValues || {}
  );
  const nodeId = nodeWorkflowData?.id;

  // Cada cambio de nombre, escucha de error o variables se refleja en el nodo del canvas.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...node.data, label: nameNode, variableValues },
              executionConfig: { ...node.executionConfig, errorDependencies: value },
            }
          : node
      )
    );
  }, [value, nameNode, variableValues, nodeId, setNodes]);

  const handleSaveConfigNode = (id: string, newValue: string) => {
    setValue(newValue);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: { ...node.data, label: nameNode, variableValues },
              executionConfig: { ...node.executionConfig, errorDependencies: newValue },
            }
          : node
      )
    );
  };

  const handleSaveVariable = (variable: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                variableValues: { ...(node?.data?.variableValues || {}), [variable]: variableValues[variable] || "" },
              },
            }
          : node
      )
    );
    notify("success", t("moveJobsEditor.workflow.modal.variableSaved").replace("{variable}", variable));
  };

  if (!nodeWorkflowData) return null;

  return (
    <>
      <Modal
        isOpen={Boolean(openIdNode)}
        onClose={() => setOpenIdNode("")}
        title={nodeWorkflowData?.data?.label ?? ""}
        iconName="cube"
        chipVariant="info"
        actions={selectedNodeId ? "double" : "single"}
        secondaryActionText={t("moveJobsEditor.common.close")}
        onSecondaryAction={() => setOpenIdNode("")}
        primaryActionText={selectedNodeId ? t("moveJobsEditor.common.delete") : t("moveJobsEditor.common.close")}
        primaryActionVariant={selectedNodeId ? "danger" : "light"}
        onPrimaryAction={() => (selectedNodeId ? setIsDeleteModalOpen(true) : setOpenIdNode(""))}
        className="max-w-[560px]!"
      >
        <div className="flex flex-col gap-4">
          <Tabs
            className="w-fit"
            tabs={tabIds.map((id) => ({ label: t(`moveJobsEditor.workflow.modal.${id}`) }))}
            activeIndex={Math.max(0, tabIds.indexOf(tab))}
            onChange={(index) => setTab(tabIds[index])}
          />
          {tab === "configuration" ? (
            <div className="flex flex-col gap-2.5">
              <Input
                label={t("moveJobsEditor.workflow.modal.nodeName")}
                maxLength={50}
                defaultValue={nodeWorkflowData?.data?.label}
                onChange={(e) => setNameNode(e.currentTarget.value)}
                onBlur={() => handleSaveConfigNode(nodeWorkflowData.id, value)}
              />
              <div className="flex w-full flex-col gap-1.5">
                <h4 className="font-poppins text-sm font-semibold text-neutral-900">
                  {t("moveJobsEditor.workflow.modal.errorListeners")}
                </h4>
                <p className="font-poppins text-xs text-neutral-800">
                  {t("moveJobsEditor.workflow.modal.errorListenersDesc")}
                </p>
                <Select
                  defaultValue={value}
                  onValueChange={(val) => handleSaveConfigNode(nodeWorkflowData.id, String(val))}
                  options={[
                    { value: "continue_execution", label: t("moveJobsEditor.workflow.modal.continueExecution") },
                    { value: "cancel_execution", label: t("moveJobsEditor.workflow.modal.cancelExecution") },
                  ]}
                />
              </div>
            </div>
          ) : tab === "variables" ? (
            <div className="flex flex-col gap-4">
              {nodeVariables.length > 0 ? (
                nodeVariables.map((variable) => (
                  <div key={variable} className="flex items-end gap-2">
                    <Input
                      label={`@${variable}`}
                      value={variableValues[variable] || ""}
                      onChange={(e) => setVariableValues({ ...variableValues, [variable]: e.currentTarget.value })}
                      placeholder={t("moveJobsEditor.workflow.modal.enterValue").replace("{variable}", variable)}
                    />
                    <Button
                      variant="ghost"
                      isIconButton
                      iconName="check"
                      aria-label={t("moveJobsEditor.workflow.modal.variables")}
                      onClick={() => handleSaveVariable(variable)}
                    />
                  </div>
                ))
              ) : (
                <p className="font-poppins text-sm text-neutral-800">{t("moveJobsEditor.workflow.modal.noVariables")}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start gap-1">
                <WidgetStatus status={extractionNodeData?.status} />
                <p className="font-poppins text-xs text-neutral-800">
                  {t("moveJobsEditor.workflow.modal.idLabel").replace("{id}", extractionNodeData?.extraction_node_id ?? "")}
                </p>
              </div>
              {extractionNodeData && <ConnectionsView node={extractionNodeData} />}
            </div>
          )}
        </div>
      </Modal>
      <ConfirmDeleteNode
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        handleDeleteWorkflow={handleDeleteWorkflow}
        selectedNodeId={selectedNodeId}
      />
    </>
  );
};

export default ModalConfigExtractionNode;
