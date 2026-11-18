"use client";

import React, { useState } from "react";
import { Button, Tabs } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import logsData from "@/data/move/logs.json";
import { toLocale } from "./calendar";

/** Botón con borde de la barra (mismo estilo que MonitorPerformance). */
const OUTLINE_BUTTON_CLASS = "border border-neutral-500 cursor-pointer";

const SOURCES = ["ui", "engine", "sap"] as const;
type LogSource = (typeof SOURCES)[number];

/**
 * Pestaña "Logs" del Monitor (Figma 511:12780). Solo layout:
 * barra de herramientas (sin acciones), selector de origen UI / Engine / SAP y visor de líneas del mock.
 * `header` es la fila de pestañas, que va dentro de la misma tarjeta de cabecera.
 */
export function MonitorLogs({ header, today }: { header: React.ReactNode; today: Date }) {
  const { dict, language } = useLanguage();
  const t = dict.move.monitor;
  const [source, setSource] = useState<LogSource>("ui");

  const log = logsData.sources[source];
  const sourceLabels: Record<LogSource, string> = { ui: t.logSourceUi, engine: t.logSourceEngine, sap: t.logSourceSap };
  const dateLabel = today.toLocaleDateString(toLocale(language), {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 rounded-lg bg-container p-2.5">
        {header}
        <div className="flex flex-col pt-2.5">
          <h1 className="text-xl font-bold text-neutral-900">{t.logsTitle}</h1>
          <p className="text-sm text-neutral-800">{t.logsSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" isIconButton iconName="search" className={OUTLINE_BUTTON_CLASS} title={t.logsSearch} />
            <Button variant="ghost" isIconButton iconName="sync" className={OUTLINE_BUTTON_CLASS} title={t.refresh} />
            <Button variant="ghost" iconName="play" className={OUTLINE_BUTTON_CLASS}>
              {t.autoRefresh}
            </Button>
            <Button variant="ghost" iconName="calendar" className={OUTLINE_BUTTON_CLASS}>
              {dateLabel}
            </Button>
            <Button variant="ghost" iconName="arrowDownToLine" className={OUTLINE_BUTTON_CLASS}>
              {t.save}
            </Button>
            <Button variant="ghost" isIconButton iconName="gear" className={OUTLINE_BUTTON_CLASS} title={t.logsSettings} />
          </div>
          <Tabs
            tabs={SOURCES.map((id) => ({ label: sourceLabels[id] }))}
            activeIndex={SOURCES.indexOf(source)}
            onChange={(idx) => setSource(SOURCES[idx])}
          />
        </div>
      </div>

      <div className="flex min-h-[640px] flex-col gap-2.5 overflow-hidden rounded-lg bg-container">
        <div className="flex items-center justify-between gap-2.5 bg-info-100 p-2.5">
          <h2 className="text-xl font-semibold text-neutral-900">
            {formatMessage(t.logsEnabled, {
              source: sourceLabels[source],
              // "always": es-ES no agrupa números de 4 cifras por defecto (el diseño muestra 1.000).
              n: new Intl.NumberFormat(toLocale(language), {
                useGrouping: "always",
              } as Intl.NumberFormatOptions).format(log.totalLines),
            })}
          </h2>
          <Button variant="ghost" size="sm" isIconButton iconName="copy" title={t.copy} />
        </div>
        <div className="overflow-x-auto p-2.5">
          {log.lines.map((line, i) => (
            <p key={i} className="whitespace-pre text-base leading-6 text-neutral-900">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
