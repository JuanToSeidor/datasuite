import monitorData from "@/data/move/monitor.json";
import type { JobNodeRun, RunningJob } from "@/components/move/overview/types";
import type {
  MonitorExecution,
  MonitorExecutionData,
  MonitorExecutionStatus,
  MonitorFrequency,
} from "./types";

const EXECUTIONS = monitorData.executions as MonitorExecutionData[];

/** Fecha local sin zona (YYYY-MM-DDTHH:mm:ss), como las del resto de mocks de Move. */
function toLocalIso(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function nextRun(from: Date, frequency: MonitorFrequency) {
  const next = new Date(from);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  else if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * Ejecuciones de hoy (demo sin backend): las horas del mock se fijan en la fecha actual.
 * Debe llamarse solo en cliente para no fijar la fecha del build en el HTML estático.
 */
export function buildTodayExecutions(today: Date = new Date()): MonitorExecution[] {
  return EXECUTIONS.map((execution) => {
    const [h, m] = execution.time.split(":").map(Number);
    const startedAt = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);
    const scheduled = Boolean(execution.scheduled);

    const nodes: JobNodeRun[] = scheduled
      ? []
      : execution.nodes.map(({ startOffsetSeconds, status, ...node }) => ({
          ...node,
          status: status === "pending" ? "running" : status,
          startedAt: toLocalIso(new Date(startedAt.getTime() + startOffsetSeconds * 1000)),
        }));

    const job: RunningJob = {
      id: execution.id,
      name: execution.name,
      startedAt: toLocalIso(startedAt),
      elapsedSeconds: execution.elapsedSeconds,
      records: execution.records,
      nextRunAt: toLocalIso(nextRun(startedAt, execution.frequency)),
      errorNode: execution.errorNode,
      nodes,
    };

    return {
      id: execution.id,
      time: execution.time,
      frequency: execution.frequency,
      scheduled,
      job,
      pendingNodes: scheduled ? execution.nodes : [],
    };
  }).sort((a, b) => a.time.localeCompare(b.time));
}

/** Estado de una ejecución a partir de sus nodos (vale también con el job "en vivo"). */
export function executionStatus(scheduled: boolean, nodes: JobNodeRun[]): MonitorExecutionStatus {
  if (scheduled) return "scheduled";
  if (nodes.some((node) => node.status === "running")) return "running";
  return nodes.some((node) => node.status === "warning") ? "warning" : "success";
}

/** Coincidencia de búsqueda: nombre del job o de cualquiera de sus nodos. */
export function matchesExecution(execution: MonitorExecution, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const nodeNames = execution.scheduled
    ? execution.pendingNodes.map((node) => node.name)
    : execution.job.nodes.map((node) => node.name);
  return [execution.job.name, ...nodeNames].some((name) => name.toLowerCase().includes(q));
}
