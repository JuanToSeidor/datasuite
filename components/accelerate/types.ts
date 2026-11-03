import type { CaralBrandName } from "@/components/icons";

export type AccelerateModelStatus = "active" | "deploying" | "error";

export interface AccelerateModel {
  id: string;
  /** ACT-IN del catálogo del que proviene este despliegue. */
  catalogId: string;
  name: string;
  companies: string[];
  version: string;
  status: AccelerateModelStatus;
  /** Avance del despliegue (0-100), relevante cuando status = "deploying". */
  progress: number;
  source: {
    brand: CaralBrandName;
    system: string;
    product: string;
    client: string;
  };
  destination: {
    brand: CaralBrandName;
    name: string;
    lakehouse: string;
    workspace: string;
  };
  freshness: {
    lastLoad: string;
    minutesAgo: number;
    tablesUpToDate: number;
    tablesTotal: number;
  };
  dashboards: number;
}

/** ACT-IN disponible (o próximo) en el catálogo para desplegar. */
export interface AccelerateCatalogItem {
  id: string;
  /** Sigla del módulo SAP, p.ej. "SD". */
  code: string;
  name: string;
  area: string;
  description: string;
  availability: "available" | "comingSoon";
  /** Etapa de Accelerate en la que estará disponible (solo comingSoon). */
  stage?: number;
  contracted: boolean;
  platforms: string[];
  stats?: { dashboards: number; destinationObjects: number; version: string };
  sapTables: string[];
  /** `stage`: etapa de Accelerate en la que se habilita un destino aún no disponible. */
  destinations: { brand: CaralBrandName; name: string; available: boolean; stage?: number }[];
}

export type SourceTableStatus = "available" | "outdated" | "missing";

export interface SourceTable {
  table: string;
  description: string;
  records: number;
  lastLoad: string;
  flow: string;
  /** Frecuencia del flujo Move en minutos (0 = sin flujo). */
  frequencyMinutes: number;
  status: SourceTableStatus;
}

export type DestinationObjectType = "deltaTable" | "sqlView" | "semanticModel";

export interface DestinationObject {
  name: string;
  type: DestinationObjectType;
  builtFrom: string;
  content: string;
}

/** Detalle extendido de un ACT-IN del catálogo (pantalla "Ver detalle"). */
export interface AccelerateCatalogDetail {
  destinationVersions: { brand: CaralBrandName; version: string }[];
  functionalDescription: string;
  features: { title: string; description: string }[];
  sheet: {
    sapModule: string;
    source: string;
    destinations: string;
    destinationsDetail?: string;
    extraction: string;
    reportingCurrency: string;
  };
  reports: string[];
  sourceTables?: {
    consultedAt: string;
    environments: { id: string; label: string; tables: SourceTable[] }[];
  };
  destinationObjects?: {
    destination: string;
    lakehouse: string;
    workspace: string;
    objects: DestinationObject[];
  };
}

export interface AccelerateAlert {
  id: string;
  severity: "danger" | "warning";
  flow: string;
  pausedSince: string;
  affects: string;
}

/** Evento del historial de Accelerate. `date` en ISO local: "2026-10-16T09:18". */
export type AccelerateActivity = { id: string; date: string } & (
  | { type: "moveLoad"; table: string; records: string }
  | { type: "moveDelayed"; table: string; minutes: number }
  | { type: "deployStarted"; user: string; model: string }
  | { type: "deployCompleted"; model: string }
  | { type: "deployFailed"; model: string }
  | { type: "dashboardPublished"; user: string; dashboard: string }
);

export type AccelerateActivityType = AccelerateActivity["type"];

/* ---------- Asistente de despliegue ---------- */

export type SapEnvironment = "production" | "quality" | "development";
export type ConnectionHealth = "healthy" | "degraded" | "unreachable";

export interface SapCompany {
  /** Código de sociedad SAP (BUKRS). */
  code: string;
  name: string;
  currency: string;
  /** ISO 3166-1 alfa-2; se usa para nombrar el país y sugerir el lakehouse. */
  country: string;
}

/** Conexión SAP registrada en el Core (Accelerate no crea conexiones propias). */
export interface SapSource {
  id: string;
  name: string;
  /** SID del sistema SAP, p.ej. "S4P". */
  system: string;
  /** Entorno de `sourceTables.environments` cuya metadata se valida en el asistente. */
  metadataEnvironment: string;
  product: string;
  environment: SapEnvironment;
  client: string;
  health: ConnectionHealth;
  verifiedAt: string;
  companies: SapCompany[];
  /** Sociedades preseleccionadas al elegir esta conexión. */
  defaultCompanies: string[];
}

/** Workspace de la plataforma destino registrado en el Core. */
export interface DestinationWorkspace {
  id: string;
  name: string;
  capacity: string;
}

export interface AccelerateDeploySetup {
  sapSources: SapSource[];
  /** Descripción corta de lo que crea Accelerate en cada plataforma, por `brand`. */
  platformDescriptions: Partial<Record<CaralBrandName, string>>;
  workspaces: Partial<Record<CaralBrandName, DestinationWorkspace[]>>;
  /** Prefijo para sugerir el nombre del lakehouse: `<prefijo>_<código>_<países>`. */
  lakehousePrefix: string;
  /** Parámetros fijos del despliegue que se muestran en la confirmación. */
  deployment: {
    /** Identidad del Core con la que Accelerate crea los objetos. */
    servicePrincipal: string;
    /** Hora de la carga diaria de datos maestros. */
    masterDataDailyAt: string;
    defaultEstimatedMinutes: number;
    /** Tiempo estimado de despliegue por id de catálogo. */
    estimatedMinutes: Record<string, number>;
  };
}

export type AccelerateDashboardStatus = "active" | "refreshing" | "error";

/** Tablero entregado por un modelo ACT-IN desplegado. */
export interface AccelerateDashboard {
  id: string;
  /** Modelo del catálogo que lo entrega (agrupa los tableros por pestaña). */
  catalogId: string;
  title: string;
  description: string;
  owner: string;
  /** Archivo de portada en `public/dashboards/`. */
  cover: string;
  platform: { brand: CaralBrandName; name: string };
  status: AccelerateDashboardStatus;
  /** Corte de los datos: "2026-10-15T08:00". */
  dataAsOf: string;
  /** Minutos desde la última actualización del tablero. */
  updatedMinutesAgo: number;
  /** Enlace al tablero en la plataforma destino. */
  url: string;
}
