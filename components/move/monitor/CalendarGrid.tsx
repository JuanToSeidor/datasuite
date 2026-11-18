"use client";

import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { executionHour, gmtLabel, runsOnDate, sameDay, weekdayName, type JobColor } from "./calendar";
import type { MonitorExecution } from "./types";

export interface CalendarJob {
  execution: MonitorExecution;
  color: JobColor;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);
/** Alto de cada franja horaria (Figma: 150px). */
const HOUR_HEIGHT = 150;
const CELL_BORDER = "border-b border-r border-neutral-500";

function EventChip({ job, showTime }: { job: CalendarJob; showTime?: boolean }) {
  const { dict } = useLanguage();
  const { execution, color } = job;
  const frequency = dict.move.monitor.frequency[execution.frequency];
  return (
    <span
      title={`${execution.time} · ${execution.job.name} · ${frequency}`}
      className={`flex max-w-full items-center gap-2 truncate rounded-lg px-3 py-1.5 text-sm font-medium leading-[14px] text-seidor-main ${color.chip}`}
    >
      {showTime && <span className="font-semibold">{execution.time}</span>}
      <span className="truncate">{execution.job.name}</span>
      {showTime && <span className="font-normal">· {frequency}</span>}
    </span>
  );
}

const jobsAt = (jobs: CalendarJob[], day: Date, today: Date, hour?: number) =>
  jobs.filter(
    ({ execution }) =>
      runsOnDate(execution, day, today) && (hour === undefined || executionHour(execution) === hour)
  );

/**
 * Vista por horas (Día y Semana, Figma 508:6615): columna de horas a cada lado,
 * una columna por día y el día seleccionado resaltado. Cabecera fija y scroll interno.
 */
export function CalendarTimeGrid({
  days,
  jobs,
  selected,
  today,
  header,
}: {
  days: Date[];
  jobs: CalendarJob[];
  selected: Date;
  today: Date;
  /** Fila del mes con navegación (solo con el panel izquierdo replegado). */
  header?: React.ReactNode;
}) {
  const { dict, language } = useLanguage();
  const t = dict.move.monitor;
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDay = days.length === 1;
  const gridCols = { gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr)) 76px` };

  // Al montar, arranca en la primera hora con ejecuciones (cabecera sticky ya descontada).
  const firstHour = jobs.length ? Math.min(...jobs.map(({ execution }) => executionHour(execution))) : 6;
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = firstHour * HOUR_HEIGHT;
    // Solo al montar: luego el usuario controla el scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const highlight = (day: Date) => (sameDay(day, selected) && !isDay ? "bg-info-100" : "");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-500">
      {header}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="sticky top-0 z-10 grid bg-container" style={gridCols}>
          <div className={CELL_BORDER} />
          {days.map((day) => (
            <div key={day.toISOString()} className={`flex flex-col p-2.5 ${CELL_BORDER} ${highlight(day)}`}>
              <span className="text-sm font-medium leading-[14px] text-neutral-800">
                {weekdayName(day, language, "short")}
              </span>
              <span
                className={`text-lg font-semibold leading-7 ${
                  sameDay(day, today) ? "text-info-main" : "text-neutral-900"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          ))}
          <div className="flex flex-col border-b border-neutral-500 p-2.5">
            <span className="text-sm font-medium leading-[14px] text-neutral-800">{t.calendarTimezone}</span>
            <span className="whitespace-nowrap text-lg font-semibold leading-7 text-neutral-900">
              {gmtLabel(selected)}
            </span>
          </div>
        </div>

        <div className="grid" style={gridCols}>
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <span
                className="border-r border-neutral-500 pr-0.5 text-right text-sm font-medium leading-[14px] text-neutral-800"
                style={{ height: HOUR_HEIGHT }}
              >
                {hour}:00
              </span>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col items-start gap-2.5 overflow-hidden p-2.5 ${CELL_BORDER} ${highlight(day)}`}
                  style={{ height: HOUR_HEIGHT }}
                >
                  {jobsAt(jobs, day, today, hour).map((job) => (
                    <EventChip key={job.execution.id} job={job} showTime={isDay} />
                  ))}
                </div>
              ))}
              <span className="pl-1.5 text-sm font-medium leading-[14px] text-neutral-800" style={{ height: HOUR_HEIGHT }}>
                {hour}:00
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Máximo de eventos visibles por día en la vista Mes; el resto se resume en "+N". */
const MONTH_MAX_EVENTS = 3;

/** Vista Mes: semanas completas; al pulsar un día se abre en la vista Día. */
export function CalendarMonthGrid({
  weeks,
  month,
  jobs,
  selected,
  today,
  onOpenDay,
  header,
}: {
  weeks: Date[][];
  month: Date;
  jobs: CalendarJob[];
  selected: Date;
  today: Date;
  onOpenDay: (day: Date) => void;
  header?: React.ReactNode;
}) {
  const { dict, language } = useLanguage();
  const t = dict.move.monitor;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-500">
      {header}
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="sticky top-0 z-10 grid grid-cols-7 bg-container">
          {weeks[0].map((day) => (
            <span key={day.getDay()} className={`p-2.5 text-sm font-medium leading-[14px] text-neutral-800 ${CELL_BORDER}`}>
              {weekdayName(day, language, "short")}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((day) => {
            const dayJobs = jobsAt(jobs, day, today).sort((a, b) => a.execution.time.localeCompare(b.execution.time));
            const isOtherMonth = day.getMonth() !== month.getMonth();
            // <button> nativo: la celda completa del día es el disparador (no es una acción de Caral).
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onOpenDay(day)}
                className={`flex min-h-[132px] cursor-pointer flex-col items-start gap-1.5 p-2.5! text-left transition-colors hover:bg-neutral-500/40! ${CELL_BORDER} ${
                  sameDay(day, selected) ? "bg-info-100!" : "bg-transparent!"
                }`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
                    sameDay(day, today)
                      ? "bg-info-main text-neutral-100"
                      : isOtherMonth
                        ? "text-neutral-800"
                        : "text-neutral-900"
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayJobs.slice(0, MONTH_MAX_EVENTS).map((job) => (
                  <EventChip key={job.execution.id} job={job} />
                ))}
                {dayJobs.length > MONTH_MAX_EVENTS && (
                  <span className="px-1 text-xs font-semibold text-neutral-800">
                    {formatMessage(t.calendarMore, { n: dayJobs.length - MONTH_MAX_EVENTS })}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
