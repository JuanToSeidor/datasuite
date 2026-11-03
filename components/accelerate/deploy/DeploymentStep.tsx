"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { DestinationObject, SourceTable } from "../types";
import {
  PENDING_BG,
  SCANNED_BG,
  TICK_MS,
  progressBackground,
  randomBetween,
  tickProgress,
} from "./progressRow";

/** Duración simulada de cada tarea (ms). La carga inicial es la más larga. */
const TASK_RANGES = {
  schema: [2000, 4000],
  tables: [4000, 8000],
  load: [12000, 20000],
  semantic: [3000, 6000],
  reports: [3000, 6000],
} as const satisfies Record<string, readonly [number, number]>;

type TaskId = keyof typeof TASK_RANGES;

interface DeploymentStepProps {
  modelName: string;
  /** "S4P · Producción → Microsoft Fabric · WS-Analítica-PRD" */
  route: string;
  platformName: string;
  objects: DestinationObject[];
  reports: string[];
  /** Tablas origen: aportan el volumen de filas de la carga inicial. */
  sourceTables: SourceTable[];
  onComplete: () => void;
}

/** Paso 5: ejecución del despliegue con progreso por tarea y global. */
export function DeploymentStep({
  modelName,
  route,
  platformName,
  objects,
  reports,
  sourceTables,
  onComplete,
}: DeploymentStepProps) {
  const { dict, language } = useLanguage();
  const t = dict.accelerate.deploy;

  const deltaTables = objects.filter((o) => o.type === "deltaTable");
  const sqlViews = objects.filter((o) => o.type === "sqlView");
  const semanticModels = objects.filter((o) => o.type === "semanticModel");

  const plural = (n: number, one: string, other: string) =>
    formatMessage(n === 1 ? one : other, { n });

  const tasks: { id: TaskId; label: string }[] = [
    { id: "schema" as const, label: t.taskSchema },
    ...(deltaTables.length
      ? [
          {
            id: "tables" as const,
            label: formatMessage(t.taskCreate, {
              what: plural(
                deltaTables.length,
                t.createDeltaTablesOne,
                t.createDeltaTablesOther,
              ),
            }),
          },
          { id: "load" as const, label: t.taskLoad },
        ]
      : []),
    ...(semanticModels.length
      ? [
          {
            id: "semantic" as const,
            label: formatMessage(
              sqlViews.length ? t.taskSemanticWithView : t.taskSemantic,
              {
                name: semanticModels.map((m) => m.name).join(", "),
              },
            ),
          },
        ]
      : []),
    ...(reports.length
      ? [
          {
            id: "reports" as const,
            label: formatMessage(t.taskPublish, {
              what: plural(
                reports.length,
                t.createReportsOne,
                t.createReportsOther,
              ),
            }),
          },
        ]
      : []),
  ];

  // Volumen de cada tabla Delta para la carga inicial (se toma de las tablas origen).
  const loadTables = useMemo(
    () =>
      deltaTables.map((o, i) => ({
        name: o.name,
        rows: sourceTables.length
          ? sourceTables[i % sourceTables.length].records || 250_000
          : 250_000,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [objects, sourceTables],
  );

  const [run, setRun] = useState(() => ({
    index: 0,
    progress: 0,
    durations: tasks.map((task) => randomBetween(TASK_RANGES[task.id])),
    elapsed: tasks.map(() => 0),
  }));
  const running = run.index < tasks.length;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRun((r) => {
        const elapsed = r.elapsed.map((e, i) =>
          i === r.index ? e + TICK_MS : e,
        );
        const next = r.progress + tickProgress(r.durations[r.index]);
        return next < 100
          ? { ...r, progress: next, elapsed }
          : { ...r, index: r.index + 1, progress: 0, elapsed };
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Progreso global ponderado por la duración de cada tarea.
  const total = run.durations.reduce((a, b) => a + b, 0);
  const doneMs =
    run.durations.slice(0, run.index).reduce((a, b) => a + b, 0) +
    (running ? (run.durations[run.index] * run.progress) / 100 : 0);
  const overall = running
    ? Math.min(99, Math.floor((doneMs / total) * 100))
    : 100;

  const compact = new Intl.NumberFormat(language, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const formatDuration = (ms: number) => {
    const secs = Math.max(1, Math.round(ms / 1000));
    return secs < 60
      ? formatMessage(t.durationSeconds, { s: secs })
      : formatMessage(t.durationMinutes, {
          m: Math.floor(secs / 60),
          s: secs % 60,
        });
  };

  /** Detalle de la carga inicial: tabla en curso y filas copiadas. */
  const loadDetail = (progress: number) => {
    if (!loadTables.length) return t.taskRunning;
    const position = (progress / 100) * loadTables.length;
    const current =
      loadTables[Math.min(Math.floor(position), loadTables.length - 1)];
    const fraction = Math.min(position - Math.floor(position), 1);
    return formatMessage(t.rowsProgress, {
      table: current.name,
      loaded: compact.format(current.rows * fraction),
      total: compact.format(current.rows),
    });
  };

  return (
    <section className="flex w-full flex-col gap-5 rounded-lg bg-container p-5 font-poppins">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-seidor-main-text">
            {formatMessage(running ? t.deployingTitle : t.deployedTitle, {
              name: modelName,
            })}
          </h2>
          <p className="text-base text-neutral-800">{route}</p>
        </div>
        <span
          className="text-5xl font-bold text-seidor-main-text tabular-nums"
          aria-live="polite"
        >
          {overall}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={overall}
        className="h-3 w-full overflow-hidden rounded-full bg-neutral-500"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${running ? "bg-warning-main" : "bg-success-main"}`}
          style={{ width: `${overall}%` }}
        />
      </div>

      <ul className="overflow-hidden rounded-xl border border-neutral-500">
        {tasks.map((task, i) => {
          const state =
            i < run.index ? "done" : i === run.index ? "running" : "pending";
          const background =
            state === "done"
              ? SCANNED_BG
              : state === "running"
                ? progressBackground(run.progress)
                : PENDING_BG;
          const detail =
            state === "done"
              ? formatDuration(run.elapsed[i])
              : state === "pending"
                ? t.taskPending
                : task.id === "load"
                  ? loadDetail(run.progress)
                  : t.taskRunning;

          return (
            <li
              key={task.id}
              style={{ background }}
              className={`flex items-center gap-3 px-4 py-3 ${i < tasks.length - 1 ? "border-b border-neutral-500" : ""}`}
            >
              <TaskIcon state={state} />
              <span className="flex-1 text-base font-semibold text-neutral-900">
                {task.label}
              </span>
              <span className="shrink-0 text-right font-mono text-sm text-neutral-800 tabular-nums">
                {detail}
              </span>
            </li>
          );
        })}
      </ul>

      {!running && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg border-l-4 border-success-main bg-success-light px-4 py-2.5"
        >
          <span className="shrink-0 text-success-main">
            <CaralIcon name="check" size={24} color="currentColor" />
          </span>
          <span className="text-base text-neutral-900">
            {formatMessage(t.deployDone, {
              time: formatDuration(run.elapsed.reduce((a, b) => a + b, 0)),
              platform: platformName,
            })}
          </span>
        </div>
      )}
    </section>
  );
}

function TaskIcon({ state }: { state: "done" | "running" | "pending" }) {
  if (state === "done") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-main text-neutral-100">
        <CaralIcon name="check" size={16} color="currentColor" />
      </span>
    );
  }
  if (state === "running") {
    return (
      <span
        aria-hidden
        className="size-6 shrink-0 animate-spin rounded-full border-[3px] border-solid"
        style={{
          borderColor: "var(--color-warning-light)",
          borderTopColor: "var(--color-warning-main)",
        }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="size-6 shrink-0 rounded-full border-2 border-solid"
      style={{ borderColor: "var(--color-neutral-800)" }}
    />
  );
}
