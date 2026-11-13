"use client";

import { useSyncExternalStore } from "react";
import upcomingData from "@/data/move/upcomingExtractions.json";
import type { ScheduledJob, ScheduledRun } from "./types";

export const SCHEDULED_JOBS = upcomingData.jobs as ScheduledJob[];

/** Clave de día local (YYYY-MM-DD), sin pasar por UTC. */
export function dayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Ejecuciones programadas de un día, ordenadas por hora. */
export function runsOn(date: Date): ScheduledRun[] {
  return SCHEDULED_JOBS.filter((job) => job.monthDays.includes(date.getDate()))
    .map((job) => {
      const [h, min] = job.time.split(":").map(Number);
      const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, min);
      return { job, at };
    })
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

const noopSubscribe = () => () => {};

/**
 * Día de hoy (YYYY-MM-DD). En el prerender estático devuelve null para no fijar
 * en el HTML la fecha del build (evita desajustes de hidratación).
 */
export function useTodayKey(): string | null {
  return useSyncExternalStore(noopSubscribe, () => dayKey(new Date()), () => null);
}
