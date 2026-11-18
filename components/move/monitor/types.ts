import type { JobEndpoint, JobNodeIssue, JobNodeStatus, RunningJob } from "@/components/move/overview/types";

export type MonitorFrequency = "daily" | "weekly" | "monthly";

/** Nodo tal como viene del mock: `pending` solo aparece en ejecuciones aún no lanzadas. */
export interface MonitorNodeData {
  id: string;
  name: string;
  progress: number;
  status: JobNodeStatus | "pending";
  source: JobEndpoint;
  destination: JobEndpoint;
  /** Segundos desde el inicio del job hasta que arrancó el nodo. */
  startOffsetSeconds: number;
  elapsedSeconds: number;
  records: number;
  issue?: JobNodeIssue;
}

export interface MonitorExecutionData {
  id: string;
  name: string;
  /** Hora programada (HH:mm) del día de hoy. */
  time: string;
  frequency: MonitorFrequency;
  /** Aún no se ejecutó: solo se muestra en la línea de tiempo. */
  scheduled?: boolean;
  elapsedSeconds: number;
  records: number;
  errorNode?: { id: string; name: string };
  nodes: MonitorNodeData[];
}

/**
 * Estado de una ejecución del día.
 * - `scheduled`: programada, todavía no arrancó.
 * - `running`: algún nodo sigue extrayendo.
 * - `success` / `warning`: terminó; `warning` si algún nodo terminó con aviso.
 */
export type MonitorExecutionStatus = "scheduled" | "running" | "success" | "warning";

/** Ejecución lista para la UI: el job con fechas de hoy (mismo formato que el Resumen). */
export interface MonitorExecution {
  id: string;
  time: string;
  frequency: MonitorFrequency;
  scheduled: boolean;
  job: RunningJob;
  /** Nodos de una ejecución programada (sin progreso ni tiempos). */
  pendingNodes: MonitorNodeData[];
}
