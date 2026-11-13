"use client";

import React from "react";
import { Chip } from "caralstable";
import { EndpointLogo } from "@/components/move/nodes/nodeShared";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { useLocaleTag } from "./format";
import { SidePanelHeader } from "./SidePanelHeader";
import type { ScheduledRun } from "./types";

/** Ancho del panel lateral con la agenda de un día. */
export const UPCOMING_DAY_PANEL_WIDTH = 520;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function StatCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col p-2.5">
      <span className="text-lg font-semibold text-neutral-900">{value}</span>
      <span className="text-sm text-neutral-800">{label}</span>
    </div>
  );
}

/** Una ejecución del día: hora en la línea de tiempo + tarjeta con el job y sus nodos. */
function RunItem({ run, isLast, now }: { run: ScheduledRun; isLast: boolean; now: number }) {
  const { dict } = useLanguage();
  const t = dict.move.overview.upcoming;
  const locale = useLocaleTag();
  const isDone = run.at.getTime() <= now;
  const time = run.at.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <li className="relative flex gap-3">
      {/* Línea de tiempo */}
      <div className="flex w-14 shrink-0 flex-col items-center">
        <span className={`text-lg font-bold ${isDone ? "text-neutral-800" : "text-info-main"}`}>{time}</span>
        <span
          aria-hidden
          className={`mt-1 size-3 shrink-0 rounded-full ${isDone ? "bg-neutral-800" : "bg-info-main"}`}
        />
        {!isLast && <span aria-hidden className="mt-1 w-0.5 flex-1 bg-neutral-500" />}
      </div>

      <div className="mb-4 flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-500 bg-container">
        {/* Encabezado: job + recurrencia + estado */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-500 p-2.5">
          <div className="flex min-w-0 flex-col">
            <span className="font-bold text-neutral-900">{run.job.name}</span>
            <span className="text-sm font-medium text-neutral-800">
              {formatMessage(t.recurrence, { days: run.job.monthDays.join(", ") })}
            </span>
          </div>
          <Chip
            variant={isDone ? "success" : "info"}
            iconName={isDone ? "check" : "clock"}
            label={isDone ? t.executed : t.scheduled}
            hasBorder
          />
        </div>

        {/* Nodos: píldora con nombre + logos de origen y destino.
            neutral-100 no cambia en modo oscuro (sigue casi blanco): ahí se usa bg-full. */}
        <div className="flex flex-col gap-2.5 p-2.5">
          <span className="px-2.5 text-sm font-medium text-neutral-800">{t.nodesLabel}</span>
          <ul className="flex flex-wrap gap-2.5">
            {run.job.nodes.map((node) => (
              <li
                key={node.id}
                title={`${node.source.name} → ${node.destination.name}`}
                className="flex items-center gap-2.5 rounded-full border border-neutral-500 bg-neutral-100 px-4 dark:bg-full py-[7px]"
              >
                <span className="text-sm font-medium text-neutral-900">{node.name}</span>
                <EndpointLogo brandName={node.source.brandName} size={15} />
                <EndpointLogo brandName={node.destination.brandName} size={15} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

/** Agenda de un día del calendario de próximas extracciones (panel lateral derecho). */
export function UpcomingDayPanel({
  date,
  runs,
  onClose,
}: {
  date: Date;
  runs: ScheduledRun[];
  onClose: () => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.overview.upcoming;
  const locale = useLocaleTag();
  const now = Date.now();

  const title = capitalize(
    date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  );
  const nodeCount = runs.reduce((sum, run) => sum + run.job.nodes.length, 0);
  const firstRun = runs[0]?.at.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="flex min-h-full flex-col font-poppins">
      <SidePanelHeader title={title} onClose={onClose} />

      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-neutral-500 [&>*:not(:last-child)]:border-r [&>*]:border-neutral-500">
          <StatCell value={runs.length} label={t.runsLabel} />
          <StatCell value={nodeCount} label={t.nodesLabel} />
          <StatCell value={firstRun ?? "—"} label={t.firstRunLabel} />
        </div>

        <h3 className="text-lg font-bold text-neutral-900">{t.scheduleTitle}</h3>

        {runs.length === 0 ? (
          <p className="text-sm text-neutral-800">{t.noRuns}</p>
        ) : (
          <ol className="flex flex-col">
            {runs.map((run, index) => (
              <RunItem key={run.job.id} run={run} isLast={index === runs.length - 1} now={now} />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
