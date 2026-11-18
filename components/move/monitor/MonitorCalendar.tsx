"use client";

import React, { useMemo, useState } from "react";
import { Button, Tabs } from "caralstable";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { jobColor, monthName, monthWeeks, shiftDate, weekDays, type CalendarView } from "./calendar";
import { CalendarMonthGrid, CalendarTimeGrid, type CalendarJob } from "./CalendarGrid";
import { CalendarMiniMonth } from "./CalendarMiniMonth";
import { matchesExecution } from "./data";
import type { MonitorExecution } from "./types";

const VIEWS: CalendarView[] = ["day", "week", "month"];

/**
 * Pestaña "Calendario" del Monitor (Figma 505:5349 / replegado 508:6969).
 * - Panel izquierdo: mini calendario + leyenda de jobs (activa/oculta cada job).
 * - Derecha: vistas Día / Semana / Mes con búsqueda.
 * - Al replegar el panel, el mes y la navegación pasan a la cabecera de la grilla.
 */
export function MonitorCalendar({ executions, today }: { executions: MonitorExecution[]; today: Date }) {
  const { dict, language } = useLanguage();
  const t = dict.move.monitor;

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [view, setView] = useState<CalendarView>("week");
  const [selected, setSelected] = useState(today);
  const [miniMonth, setMiniMonth] = useState(today);
  const [query, setQuery] = useState("");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  // El color depende del orden original del job, no del filtro (no cambia al buscar).
  const jobs = useMemo<CalendarJob[]>(
    () => executions.map((execution, i) => ({ execution, color: jobColor(i) })),
    [executions]
  );
  const searched = useMemo(() => jobs.filter(({ execution }) => matchesExecution(execution, query)), [jobs, query]);
  const visible = searched.filter(({ execution }) => !hiddenIds.includes(execution.id));

  const selectDate = (date: Date) => {
    setSelected(date);
    setMiniMonth(date);
  };
  const toggleJob = (id: string) =>
    setHiddenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  // Cabecera con mes y navegación: solo con el panel replegado (Figma 508:6969).
  const navHeader = !isPanelOpen && (
    <div className="flex items-center gap-2.5 bg-neutral-500 px-2.5 py-1.5">
      <p className="flex flex-1 gap-1.5 text-lg font-semibold">
        <span className="text-seidor-main-text">{monthName(selected, language)}</span>
        <span className="text-neutral-800">{selected.getFullYear()}</span>
      </p>
      <Button
        variant="ghost"
        size="sm"
        isIconButton
        iconName="chevronLeft"
        title={t.calendarPrev}
        onClick={() => selectDate(shiftDate(selected, view, -1))}
      />
      <Button
        variant="ghost"
        size="sm"
        isIconButton
        iconName="chevronRigth"
        title={t.calendarNext}
        onClick={() => selectDate(shiftDate(selected, view, 1))}
      />
    </div>
  );

  return (
    <div
      className={`grid h-[calc(100vh-240px)] min-h-[560px] gap-2.5 ${
        isPanelOpen ? "xl:grid-cols-[400px_minmax(0,1fr)]" : "grid-cols-1"
      }`}
    >
      {isPanelOpen && (
        <aside className="flex min-h-0 flex-col gap-2.5 overflow-auto rounded-lg bg-container p-2.5">
          <CalendarMiniMonth
            month={miniMonth}
            onMonthChange={setMiniMonth}
            selected={selected}
            onSelect={selectDate}
            today={today}
            jobs={searched}
          />
          {searched.length === 0 ? (
            <p className="p-2.5 text-sm text-neutral-800">{t.calendarNoJobs}</p>
          ) : (
            searched.map(({ execution, color }) => {
              const isHidden = hiddenIds.includes(execution.id);
              // <button> nativo: fila de leyenda que alterna la visibilidad del job (no es una acción de Caral).
              return (
                <button
                  key={execution.id}
                  type="button"
                  onClick={() => toggleJob(execution.id)}
                  title={formatMessage(t.calendarToggleJob, { name: execution.job.name })}
                  aria-pressed={!isHidden}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg bg-info-100! p-2.5! text-left transition-opacity ${
                    isHidden ? "opacity-50" : ""
                  }`}
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${
                      isHidden ? "border border-neutral-800 bg-transparent" : color.dot
                    }`}
                  />
                  <span className={`flex-1 truncate text-sm font-medium text-neutral-900 ${isHidden ? "line-through" : ""}`}>
                    {execution.job.name}
                  </span>
                  <span className="shrink-0 text-xs text-neutral-800">
                    {execution.time} · {t.frequency[execution.frequency]}
                  </span>
                </button>
              );
            })
          )}
        </aside>
      )}

      <section className="flex min-h-0 flex-col gap-2.5 rounded-lg bg-container p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5">
          <div className="flex items-center gap-2.5">
            <Button
              variant="info"
              isIconButton
              iconName={isPanelOpen ? "closeSidebarRigt" : "closeSidebarLeft"}
              title={isPanelOpen ? t.calendarCollapse : t.calendarExpand}
              onClick={() => setIsPanelOpen((open) => !open)}
            />
            <Tabs
              tabs={[{ label: t.calendarViewDay }, { label: t.calendarViewWeek }, { label: t.calendarViewMonth }]}
              activeIndex={VIEWS.indexOf(view)}
              onChange={(idx) => setView(VIEWS[idx])}
            />
          </div>
          <div className="w-56">
            <Input
              iconName="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full"
            />
          </div>
        </div>

        {view === "month" ? (
          <CalendarMonthGrid
            weeks={monthWeeks(selected)}
            month={selected}
            jobs={visible}
            selected={selected}
            today={today}
            onOpenDay={(day) => {
              selectDate(day);
              setView("day");
            }}
            header={navHeader}
          />
        ) : (
          <CalendarTimeGrid
            key={view}
            days={view === "day" ? [selected] : weekDays(selected)}
            jobs={visible}
            selected={selected}
            today={today}
            header={navHeader}
          />
        )}
      </section>
    </div>
  );
}
