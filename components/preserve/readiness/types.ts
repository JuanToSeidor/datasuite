export type ReadinessPhaseId = "checks" | "seed" | "adjustment" | "validation" | "catalog" | "agent";
export type ReadinessStatus = "complete" | "inProgress" | "pending";
export type ReadinessAction = "checks" | "questions" | "catalog";

export interface ReadinessPhase {
  id: ReadinessPhaseId;
  status: ReadinessStatus;
  action: ReadinessAction;
  passed?: number;
  total?: number;
  missing?: string;
  n?: number;
  validated?: number;
  servable?: number;
}

export interface PreserveReadinessData {
  archives: string[];
  selected: string;
  cutoffDate: string;
  source: { system: string; client: string; size: string; tables: number };
  phases: ReadinessPhase[];
}
