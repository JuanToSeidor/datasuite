"use client";

import React from "react";
import { Button } from "caralstable";
import { Input } from "@/components/ui";
import { Placeholder } from "@/components/move/overview";
import { useLanguage } from "@/contexts/LanguageContext";

/** Botón de icono con borde de la barra (mismo estilo que MonitorPerformance). */
const ICON_BUTTON_CLASS = "border border-neutral-500 cursor-pointer";

/**
 * Pestaña "Historial" del Monitor (Figma 508:7306). Solo layout:
 * cabecera con título y barra de acciones; el cuerpo sigue como placeholder (indicado en el diseño).
 * `header` es la fila de pestañas, que va dentro de la misma tarjeta de cabecera.
 */
export function MonitorHistory({ header }: { header: React.ReactNode }) {
  const { dict } = useLanguage();
  const t = dict.move.monitor;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 rounded-lg bg-container p-2.5">
        {header}
        <div className="flex flex-wrap items-end justify-between gap-3 pb-2.5 pt-5">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-neutral-900">{t.historyTitle}</h1>
            <p className="text-sm text-neutral-800">{t.historySubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-56">
              <Input iconName="search" placeholder={t.searchPlaceholder} className="w-full" />
            </div>
            <Button variant="ghost" isIconButton iconName="arrowsMaximize" className={ICON_BUTTON_CLASS} title={t.maximize} />
            <Button variant="ghost" isIconButton iconName="sync" className={ICON_BUTTON_CLASS} title={t.refresh} />
            <Button variant="ghost" isIconButton iconName="calendar" className={ICON_BUTTON_CLASS} title={t.dateRange} />
            <Button variant="ghost" isIconButton iconName="filter" className={ICON_BUTTON_CLASS} title={t.filtersTitle} />
            <Button variant="success" iconName="arrowDownToLine">
              {t.download}
            </Button>
          </div>
        </div>
      </div>

      <Placeholder label={t.comingSoon} className="min-h-[640px] bg-container" />
    </div>
  );
}
