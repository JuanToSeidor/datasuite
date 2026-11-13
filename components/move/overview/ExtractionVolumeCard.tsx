"use client";

import React, { useMemo, useState } from "react";
import { Tabs } from "caralstable";
import type { CaralBrandName } from "@/components/icons";
import { Select, TimelineRangeSlider } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import volumeData from "@/data/move/extractionVolume.json";
import { useLocaleTag } from "./format";
import { MoveCard, MoveCardFooterLink } from "./MoveCard";

interface VolumeSource {
  id: string;
  name: string;
  brandName: string;
}

interface VolumeDay {
  date: string;
  /** Extracciones del día, en el mismo orden que `sources`. */
  counts: number[];
}

type Granularity = "day" | "week" | "month";

interface VolumeBar {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
}

const SOURCES = volumeData.sources as VolumeSource[];
const DAYS = volumeData.days as VolumeDay[];
const TOTAL_DAYS = DAYS.length;

const ALL_SOURCES = "all";
const GRANULARITIES: Granularity[] = ["day", "week", "month"];

/** Ventana que abre cada vista rápida (en días). */
const QUICK_WINDOW_DAYS: Record<Granularity, number> = { day: 14, week: 84, month: 243 };
/** Mínimo visible: una semana. */
const MIN_WINDOW_DAYS = 6;

/** Agrupación automática según los días visibles (como el gráfico de Optimize). */
function granularityFor(days: number): Granularity {
  if (days <= 45) return "day";
  if (days <= 210) return "week";
  return "month";
}

const parseDate = (iso: string) => new Date(`${iso}T00:00:00`);

