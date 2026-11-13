"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CaralIcon } from "@/components/icons";
import { DataTable, Spinner, type DataTableColumn } from "@/components/ui";
import { EndpointLogo } from "@/components/move/nodes/nodeShared";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidePanel } from "@/contexts/SidePanelContext";
import { formatMessage } from "@/lib/format";
import { useDateTimeFormatter } from "./format";
import { JOB_NODE_PANEL_WIDTH, JobNodePanel } from "./JobNodePanel";
import { MoveCardFooterLink } from "./MoveCard";
import type { DestinationPreview, JobEndpoint, JobNodeIssue, JobNodeRun, RunningJob } from "./types";
import { formatClock, formatShortDuration, useRunningJob } from "./useRunningJob";

/** Degradado de carga de la fila: de bg-full a bg-container (el fondo de todas las filas). */
const PROGRESS_GRADIENT = "linear-gradient(90deg, var(--color-full) 0%, var(--color-container) 100%)";
/** Mismo degradado para la fila seleccionada, en tonos info para fundirse con su fondo info-100. */
const SELECTED_PROGRESS_GRADIENT =
  "linear-gradient(90deg, color-mix(in srgb, var(--color-info-main) 18%, var(--color-info-100)) 0%, var(--color-info-100) 100%)";

function NodeStatusIcon({ node }: { node: JobNodeRun }) {
  if (node.status === "completed") {
    return (
      <span className="text-success-main">
        <CaralIcon name="check" size={24} color="currentColor" />
      </span>
    );
  }
  if (node.status === "warning") {
    return (
      <span className="text-warning-main">
        <CaralIcon name="triangleExclamation" size={24} color="currentColor" />
      </span>
    );
  }
  // En curso: spinner girando hasta que el nodo se complete (luego pasa al check).
  return <Spinner size={24} tone="info" />;
}

function EndpointCell({ endpoint, dimmed = false }: { endpoint: JobEndpoint; dimmed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {/* Atenuada (hay otro nodo abierto en el panel): logo monocromo CaralIcon con el color de la fila. */}
      <EndpointLogo brandName={endpoint.brandName} size={24} monochrome={dimmed} />
      <div className="flex flex-col leading-tight">
        {/* Sin color propio: hereda el de la fila (se atenúa cuando hay otro nodo seleccionado). */}
        <span className="text-sm">{endpoint.name}</span>
        <span className="text-xs text-neutral-800">{endpoint.type}</span>
      </div>
    </div>
  );
}

