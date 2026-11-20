"use client";

import { useEffect, useMemo, useState } from "react";
import detailsData from "@/data/preserve/extractionDetails.json";

export type TableStatus = "extracting" | "matches" | "matchesWithErrors";
export type ExtractionStatus = "extracting" | "withDifferences" | "matches";

export interface TableDetail {
  table: string;
  leftSap: number | null;
  arrived: number | null;
  progress: number;
  difference: number | null;
  status: TableStatus;
}

export interface ExtractionDetail {
  status: ExtractionStatus;
  /** Extracción simulada en vivo: avanza sola desde que se inicia en el asistente. */
  live?: boolean;
  owner?: string;
  archive?: string;
  route: {
    source: string;
    destination: string;
    sourceType: string;
    sourceBrand: string;
    destinationType: string;
    destinationBrand: string;
  };
  progress: number;
  startedAt: string;
  elapsedSeconds: number;
  /** Tabla con error, citada en los comentarios. */
  errorTable?: string;
  tables: TableDetail[];
  /** Resto de tablas: se resumen en una fila y se despliegan con "Ver más". */
  pendingTables: TableDetail[];
}

export const extractionDetails = detailsData as Record<string, ExtractionDetail>;

/** Extracción que se crea al iniciar la primera extracción (primer despliegue). */
export const LIVE_EXTRACTION_ID = "EXT-032";

const STORAGE_KEY = "preserve_live_extraction_started";
/** Evento de ventana al iniciar u olvidar la extracción en vivo (lo escucha el layout de Preserve). */
export const LIVE_EXTRACTION_EVENT = "preserve:live-extraction";
const notify = () => window.dispatchEvent(new Event(LIVE_EXTRACTION_EVENT));
/** Tablas que se extraen en paralelo. */
const CONCURRENCY = 6;

/** Marca el inicio de la extracción en vivo (desde el asistente): siempre arranca de 0. */
export function startLiveExtraction() {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    /* sin storage: el detalle arrancará al abrirse */
  }
  notify();
}

/** Olvida la extracción en vivo: el primer despliegue vuelve a empezar sin extracciones. */
export function clearLiveExtraction() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
  notify();
}

/** Inicio guardado de la extracción en vivo, o null si todavía no se inició. */
export function getLiveExtractionStart(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Segundos que tarda una tabla en extraerse (más filas, más tiempo): ~10–20 s. */
const tableDuration = (row: TableDetail) => 6 + Math.round(Math.log10((row.leftSap ?? 0) + 10) * 1.5);

/**
 * Agenda de la simulación: las tablas se extraen en orden, `CONCURRENCY` a la vez.
 * El estado en un instante se deriva solo del tiempo transcurrido, así que al recargar
 * o volver a la pantalla la extracción sigue donde iba.
 */
function buildSchedule(rows: TableDetail[]) {
  const workers = new Array<number>(CONCURRENCY).fill(0);
  return rows.map((row) => {
    const slot = workers.indexOf(Math.min(...workers));
    const start = workers[slot];
    const end = start + tableDuration(row);
    workers[slot] = end;
    return { start, end };
  });
}

function simulateRow(row: TableDetail, slot: { start: number; end: number }, elapsed: number, errorTable?: string): TableDetail {
  const ratio = Math.min(1, Math.max(0, (elapsed - slot.start) / (slot.end - slot.start)));
  const progress = Math.floor(ratio * 100);
  const done = progress >= 100;
  return {
    ...row,
    progress,
    arrived: Math.round((row.leftSap ?? 0) * ratio),
    difference: done ? 0 : null,
    status: done ? (row.table === errorTable ? "matchesWithErrors" : "matches") : "extracting",
  };
}

/** Estado de una extracción para pintarla (estática desde el JSON o simulada en vivo). */
export interface ExtractionRun {
  status: ExtractionStatus;
  progress: number;
  startedAt: string;
  elapsedSeconds: number;
  isRunning: boolean;
  tables: TableDetail[];
  pendingTables: TableDetail[];
  /** Si ya hay que mostrar el comentario de la tabla con error. */
  showError: boolean;
}

/**
 * Avance de una extracción. Las estáticas solo mueven el reloj; las `live` simulan la
 * extracción completa tabla por tabla desde su inicio guardado.
 */
export function useExtractionRun(detail: ExtractionDetail | undefined): ExtractionRun | null {
  const isLive = Boolean(detail?.live);
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(mountedAt);
  const [liveStart, setLiveStart] = useState<string | null>(null);

  // Inicio de la extracción en vivo; si se abre sin pasar por el asistente, arranca ahora.
  useEffect(() => {
    if (!isLive) return;
    let start = getLiveExtractionStart();
    if (!start) {
      startLiveExtraction();
      start = getLiveExtractionStart() ?? new Date().toISOString();
    }
    setLiveStart(start);
    setNow(Date.now());

    // Si se reinicia desde el asistente, se toma el nuevo inicio.
    const onChange = () => {
      const next = getLiveExtractionStart();
      if (next) {
        setLiveStart(next);
        setNow(Date.now());
      }
    };
    window.addEventListener(LIVE_EXTRACTION_EVENT, onChange);
    return () => window.removeEventListener(LIVE_EXTRACTION_EVENT, onChange);
  }, [isLive]);

  const allRows = useMemo(() => (detail ? [...detail.tables, ...detail.pendingTables] : []), [detail]);
  const schedule = useMemo(() => (isLive ? buildSchedule(allRows) : []), [isLive, allRows]);
  const totalSeconds = schedule.length ? Math.max(...schedule.map((s) => s.end)) : 0;

  const elapsedSeconds = !detail
    ? 0
    : isLive
      ? liveStart
        ? Math.max(0, Math.floor((now - Date.parse(liveStart)) / 1000))
        : 0
      : detail.elapsedSeconds + Math.floor((now - mountedAt) / 1000);

  const isRunning = !!detail && (isLive ? elapsedSeconds < totalSeconds : detail.status === "extracting");

  // Un tick por segundo mientras la extracción está en curso.
  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  return useMemo(() => {
    if (!detail) return null;
    if (!isLive) {
      return {
        status: detail.status,
        progress: detail.progress,
        startedAt: detail.startedAt,
        elapsedSeconds,
        isRunning,
        tables: detail.tables,
        pendingTables: detail.pendingTables,
        showError: Boolean(detail.errorTable),
      };
    }

    // La duración se congela al terminar.
    const elapsed = Math.min(elapsedSeconds, totalSeconds);
    const rows = allRows.map((row, i) => simulateRow(row, schedule[i], elapsed, detail.errorTable));
    const progress = Math.floor(rows.reduce((sum, r) => sum + r.progress, 0) / Math.max(rows.length, 1));
    return {
      status: isRunning ? "extracting" : "matches",
      progress,
      startedAt: liveStart ?? new Date(mountedAt).toISOString(),
      elapsedSeconds: elapsed,
      isRunning,
      tables: rows.slice(0, detail.tables.length),
      pendingTables: rows.slice(detail.tables.length),
      showError: rows.some((r) => r.status === "matchesWithErrors"),
    };
  }, [detail, isLive, elapsedSeconds, totalSeconds, isRunning, allRows, schedule, liveStart, mountedAt]);
}
