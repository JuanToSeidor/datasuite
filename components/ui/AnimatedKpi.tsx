"use client";

import React, { useEffect, useState } from "react";

const STAGGER_MS = 180;
const DURATION_MS = 1400;

export interface AnimatedKpiProps {
  /** Texto final que se muestra cuando no hay conteo numérico. */
  value: string;
  /** Si se pasa, el valor cuenta desde 0 hasta este número. */
  count?: number;
  decimals?: number;
  suffix?: string;
  label: string;
  /** Posición de la tarjeta: define cuándo empieza su animación. */
  index: number;
}

/**
 * KPI que aparece en secuencia. El degradado del icono Analice se
 * "llena" sobre el valor como una barra de carga mientras el número
 * cuenta hasta su valor final.
 */
export function AnimatedKpi({ value, count, decimals = 0, suffix = "", label, index }: AnimatedKpiProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisible(true);
      setProgress(1);
      return;
    }

    let raf = 0;
    let start = 0;
    const timer = window.setTimeout(() => {
      setVisible(true);
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const linear = Math.min(1, (timestamp - start) / DURATION_MS);
        // Ease-out cúbico: la carga arranca rápido y frena al final.
        setProgress(1 - Math.pow(1 - linear, 3));
        if (linear < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, index * STAGGER_MS);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [index]);

  const displayed =
    count !== undefined
      ? `${new Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(count * progress)}${suffix}`
      : value;

  // Durante la carga, el degradado a todo color (degradado del icono Analice) cubre
  // hasta el avance y termina en bg-container en el borde. Al completarse, la tarjeta
  // queda solo con bg-container.
  const done = progress * 100;
  const isLoading = progress < 1;

  return (
    <div
      className={`flex flex-col rounded-xl bg-container p-4 transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      style={
        isLoading
          ? {
              backgroundImage:
                "linear-gradient(90deg, var(--color-indigo-main) 0%, var(--color-info-main) 55%, var(--color-info-light) 85%, var(--color-container) 100%)",
              backgroundSize: `${done}% 100%`,
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      <span className="text-2xl font-bold text-neutral-900">{displayed}</span>
      <span className="text-xs text-neutral-800">{label}</span>
    </div>
  );
}
