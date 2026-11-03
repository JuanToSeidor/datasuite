"use client";

import React, { useEffect, useState } from "react";
import { Button } from "caralstable";
import { CaralIcon, type Icons } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { SourceTable, SourceTableStatus } from "../types";
import { StepHeading } from "./OriginStep";
import {
  PENDING_BG,
  SCANNED_BG,
  TICK_MS,
  progressBackground,
  randomBetween,
  tickProgress,
} from "./progressRow";

/** Duración por tabla (ms): la mayoría rápidas, algunas lentas (tablas grandes). */
const FAST_RANGE = [800, 2500] as const;
const SLOW_RANGE = [4000, 7000] as const;
const SLOW_CHANCE = 0.3;

/** Sortea la duración de cada tabla; garantiza al menos una lenta para dar realismo. */
function randomDurations(count: number): number[] {
  const durations = Array.from({ length: count }, () =>
    randomBetween(Math.random() < SLOW_CHANCE ? SLOW_RANGE : FAST_RANGE),
  );
  if (count > 1 && !durations.some((d) => d >= SLOW_RANGE[0])) {
    durations[Math.floor(Math.random() * count)] = randomBetween(SLOW_RANGE);
  }
  return durations;
}

const RESULT_BG: Record<SourceTableStatus, string> = {
  available: SCANNED_BG,
  outdated: "var(--color-warning-light)",
  missing: "var(--color-danger-light)",
};

const RESULT_STYLE: Record<
  SourceTableStatus,
  { icon: Icons; className: string }
> = {
  available: { icon: "check", className: "text-success-main" },
  outdated: { icon: "triangleExclamation", className: "text-warning-main" },
  missing: { icon: "xCircle", className: "text-danger-main" },
};

interface ValidationStepProps {
  modelName: string;
  system: string;
  tables: SourceTable[];
  /** La configuración actual ya se validó: se muestran los resultados sin re-escanear. */
  alreadyValidated: boolean;
  onComplete: () => void;
  onRestart: () => void;
}

