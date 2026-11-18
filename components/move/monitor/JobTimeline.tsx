"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Spinner } from "@/components/ui";
import { EndpointLogo } from "@/components/move/nodes/nodeShared";
import { nodeProgressStyle } from "@/components/move/overview/nodeProgressStyle";
import type { DestinationPreview, JobEndpoint, JobNodeRun } from "@/components/move/overview/types";
import { useJobNodePanel } from "@/components/move/overview/useJobNodePanel";
import { formatClock, useRunningJob } from "@/components/move/overview/useRunningJob";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { executionStatus } from "./data";
import type { MonitorExecution, MonitorExecutionStatus } from "./types";

type ChipVariant = "success" | "warning" | "info" | "light";

/** Fila de nodo de la tarjeta (ya resuelta para pintar). */
interface TimelineNodeRow {
  id: string;
  name: string;
  source: JobEndpoint;
  destination: JobEndpoint;
  chip: { variant: ChipVariant; label: string };
  duration: string;
  /** Nodo ya ejecutado o en curso (las ejecuciones programadas no tienen progreso). */
  run?: Pick<JobNodeRun, "status" | "progress">;
}

/** Logos de origen y destino superpuestos (Figma: círculos de 36px, el segundo con sombra). */
function EndpointPair({ source, destination }: { source: JobEndpoint; destination: JobEndpoint }) {
  return (
    <div className="flex shrink-0 items-center">
      <span className="-mr-3 flex rounded-full bg-neutral-100 p-1.5">
        <EndpointLogo brandName={source.brandName} size={24} />
      </span>
      <span className="flex rounded-full bg-neutral-100 p-1.5 drop-shadow-[0_0_1.65px_rgba(0,0,0,0.09)]">
        <EndpointLogo brandName={destination.brandName} size={24} />
      </span>
    </div>
  );
}

/** Marcador del eje: check (completado), aviso, spinner (en curso) o círculo vacío (programado). */
function TimelineDot({ status }: { status: MonitorExecutionStatus }) {
  if (status === "scheduled") {
    return <span className="size-[30px] shrink-0 rounded-full border-2 border-neutral-800 bg-full" />;
  }
  if (status === "running") {
    return (
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-container ring-2 ring-info-main">
        <Spinner size={18} tone="info" />
      </span>
    );
  }
  const isWarning = status === "warning";
  return (
    <span
      className={`flex size-[30px] shrink-0 items-center justify-center rounded-full text-neutral-100 ${
        isWarning ? "bg-warning-main" : "bg-success-main"
      }`}
    >
      <CaralIcon name={isWarning ? "triangleExclamation" : "check"} size={15} color="currentColor" />
    </span>
  );
}

