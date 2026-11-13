"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidePanel } from "@/contexts/SidePanelContext";
import { formatMessage } from "@/lib/format";
import { useLocaleTag } from "./format";
import { MoveCard, MoveCardFooterLink } from "./MoveCard";
import { dayKey, parseDayKey, runsOn, useTodayKey } from "./schedule";
import { UPCOMING_DAY_PANEL_WIDTH, UpcomingDayPanel } from "./UpcomingDayPanel";

/** Cuántos meses hacia adelante se pueden recorrer en el calendario. */
const MAX_MONTHS_AHEAD = 11;
/** Domingo de referencia para generar las iniciales de los días (D L M X J V S). */
const REFERENCE_SUNDAY = new Date(2026, 10, 1);

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Semanas (domingo a sábado) que cubren el mes indicado. */
function monthWeeks(year: number, month: number) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((first.getDay() + daysInMonth) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => new Date(year, month, 1 - first.getDay() + i));
}

/**
 * Próximas extracciones: calendario mensual con los días que tienen ejecuciones
 * programadas (círculo azul). Al tocar un día se abre su agenda en el panel lateral.
 */
export function UpcomingExtractionsCard({ className = "" }: { className?: string }) {
  const { dict } = useLanguage();
  const t = dict.move.overview;
  const todayKey = useTodayKey();

  return (
    <MoveCard
      title={t.upcomingTitle}
      className={className}
      // Sin línea bajo el título: el corte lo marca el propio calendario.
      headerDivider={false}
      footer={<MoveCardFooterLink label={t.viewCalendar} />}
    >
      {/* En el prerender aún no se conoce "hoy": se reserva el espacio del calendario. */}
      {todayKey ? <UpcomingCalendar todayKey={todayKey} /> : <div className="min-h-[360px]" />}
    </MoveCard>
  );
}

function UpcomingCalendar({ todayKey }: { todayKey: string }) {
  const { dict } = useLanguage();
  const t = dict.move.overview.upcoming;
  const locale = useLocaleTag();
  const { isSidePanelOpen, openSidePanel, closeSidePanel } = useSidePanel();

  const today = useMemo(() => parseDayKey(todayKey), [todayKey]);
  const [monthOffset, setMonthOffset] = useState(0);
  // Día cuya agenda está abierta en el panel lateral (se resalta en el calendario).
  const [openKey, setOpenKey] = useState<string | null>(null);

  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const days = useMemo(
    () => monthWeeks(viewMonth.getFullYear(), viewMonth.getMonth()),
    // viewMonth se deriva de today + monthOffset
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [today, monthOffset]
  );

  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(REFERENCE_SUNDAY.getFullYear(), REFERENCE_SUNDAY.getMonth(), REFERENCE_SUNDAY.getDate() + i)
          .toLocaleDateString(locale, { weekday: "narrow" })
          .toUpperCase()
      ),
    [locale]
  );

  // Abre (o actualiza) la agenda del día en el panel lateral.
  useEffect(() => {
    if (!openKey) return;
    const date = parseDayKey(openKey);
    openSidePanel(
      <UpcomingDayPanel key={openKey} date={date} runs={runsOn(date)} onClose={closeSidePanel} />,
      { width: UPCOMING_DAY_PANEL_WIDTH }
    );
  }, [openKey, locale, openSidePanel, closeSidePanel]);

  // Si el panel se cierra (X, cambio de ruta, otro panel...), el día deja de estar abierto.
  const wasPanelOpen = useRef(false);
  useEffect(() => {
    if (wasPanelOpen.current && !isSidePanelOpen) setOpenKey(null);
    wasPanelOpen.current = isSidePanelOpen;
  }, [isSidePanelOpen]);

  const monthLabel = capitalize(viewMonth.toLocaleDateString(locale, { month: "long", year: "numeric" }));

  return (
      <div className="overflow-hidden rounded-lg border border-neutral-500">
        {/* Mes + navegación */}
        <div className="flex items-center gap-2.5 bg-neutral-500 px-2.5 py-1.5">
          <p className="flex-1 text-neutral-900">{monthLabel}</p>
          <Button
            isIconButton
            variant="ghost"
            size="sm"
            iconName="chevronLeft"
            title={t.prevMonth}
            disabled={monthOffset === 0}
            onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
          />
          <Button
            isIconButton
            variant="ghost"
            size="sm"
            iconName="chevronRigth"
            title={t.nextMonth}
            disabled={monthOffset >= MAX_MONTHS_AHEAD}
            onClick={() => setMonthOffset((m) => Math.min(MAX_MONTHS_AHEAD, m + 1))}
          />
        </div>

        <div className="grid grid-cols-7 justify-items-center gap-y-1 px-1 pb-2">
          {weekdays.map((label, i) => (
            <span key={i} className="py-2 text-xl font-semibold text-neutral-900">
              {label}
            </span>
          ))}

          {days.map((date) => {
            const key = dayKey(date);
            const inMonth = date.getMonth() === viewMonth.getMonth();
            const isPast = date < today;
            const runs = inMonth && !isPast ? runsOn(date) : [];
            const isToday = key === todayKey;
            const cell = "flex h-11 w-full max-w-12 items-center justify-center rounded-full";

            if (!runs.length) {
              return (
                <span
                  key={key}
                  className={`${cell} ${
                    !inMonth || isPast
                      ? "text-neutral-800"
                      : isToday
                        ? "font-bold text-info-main"
                        : "text-neutral-900"
                  }`}
                >
                  {date.getDate()}
                </span>
              );
            }

            const isSelected = key === openKey;
            // <button> nativo: el círculo del día no es un botón de acción de Caral
            // (forma y tamaño propios del calendario), pero debe ser enfocable y accesible.
            return (
              <button
                key={key}
                type="button"
                onClick={() => setOpenKey(key)}
                aria-pressed={openKey === key}
                aria-label={formatMessage(t.dayAria, {
                  date: date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }),
                  jobs: runs.map((run) => run.job.name).join(", "),
                })}
                className={`${cell} cursor-pointer bg-info-main text-neutral-100 outline-none transition-[background-color,box-shadow] hover:bg-info-hard focus-visible:ring-2 focus-visible:ring-info-hard focus-visible:ring-offset-2 focus-visible:ring-offset-container ${
                  isSelected ? "bg-info-hard!" : ""
                } ${isToday ? "font-bold" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

  );
}
