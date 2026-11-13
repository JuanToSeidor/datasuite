import React from "react";

type SpinnerTone = "info" | "success" | "warning" | "danger" | "neutral";

/** Color del tramo que gira y de la pista, con tokens semánticos de globals.css. */
const TONE_COLORS: Record<SpinnerTone, { track: string; arc: string }> = {
  info: { track: "var(--color-info-light)", arc: "var(--color-info-main)" },
  success: { track: "var(--color-success-light)", arc: "var(--color-success-main)" },
  warning: { track: "var(--color-warning-light)", arc: "var(--color-warning-main)" },
  danger: { track: "var(--color-danger-light)", arc: "var(--color-danger-main)" },
  neutral: { track: "var(--color-neutral-500)", arc: "var(--color-neutral-800)" },
};

export interface SpinnerProps {
  /** Diámetro en px (por defecto 24, igual que los iconos de Caral). */
  size?: number;
  /** Grosor del borde en px. */
  thickness?: number;
  tone?: SpinnerTone;
  /** Texto accesible; si se omite, el spinner es decorativo. */
  label?: string;
  className?: string;
}

/**
 * Spinner de carga (mismo patrón que los pasos de despliegue de Accelerate):
 * círculo con pista suave y un tramo de color que gira.
 */
export function Spinner({ size = 24, thickness = 3, tone = "info", label, className = "" }: SpinnerProps) {
  const { track, arc } = TONE_COLORS[tone];
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 animate-spin rounded-full border-solid ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderColor: track,
        borderTopColor: arc,
      }}
    />
  );
}
