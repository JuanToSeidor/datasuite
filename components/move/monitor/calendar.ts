import type { Language } from "@/locales";
import type { MonitorExecution } from "./types";

export type CalendarView = "day" | "week" | "month";

/** Colores por job (tokens Caral): punto de la leyenda / mini calendario y fondo del evento. */
const JOB_COLORS = [
  { dot: "bg-info-main", chip: "bg-info-light" },
  { dot: "bg-success-main", chip: "bg-success-light" },
  { dot: "bg-warning-main", chip: "bg-warning-light" },
  { dot: "bg-sakura-main", chip: "bg-sakura-light" },
  { dot: "bg-indigo-main", chip: "bg-indigo-light" },
  { dot: "bg-danger-main", chip: "bg-danger-light" },
] as const;

export type JobColor = (typeof JOB_COLORS)[number];

export function jobColor(index: number): JobColor {
  return JOB_COLORS[index % JOB_COLORS.length];
}

const LOCALES: Record<Language, string> = { es: "es-ES", en: "en-US", pt: "pt-BR" };

export function toLocale(language: Language) {
  return LOCALES[language] ?? "es-ES";
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function monthName(date: Date, language: Language) {
  return capitalize(date.toLocaleDateString(toLocale(language), { month: "long" }));
}

/** Nombre del día de la semana (`narrow`: D L M…, `short`: Dom Lun…). */
export function weekdayName(date: Date, language: Language, style: "narrow" | "short") {
  return capitalize(date.toLocaleDateString(toLocale(language), { weekday: style }).replace(".", ""));
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Domingo de la semana de `date` (el calendario empieza en domingo, como el diseño). */
export function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

export function weekDays(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Semanas completas (domingo a sábado) que cubren el mes de `date`. */
export function monthWeeks(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const weeks: Date[][] = [];
  for (let start = startOfWeek(first); start <= last; start = addDays(start, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
  }
  return weeks;
}

/** Desplaza la fecha una unidad de la vista (día, semana o mes). */
export function shiftDate(date: Date, view: CalendarView, step: 1 | -1) {
  if (view === "day") return addDays(date, step);
  if (view === "week") return addDays(date, 7 * step);
  const target = new Date(date.getFullYear(), date.getMonth() + step, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

/**
 * ¿El job se ejecuta ese día? (demo sin backend): las frecuencias se anclan a hoy.
 * - diario: todos los días.
 * - semanal: el mismo día de la semana que hoy.
 * - mensual: el mismo día del mes que hoy (o el último día si el mes es más corto).
 */
export function runsOnDate(execution: MonitorExecution, date: Date, today: Date) {
  if (execution.frequency === "daily") return true;
  if (execution.frequency === "weekly") return date.getDay() === today.getDay();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() === Math.min(today.getDate(), lastDay);
}

export function executionHour(execution: MonitorExecution) {
  return Number(execution.time.split(":")[0]);
}

/** Zona horaria del navegador en formato GMT±H (o GMT±H:MM). */
export function gmtLabel(date: Date = new Date()) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}
