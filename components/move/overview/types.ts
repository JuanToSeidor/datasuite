export interface JobEndpoint {
  name: string;
  type: string;
  brandName: string;
}

export type JobNodeStatus = "running" | "completed" | "warning";

export interface JobNodeRun {
  id: string;
  name: string;
  progress: number;
  status: JobNodeStatus;
  source: JobEndpoint;
  destination: JobEndpoint;
  startedAt: string;
  /** Segundos que lleva el nodo extrayendo. */
  elapsedSeconds: number;
  /** Motivo del aviso (se traduce en la columna de comentarios al terminar el job). */
  issue?: JobNodeIssue;
  /** Registros que el nodo carga al completarse (los cargados = records × progress). */
  records: number;
}

export type JobNodeIssue = "noData";

export interface RunningJob {
  id: string;
  name: string;
  startedAt: string;
  /** Segundos que lleva el job en ejecución. El % del job se calcula con sus nodos. */
  elapsedSeconds: number;
  records: number;
  /** Próxima ejecución programada del job. */
  nextRunAt: string;
  errorNode?: { id: string; name: string };
  nodes: JobNodeRun[];
}

export interface DestinationPreview {
  columns: string[];
  rows: string[][];
}

export interface MoveOverviewData {
  runningJob: RunningJob;
  destinationPreview: DestinationPreview;
}

/** Nodo que se ejecutará en una extracción programada. */
export interface ScheduledNode {
  id: string;
  name: string;
  source: JobEndpoint;
  destination: JobEndpoint;
}

/** Job programado: se ejecuta todos los meses en los días indicados a la hora `time` (HH:mm). */
export interface ScheduledJob {
  id: string;
  name: string;
  time: string;
  monthDays: number[];
  nodes: ScheduledNode[];
}

/** Ejecución concreta de un job en un día del calendario. */
export interface ScheduledRun {
  job: ScheduledJob;
  at: Date;
}
