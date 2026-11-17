/**
 * Tipos de Jobs de Move, portados de datasync (`app/types/jobs.ts`, `extractionNodesJob.ts`,
 * `executions.ts`) sin zod: en la suite no hay API, los datos vienen de `data/move/*.json`.
 * Se mantienen los nombres de campo snake_case del backend para que la lógica portada
 * (orderNodes, schedules, workflow) funcione igual.
 */
import type { Edge, Node } from "@xyflow/react";

export type TJobStatus = "enabled" | "disabled";

export interface TScheduleConfig {
  id: string;
  status: string; // "enabled" | "disabled"
  cron_expression: string;
  repeat: string;
  time_zone_client?: string;
  time_zone_server?: string;
}

export interface TNodeWorkflowData {
  extractionNodeId: string;
  label?: string;
  error?: unknown;
  isValid: boolean;
  jobId: string;
  variableValues?: Record<string, string>;
  varibles?: string[];
  [key: string]: unknown;
}

export interface TNodeWorkflowExecutionConfig {
  /** "continue_execution" | "stop_execution" */
  errorDependencies?: string;
}

export type TNodeWorkflow = Node<TNodeWorkflowData> & {
  executionConfig?: TNodeWorkflowExecutionConfig;
};

export type TEdgeWorkflow = Edge & {
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export interface TWorkflowConfig {
  stopOnError: boolean;
}

export interface TOrderedNode {
  id: string;
  extractionNodeId: string;
  type?: string;
  dependencies: string[];
  executionConfig: TNodeWorkflowExecutionConfig;
}

export interface TWorkflowDetail {
  orderedNodes: TOrderedNode[][];
  nodes: TNodeWorkflow[];
  edges: TEdgeWorkflow[];
  config: TWorkflowConfig;
}

export interface TJob {
  job_id: string;
  name: string;
  status: TJobStatus | string;
  last_execution_time: string | null;
  is_productive?: boolean;
  is_deleted: boolean;
  workspace_id: string;
  created_by: string;
  created_date: string;
  modified_by: string | null;
  modified_date: string | null;
  schedule_config: TScheduleConfig[];
  workflow_detail: TWorkflowDetail;
}

export type TJobInput = Partial<Omit<TJob, "job_id">>;

/** Alta/baja de nodos de extracción en un job al guardar el workflow. */
export interface TNodesAddOrDelete {
  extraction_node_job_id: string;
  extraction_node_id: string;
  job_id: string;
  type: string;
}

export interface TExtractionNodesJobInput {
  nodes_add: TNodesAddOrDelete[];
  nodes_delete: TNodesAddOrDelete[];
  workflow_detail: TWorkflowDetail;
  job_id: string;
}

/* ------------------------------ Ejecuciones ------------------------------ */

/** Estado global de una ejecución (mismos valores que el backend de datasync). */
export type TExecutionStatus = "initiated" | "running" | "completed" | "warning" | "failed" | "cancelled";

/** Estado de cada nodo dentro de una ejecución. */
export type TExecutionNodeStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "nodata"
  | "skipped"
  | "cancelled";

export interface TExecutionNode {
  /** id del nodo dentro del workflow */
  id: string;
  extraction_node_id: string;
  status: TExecutionNodeStatus;
  error: string | null;
  dependencies: string[];
  extraction_node_info: { name: string };
  execution_info: {
    time_start: string | null;
    time_end: string | null;
    registers: number;
  };
}

export interface TExecution {
  execution_id: string;
  job_id: string;
  creation_date: string;
  status: TExecutionStatus;
  details: {
    /** Indexado por id de nodo del workflow (como `details.nodes[id]` en datasync). */
    nodes: Record<string, TExecutionNode>;
    job: { name: string; job_id: string };
    time_end: string | null;
  };
  is_deleted: boolean;
}

/* -------------------------- Nodos de extracción -------------------------- */

/** Nodo de extracción tal como lo usa el editor (mapeado desde `data/move/nodes.json`). */
export interface TExtractionNode {
  extraction_node_id: string;
  name: string;
  status: string; // "enabled" | "disabled" | "drafted"
  origin: { name: string; type: string; brandName: string; isProduction?: boolean };
  destination: { name: string; type: string; brandName: string };
  /** Variables que el nodo expone para que el job les asigne valor (p. ej. fechas). */
  variables?: string[];
  /** Config de origen/destino/settings (solo los nodos creados desde plantilla la traen). */
  transformation_config?: unknown;
  created_by: string;
  created_date: string;
}

/* ------------------------------- Plantillas ------------------------------ */

export interface TJobTemplateNode {
  templateNodeId: string;
  source: Record<string, unknown>;
}

/** Nivel de ejecución de una plantilla: nodos en paralelo con sus dependencias (por templateNodeId). */
export interface TJobTemplateLevelNode {
  templateNodeId: string;
  workflowNodeId: string;
  dependencies: string[];
}

export interface TJobTemplate {
  name: string;
  mode: "table" | "extractor";
  type: string; // "SAP 4HANA" | "SAPABAP"
  nodes: TJobTemplateNode[];
  /** Cada job de la plantilla trae su workflow como niveles ordenados (el backend arma nodos/edges). */
  jobs: { workflow_detail: TJobTemplateLevelNode[][] }[];
}

export interface TJobPackage {
  type: string;
  mode: "table" | "extractor";
  label: string;
  templates: string[];
}