/** Paso 3: verifica contra la metadata del Core que Move tenga extraídas las tablas del ACT-IN. */
export function ValidationStep({
  modelName,
  system,
  tables,
  alreadyValidated,
  onComplete,
  onRestart,
}: ValidationStepProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.deploy;
  const td = dict.accelerate.detail;

  // `cursor`: índice de la tabla en análisis (=== tables.length cuando terminó).
  const [scan, setScan] = useState(() => ({
    cursor: alreadyValidated ? tables.length : 0,
    progress: 0,
    durations: randomDurations(tables.length),
  }));
  const { cursor, progress } = scan;
  const running = cursor < tables.length;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      // Un único estado para que el updater no tenga efectos (StrictMode lo ejecuta dos veces).
      setScan((s) => {
        const next = s.progress + tickProgress(s.durations[s.cursor]);
        return next < 100
          ? { ...s, progress: next }
          : { ...s, cursor: s.cursor + 1, progress: 0 };
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running && !alreadyValidated) onComplete();
    // Solo al terminar el escaneo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const restart = () => {
    onRestart();
    // Cada nueva validación sortea otros tiempos.
    setScan({
      cursor: 0,
      progress: 0,
      durations: randomDurations(tables.length),
    });
  };

  const resultLabel: Record<SourceTableStatus, string> = {
    available: td.statusAvailable,
    outdated: td.statusOutdated,
    missing: td.statusMissing,
  };

  const count = (s: SourceTableStatus) =>
    tables.filter((r) => r.status === s).length;
  const missing = count("missing");
  const outdated = count("outdated");

  // El aviso se tiñe en cuanto una fila ya analizada sale con problemas (incluso a mitad del escaneo).
  const scanned = tables.slice(0, cursor);
  const alert = scanned.some((r) => r.status === "missing")
    ? { bg: "bg-danger-light", border: "border-danger-main" }
    : scanned.some((r) => r.status === "outdated")
      ? { bg: "bg-warning-light", border: "border-warning-main" }
      : null;

  const banner = running
    ? {
        tone: "border-info-main",
        icon: null,
        text: formatMessage(t.validating, {
          done: cursor,
          total: tables.length,
        }),
      }
    : missing > 0
      ? {
          tone: "border-danger-main",
          icon: { name: "xCircle" as Icons, className: "text-danger-main" },
          text: formatMessage(t.validationBlocked, { missing, system }),
        }
      : outdated > 0
        ? {
            tone: "border-warning-main",
            icon: {
              name: "triangleExclamation" as Icons,
              className: "text-warning-main",
            },
            text: formatMessage(t.validationWarnings, {
              available: count("available"),
              total: tables.length,
              outdated,
            }),
          }
        : {
            tone: "border-success-main",
            icon: {
              name: "check" as Icons,
              className: "text-success-main",
            },
            text: formatMessage(t.validationOk, { total: tables.length }),
          };

  return (
    <section className="flex w-full flex-col gap-6 rounded-lg bg-container p-5 font-poppins">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <StepHeading
          title={t.validationTitle}
          subtitle={formatMessage(t.validationSubtitle, {
            model: modelName,
            n: tables.length,
            system,
          })}
        />
        <Button
          variant="light"
          hasBorder
          iconName="sync"
          disabled={running}
          onClick={restart}
        >
          {t.revalidate}
        </Button>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2.5 rounded-lg border-l-4 px-4 py-2.5 transition-colors duration-300 ${
          alert
            ? `${alert.bg} ${alert.border}`
            : `bg-neutral-500/60 ${banner.tone}`
        }`}
      >
        {banner.icon ? (
          <span className={`shrink-0 ${banner.icon.className}`}>
            <CaralIcon name={banner.icon.name} size={24} color="currentColor" />
          </span>
        ) : (
          <span
            aria-hidden
            className="size-6 shrink-0 animate-spin rounded-full border-[3px] border-solid"
            style={{
              borderColor: "var(--color-neutral-800)",
              borderTopColor: "var(--color-warning-main)",
              opacity: 0.85,
            }}
          />
        )}
        <span className="text-base text-neutral-900">{banner.text}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-500">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-neutral-500">
              <th className="w-[8%] px-3 py-3 text-lg font-semibold text-neutral-900">
                {t.colTable}
              </th>
              <th className="w-[36%] px-3 py-3 text-lg font-semibold text-neutral-900">
                {t.colDescription}
              </th>
              <th className="w-[36%] px-3 py-3 text-lg font-semibold text-neutral-900">
                {t.colLastLoad}
              </th>
              <th className="px-3 py-3 text-lg font-semibold text-neutral-900">
                {t.colResult}
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map((row, i) => {
              const state =
                i < cursor ? "done" : i === cursor ? "analyzing" : "pending";
              const background =
                state === "done"
                  ? RESULT_BG[row.status]
                  : state === "analyzing"
                    ? progressBackground(progress)
                    : PENDING_BG;
              const cell = `px-3 py-2.5 text-base text-neutral-900 ${i < tables.length - 1 ? "border-b border-neutral-500" : ""}`;
              const result = RESULT_STYLE[row.status];

              return (
                <tr
                  key={row.table}
                  style={{ background }}
                  className="transition-colors duration-300"
                >
                  <td className={cell}>{row.table}</td>
                  <td className={cell}>{row.description}</td>
                  <td className={cell}>
                    {state === "done" ? (
                      row.lastLoad
                    ) : (
                      <span
                        className={`block h-2.5 w-24 rounded-full bg-neutral-800/30 ${state === "analyzing" ? "animate-pulse" : ""}`}
                      />
                    )}
                  </td>
                  <td className={cell}>
                    {state === "done" ? (
                      <span
                        className={`flex items-center gap-2 ${result.className}`}
                      >
                        <CaralIcon
                          name={result.icon}
                          size={24}
                          color="currentColor"
                        />
                        {resultLabel[row.status]}
                      </span>
                    ) : (
                      <span
                        className={`flex items-center gap-2 text-neutral-800 ${state === "analyzing" ? "animate-pulse" : ""}`}
                      >
                        <CaralIcon
                          name="clock"
                          size={24}
                          color="currentColor"
                        />
                        {state === "analyzing"
                          ? t.resultAnalyzing
                          : t.resultPending}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