/** Lunes de la semana de una fecha (clave de agrupación semanal). */
function mondayOf(iso: string) {
  const date = parseDate(iso);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

/**
 * Volumen de extracción: barras con la cantidad de extracciones por día, semana o mes.
 * La ventana visible se acerca/aleja y desplaza con el slider inferior (como en Optimize),
 * y la agrupación se ajusta sola para que las barras entren en el espacio.
 */
export function ExtractionVolumeCard({ className = "" }: { className?: string }) {
  const { dict } = useLanguage();
  const t = dict.move.overview;
  const tv = t.volume;
  const locale = useLocaleTag();

  const [range, setRange] = useState({ start: TOTAL_DAYS - QUICK_WINDOW_DAYS.month, end: TOTAL_DAYS - 1 });
  const [source, setSource] = useState<string>(ALL_SOURCES);
  const [hovered, setHovered] = useState<string | null>(null);

  const windowDays = range.end - range.start + 1;
  const granularity = granularityFor(windowDays);

  const sourceIndex = SOURCES.findIndex((s) => s.id === source);
  const countFor = (day: VolumeDay) =>
    sourceIndex >= 0 ? day.counts[sourceIndex] : day.counts.reduce((sum, n) => sum + n, 0);

  const bars = useMemo<VolumeBar[]>(() => {
    const fmt = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString(locale, options);
    const map = new Map<string, VolumeBar>();

    DAYS.slice(range.start, range.end + 1).forEach((day) => {
      const date = parseDate(day.date);
      let key: string;
      let label: string;
      let fullLabel: string;

      if (granularity === "day") {
        key = day.date;
        label = fmt(date, { day: "numeric", month: "short" });
        fullLabel = fmt(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      } else if (granularity === "week") {
        const monday = mondayOf(day.date);
        key = monday.toISOString().slice(0, 10);
        label = fmt(monday, { day: "numeric", month: "short" });
        fullLabel = formatMessage(tv.weekOf, { date: fmt(monday, { day: "numeric", month: "long", year: "numeric" }) });
      } else {
        key = day.date.slice(0, 7);
        label = fmt(date, { month: "short", year: "2-digit" });
        fullLabel = fmt(date, { month: "long", year: "numeric" });
      }

      const bar = map.get(key) ?? { key, label, fullLabel, value: 0 };
      bar.value += countFor(day);
      map.set(key, bar);
    });

    return Array.from(map.values());
    // countFor depende de sourceIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, granularity, sourceIndex, locale, tv.weekOf]);

  const maxValue = Math.max(1, ...bars.map((bar) => bar.value));
  const totalValue = bars.reduce((sum, bar) => sum + bar.value, 0);
  const hoveredBar = bars.find((bar) => bar.key === hovered) ?? null;

  // Muchas barras: menos separación y etiquetas salteadas para que el eje no se encime.
  const gapClass = bars.length > 40 ? "gap-0.5" : bars.length > 16 ? "gap-1" : "gap-3";
  const labelStep = Math.ceil(bars.length / 10);

  /** Vista rápida: abre la ventana típica de esa agrupación, anclada al final visible. */
  const setQuickView = (index: number) => {
    const days = QUICK_WINDOW_DAYS[GRANULARITIES[index]];
    const end = range.end;
    const start = Math.max(0, end - days + 1);
    setRange({ start, end: Math.max(end, start + days - 1) });
  };

  const fmtDay = (index: number) =>
    parseDate(DAYS[index].date).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  const sourceOptions = [
    { value: ALL_SOURCES, label: tv.allSources, iconName: "database" as const },
    ...SOURCES.map((s) => ({ value: s.id, label: s.name, brand: s.brandName as CaralBrandName })),
  ];

  return (
    <MoveCard
      title={t.extractionVolumeTitle}
      className={className}
      action={
        // Contenedor de ancho fijo: Select ocupa siempre el 100% de su contenedor.
        <div className="w-52 shrink-0">
          <Select options={sourceOptions} value={source} onValueChange={(value) => setSource(String(value))} />
        </div>
      }
      footer={<MoveCardFooterLink label={t.viewPerformance} />}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[{ label: tv.day }, { label: tv.week }, { label: tv.month }]}
          activeIndex={GRANULARITIES.indexOf(granularity)}
          onChange={setQuickView}
        />
        <p className="text-sm text-neutral-800">
          {formatMessage(tv.summary, {
            from: fmtDay(range.start),
            to: fmtDay(range.end),
            n: totalValue.toLocaleString(locale),
          })}
        </p>
      </div>

      {/* Barras */}
      <div className="relative">
        {hoveredBar && (
          <div className="pointer-events-none absolute right-0 top-0 z-30 flex flex-col gap-0.5 rounded-lg border border-neutral-500 bg-container px-3 py-2 text-xs shadow-xl">
            <span className="font-semibold capitalize text-neutral-900">{hoveredBar.fullLabel}</span>
            <span className="text-info-main">
              {formatMessage(tv.extractions, { n: hoveredBar.value.toLocaleString(locale) })}
            </span>
          </div>
        )}

        <div className={`flex h-[220px] items-end ${gapClass} px-1 pt-2`}>
          {bars.map((bar) => {
            const isHovered = hovered === bar.key;
            return (
              <div
                key={bar.key}
                className="flex h-full min-w-0 flex-1 cursor-default flex-col justify-end overflow-hidden rounded-md bg-neutral-500"
                onMouseEnter={() => setHovered(bar.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className={`w-full rounded-md transition-[height,background-color] duration-300 ${
                    isHovered ? "bg-info-hard" : "bg-info-main"
                  }`}
                  style={{ height: `${Math.max(2, (bar.value / maxValue) * 100)}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Eje X */}
        <div className={`flex ${gapClass} px-1 pt-2`}>
          {bars.map((bar, index) => (
            <span
              key={bar.key}
              className={`min-w-0 flex-1 truncate text-center text-xs font-medium capitalize ${
                hovered === bar.key ? "text-info-main" : "text-neutral-900"
              } ${index % labelStep === 0 ? "" : "invisible"}`}
            >
              {bar.label}
            </span>
          ))}
        </div>
      </div>

      {/* Ventana de tiempo: acercar/alejar y desplazar */}
      <TimelineRangeSlider
        total={TOTAL_DAYS}
        start={range.start}
        end={range.end}
        minSpan={MIN_WINDOW_DAYS}
        onChange={(start, end) => setRange({ start, end })}
        labels={{ start: tv.sliderStart, end: tv.sliderEnd, window: tv.sliderWindow }}
        className="mt-1"
      />
    </MoveCard>
  );
}
