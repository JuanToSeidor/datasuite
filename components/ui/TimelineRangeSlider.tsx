"use client";

import React, { useRef } from "react";

type DragMode = "start" | "end" | "window";

export interface TimelineRangeSliderProps {
  /** Cantidad total de posiciones (p.ej. días del histórico). */
  total: number;
  /** Índice inicial de la ventana (incluido). */
  start: number;
  /** Índice final de la ventana (incluido). */
  end: number;
  /** Tamaño mínimo de la ventana, en posiciones. */
  minSpan?: number;
  onChange: (start: number, end: number) => void;
  /** Textos accesibles de cada control. */
  labels?: { start?: string; end?: string; window?: string };
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Slider de rango tipo línea de tiempo (estilo Premiere, como el de Optimize):
 * - Asas laterales: acercan/alejan (cambian el inicio o el final de la ventana).
 * - Barra central: desplaza la ventana completa.
 * El arrastre sigue al puntero 1:1 sobre la pista (pointer events: ratón y táctil)
 * y cada control se maneja también con teclado (flechas; Shift = pasos de 10).
 */
export function TimelineRangeSlider({
  total,
  start,
  end,
  minSpan = 1,
  onChange,
  labels = {},
  className = "",
}: TimelineRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: DragMode; startX: number; start: number; end: number } | null>(null);

  const last = Math.max(total - 1, 1);
  const startPct = (start / last) * 100;
  const endPct = (end / last) * 100;

  const indexFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    return Math.round(((clientX - rect.left) / rect.width) * last);
  };

  const apply = (mode: DragMode, from: { start: number; end: number }, target: number, delta = 0) => {
    if (mode === "start") {
      onChange(clamp(target, 0, from.end - minSpan), from.end);
    } else if (mode === "end") {
      onChange(from.start, clamp(target, from.start + minSpan, total - 1));
    } else {
      const span = from.end - from.start;
      const nextStart = clamp(from.start + delta, 0, total - 1 - span);
      onChange(nextStart, nextStart + span);
    }
  };

  const onPointerDown = (mode: DragMode) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { mode, startX: e.clientX, start, end };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!drag || !rect || rect.width <= 0) return;
    const delta = Math.round(((e.clientX - drag.startX) / rect.width) * last);
    apply(drag.mode, drag, indexFromClientX(e.clientX), delta);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  const onKeyDown = (mode: DragMode) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1;
    const dir = e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    const from = { start, end };
    const target = (mode === "start" ? start : end) + dir * step;
    apply(mode, from, target, dir * step);
  };

  const dragProps = (mode: DragMode) => ({
    onPointerDown: onPointerDown(mode),
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onKeyDown: onKeyDown(mode),
    tabIndex: 0,
  });

  // Posición en línea (no clases translate-*: caralstable también las define y se sumarían).
  // Las asas quedan por FUERA de la ventana (inicio a la izquierda, fin a la derecha)
  // para que nunca se tapen entre sí aunque la ventana sea muy estrecha.
  const handleClass =
    "absolute top-1/2 z-20 size-7 cursor-ew-resize touch-none rounded-full border-2 border-container bg-neutral-800 shadow-md outline-none transition-[background-color,box-shadow] hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-info-main active:bg-seidor-main";

  return (
    // Margen lateral del tamaño de un asa: así no se salen de la pista en los extremos.
    <div className={`w-full px-7 ${className}`}>
    <div ref={trackRef} className="relative h-7 w-full select-none rounded-full bg-neutral-500">
      {/* Ventana activa: se arrastra para desplazar */}
      <div
        role="slider"
        aria-label={labels.window}
        aria-valuemin={0}
        aria-valuemax={total - 1}
        aria-valuenow={start}
        className="absolute inset-y-0.5 z-10 flex min-w-1 cursor-grab touch-none items-center justify-center rounded-full bg-neutral-800/30 outline-none transition-colors hover:bg-neutral-800/40 focus-visible:ring-2 focus-visible:ring-info-main active:cursor-grabbing"
        style={{ left: `${startPct}%`, width: `${Math.max(endPct - startPct, 0)}%` }}
        {...dragProps("window")}
      >
        <span aria-hidden className="flex gap-1 opacity-60">
          <span className="h-2.5 w-1 rounded-full bg-neutral-900" />
          <span className="h-2.5 w-1 rounded-full bg-neutral-900" />
          <span className="h-2.5 w-1 rounded-full bg-neutral-900" />
        </span>
      </div>

      {/* Asas: acercan / alejan */}
      <div
        role="slider"
        aria-label={labels.start}
        aria-valuemin={0}
        aria-valuemax={end - minSpan}
        aria-valuenow={start}
        className={handleClass}
        style={{ left: `${startPct}%`, transform: "translate(-100%, -50%)" }}
        {...dragProps("start")}
      />
      <div
        role="slider"
        aria-label={labels.end}
        aria-valuemin={start + minSpan}
        aria-valuemax={total - 1}
        aria-valuenow={end}
        className={handleClass}
        style={{ left: `${endPct}%`, transform: "translate(0, -50%)" }}
        {...dragProps("end")}
      />
    </div>
    </div>
  );
}
