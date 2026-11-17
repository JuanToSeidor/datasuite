"use client";

import { Chip } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";

type ChipVariant = "default" | "info" | "success" | "warning" | "danger" | "light";

const VARIANT_BY_STATUS: Record<string, ChipVariant> = {
  initiated: "info",
  running: "info",
  completed: "success",
  enabled: "success",
  warning: "warning",
  drafted: "warning",
  failed: "danger",
  cancelled: "danger",
  disabled: "danger",
  stop: "danger",
  pending: "default",
  nodata: "light",
  skipped: "light",
};

/** Equivalente local del `WidgetStatus` de datasync: estado de ejecución / nodo como Chip de Caral. */
export default function WidgetStatus({ status }: { status?: string | null }) {
  const { t } = useLanguage();
  if (!status) return null;
  return (
    <Chip
      variant={VARIANT_BY_STATUS[status] ?? "default"}
      label={t(`moveJobsEditor.workflow.status.${status}`, status)}
      hasBorder
    />
  );
}
