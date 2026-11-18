"use client";

import React, { useCallback, useMemo, useState } from "react";
import { JobRunningCard } from "@/components/move/overview";
import type { DestinationPreview } from "@/components/move/overview/types";
import { executionStatus } from "./data";
import type { MonitorExecution } from "./types";

/**
 * Vista de lista del Monitor (Figma "Monitor - Performance"):
 * arriba el job en ejecución con la misma tarjeta del Resumen y, debajo,
 * los jobs ya ejecutados hoy plegados (nombre + estado), del más reciente al más antiguo.
 * Las ejecuciones programadas que aún no arrancaron solo aparecen en la vista de tarjetas.
 */
export function JobPerformanceList({
  executions,
  destinationPreview,
}: {
  executions: MonitorExecution[];
  destinationPreview: DestinationPreview;
}) {
  const { running, finished } = useMemo(() => {
    const executed = executions.filter((execution) => !execution.scheduled);
    const isRunning = (execution: MonitorExecution) =>
      executionStatus(false, execution.job.nodes) === "running";
    return {
      running: executed.filter(isRunning),
      finished: executed.filter((execution) => !isRunning(execution)).reverse(),
    };
  }, [executions]);

  // Una sola selección para todas las tarjetas: el panel lateral muestra un nodo cada vez.
  const [selection, setSelection] = useState<{ jobId: string; nodeId: string } | null>(null);
  const selectionHandler = useCallback(
    (jobId: string) => (nodeId: string | null) =>
      setSelection((current) => {
        if (nodeId) return { jobId, nodeId };
        // Solo la tarjeta dueña de la selección puede limpiarla.
        return current?.jobId === jobId ? null : current;
      }),
    []
  );

  const renderCard = (execution: MonitorExecution, variant: "live" | "summary") => (
    <JobRunningCard
      key={execution.id}
      job={execution.job}
      destinationPreview={destinationPreview}
      variant={variant}
      showFooterLink={false}
      // El job en ejecución se muestra abierto; los ya ejecutados, plegados.
      defaultOpen={variant === "live"}
      selectedNodeId={selection?.jobId === execution.id ? selection.nodeId : null}
      onSelectedNodeChange={selectionHandler(execution.id)}
    />
  );

  return (
    <div className="flex flex-col gap-2.5">
      {running.map((execution) => renderCard(execution, "live"))}
      {finished.map((execution) => renderCard(execution, "summary"))}
    </div>
  );
}
