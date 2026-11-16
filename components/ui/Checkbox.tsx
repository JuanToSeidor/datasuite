"use client";

import { useEffect, useRef } from "react";
import { CaralIcon } from "@/components/icons";

export type CheckboxVariant = "success" | "info" | "neutral";

const CHECKED_CLASS: Record<CheckboxVariant, string> = {
  success: "peer-checked:bg-success-main peer-checked:border-success-hard",
  info: "peer-checked:bg-info-main peer-checked:border-info-hard",
  neutral: "peer-checked:bg-neutral-800 peer-checked:border-neutral-800",
};

const INDETERMINATE_CLASS: Record<CheckboxVariant, string> = {
  success: "bg-success-main border-success-hard",
  info: "bg-info-main border-info-hard",
  neutral: "bg-neutral-800 border-neutral-800",
};

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Estado mixto (p.ej. "seleccionar todos" con selección parcial): muestra un guion. */
  indeterminate?: boolean;
  variant?: CheckboxVariant;
  disabled?: boolean;
  /** Texto accesible cuando no hay etiqueta visible. */
  ariaLabel?: string;
  title?: string;
}

/** Casilla de 24px del design system (Caral no trae checkbox). Usa un input nativo para accesibilidad. */
export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  variant = "success",
  disabled = false,
  ariaLabel,
  title,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const mixed = indeterminate && !checked;

  return (
    <span className="relative inline-flex size-6 shrink-0" title={title}>
      <input
        ref={ref}
        type="checkbox"
        className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={`flex size-6 items-center justify-center rounded-[6px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-info-main/40 peer-disabled:opacity-50 ${
          mixed ? INDETERMINATE_CLASS[variant] : `border-neutral-800 ${CHECKED_CLASS[variant]}`
        } ${checked || mixed ? "text-neutral-100" : "text-transparent"}`}
      >
        <CaralIcon name={mixed ? "less" : "check"} size={15} />
      </span>
    </span>
  );
}
