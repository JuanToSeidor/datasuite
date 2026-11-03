import type { Icons } from "@/components/icons";
import type { TranslationDictionary } from "@/locales";
import { formatMessage } from "@/lib/format";
import type { AccelerateActivity, AccelerateActivityType } from "../types";

type Tone = "success" | "info" | "danger" | "warning";

/** Color e ícono de cada tipo de evento (punto del inicio y ícono del historial). */
export const ACTIVITY_META: Record<AccelerateActivityType, { tone: Tone; icon: Icons }> = {
  moveLoad: { tone: "success", icon: "database" },
  moveDelayed: { tone: "warning", icon: "clock" },
  deployStarted: { tone: "info", icon: "planeDeparture" },
  deployCompleted: { tone: "success", icon: "check" },
  deployFailed: { tone: "danger", icon: "triangleExclamation" },
  dashboardPublished: { tone: "warning", icon: "presentationScreenChart" },
};

export const TONE_DOT: Record<Tone, string> = {
  success: "bg-success-main",
  info: "bg-info-main",
  danger: "bg-danger-main",
  warning: "bg-warning-main",
};

export const TONE_BADGE: Record<Tone, string> = {
  success: "bg-success-light text-success-main",
  info: "bg-info-light text-info-main",
  danger: "bg-danger-light text-danger-main",
  warning: "bg-warning-light text-warning-main",
};

/** Categorías del filtro del historial. */
export const ACTIVITY_CATEGORIES = {
  all: null,
  deploys: ["deployStarted", "deployCompleted", "deployFailed"],
  loads: ["moveLoad", "moveDelayed"],
  dashboards: ["dashboardPublished"],
  alerts: ["deployFailed", "moveDelayed"],
} as const satisfies Record<string, readonly AccelerateActivityType[] | null>;

export type ActivityCategory = keyof typeof ACTIVITY_CATEGORIES;

export const inCategory = (item: AccelerateActivity, category: ActivityCategory) => {
  const types = ACTIVITY_CATEGORIES[category] as readonly AccelerateActivityType[] | null;
  return !types || types.includes(item.type);
};

/** Texto del evento en el idioma activo. */
export function describeActivity(item: AccelerateActivity, dict: TranslationDictionary): string {
  const t = dict.accelerate.overview;
  switch (item.type) {
    case "moveLoad":
      return formatMessage(t.activityMoveLoad, { table: item.table, records: item.records });
    case "moveDelayed":
      return formatMessage(t.activityMoveDelayed, { table: item.table, minutes: item.minutes });
    case "deployStarted":
      return formatMessage(t.activityDeployStarted, { user: item.user, model: item.model });
    case "deployCompleted":
      return formatMessage(t.activityDeployCompleted, { model: item.model });
    case "deployFailed":
      return formatMessage(t.activityDeployFailed, { model: item.model });
    case "dashboardPublished":
      return formatMessage(t.activityDashboardPublished, { user: item.user, dashboard: item.dashboard });
  }
}

/** "16/10/2026 09:18" en el formato del idioma. */
export const formatActivityDate = (iso: string, language: string) =>
  new Intl.DateTimeFormat(language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