function TimelineItem({
  execution,
  isFirst,
  isLast,
  destinationPreview,
  selectedNodeId,
  onSelectedNodeChange,
}: {
  execution: MonitorExecution;
  isFirst: boolean;
  isLast: boolean;
  destinationPreview: DestinationPreview;
  /** Nodo de esta ejecución abierto en el panel lateral (null si es de otra o no hay). */
  selectedNodeId: string | null;
  onSelectedNodeChange: (nodeId: string | null) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.monitor;
  // El job en curso avanza en vivo igual que en la tarjeta del Resumen.
  const job = useRunningJob(execution.job);
  const status = executionStatus(execution.scheduled, job.nodes);

  // Detalle del nodo en el panel lateral, igual que en la vista de lista (en vivo si está en curso).
  useJobNodePanel({
    nodes: job.nodes,
    nextRunAt: job.nextRunAt,
    destinationPreview,
    selectedNodeId,
    onSelectedNodeChange,
  });
  // Las ejecuciones programadas aún no tienen datos que mostrar en el panel.
  const canOpenNode = !execution.scheduled;

  // El fondo de carga de las filas arranca en 0 y se llena tras el primer pintado
  // (igual que al abrir la tarjeta en la vista de lista). Doble rAF para que el 0% llegue a pintarse.
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setIsVisible(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  const headerChip: Record<MonitorExecutionStatus, { variant: ChipVariant; label: string; icon?: "check" }> = {
    scheduled: { variant: "light", label: t.statusScheduled },
    running: { variant: "info", label: formatMessage(t.statusRunningProgress, { n: job.progress }) },
    success: { variant: "success", label: t.statusSuccess, icon: "check" },
    warning: { variant: "warning", label: t.statusWarning },
  };

  const rows: TimelineNodeRow[] = execution.scheduled
    ? execution.pendingNodes.map((node) => ({
        id: node.id,
        name: node.name,
        source: node.source,
        destination: node.destination,
        chip: { variant: "light", label: t.nodePending },
        duration: "--:--:--",
      }))
    : job.nodes.map((node) => ({
        id: node.id,
        name: node.name,
        source: node.source,
        destination: node.destination,
        chip:
          node.status === "running"
            ? { variant: "info", label: `${node.progress}%` }
            : node.status === "warning"
              ? { variant: "warning", label: t.nodeWarning }
              : { variant: "success", label: t.nodeSuccess },
        duration: formatClock(node.elapsedSeconds),
        run: node,
      }));

  const chip = headerChip[status];
  const line = "w-0.5 flex-1 bg-neutral-800";

  return (
    <li className="flex items-stretch gap-2.5">
      {/* Hora + frecuencia */}
      <div className="flex w-[90px] shrink-0 flex-col items-end justify-center gap-1">
        <span className="flex items-center gap-2.5">
          <span className="text-xl font-bold text-neutral-900">{execution.time}</span>
          <span className="h-px w-[15px] bg-neutral-800" />
        </span>
        <Chip variant="info" label={t.frequency[execution.frequency]} />
      </div>

      {/* Eje: línea superior, marcador y línea inferior (sin tramos en los extremos) */}
      <div className="flex w-[30px] shrink-0 flex-col items-center gap-0.5">
        <span className={isFirst ? "flex-1" : line} />
        <TimelineDot status={status} />
        <span className={isLast ? "flex-1" : line} />
      </div>

      {/* Tarjeta del job */}
      <article className="my-1 flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-container">
        <header className="flex items-center justify-between gap-3 border-b border-neutral-500 p-2.5">
          <h3 className="min-w-0 truncate text-xl font-bold text-neutral-900">{job.name}</h3>
          <Chip variant={chip.variant} label={chip.label} iconName={chip.icon} />
        </header>
        <ul className="flex flex-col">
          {rows.map((row) => {
            const isSelected = row.id === selectedNodeId;
            const open = () => onSelectedNodeChange(row.id);
            return (
            <li
              key={row.id}
              {...(canOpenNode && {
                role: "button",
                tabIndex: 0,
                "aria-pressed": isSelected,
                onClick: open,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                  }
                },
              })}
              style={row.run && nodeProgressStyle(row.run, { isSelected, isVisible })}
              className={`flex items-center gap-2.5 border-b border-neutral-500 p-2.5 transition-colors last:border-b-0 ${
                canOpenNode
                  ? "cursor-pointer outline-none hover:bg-info-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info-main"
                  : ""
              } ${isSelected ? "bg-info-100 ring-1 ring-inset ring-info-main" : ""}`}
            >
              <EndpointPair source={row.source} destination={row.destination} />
              <span className="min-w-0 flex-1 truncate text-lg font-semibold text-neutral-900">{row.name}</span>
              <Chip variant={row.chip.variant} label={row.chip.label} hasBorder={row.chip.variant !== "light"} />
              <span className="w-[62px] shrink-0 text-right text-sm text-neutral-800 tabular-nums">{row.duration}</span>
            </li>
            );
          })}
        </ul>
      </article>
    </li>
  );
}

/**
 * Vista de tarjetas del Monitor (Figma "Monitor - Performance" tarjetas):
 * línea de tiempo del día con cada ejecución programada, su hora, frecuencia y nodos.
 */
export function JobTimeline({
  executions,
  destinationPreview,
}: {
  executions: MonitorExecution[];
  destinationPreview: DestinationPreview;
}) {
  const { dict } = useLanguage();
  const t = dict.move.monitor;

  // Una sola selección para toda la línea de tiempo: el panel muestra un nodo cada vez.
  const [selection, setSelection] = useState<{ executionId: string; nodeId: string } | null>(null);
  const selectionHandler = useCallback(
    (executionId: string) => (nodeId: string | null) =>
      setSelection((current) => {
        if (nodeId) return { executionId, nodeId };
        // Solo la ejecución dueña de la selección puede limpiarla.
        return current?.executionId === executionId ? null : current;
      }),
    []
  );

  // El job en curso sube a su propia sección ("Ejecutando ahora"), encima de la línea de "Hoy".
  // Se clasifica por el estado inicial, como la vista de lista.
  const { running, rest } = useMemo(() => {
    const isRunning = (execution: MonitorExecution) =>
      executionStatus(execution.scheduled, execution.job.nodes) === "running";
    return {
      running: executions.filter(isRunning),
      rest: executions.filter((execution) => !isRunning(execution)),
    };
  }, [executions]);

  const renderSection = (label: string, items: MonitorExecution[]) => (
    <>
      <Chip variant="light" label={label} />
      <ol className="flex w-full max-w-3xl flex-col">
        {items.map((execution, index) => (
          <TimelineItem
            key={execution.id}
            execution={execution}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            destinationPreview={destinationPreview}
            selectedNodeId={selection?.executionId === execution.id ? selection.nodeId : null}
            onSelectedNodeChange={selectionHandler(execution.id)}
          />
        ))}
      </ol>
    </>
  );

  return (
    <div className="flex flex-col items-center gap-2.5 p-2.5">
      {running.length > 0 && renderSection(t.runningNow, running)}
      {rest.length > 0 && renderSection(t.today, rest)}
    </div>
  );
}