/** Dato del encabezado del detalle: valor + etiqueta. */
function JobStat({ value, label, emphasized }: { value: string; label: string; emphasized: boolean }) {
  // En curso los datos van atenuados; al terminar el job pasan a texto principal (como en Figma).
  const tone = emphasized ? "text-neutral-900" : "text-neutral-800";
  return (
    <div className={`flex flex-col transition-colors duration-500 ${tone}`}>
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

/**
 * Job en ejecución / última ejecución.
 * - Cerrado: porcentaje + nombre del job + barra de progreso.
 * - Abierto: además, el resumen ("75% Completed"), la tabla de nodos y comentarios.
 * - Al terminar todos los nodos cambia a "Última ejecución": datos en texto principal,
 *   columna de comentarios por nodo (sin la flecha) y resumen de errores si los hubo.
 */
export function JobRunningCard({
  job: initialJob,
  destinationPreview,
}: {
  job: RunningJob;
  destinationPreview: DestinationPreview;
}) {
  const { dict } = useLanguage();
  const t = dict.move.overview;
  const formatDateTime = useDateTimeFormatter();
  const [isOpen, setIsOpen] = useState(false);
  const job = useRunningJob(initialJob);
  const { isFinished } = job;
  const hasWarnings = job.nodes.some((node) => node.status === "warning");

  const toggle = () => setIsOpen((open) => !open);

  // Detalle del nodo en el panel lateral derecho (el layout oculta el sidebar mientras está abierto).
  const { isSidePanelOpen, openSidePanel, closeSidePanel } = useSidePanel();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = job.nodes.find((node) => node.id === selectedNodeId) ?? null;

  // Se vuelve a pasar el contenido en cada tick para que el panel muestre el avance en vivo.
  // `key` por nodo: al cambiar de nodo el panel se reinicia (pestaña Detalles).
  useEffect(() => {
    if (!selectedNode) return;
    openSidePanel(
      <JobNodePanel
        key={selectedNode.id}
        node={selectedNode}
        nextRunAt={job.nextRunAt}
        preview={destinationPreview}
        onClose={closeSidePanel}
      />,
      { width: JOB_NODE_PANEL_WIDTH }
    );
  }, [selectedNode, job.nextRunAt, destinationPreview, openSidePanel, closeSidePanel]);

  // Si el panel se cierra (X, cambio de ruta...), se quita la selección de la fila.
  const wasPanelOpen = useRef(false);
  useEffect(() => {
    if (wasPanelOpen.current && !isSidePanelOpen) setSelectedNodeId(null);
    wasPanelOpen.current = isSidePanelOpen;
  }, [isSidePanelOpen]);

  /**
   * Fondo de progreso por fila (mismo degradado de carga que AnimatedKpi).
   * - En curso: el degradado cubre el % completado y crece con transición.
   *   Al abrir la tarjeta se llena desde 0.
   * - Al completarse: el degradado se ancla a la derecha y se vacía hacia ese lado.
   * - Con aviso: sin degradado (mantiene su fondo warning).
   */
  const rowStyle = (row: JobNodeRun): React.CSSProperties | undefined => {
    const isSelected = row.id === selectedNodeId;
    if (row.status === "warning" && !isSelected) return undefined;
    const isActive = row.status === "running";
    const fill = isOpen && isActive ? row.progress : 0;
    return {
      backgroundImage: isSelected ? SELECTED_PROGRESS_GRADIENT : PROGRESS_GRADIENT,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${fill}% 100%`,
      backgroundPosition: isActive ? "left center" : "right center",
      transition: "background-size 700ms cubic-bezier(0.22, 1, 0.36, 1)",
    };
  };

  // Fila atenuada: hay un nodo abierto en el panel y no es este.
  const isDimmed = useCallback(
    (row: JobNodeRun) => selectedNodeId !== null && row.id !== selectedNodeId,
    [selectedNodeId]
  );

  const columns = useMemo<DataTableColumn<JobNodeRun>[]>(() => {
    const all: DataTableColumn<JobNodeRun>[] = [
      {
        id: "status",
        header: "",
        accessorKey: "status",
        filterType: "none",
        width: 56,
        resizable: false,
        align: "center",
        cell: ({ row }) => <NodeStatusIcon node={row} />,
      },
      { id: "name", accessorKey: "name", header: t.colName, filterType: "none", width: 140 },
      {
        id: "progress",
        accessorKey: "progress",
        header: t.colCompleted,
        filterType: "none",
        width: 140,
        cell: ({ value }) => `${value}%`,
      },
      {
        id: "source",
        accessorFn: (row) => row.source.name,
        header: t.colSource,
        filterType: "none",
        width: 170,
        cell: ({ row }) => <EndpointCell endpoint={row.source} dimmed={isDimmed(row)} />,
      },
      {
        id: "arrow",
        header: "",
        filterType: "none",
        width: 48,
        resizable: false,
        align: "center",
        cell: () => (
          <span className="flex justify-center">
            <CaralIcon name="arrowRight" size={20} color="currentColor" />
          </span>
        ),
      },
      {
        id: "destination",
        accessorFn: (row) => row.destination.name,
        header: t.colDestination,
        filterType: "none",
        width: 170,
        cell: ({ row }) => <EndpointCell endpoint={row.destination} dimmed={isDimmed(row)} />,
      },
      {
        id: "startedAt",
        accessorKey: "startedAt",
        header: t.colTimeStart,
        filterType: "none",
        width: 140,
        cell: ({ value }) => formatDateTime(value),
      },
      {
        id: "elapsed",
        accessorKey: "elapsedSeconds",
        header: t.colCurrentTime,
        filterType: "none",
        width: 140,
        cell: ({ value }) => formatShortDuration(value),
      },
    ];
    if (!isFinished) return all;

    // Terminado: sin la flecha entre origen y destino, y con comentarios por nodo.
    const issueLabel: Record<JobNodeIssue, string> = { noData: t.issueNoData };
    return [
      ...all.filter((col) => col.id !== "arrow"),
      {
        id: "comments",
        accessorKey: "issue",
        header: t.colComments,
        filterType: "none",
        width: 240,
        cell: ({ row }) => (row.issue ? issueLabel[row.issue] : "-"),
      },
    ];
  }, [t, formatDateTime, isFinished, isDimmed]);

  // El comentario resalta el nodo con error como enlace.
  const [commentBefore, commentAfter = ""] = t.jobCommentError.split("{node}");

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-container font-poppins">
      {/* Cabecera: alterna abierto/cerrado.
          Se usa un div con role="button" para que toda la franja sea clicable sin anidar botones. */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="flex cursor-pointer flex-col gap-2 p-4 outline-none focus-visible:ring-2 focus-visible:ring-info-main"
      >
        <p className="text-sm text-info-main">{isFinished ? t.lastJobRunTitle : t.jobRunningTitle}</p>
        <div className="flex items-center">
          {/* El porcentaje se pliega (ancho + opacidad) al abrir, porque pasa al detalle. */}
          <span
            aria-hidden={isOpen}
            className={`overflow-hidden whitespace-nowrap text-2xl font-bold text-success-main transition-[max-width,opacity,margin] duration-300 ease-in-out ${
              isOpen ? "mr-0 max-w-0 opacity-0" : "mr-3 max-w-24 opacity-100"
            }`}
          >
            {job.progress}%
          </span>
          <h2 className="min-w-0 flex-1 truncate text-2xl font-bold text-neutral-900">{job.name}</h2>
          {/* Rotación en línea: la clase `rotate-180` existe en Tailwind v4 y también en el CSS de
              caralstable (v3); ambas se suman (360°) y la flecha no cambiaría. */}
          <span
            className="ml-3 shrink-0 text-neutral-900 transition-transform duration-300 ease-in-out"
            style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
          >
            <CaralIcon name="chevronDown" size={24} color="currentColor" />
          </span>
        </div>
      </div>

      {/* Barra de progreso a todo el ancho */}
      <div
        className="h-2.5 w-full bg-success-light"
        role="progressbar"
        aria-valuenow={job.progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-success-main transition-[width] duration-500" style={{ width: `${job.progress}%` }} />
      </div>

      {/* Detalle: siempre montado para poder animar la altura (grid-rows 0fr -> 1fr) y el fundido.
          `inert` evita que el contenido oculto reciba foco o clics. */}
      <div
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
        <div
          className={`flex flex-col gap-3 p-4 transition-[opacity,transform] duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 px-2">
            <span className="text-5xl font-extrabold text-success-main">
              {formatMessage(t.jobCompleted, { n: job.progress })}
            </span>
            <div className="grid min-w-[min(100%,440px)] flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <JobStat value={formatDateTime(job.startedAt)} label={t.colTimeStart} emphasized={isFinished} />
              <JobStat value={formatClock(job.elapsedSeconds)} label={t.jobElapsed} emphasized={isFinished} />
              <JobStat
                value={formatMessage(t.jobRows, { n: job.records.toLocaleString() })}
                label={t.jobRecords}
                emphasized={isFinished}
              />
            </div>
          </div>

          <DataTable<JobNodeRun>
            variant="embedded"
            data={job.nodes}
            columns={columns}
            keyExtractor={(row) => row.id}
            rowStyle={rowStyle}
            onRowClick={(row) => setSelectedNodeId(row.id)}
            // Todas las filas sobre bg-container (con borde inferior en las celdas: la tabla usa
            // border-separate y el borde del <tr> no se pinta); la de aviso mantiene su fondo.
            // La fila abierta en el panel se marca con un borde info a la izquierda.
            // Seleccionada (abierta en el panel): fondo info-100 y borde info-main alrededor de la fila
            // (bordes en las celdas: arriba/abajo en todas, izquierda en la primera, derecha en la última).
            // Llevan `!`: el reset sin capa de caralstable (border-width: 0) gana a las utilidades de Tailwind v4.
            rowClassName={(row) =>
              row.id === selectedNodeId
                ? "bg-info-100 text-neutral-900 [&>td]:border-y! [&>td]:border-info-main! [&>td:first-child]:border-l! [&>td:last-child]:border-r!"
                : `[&>td]:border-b [&>td]:border-neutral-500 ${
                    row.status === "warning" ? "bg-warning-light" : "bg-container"
                  } ${
                    // Con un nodo abierto en el panel, el resto de filas baja su texto a neutral-800.
                    selectedNodeId ? "text-neutral-800" : "text-neutral-900"
                  }`
            }
            canSearch={false}
            canFilterColumns={false}
            canFilterErrors={false}
            canExport={false}
            canExpand={false}
            canReadjust={false}
          />

          {isFinished && hasWarnings && (
            <div className="flex flex-col py-2">
              <h3 className="text-xl font-bold text-neutral-900">{t.jobFinishedWithErrorsTitle}</h3>
              <p className="text-sm text-neutral-800">{t.jobFinishedWithErrorsText}</p>
            </div>
          )}

          {!isFinished && job.errorNode && (
            <div className="flex flex-col py-2">
              <h3 className="text-xl font-bold text-neutral-900">{t.jobCommentsTitle}</h3>
              <p className="text-sm text-neutral-800">
                {commentBefore}
                <Link href="/move/nodes" className="text-info-main hover:underline">
                  {job.errorNode.name}
                </Link>
                {commentAfter}
              </p>
            </div>
          )}

          <div className="h-px w-full bg-neutral-300" />
          <MoveCardFooterLink label={t.viewPerformance} />
        </div>
        </div>
      </div>
    </section>
  );
}
