import type React from "react";
import type { JobNodeRun } from "./types";

/** Degradado de carga de la fila: de bg-full a bg-container (el fondo de todas las filas). */
const PROGRESS_GRADIENT = "linear-gradient(90deg, var(--color-full) 0%, var(--color-container) 100%)";
/** Mismo degradado para la fila seleccionada, en tonos info para fundirse con su fondo info-100. */
const SELECTED_PROGRESS_GRADIENT =
  "linear-gradient(90deg, color-mix(in srgb, var(--color-info-main) 18%, var(--color-info-100)) 0%, var(--color-info-100) 100%)";

/**
 * Fondo de progreso por fila de nodo (mismo degradado de carga que AnimatedKpi).
 * - En curso: el degradado cubre el % completado y crece con transición.
 *   Con `isVisible` en false queda en 0, para que al mostrarse se llene desde 0.
 * - Al completarse: el degradado se ancla a la derecha y se vacía hacia ese lado.
 * - Con aviso: sin degradado (mantiene su fondo), salvo que esté seleccionada.
 */
export function nodeProgressStyle(
  node: Pick<JobNodeRun, "status" | "progress">,
  { isSelected, isVisible }: { isSelected: boolean; isVisible: boolean }
): React.CSSProperties | undefined {
  if (node.status === "warning" && !isSelected) return undefined;
  const isActive = node.status === "running";
  const fill = isVisible && isActive ? node.progress : 0;
  return {
    backgroundImage: isSelected ? SELECTED_PROGRESS_GRADIENT : PROGRESS_GRADIENT,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${fill}% 100%`,
    backgroundPosition: isActive ? "left center" : "right center",
    transition: "background-size 700ms cubic-bezier(0.22, 1, 0.36, 1)",
  };
}
