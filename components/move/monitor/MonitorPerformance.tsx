"use client";

import React, { useMemo, useState } from "react";
import { Button } from "caralstable";
import { Input } from "@/components/ui";
import type { DestinationPreview } from "@/components/move/overview/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { executionStatus, matchesExecution } from "./data";
import { JobPerformanceList } from "./JobPerformanceList";
import { JobTimeline } from "./JobTimeline";
import { MONITOR_STATUSES, MonitorStatusFilterDrawer } from "./MonitorStatusFilterDrawer";
import type { MonitorExecution, MonitorExecutionStatus } from "./types";

export type MonitorViewMode = "list" | "cards";

/** Botón de icono con borde de la barra (mismo estilo que MoveListView). */
const ICON_BUTTON_CLASS = "border border-neutral-500 cursor-pointer";

/**
 * Pestaña "Rendimiento de jobs": cabecera con búsqueda, calendario, filtros y cambio de vista,
 * y debajo la lista (tarjeta del job en ejecución + jobs ejecutados) o la línea de tiempo.
 * `header` es la fila de pestañas, que va dentro de la misma tarjeta de cabecera.
 */
export function MonitorPerformance({
  executions,
  destinationPreview,
  header,
  onOpenCalendar,
}: {
  executions: MonitorExecution[];
  destinationPreview: DestinationPreview;
  header: React.ReactNode;
  onOpenCalendar: () => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.monitor;

  const [viewMode, setViewMode] = useState<MonitorViewMode>("list");
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<MonitorExecutionStatus[]>(MONITOR_STATUSES);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isFiltered = statuses.length < MONITOR_STATUSES.length;

  // Filtra por el estado inicial de cada ejecución (el job en curso se filtra como "en ejecución").
  const visible = useMemo(
    () =>
      executions.filter(
        (execution) =>
          statuses.includes(executionStatus(execution.scheduled, execution.job.nodes)) &&
          matchesExecution(execution, query)
      ),
    [executions, statuses, query]
  );
  const hasListRows = visible.some((execution) => !execution.scheduled);
  const isEmpty = viewMode === "list" ? !hasListRows : visible.length === 0;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 rounded-lg bg-container p-2.5">
        {header}
        <div className="flex flex-wrap items-end justify-between gap-3 pb-2.5 pt-5">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-neutral-900">{t.performanceTitle}</h1>
            <p className="text-sm text-neutral-800">{t.performanceSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-56">
              <Input
                iconName="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full"
              />
            </div>
            <Button
              variant="ghost"
              isIconButton
              iconName="calendar"
              className={ICON_BUTTON_CLASS}
              onClick={onOpenCalendar}
              title={t.viewCalendar}
            />
            <Button
              variant={isFiltered ? "info" : "ghost"}
              isIconButton
              iconName="filter"
              className={isFiltered ? "cursor-pointer" : ICON_BUTTON_CLASS}
              onClick={() => setIsFilterOpen(true)}
              title={t.filtersTitle}
            />
            <Button
              variant="ghost"
              isIconButton
              iconName={viewMode === "list" ? "grid" : "list"}
              className={ICON_BUTTON_CLASS}
              onClick={() => setViewMode((mode) => (mode === "list" ? "cards" : "list"))}
              title={viewMode === "list" ? t.switchToCards : t.switchToList}
            />
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="w-full rounded-lg bg-container p-10 text-center text-sm text-neutral-800">{t.noResults}</div>
      ) : viewMode === "list" ? (
        <JobPerformanceList executions={visible} destinationPreview={destinationPreview} />
      ) : (
        <JobTimeline executions={visible} destinationPreview={destinationPreview} />
      )}

      {/* Montado solo abierto: un Drawer cerrado reserva altura fantasma bajo la página. */}
      {isFilterOpen && (
        <MonitorStatusFilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selected={statuses}
          onChange={setStatuses}
        />
      )}
    </div>
  );
}
