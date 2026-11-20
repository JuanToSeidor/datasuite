import { CaralBrandName, Icons } from "iconcaral2";

export type SidebarItem = {
  label: string;
  iconName: Icons;
  href: string;
  external?: boolean;
  /**
   * Escenarios del workspace (`workspace.scenarios[branch.id]`) en los que el item es visible.
   * Sin definir = visible siempre. Las rutas fuera de los items visibles se redirigen
   * (ver `isBranchRouteAllowed`).
   */
  scenarios?: string[];
};

export type SidebarSection = {
  sectionTitle?: string;
  items: SidebarItem[];
};

/**
 * Escenarios simulados de Preserve (rol + momento de uso), elegidos por el workspace activo
 * en `data/workspaces.json` → `scenarios.preserve`.
 */
export const PRESERVE_ADMIN_FIRST_DEPLOY = "adminFirstDeploy";
export const PRESERVE_ADMIN_DEPLOYED = "adminDeployed";
export const PRESERVE_END_USER = "endUser";

const isItemVisible = (item: SidebarItem, scenario?: string) =>
  !item.scenarios || !scenario || item.scenarios.includes(scenario);

/** Secciones del branch con solo los items visibles en el escenario (sin secciones vacías). */
export function getVisibleSections(branch: Branch, scenario?: string): SidebarSection[] {
  return (branch.sidebarSections ?? [])
    .map((s) => ({ ...s, items: s.items.filter((item) => isItemVisible(item, scenario)) }))
    .filter((s) => s.items.length > 0);
}

/**
 * Si la ruta del branch es accesible en el escenario. Se busca el item más específico que la
 * contiene (el home del branch solo por match exacto); rutas sin item asociado se permiten.
 * Devuelve la ruta de destino si hay que redirigir, o null si la ruta es válida.
 */
