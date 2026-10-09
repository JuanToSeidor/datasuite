import { CaralBrandName, Icons } from "iconcaral2";

export type SidebarItem = {
  label: string;
  iconName: Icons;
  href: string;
  external?: boolean;
};

export type SidebarSection = {
  sectionTitle?: string;
  items: SidebarItem[];
};

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
          sectionTitle: "Pipelines & Data",
          items: [
            { label: "Overview", iconName: "house", href: "/move" },
            { label: "Pipelines", iconName: "arrowRight", href: "/move/pipelines" },
            { label: "Data Sources", iconName: "database", href: "/move/sources" },
            { label: "Destinations", iconName: "cloud", href: "/move/destinations" },
          ]
        },
        {
          sectionTitle: "Monitoring",
          items: [
            { label: "Activity Logs", iconName: "screenChart", href: "/move/activity" },
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
          sectionTitle: "Data Vaults",
          items: [
            { label: "Overview", iconName: "house", href: "/preserve" },
            { label: "Historical Vaults", iconName: "folder", href: "/preserve/vaults" },
            { label: "Retention Policies", iconName: "shieldHalved", href: "/preserve/policies" },
          ]
        },
        {
          sectionTitle: "Compliance",
          items: [
            { label: "Audit Logs", iconName: "file", href: "/preserve/audit" },
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
            { label: "Overview", iconName: "house", href: "/accelerate" },
            { label: "Data Models", iconName: "chartSimple", href: "/accelerate/models" },
            { label: "SAP Connectors", iconName: "link", href: "/accelerate/connectors" },
          ]
        },
        {
          sectionTitle: "Insights",
          items: [
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
