export type VaultStatus = "queryable" | "extracting";
export type TableAvailability = "servable" | "servableAsOf" | "notServable" | "notExtracted";
export type TableReconciliation =
  | { type: "matches" }
  | { type: "missing"; n: number }
  | { type: "notInDump" };

export interface Vault {
  id: string;
  archive: string;
  source: { system: string; product: string; client: string };
  cutOffDate: string;
  destination: { platform: string; schema: string };
  volume: { size: string; tables: number; rows: string };
  status: VaultStatus;
  progress?: number;
}

export interface ArchiveTable {
  table: string;
  description: string;
  component: string;
  dataClass: string;
  dataKind: string;
  records: number | null;
  availability: TableAvailability;
  reconciliation: TableReconciliation;
}

export interface PreserveVaultsData {
  vaults: Vault[];
  tables: ArchiveTable[];
}
