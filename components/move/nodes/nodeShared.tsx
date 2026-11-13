import { Brand, CaralIcon, CaralBrandName, Icons } from "@/components/icons";

const VALID_BRANDS = new Set([
  "SAP", "SAPHanaC", "Snowflake", "AWS", "Azure", "Google", "GoogleStorage", "GoogleBigquery",
  "PostgreSQL", "MSSQL", "Oracle", "Databricks", "S3", "Redshift",
  "Fabric", "OneLake", "Synapse", "AzureSql", "mySQL", "Teradata",
]);

export type MoveNodeStatus = "enabled" | "drafted" | "stop";

export interface MoveNodeEndpoint {
  name: string;
  type: string;
  brandName: string;
  /** Origen productivo: muestra el badge `badgeSync` en la vista de grilla. */
  isProduction?: boolean;
}

export interface MoveNode {
  id: string;
  name: string;
  status: MoveNodeStatus;
  origin: MoveNodeEndpoint;
  destination: MoveNodeEndpoint;
  createdBy: string;
  avatarText: string;
  createdAt: string;
  lastUsedAt: string | null;
}

const LOCALE_BY_LANGUAGE: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  pt: "pt-BR",
};

/** Fecha numérica (dd/mm/aaaa en es/pt, mm/dd/aaaa en en), como en el diseño de Figma. */
export function makeNodeDateFormatter(language: string) {
  const locale = LOCALE_BY_LANGUAGE[language] ?? "en-US";
  return (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
}

/**
 * Logo del origen/destino.
 * `monochrome`: usa la versión CaralIcon de la marca (un solo color, `currentColor`)
 * en lugar del logo a color, p.ej. para atenuar filas no seleccionadas.
 */
export function EndpointLogo({
  brandName,
  size,
  monochrome = false,
}: {
  brandName: string;
  size: number;
  monochrome?: boolean;
}) {
  if (VALID_BRANDS.has(brandName)) {
    return monochrome ? (
      <CaralIcon name={brandName as Icons} size={size} color="currentColor" />
    ) : (
      <Brand name={brandName as CaralBrandName} size={size} />
    );
  }
  return <CaralIcon name={"database" as Icons} size={size} color={monochrome ? "currentColor" : undefined} />;
}
