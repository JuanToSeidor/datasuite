export type CheckState = "passed" | "warning";

export interface ArchiveCheck {
  id: number;
  name: string;
  failsSilently: boolean;
  before: CheckState;
  destination: CheckState;
  detail: string;
  /** Muestra la acción para agregar las tablas de códigos a la próxima extracción. */
  action?: boolean;
}

export type CatalogStatus = "inCatalog" | "outNeedsSap" | "waitingValidation";

export interface CatalogRow {
  table: string;
  questions: number[];
  status: CatalogStatus;
}

export type ExtractionStatus = "completeDifferences" | "completeMatches";

export interface ArchiveExtraction {
  id: string;
  by: string;
  archive: string;
  scope: string;
  status: ExtractionStatus;
  missingRows: number;
  progress: number;
  started: string;
  duration: string;
}

export interface PreserveVaultDetailsData {
  checks: ArchiveCheck[];
  catalog: { tablesEnabled: number; rows: CatalogRow[] };
  extractions: ArchiveExtraction[];
}