export function getBranchRedirect(branch: Branch, scenario: string | undefined, rawPathname: string): string | null {
  // `trailingSlash: true` puede dejar la barra final: "/preserve/" debe tratarse como "/preserve".
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
  const items = (branch.sidebarSections ?? []).flatMap((s) => s.items).filter((i) => !i.external);
  const owner = items
    .filter((i) => pathname === i.href || (i.href !== branch.href && pathname.startsWith(i.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!owner || isItemVisible(owner, scenario)) return null;
  const fallback = items.find((i) => isItemVisible(i, scenario));
  return fallback && fallback.href !== pathname ? fallback.href : null;
}

export type Branch = {
  id: string;
  title: string;
  description: string;
  color: string;
  // Link to the branch's main route
  href?: string;
  tags?: string[];
  sidebarSections?: SidebarSection[];
};

export type SuiteConfig = {
  name: string;
  icon: CaralBrandName;
  // Flag para activar o desactivar la discriminación por tags en los tabs de inicio
  enableTagDiscrimination?: boolean;
  defaultSidebarSections: SidebarSection[];
  branches: Branch[];
};

export const defaultSuiteSidebarSections: SidebarSection[] = [
  {
    sectionTitle: "Explore",
    items: [
      { label: "Home", iconName: "house", href: "/" },
      { label: "Connections", iconName: "link", href: "/connections" },
      { label: "Monitor", iconName: "screenChart", href: "/monitor" },
    ]
  },
  {
    sectionTitle: "Manage",
    items: [
      { label: "Dashboard", iconName: "chartSimple", href: "/dashboard" },
      { label: "Docs", iconName: "book", href: "https://crestone-help.seidoranalytics.com/", external: true },
    ]
  }
];

export const suiteConfig: SuiteConfig = {
  name: "Crestone",
  icon: "Crestone",
  enableTagDiscrimination: false,
  defaultSidebarSections: defaultSuiteSidebarSections,
  branches: [
    {
      id: "move",
      title: "Move",
      description: "Integra y moviliza datos desde múltiples fuentes hacia plataformas modernas, habilitando una base sólida y confiable para analítica y toma de decisiones.​",
      color: "var(--color-info-main)", // Azul
      href: "/move",
      tags: ["Destacados", "Propios"],
      sidebarSections: [
        {
          sectionTitle: "Move",
          items: [
            { label: "Overview", iconName: "house", href: "/move" },
            { label: "Nodos", iconName: "cubeInCube", href: "/move/nodes" },
            { label: "Jobs", iconName: "network", href: "/move/jobs" },
            { label: "Monitor", iconName: "screenChart", href: "/move/activity" },
          ]
        }
      ]
    },
    {
      id: "preserve",
      title: "Preserve",
      description: "Mueve datos históricos de forma eficiente, asegurando su disponibilidad y trazabilidad para análisis a largo plazo y cumplimiento.​",
      color: "var(--color-success-main)", // Verde
      href: "/preserve",
      tags: ["Destacados", "Propios", "Tecnología emergente"],
      sidebarSections: [
        {
          sectionTitle: "Archive",
          items: [
            { label: "Overview", iconName: "house", href: "/preserve", scenarios: [PRESERVE_ADMIN_DEPLOYED] },
            { label: "Readiness", iconName: "sync", href: "/preserve/readiness", scenarios: [PRESERVE_ADMIN_DEPLOYED] },
            { label: "Historical vaults", iconName: "box", href: "/preserve/vaults", scenarios: [PRESERVE_ADMIN_DEPLOYED] },
            { label: "Source inventory", iconName: "search", href: "/preserve/sources", scenarios: [PRESERVE_ADMIN_FIRST_DEPLOY, PRESERVE_ADMIN_DEPLOYED] },
            { label: "Extractions", iconName: "arrowDownToLine", href: "/preserve/extractions", scenarios: [PRESERVE_ADMIN_FIRST_DEPLOY, PRESERVE_ADMIN_DEPLOYED] },
          ]
        },
        {
          sectionTitle: "Query",
          items: [
            { label: "Query", iconName: "database", href: "/preserve/query", scenarios: [PRESERVE_ADMIN_DEPLOYED] },
            { label: "Validated questions", iconName: "check", href: "/preserve/questions", scenarios: [PRESERVE_ADMIN_DEPLOYED] },
          ]
        },
        {
          sectionTitle: "Compliance",
          items: [
            { label: "Audit logs", iconName: "file", href: "/preserve/audit", scenarios: [PRESERVE_ADMIN_DEPLOYED] },
            { label: "Retention policies", iconName: "shieldHalved", href: "/preserve/policies", scenarios: [PRESERVE_ADMIN_DEPLOYED] },
          ]
        },
        {
          sectionTitle: "SAP",
          items: [
            { label: "SAP transaction", iconName: "database", href: "/preserve/transactions", scenarios: [PRESERVE_END_USER] },
          ]
        }
      ]
    },
    {
      id: "accelerate",
      title: "Accelerate",
      description: "Entrega analítica y visualización sobre datos SAP, acelerando la generación de insights mediante modelos preconstruidos desplegados en Microsoft y Snowflake.​",
      color: "var(--color-warning-main)", // Naranja
      href: "/accelerate",
      tags: ["Nuevas tendencias", "Colaboraciones"],
      sidebarSections: [
        {
          sectionTitle: "Analytics",
          items: [
            { label: "Overview", iconName: "bank", href: "/accelerate" },
            { label: "Data Models", iconName: "bars", href: "/accelerate/models" },
            { label: "Dashboards", iconName: "screenChart", href: "/accelerate/dashboards" },
          ]
        }
      ]
    },
    {
      id: "optimize",
      title: "Optimize",
      description: "Monitorea y optimiza el consumo de recursos cloud generado por el uso de Crestone, brindando visibilidad y control sobre los costos de datos.​",
      color: "var(--color-danger-main)", // Rojo
      href: "/optimize",
      tags: ["Destacados", "Propios", "Proyectos futuros"],
      sidebarSections: [
        {
          sectionTitle: "Optimize",
          items: [
            { label: "Dashboard", iconName: "chartSimple", href: "/optimize" },
            { label: "Accounts", iconName: "link", href: "/optimize/accounts" },
            { label: "Drivers", iconName: "bolt", href: "/optimize/drivers" },
            { label: "Distributions", iconName: "circles", href: "/optimize/distributions" },
            { label: "Forecast", iconName: "screenChart", href: "/optimize/forecast" },

            { label: "Advisor", iconName: "magic", href: "/optimize/advisor" },
          ]
        }
      ]
    },
    {
      id: "analyze",
      title: "Analyze",
      description: "Aplica inteligencia artificial sobre los datos integrados, habilitando análisis avanzados, automatización y generación de insights predictivos.​",
      color: "var(--color-sakura-main)", // Rosa
      href: "/analyze",
      tags: ["Destacados", "AI generativa", "Tecnología emergente"],
      sidebarSections: [
        {
          sectionTitle: "AI Studio",
          items: [
            { label: "Overview", iconName: "house", href: "/analyze" },
            { label: "Workbenches", iconName: "code", href: "/analyze/workbenches" },
            { label: "AI Models", iconName: "robot", href: "/analyze/models" },
          ]
        },
        {
          sectionTitle: "Automation",
          items: [
            { label: "Prompt Engine", iconName: "magic", href: "/analyze/prompts" },
          ]
        }
      ]
    },
    {
      id: "migrate",
      title: "Migrate",
      description: "Acelera y estandariza la migración desde plataformas SAP hacia arquitecturas modernas, reduciendo riesgo, tiempos y dependencia de desarrollos manuales.​",
      color: "var(--color-indigo-main)", // Morado
      href: "/migrate",
      tags: ["Destacados", "Nuevas tendencias"],
      sidebarSections: [
        {
          sectionTitle: "Migration",
          items: [
            { label: "Overview", iconName: "house", href: "/migrate" },
            { label: "Migration Waves", iconName: "arrowRight", href: "/migrate/waves" },
            { label: "Schema Mapping", iconName: "network", href: "/migrate/schemas" },
          ]
        },
        {
          sectionTitle: "Validation",
          items: [
            { label: "Reports", iconName: "file", href: "/migrate/reports" },
          ]
        }
      ]
    },
    {
      id: "profiler",
      title: "Profiler",
      description: "Analiza automáticamente la calidad y consistencia de los datos extraídos desde distintos sistemas, detectando anomalías y relaciones rotas antes de que impacten en los procesos analíticos.​",
      color: "var(--color-danger-hard)", // Rojo Oscuro
      href: "/profiler",
      tags: ["AI generativa", "Propios"],
      sidebarSections: [
        {
          sectionTitle: "Data Quality",
          items: [
            { label: "Overview", iconName: "house", href: "/profiler" },
            { label: "Quality Rules", iconName: "shieldHalved", href: "/profiler/rules" },
            { label: "Anomalies", iconName: "screenChart", href: "/profiler/anomalies" },
          ]
        }
      ]
    }
  ],
};
