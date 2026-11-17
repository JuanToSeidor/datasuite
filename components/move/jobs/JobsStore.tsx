"use client";

/**
 * Store mock de Jobs de Move. Reemplaza a los endpoints RTK Query de datasync
 * (`jobsApi`, `extractionNodesJobApi`, `executionsApi`) con estado local en memoria
 * sembrado desde `data/move/*.json`. Cada acción devuelve una Promise con una pequeña
 * latencia para que las vistas portadas mantengan su flujo (loading → éxito/error).
 *
 * El provider vive en `app/(suite)/move/jobs/layout.tsx`, así el estado se conserva
 * al navegar entre el asistente (`/move/jobs/new`) y el editor (`/move/jobs/editor`).
 * Se reinicia al recargar la página (es una demo).
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "caralstable";
import jobsData from "@/data/move/jobs.json";
import nodesData from "@/data/move/nodes.json";
import { orderNodes } from "@/lib/move/jobs/utils";
import type {
  TExecution,
  TExecutionNode,
  TExtractionNode,
  TExtractionNodesJobInput,
  TJob,
  TJobInput,
  TNodeWorkflow,
  TEdgeWorkflow,
  TScheduleConfig,
  TWorkflowConfig,
  TJobTemplateLevelNode,
} from "@/lib/move/jobs/types";

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

export const createUUID = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;

const LATENCY_MS = 350;
const delay = <T,>(value: T, ms = LATENCY_MS) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

/** Usuario de la demo (no hay sesión real). */
export const CURRENT_USER = "jdtorres@seidoranalytics.com";
export const CURRENT_WORKSPACE_ID = "ws-default";

/** Edge con el marcador que usa el editor de datasync. */
export const DEFAULT_EDGE_MARKER = { type: "arrowclosed", color: "#66b6ff", width: 20, height: 20 } as const;

type RawNode = (typeof nodesData)[number] & { variables?: string[] };

const toExtractionNode = (n: RawNode): TExtractionNode => ({
  extraction_node_id: n.id,
  name: n.name,
  status: n.status,
  origin: n.origin,
  destination: n.destination,
  variables: n.variables,
  created_by: n.createdBy,
  created_date: n.createdAt,
});

const withOrderedNodes = (job: TJob): TJob => {
  try {
    return {
      ...job,
      workflow_detail: {
        ...job.workflow_detail,
        orderedNodes: orderNodes(job.workflow_detail.edges, job.workflow_detail.nodes),
      },
    };
  } catch {
    return job; // sin nodo de inicio: se deja como está (el editor lo marca inválido)
  }
};

/* ------------------------------------------------------------------ */
/* Notificaciones (equivalente a react-hot-toast en datasync)          */
/* ------------------------------------------------------------------ */

type ToastVariant = "success" | "danger" | "info" | "warning";
interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
}

/* ------------------------------------------------------------------ */
/* API del store                                                       */
/* ------------------------------------------------------------------ */

export interface CreateWithTemplateInput {
  /** Nodos de extracción a crear (uno por nodo de la plantilla). */
  nodes: Array<{
    templateNodeId: string;
    name: string;
    origin: TExtractionNode["origin"];
    destination: TExtractionNode["destination"];
    transformation_config?: unknown;
  }>;
  /** Jobs a crear; su workflow viene como niveles de la plantilla. */
  jobs: Array<{ name: string; workflow_detail: TJobTemplateLevelNode[][] }>;
}

export interface JobsStore {
  jobs: TJob[];
  extractionNodes: TExtractionNode[];
  executions: TExecution[];

  getJob: (jobId: string) => TJob | undefined;
  /** Ejecución en curso (initiated/running) de un job, o la última si no hay ninguna activa. */
  getActiveExecution: (jobId: string) => TExecution | null;

  updateJob: (jobId: string, data: TJobInput) => Promise<TJob>;
  updateWorkflow: (input: TExtractionNodesJobInput) => Promise<TJob>;
  updateConfigWorkflow: (jobId: string, config: Partial<TWorkflowConfig>) => Promise<TJob>;
  deleteJob: (jobId: string) => Promise<void>;
  changeStatusJob: (jobId: string, status: "enabled" | "disabled") => Promise<TJob>;

  addSchedule: (jobId: string, schedule: TScheduleConfig) => Promise<TJob>;
  updateSchedule: (jobId: string, schedule: TScheduleConfig) => Promise<TJob>;
  deleteSchedule: (jobId: string, scheduleId: string) => Promise<TJob>;

  runJob: (jobId: string) => Promise<TExecution>;
  cancelExecution: (executionId: string) => Promise<void>;

  /** Crea nodos de extracción y jobs a partir de una plantilla. Devuelve los ids de los jobs creados. */
  createJobsWithTemplate: (input: CreateWithTemplateInput) => Promise<string[]>;

