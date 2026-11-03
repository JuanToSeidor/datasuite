"use client";

import React from "react";
import { Brand, type CaralBrandName } from "@/components/icons";

interface SelectionSummaryCardProps {
  brand: CaralBrandName;
  title: string;
  subtitle: string;
  /** Línea opcional inferior (p.ej. salud de la conexión). */
  meta?: React.ReactNode;
  size?: "md" | "lg";
}

/** Tarjeta resaltada (naranja Accelerate) que resume la conexión o el workspace elegido. */
export function SelectionSummaryCard({
  brand,
  title,
  subtitle,
  meta,
  size = "lg",
}: SelectionSummaryCardProps) {
  const isLarge = size === "lg";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-warning-main bg-warning-light p-3 font-poppins">
      {!isLarge && (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
          <Brand name={brand} size={24} />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {isLarge && <Brand name={brand} size={36} />}
          <span
            className={`truncate font-bold text-warning-main ${isLarge ? "text-2xl" : "text-xl"}`}
          >
            {title}
          </span>
        </div>
        <span
          className={`text-warning-hard ${isLarge ? "text-lg font-semibold" : "text-base"}`}
        >
          {subtitle}
        </span>
        {meta && <span className="text-base text-neutral-900">{meta}</span>}
      </div>
    </div>
  );
}
