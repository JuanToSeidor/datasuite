import React from "react";
import { CaralIcon } from "@/components/icons";

export type CatalogStatus = "contracted" | "unavailable" | "comingSoon";

/** Polígono de estrella/sello con `points` puntas (radio interno en %). */
function sealPolygon(points: number, innerRadius = 40, outerRadius = 50) {
  const vertices: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    vertices.push(`${(50 + r * Math.cos(angle)).toFixed(2)}% ${(50 + r * Math.sin(angle)).toFixed(2)}%`);
  }
  return `polygon(${vertices.join(", ")})`;
}

const SEAL_CLIP_PATH = sealPolygon(12);

interface CatalogStatusBadgeProps {
  status: CatalogStatus;
  /** Texto accesible / tooltip. */
  label: string;
}

/**
 * Sello de estado del ACT-IN en el catálogo:
 * - contracted: estrella verde con check
 * - unavailable: estrella roja con X
 * - comingSoon: círculo gris con reloj
 */
export function CatalogStatusBadge({ status, label }: CatalogStatusBadgeProps) {
  if (status === "comingSoon") {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-500 text-neutral-800"
      >
        <CaralIcon name="clock" color="currentColor" />
      </span>
    );
  }

  const isContracted = status === "contracted";
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{ clipPath: SEAL_CLIP_PATH }}
      className={`flex size-13 shrink-0 items-center justify-center text-neutral-100 ${
        isContracted ? "bg-success-main" : "bg-danger-main"
      }`}
    >
      <CaralIcon name={isContracted ? "check" : "x"}  color="currentColor" />
    </span>
  );
}