  /** Notificación tipo toast (Alert de Caral). */
  notify: (variant: ToastVariant, title: string) => void;
  /** Equivalente a `toast.promise`: muestra éxito/error según el resultado. */
  notifyPromise: <T>(
    promise: Promise<T>,
    messages: { success: string | ((value: T) => string); error: string | ((err: unknown) => string) }
  ) => Promise<T>;
}

const JobsContext = createContext<JobsStore | null>(null);

export function useJobsStore(): JobsStore {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobsStore debe usarse dentro de <JobsProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

const LEVEL_X = 320;
const LEVEL_Y = 140;

/** Arma nodos y edges del workflow a partir de los niveles de una plantilla (lo que hacía el backend). */
function buildWorkflowFromLevels(
  jobId: string,
  levels: TJobTemplateLevelNode[][],
  extractionIdByTemplateNode: Record<string, string>,
  labelByExtractionId: Record<string, string>
): { nodes: TNodeWorkflow[]; edges: TEdgeWorkflow[] } {
  const start: TNodeWorkflow = {
    id: createUUID(),
    type: "startNodeFlow",
    position: { x: 0, y: 0 },
    data: {} as TNodeWorkflow["data"],
  };
  const nodes: TNodeWorkflow[] = [start];
  const edges: TEdgeWorkflow[] = [];
  const workflowIdByTemplate: Record<string, string> = {};

  levels.forEach((level, li) => {
    level.forEach((item, i) => {
      const extractionNodeId = extractionIdByTemplateNode[item.templateNodeId];
      if (!extractionNodeId) return;
      const id = createUUID();
      workflowIdByTemplate[item.templateNodeId] = id;
      nodes.push({
        id,
        type: "extractorNodeFlow",
        position: { x: LEVEL_X * (li + 1), y: (i - (level.length - 1) / 2) * LEVEL_Y },
        data: { extractionNodeId, label: labelByExtractionId[extractionNodeId], isValid: true, jobId },
        executionConfig: { errorDependencies: "continue_execution" },
      });
      const sources = item.dependencies.length
        ? item.dependencies.map((dep) => workflowIdByTemplate[dep]).filter(Boolean)
        : [start.id];
      sources.forEach((source) =>
        edges.push({
          id: createUUID(),
          source,
          target: id,
          sourceHandle: "b",
          targetHandle: "a",
          markerEnd: { ...DEFAULT_EDGE_MARKER } as TEdgeWorkflow["markerEnd"],
        })
      );
    });
  });

  return { nodes, edges };
}

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<TJob[]>(() => (jobsData as unknown as TJob[]).map(withOrderedNodes));
  const [extractionNodes, setExtractionNodes] = useState<TExtractionNode[]>(() =>
    (nodesData as RawNode[]).map(toExtractionNode)
  );
  const [executions, setExecutions] = useState<TExecution[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Referencias para que los timers de la simulación lean el estado actual.
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});

  useEffect(() => {
    const timers = timersRef.current;
    return () => Object.values(timers).flat().forEach(clearTimeout);
  }, []);

  /* ------------------------------ Toasts ------------------------------ */

  const notify = useCallback((variant: ToastVariant, title: string) => {
    setToasts((prev) => [...prev, { id: createUUID(), variant, title }]);
  }, []);

  const notifyPromise = useCallback(
    async <T,>(
      promise: Promise<T>,
      messages: { success: string | ((value: T) => string); error: string | ((err: unknown) => string) }
    ) => {
      try {
        const value = await promise;
        notify("success", typeof messages.success === "function" ? messages.success(value) : messages.success);
        return value;
      } catch (err) {
        notify("danger", typeof messages.error === "function" ? messages.error(err) : messages.error);
        throw err;
      }
    },
    [notify]
  );

  /* ------------------------------ Jobs ------------------------------- */

  const getJob = useCallback((jobId: string) => jobs.find((j) => j.job_id === jobId && !j.is_deleted), [jobs]);

  /** Aplica un cambio a un job y devuelve el job resultante (rechaza si no existe). */
  const patchJob = useCallback((jobId: string, updater: (job: TJob) => TJob): Promise<TJob> => {
    const current = jobsRef.current.find((j) => j.job_id === jobId);
    if (!current) return Promise.reject(new Error("Job not found"));
    const next = updater(current);
    setJobs((prev) => prev.map((j) => (j.job_id === jobId ? next : j)));
    return delay(next);
  }, []);

  const updateJob = useCallback(
    (jobId: string, data: TJobInput) =>
      patchJob(jobId, (job) =>
        withOrderedNodes({ ...job, ...data, modified_by: CURRENT_USER, modified_date: new Date().toISOString() } as TJob)
      ),
    [patchJob]
  );

  const updateWorkflow = useCallback(
    (input: TExtractionNodesJobInput) =>
      patchJob(input.job_id, (job) =>
        withOrderedNodes({
          ...job,
          workflow_detail: input.workflow_detail,
          modified_by: CURRENT_USER,
          modified_date: new Date().toISOString(),
        })
      ),
    [patchJob]
  );

  const updateConfigWorkflow = useCallback(
    (jobId: string, config: Partial<TWorkflowConfig>) =>
      patchJob(jobId, (job) => ({
        ...job,
        workflow_detail: { ...job.workflow_detail, config: { ...job.workflow_detail.config, ...config } },
      })),
    [patchJob]
  );

  const deleteJob = useCallback(
    async (jobId: string) => {
      await patchJob(jobId, (job) => ({ ...job, is_deleted: true }));
    },
    [patchJob]
  );

  const changeStatusJob = useCallback(
    (jobId: string, status: "enabled" | "disabled") => patchJob(jobId, (job) => ({ ...job, status })),
    [patchJob]
  );

  /* ---------------------------- Schedules ---------------------------- */

  const addSchedule = useCallback(
    (jobId: string, schedule: TScheduleConfig) =>
      patchJob(jobId, (job) => ({ ...job, schedule_config: [...(job.schedule_config ?? []), schedule] })),
    [patchJob]
  );

  const updateSchedule = useCallback(
    (jobId: string, schedule: TScheduleConfig) =>
      patchJob(jobId, (job) => ({
        ...job,
        schedule_config: job.schedule_config.map((s) => (s.id === schedule.id ? schedule : s)),
      })),
    [patchJob]
  );

  const deleteSchedule = useCallback(
    (jobId: string, scheduleId: string) =>
      patchJob(jobId, (job) => ({ ...job, schedule_config: job.schedule_config.filter((s) => s.id !== scheduleId) })),
    [patchJob]
  );

  /* ---------------------------- Ejecuciones ---------------------------- */

  const updateExecution = useCallback((executionId: string, updater: (e: TExecution) => TExecution) => {
    setExecutions((prev) => prev.map((e) => (e.execution_id === executionId ? updater(e) : e)));
  }, []);

  /**
   * Simula la ejecución recorriendo `orderedNodes` por niveles: cada nivel corre en paralelo
   * unos segundos y termina en completed (o nodata/failed al azar para dar variedad).
   */
  const runJob = useCallback(
    async (jobId: string) => {
      const job = jobsRef.current.find((j) => j.job_id === jobId);
      if (!job) throw new Error("Job not found");
      const levels = withOrderedNodes(job).workflow_detail.orderedNodes;
      if (!levels.length) throw new Error("Workflow without nodes");

      const now = new Date().toISOString();
      const executionId = createUUID();
      const nodes: Record<string, TExecutionNode> = {};
      levels.flat().forEach((n) => {
        const extraction = extractionNodes.find((x) => x.extraction_node_id === n.extractionNodeId);
        nodes[n.id] = {
          id: n.id,
          extraction_node_id: n.extractionNodeId,
          status: "pending",
          error: null,
          dependencies: n.dependencies,
          extraction_node_info: { name: extraction?.name ?? n.extractionNodeId },
          execution_info: { time_start: null, time_end: null, registers: 0 },
        };
      });

      const execution: TExecution = {
        execution_id: executionId,
        job_id: jobId,
        creation_date: now,
        status: "initiated",
        details: { nodes, job: { name: job.name, job_id: jobId }, time_end: null },
        is_deleted: false,
      };
      setExecutions((prev) => [...prev, execution]);

      const timers: ReturnType<typeof setTimeout>[] = [];
      const STEP = 2500;
      let hadFailure = false;

      levels.forEach((level, li) => {
        // Inicio del nivel
        timers.push(
          setTimeout(() => {
            updateExecution(executionId, (e) => {
              const next = { ...e, status: "running" as const, details: { ...e.details, nodes: { ...e.details.nodes } } };
              level.forEach((n) => {
                next.details.nodes[n.id] = {
                  ...next.details.nodes[n.id],
                  status: "running",
                  execution_info: { ...next.details.nodes[n.id].execution_info, time_start: new Date().toISOString() },
                };
              });
              return next;
            });
          }, 600 + li * STEP)
        );
        // Fin del nivel
        timers.push(
          setTimeout(() => {
            updateExecution(executionId, (e) => {
              const next = { ...e, details: { ...e.details, nodes: { ...e.details.nodes } } };
              level.forEach((n) => {
                const roll = Math.random();
                const status = roll < 0.08 ? "failed" : roll < 0.15 ? "nodata" : "completed";
                if (status === "failed") hadFailure = true;
                next.details.nodes[n.id] = {
                  ...next.details.nodes[n.id],
                  status,
                  error: status === "failed" ? "Timeout reading source table" : null,
                  execution_info: {
                    ...next.details.nodes[n.id].execution_info,
                    time_end: new Date().toISOString(),
                    registers: status === "completed" ? Math.floor(5_000 + Math.random() * 250_000) : 0,
                  },
                };
              });
              return next;
            });
          }, 600 + li * STEP + STEP - 200)
        );
      });

      // Cierre de la ejecución
      timers.push(
        setTimeout(() => {
          const end = new Date().toISOString();
          updateExecution(executionId, (e) => ({
            ...e,
            status: hadFailure ? "warning" : "completed",
            details: { ...e.details, time_end: end },
          }));
          setJobs((prev) => prev.map((j) => (j.job_id === jobId ? { ...j, last_execution_time: end } : j)));
          delete timersRef.current[executionId];
        }, 600 + levels.length * STEP)
      );

      timersRef.current[executionId] = timers;
      return delay(execution, 200);
    },
    [extractionNodes, updateExecution]
  );

  const cancelExecution = useCallback(
    async (executionId: string) => {
      (timersRef.current[executionId] ?? []).forEach(clearTimeout);
      delete timersRef.current[executionId];
      const end = new Date().toISOString();
      updateExecution(executionId, (e) => {
        const nodes = { ...e.details.nodes };
        Object.keys(nodes).forEach((id) => {
          if (nodes[id].status === "pending" || nodes[id].status === "running") {
            nodes[id] = { ...nodes[id], status: "cancelled" };
          }
        });
        return { ...e, status: "cancelled", details: { ...e.details, nodes, time_end: end } };
      });
      await delay(undefined);
    },
    [updateExecution]
  );

  const getActiveExecution = useCallback(
    (jobId: string) => {
      const jobExecutions = executions.filter((e) => e.job_id === jobId);
      return (
        jobExecutions.find((e) => e.status === "initiated" || e.status === "running") ??
        jobExecutions[jobExecutions.length - 1] ??
        null
      );
    },
    [executions]
  );

  /* ---------------------------- Plantillas ---------------------------- */

  const createJobsWithTemplate = useCallback(async (input: CreateWithTemplateInput) => {
    const now = new Date().toISOString();
    const extractionIdByTemplateNode: Record<string, string> = {};
    const labelByExtractionId: Record<string, string> = {};
    const newNodes: TExtractionNode[] = input.nodes.map((n) => {
      const id = createUUID();
      extractionIdByTemplateNode[n.templateNodeId] = id;
      labelByExtractionId[id] = n.name;
      return {
        extraction_node_id: id,
        name: n.name,
        status: "enabled",
        origin: n.origin,
        destination: n.destination,
        transformation_config: n.transformation_config,
        created_by: CURRENT_USER,
        created_date: now,
      };
    });

    const newJobs: TJob[] = input.jobs.map((j) => {
      const jobId = createUUID();
      const { nodes, edges } = buildWorkflowFromLevels(jobId, j.workflow_detail, extractionIdByTemplateNode, labelByExtractionId);
      return withOrderedNodes({
        job_id: jobId,
        name: j.name,
        status: "enabled",
        last_execution_time: null,
        is_productive: false,
        is_deleted: false,
        workspace_id: CURRENT_WORKSPACE_ID,
        created_by: CURRENT_USER,
        created_date: now,
        modified_by: null,
        modified_date: null,
        schedule_config: [],
        workflow_detail: { orderedNodes: [], nodes, edges, config: { stopOnError: false } },
      });
    });

    setExtractionNodes((prev) => [...prev, ...newNodes]);
    setJobs((prev) => [...prev, ...newJobs]);
    return delay(newJobs.map((j) => j.job_id), 700);
  }, []);

  const value = useMemo<JobsStore>(
    () => ({
      jobs: jobs.filter((j) => !j.is_deleted),
      extractionNodes,
      executions,
      getJob,
      getActiveExecution,
      updateJob,
      updateWorkflow,
      updateConfigWorkflow,
      deleteJob,
      changeStatusJob,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      runJob,
      cancelExecution,
      createJobsWithTemplate,
      notify,
      notifyPromise,
    }),
    [
      jobs,
      extractionNodes,
      executions,
      getJob,
      getActiveExecution,
      updateJob,
      updateWorkflow,
      updateConfigWorkflow,
      deleteJob,
      changeStatusJob,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      runJob,
      cancelExecution,
      createJobsWithTemplate,
      notify,
      notifyPromise,
    ]
  );

  return (
    <JobsContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          type="toast"
          position="top-right"
          variant={toast.variant}
          title={toast.title}
          autoClose={3000}
          onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}
    </JobsContext.Provider>
  );
}
