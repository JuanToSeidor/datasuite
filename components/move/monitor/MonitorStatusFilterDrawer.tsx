"use client";

import React from "react";
import { Button, Drawer } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { MonitorExecutionStatus } from "./types";

export const MONITOR_STATUSES: MonitorExecutionStatus[] = ["running", "success", "warning", "scheduled"];

/**
 * Filtro por estado de la ejecución: chips multiselección (mismo patrón que el drawer
 * de filtros de `DataTable` para columnas tipo lista). Se aplica al momento.
 */
export function MonitorStatusFilterDrawer({
  isOpen,
  onClose,
  selected,
  onChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  selected: MonitorExecutionStatus[];
  onChange: (statuses: MonitorExecutionStatus[]) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.monitor;
  const labels: Record<MonitorExecutionStatus, string> = {
    running: t.statusRunning,
    success: t.statusSuccess,
    warning: t.statusWarning,
    scheduled: t.statusScheduled,
  };

  const toggle = (status: MonitorExecutionStatus) =>
    onChange(selected.includes(status) ? selected.filter((s) => s !== status) : [...selected, status]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={t.filtersTitle} size="md">
      <div className="flex flex-col gap-3 font-poppins">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-900">{t.filterStatus}</span>
          <span className="text-xs font-semibold text-neutral-800">
            {formatMessage(t.selectedCount, { n: selected.length, total: MONITOR_STATUSES.length })}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {MONITOR_STATUSES.map((status) => {
            const isSelected = selected.includes(status);
            // Chip conmutador: <button> nativo con el mismo estilo que los chips de filtro de DataTable
            // (el Chip de caralstable no es interactivo).
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(status)}
                className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "border-info-main bg-info-light text-info-hard ring-1 ring-info-main/30"
                    : "border-neutral-500 bg-container text-neutral-800 hover:border-neutral-800"
                }`}
              >
                {isSelected && <CaralIcon name="check" size={13} />}
                {labels[status]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onChange(MONITOR_STATUSES)}>
            {t.selectAll}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChange([])}>
            {t.clearSelection}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
