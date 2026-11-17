/**
 * Tipos y datos del asistente "crear jobs desde plantilla" (portado de datasync
 * `app/(app)/move/jobs/new`). En datasync los sistemas venían de `useGetSystemsQuery`;
 * en la suite salen de la conexiones mock de `data/connections.json`.
 */
import type React from "react";
import connections from "@/data/connections.json";
import jobTemplatesData from "@/data/move/jobTemplates.json";
import type { TJobPackage, TJobTemplate, TJobTemplateNode } from "@/lib/move/jobs/types";
import type { CreateWithTemplateInput } from "@/components/move/jobs/JobsStore";

/** Sistema (conexión) elegible como origen o destino; equivale al `system` de datasync. */
export interface JobSystem {
  system_id: string;
  name: string;
  /** Tipo de la conexión ("SAP", "AWS", "Snowflake"...). */
  type: string;
  brandName: string;
  location: "source" | "destination";
}

/** Config del destino que arman los formularios AWS/Snowflake (igual que `destinationConfig` en datasync). */
export interface DestinationConfig {
  type_file?: string | null;
  folder_name?: string;
  type?: "table" | "stage";
  mode?: "new" | "exists";
  name?: string | null;
  delete_existing_data?: boolean;
  pre_execution_sql?: string;
  post_execution_sql?: string;
}

export type SetDestinationConfig = React.Dispatch<React.SetStateAction<DestinationConfig | null>>;

/** Valores del límite de registros por ejecución (mismos que datasync). */
export const NOT_LIMIT = "not limit";
export const LIMIT_VALUES = ["1000", "10000", "100000", NOT_LIMIT] as const;

/* ------------------------------ Plantillas ------------------------------ */

const jobTemplates = jobTemplatesData as unknown as {
  packages: TJobPackage[];
  templates: Record<string, TJobTemplate>;
};

export const templatePackages: TJobPackage[] = jobTemplates.packages;

/**
 * Plantilla de un paquete: datasync la buscaba en `templatesSAPTable` o `templatesSAPExtractor`
 * según el modo del paquete; aquí están juntas, así que se valida que el modo coincida.
 */
export function getPackageTemplate(pack: TJobPackage, name: string): TJobTemplate | undefined {
  const template = jobTemplates.templates[name];
  return template && template.mode === pack.mode ? template : undefined;
}

/** Nombre visible del nodo de plantilla: tabla (SAP 4HANA) o extractor (SAPABAP). */
export function getTemplateNodeSourceName(template: TJobTemplate | null, node: TJobTemplateNode): string {
  if (template?.type === "SAP 4HANA") return String(node.source?.table_name ?? "");
  if (template?.type === "SAPABAP") return String(node.source?.name_extractor ?? "");
  return "";
}

/* ------------------------------- Sistemas ------------------------------- */

/** Tipo de conexión de la suite que sirve como origen para cada tipo de plantilla. */
const SOURCE_TYPE_BY_TEMPLATE: Record<string, string> = {
  SAPABAP: "SAP",
  "SAP 4HANA": "SAP",
};

/** Destinos con formulario de configuración (en datasync: AWSConfig y SnowflakeConfig). */
export const DESTINATION_TYPES = { aws: "AWS", snowflake: "Snowflake" } as const;
const CONFIGURABLE_DESTINATIONS = new Set<string>(Object.values(DESTINATION_TYPES));

export const jobSystems: JobSystem[] = connections
  .filter((c) => c.status === "Enabled")
  .map((c) => ({
    system_id: c.id,
    name: c.name,
    type: c.type,
    brandName: c.brandName,
    location: c.locationType.toLowerCase() === "source" ? "source" : "destination",
  }));

export const getSourceSystems = (templateType?: string): JobSystem[] =>
  jobSystems.filter((s) => s.location === "source" && s.type === SOURCE_TYPE_BY_TEMPLATE[templateType ?? ""]);

export const getDestinationSystems = (): JobSystem[] =>
  jobSystems.filter((s) => s.location === "destination" && CONFIGURABLE_DESTINATIONS.has(s.type));

/* ------------------------- Datos que se van a crear ------------------------- */

/** Nodo formateado como en `formattedNodesTemplate` de datasync (+ origen/destino para el store). */
export type TemplateNodeDraft = CreateWithTemplateInput["nodes"][number] & {
  transformation_config: {
    source: Record<string, unknown>;
    destination: DestinationConfig;
    settings: { limit: string };
  };
  status: "enabled";
  is_deleted: boolean;
  created_by: string;
  created_date: Date;
  modified_by: null;
  modified_date: null;
  workspace_id: string;
  destination_id?: string;
  source_id?: string;
};

/** Job formateado como en `formattedJobsTemplate` de datasync. */
export type TemplateJobDraft = CreateWithTemplateInput["jobs"][number] & {
  status: "enabled";
  is_deleted: boolean;
  workspace_id: string;
  created_by: string;
  schedule_config: [];
};

/** Iniciales para el avatar (igual que `getInitials` de datasync). */
export const getInitials = (value?: string) => {
  const base = (value ?? "").split("@")[0].replace(/[._-]+/g, " ").trim();
  return (
    base
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toLocaleUpperCase())
      .join("") || "?"
  );
};
