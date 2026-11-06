export type PreserveStepState = "done" | "active" | "pending";

export interface PreserveStep {
  id: "checks" | "seed" | "adjustment" | "validation" | "catalog" | "agent";
  state: PreserveStepState;
}

export interface PreserveOverviewData {
  archives: {
    total: number;
    queryable: number;
    extracting: { id: string; progress: number };
  };
  questions: {
    validated: number;
    pending: number;
    needSap: number;
  };
  latestExtraction: {
    ref: string;
    matdoc: string;
    status: "differences" | "ok";
    sapRows: string;
    missingRows: number;
  };
  dumpChecks: {
    ref: string;
    matdoc: string;
    ok: number;
    total: number;
    warnings: number;
    missingRows: number;
  };
  readiness: {
    archives: string[];
    selected: string;
    currentPhase: number;
    steps: PreserveStep[];
  };
}
