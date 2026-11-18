"use client";

import React from "react";
import { Button } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { monthName, monthWeeks, runsOnDate, sameDay, weekdayName, type JobColor } from "./calendar";
import type { MonitorExecution } from "./types";

/**
 * Mini calendario del panel izquierdo (Figma 505:6476): navega por meses y selecciona el día.
 * Los puntos bajo el número marcan las ejecuciones semanales/mensuales de ese día
 * (las diarias van todos los días y no aportan información).
 */
export function CalendarMiniMonth({
  month,
  onMonthChange,
  selected,
  onSelect,
  today,
  jobs,
}: {
  /** Cualquier día del mes mostrado. */
  month: Date;
  onMonthChange: (month: Date) => void;
  selected: Date;
  onSelect: (date: Date) => void;
  today: Date;
  jobs: Array<{ execution: MonitorExecution; color: JobColor }>;
}) {
  const { dict, language } = useLanguage();
  const t = dict.move.monitor;
  const weeks = monthWeeks(month);
  const markedJobs = jobs.filter(({ execution }) => execution.frequency !== "daily");
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-500">
      <div className="flex items-center gap-2.5 bg-neutral-500 px-2.5 py-1.5">
        <p className="flex flex-1 gap-1.5">
          <span className="text-seidor-main-text">{monthName(month, language)}</span>
          <span className="text-neutral-800">{month.getFullYear()}</span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          isIconButton
          iconName="chevronLeft"
          title={t.calendarPrev}
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        />
        <Button
          variant="ghost"
          size="sm"
          isIconButton
          iconName="chevronRigth"
          title={t.calendarNext}
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        />
      </div>

      <div className="grid grid-cols-7 px-1 pb-1">
        {weeks[0].map((day) => (
          <span key={day.getDay()} className="py-1.5 text-center text-xl font-semibold text-neutral-900">
            {weekdayName(day, language, "narrow")}
          </span>
        ))}
        {weeks.flat().map((day) => {
          const isSelected = sameDay(day, selected);
          const isToday = sameDay(day, today);
          const isMuted = day.getMonth() !== month.getMonth() || day < todayStart;
          const dots = markedJobs.filter(({ execution }) => runsOnDate(execution, day, today));
          // <button> nativo: celda de día transparente del calendario (no es una acción de Caral).
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              className="flex justify-center py-0.5"
            >
              <span
                className={`flex size-10 cursor-pointer flex-col items-center justify-center rounded-full transition-colors ${
                  isSelected
                    ? "bg-info-main text-neutral-100"
                    : `hover:bg-neutral-500 ${isMuted ? "text-neutral-800" : "text-neutral-900"} ${
                        isToday ? "font-bold ring-1 ring-info-main" : ""
                      }`
                }`}
              >
                <span className="leading-5">{day.getDate()}</span>
                {dots.length > 0 && (
                  <span className="flex h-1.5 gap-0.5">
                    {dots.slice(0, 3).map(({ execution, color }) => (
                      <span
                        key={execution.id}
                        className={`size-1.5 rounded-full ${isSelected ? "bg-neutral-100" : color.dot}`}
                      />
                    ))}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
