import React from "react";
import { Brand, type CaralBrandName } from "@/components/icons";

interface BrandPillProps {
  brand: CaralBrandName;
  label: string;
  /** false = atenuada (p.ej. destino "Próximamente"). */
  enabled?: boolean;
  size?: "sm" | "md";
}

/**
 * Píldora con logo de marca.
 * Excepción a la regla de usar <Chip />: el Chip de Caral solo acepta íconos `iconcaral2`,
 * no logos <Brand />.
 */
export function BrandPill({ brand, label, enabled = true, size = "md" }: BrandPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-poppins ${
        size === "sm" ? "gap-1.5 px-3 py-1 text-xs" : "gap-2 px-4 py-1.5 text-sm"
      } ${
        enabled ? "border-neutral-800 font-semibold text-neutral-900" : "border-neutral-500 text-neutral-800"
      }`}
    >
      <span className={enabled ? "" : "opacity-60"}>
        <Brand name={brand} size={size === "sm" ? 13 : 15} />
      </span>
      {label}
    </span>
  );
}
