/** Fondos de fila "barra de progreso" compartidos por Validación y Despliegue. */

export const PENDING_BG = "var(--color-neutral-500)";
export const SCANNED_BG = "var(--color-container)";

/** Intervalo de las simulaciones del asistente. */
export const TICK_MS = 40;

/**
 * Fondo de fila como barra de progreso: la parte completada (izquierda) cubre el gris
 * pendiente con un borde degradado suave.
 */
export function progressBackground(progress: number) {
  const edge = Math.min(progress + 12, 100);
  return `linear-gradient(90deg, ${SCANNED_BG} 0%, ${SCANNED_BG} ${progress}%, ${PENDING_BG} ${edge}%)`;
}

export const randomBetween = ([min, max]: readonly [number, number]) =>
  min + Math.random() * (max - min);

/** Avance de un tick para una tarea de `durationMs`, con tirones (×0,2–1,8) para que no sea lineal. */
export const tickProgress = (durationMs: number) =>
  (TICK_MS / durationMs) * 100 * (0.2 + Math.random() * 1.6);
