import licensesData from "@/data/licenses.json";
import type { TranslationDictionary } from "@/locales";

export type ModuleLicenseStatus = "active" | "unlicensed";
export type LicenseHistoryStatus = "active" | "expired" | "removed";
export type LicenseQuotaId = "origins" | "nodes" | "users";

/** Nodo de Move: cuenta como uso de licencia junto con las tablas que extrae. */
export interface LicenseNodeItem {
  id: string;
  name: string;
  origin: string; // nombre de <Brand>
  destination: string; // nombre de <Brand>
  tables: string[];
}

export interface LicenseOriginItem {
  id: string;
  name: string;
  brand: string;
  environment: string;
}

export interface LicenseUserItem {
  id: string;
  name: string;
  email: string;
  workspace: string;
}

export type LicenseQuota =
  | { id: "nodes"; used: number; total: number; items: LicenseNodeItem[] }
  | { id: "origins"; used: number; total: number; items: LicenseOriginItem[] }
  | { id: "users"; used: number; total: number; items: LicenseUserItem[] };

export interface LicenseHistoryEntry {
  id: string;
  type: string;
  status: LicenseHistoryStatus;
  expiresAt: string;
}

export interface ModuleLicense {
  id: string;
  name: string;
  status: ModuleLicenseStatus;
  validUntil: string | null;
  plan: string | null;
  quotas: LicenseQuota[];
  history: LicenseHistoryEntry[];
}

export const MODULE_LICENSES = licensesData.modules as unknown as ModuleLicense[];

/** Rutas de la pestaña Licencia (listado → módulo → cuota). */
export const licenseHref = (moduleId?: string, quotaId?: string) =>
  `/settings?tab=license${moduleId ? `&module=${moduleId}` : ""}${quotaId ? `&quota=${quotaId}` : ""}`;

/** Ventana (días) para considerar una licencia como "próxima a vencer". */
export const EXPIRING_WINDOW_DAYS = 30;

export type LicenseDict = TranslationDictionary["settings"]["license"];

export const QUOTA_LABEL_KEY: Record<LicenseQuotaId, keyof LicenseDict> = {
  origins: "quotaOrigins",
  nodes: "quotaNodes",
  users: "quotaUsers",
};

export const QUOTA_DESCRIPTION_KEY: Record<LicenseQuotaId, keyof LicenseDict> = {
  origins: "quotaOriginsDescription",
  nodes: "quotaNodesDescription",
  users: "quotaUsersDescription",
};

/** Fecha ISO (yyyy-mm-dd) → Date local, sin desfase por zona horaria. */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isExpiringSoon(iso: string | null, now = new Date()): boolean {
  if (!iso) return false;
  const diffDays = (parseIsoDate(iso).getTime() - now.getTime()) / 86_400_000;
  return diffDays >= 0 && diffDays <= EXPIRING_WINDOW_DAYS;
}
