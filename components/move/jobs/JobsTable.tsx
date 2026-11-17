"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Button, Chip } from "caralstable";
import { DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { MoveListView } from "@/components/move/shared/MoveListView";
import { EndpointLogo } from "@/components/move/nodes/nodeShared";
import { getNextJobExecution } from "@/lib/move/jobs/schedule";
import type { TExtractionNode, TJob } from "@/lib/move/jobs/types";
import { useJobsStore } from "./JobsStore";

type JobListStatus = "running" | "enabled" | "disabled";

/** Fila del listado: el job más los datos derivados que muestran tabla y tarjetas. */
interface JobRow {
  job: TJob;
  id: string;
  name: string;
  status: JobListStatus;
  nodes: TExtractionNode[];
  nextRun: Date | null;
  lastRun: string | null;
  createdBy: string;
  createdAt: string;
}

const STATUS_DOT_CLASS: Record<JobListStatus, string> = {
  running: "bg-info-main",
  enabled: "bg-success-main",
  disabled: "bg-danger-main",
};

const STATUS_CHIP: Record<JobListStatus, "info" | "success" | "danger"> = {
  running: "info",
  enabled: "success",
  disabled: "danger",
};

const LOCALE_BY_LANGUAGE: Record<string, string> = { es: "es-ES", en: "en-US", pt: "pt-BR" };

export const getJobEditorHref = (jobId: string) => `/move/jobs/editor/?id=${encodeURIComponent(jobId)}`;

function matchesJobSearch(row: JobRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.name, row.createdBy, ...row.nodes.map((n) => n.name)].some((v) => v.toLowerCase().includes(q));
}

/** Logos de los orígenes de los nodos del job (máx. 4) + contador. */
function NodesSummary({ nodes, label }: { nodes: TExtractionNode[]; label: string }) {
  const brands = Array.from(new Set(nodes.map((n) => n.origin.brandName))).slice(0, 4);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex items-center -space-x-1.5 shrink-0">
        {brands.map((brand) => (
          <span key={brand} className="flex size-6 items-center justify-center rounded-full bg-container border border-neutral-500">
            <EndpointLogo brandName={brand} size={14} />
          </span>
        ))}
      </div>
      <span className="text-neutral-900 text-sm whitespace-nowrap">
        {nodes.length} {label}
      </span>
    </div>
  );
}

function EditJobButton({ jobId, title }: { jobId: string; title: string }) {
  return (
    <Link href={getJobEditorHref(jobId)} title={title}>
      <Button
        variant="ghost"
        isIconButton
        iconName="edit"
        className="text-neutral-900 hover:bg-neutral-500/30 cursor-pointer p-1.5 rounded-lg transition-colors"
        title={title}
      />
    </Link>
  );
}

/**
 * Fila de nodos con desplazamiento horizontal estilo móvil: se arrastra con el mouse
 * (con inercia al soltar), sin barra de scroll visible. La rueda vertical también la
 * desplaza en horizontal. En pantallas táctiles se usa el scroll nativo.
 */
function NodesRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0; // px/ms
    let raf = 0;

    const stopInertia = () => cancelAnimationFrame(raf);

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
      stopInertia();
      dragging = true;
      startX = lastX = e.clientX;
      startScroll = el.scrollLeft;
      lastT = performance.now();
      velocity = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocity = (lastX - e.clientX) / dt;
      lastX = e.clientX;
      lastT = now;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.releasePointerCapture(e.pointerId);
      el.style.cursor = "";
      // Inercia: sigue deslizando y frena gradualmente.
      let v = performance.now() - lastT > 80 ? 0 : velocity;
      let prev = performance.now();
      const step = (now: number) => {
        const dt = now - prev;
        prev = now;
        el.scrollLeft += v * dt;
        v *= Math.pow(0.95, dt / 16);
        if (Math.abs(v) > 0.02) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return; // en los extremos se deja scrollear la página
      e.preventDefault();
      stopInertia();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stopInertia();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab select-none border-b border-neutral-500 px-2.5 pt-5 pb-2.5"
    >
      {children}
    </div>
  );
}

/** Píldora de un nodo: logo origen + logo destino superpuestos; al hacer hover se expande con el nombre completo. */
function NodePill({ node }: { node: TExtractionNode }) {
  return (
    <div
      className="flex items-center gap-2.5 max-w-[197px] hover:max-w-[640px] transition-[max-width] duration-300 ease-out shrink-0 overflow-hidden rounded-full border border-neutral-500 hover:border-info-main px-4 py-0.5"
      title={node.name}
    >
      <div className="flex items-center shrink-0">
        <span className="-mr-3 flex items-center rounded-full bg-neutral-100 p-1.5">
          <EndpointLogo brandName={node.origin.brandName} size={24} />
        </span>
        <span className="relative flex items-center rounded-full bg-neutral-100 p-1.5 drop-shadow-[0_0_1.65px_rgba(0,0,0,0.09)]">
          <EndpointLogo brandName={node.destination.brandName} size={24} />
        </span>
      </div>
      <span className="flex-1 min-w-0 truncate text-base text-neutral-900">{node.name}</span>
    </div>
  );
}

function JobCardField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col min-w-0 px-2.5 py-1.5">
      <span className="text-sm font-medium leading-3.5 text-neutral-800 whitespace-nowrap">{label}</span>
      <span className="text-base text-neutral-900 truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

function JobCard({
  row,
  statusLabel,
  formatDateTime,
}: {
  row: JobRow;
  statusLabel: (s: JobListStatus) => string;
  formatDateTime: (value: string | Date) => string;
}) {
  const { dict } = useLanguage();
  const t = dict.moveJobs.list;
  return (
    <div className="flex flex-col self-start overflow-hidden rounded-lg bg-container font-poppins">
      {/* Cabecera: nombre + estado */}
      <div className="flex items-center gap-2.5 border-b border-neutral-500 px-2.5 pt-5 pb-2.5">
        <p className="flex-1 min-w-0 truncate text-lg font-semibold text-neutral-900" title={row.name}>
          {row.name}
        </p>
        <Chip label={statusLabel(row.status)} variant={STATUS_CHIP[row.status]} hasBorder />
      </div>

      {/* Nodos del job */}
      <NodesRow>
        {row.nodes.length > 0 ? (
          row.nodes.map((node) => <NodePill key={node.extraction_node_id} node={node} />)
        ) : (
          <p className="text-sm text-neutral-800 py-1.5">{t.noNodes}</p>
        )}
      </NodesRow>

      {/* Datos */}
      <div className="grid grid-cols-3 gap-x-2.5 gap-y-1.5 py-2.5">
        <JobCardField label={t.author} value={row.createdBy} />
        <JobCardField label={t.nextRun} value={row.nextRun ? formatDateTime(row.nextRun) : t.noSchedule} />
        <JobCardField label={t.lastRun} value={row.lastRun ? formatDateTime(row.lastRun) : t.notExecuted} />
      </div>

      {/* Acciones */}
      <div className="flex justify-end border-t border-neutral-500 p-2.5">
        <Link href={getJobEditorHref(row.id)}>
          <Button variant="info" className="cursor-pointer">
            {t.edit}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function JobsTable() {
  const { dict, language } = useLanguage();
  const t = dict.moveJobs.list;
  const { jobs, extractionNodes, getActiveExecution } = useJobsStore();

  const formatDateTime = useMemo(() => {
    const locale = LOCALE_BY_LANGUAGE[language] ?? "en-US";
    return (value: string | Date) =>
      new Date(value).toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  }, [language]);

  const statusLabel = (status: JobListStatus) =>
    status === "running" ? t.statusRunning : status === "enabled" ? t.statusEnabled : t.statusDisabled;

  const rows = useMemo<JobRow[]>(
    () =>
      jobs.map((job) => {
        const active = getActiveExecution(job.job_id);
        const isRunning = active?.status === "running" || active?.status === "initiated";
        const nodeIds = job.workflow_detail.nodes
          .filter((n) => n.type === "extractorNodeFlow")
          .map((n) => n.data.extractionNodeId);
        return {
          job,
          id: job.job_id,
          name: job.name,
          status: isRunning ? "running" : job.status === "enabled" ? "enabled" : "disabled",
          nodes: nodeIds
            .map((id) => extractionNodes.find((n) => n.extraction_node_id === id))
            .filter((n): n is TExtractionNode => Boolean(n)),
          nextRun:
            job.status === "enabled"
              ? getNextJobExecution(job.schedule_config.filter((s) => s.status === "enabled"))
              : null,
          lastRun: job.last_execution_time,
          createdBy: job.created_by,
          createdAt: job.created_date,
        };
      }),
    [jobs, extractionNodes, getActiveExecution]
  );

  const columns = useMemo<DataTableColumn<JobRow>[]>(
    () => [
      {
        id: "status",
        accessorKey: "status",
        header: "",
        filterable: false,
        align: "center",
        width: 47,
        minWidth: 47,
        resizable: false,
        cell: ({ value }) => {
          const status = value as JobListStatus;
          return (
            <div className="flex items-center justify-center">
              <span
                role="img"
                aria-label={statusLabel(status)}
                title={statusLabel(status)}
                className={`size-3 rounded-full ${STATUS_DOT_CLASS[status]} ${status === "running" ? "animate-pulse" : ""}`}
              />
            </div>
          );
        },
      },
      {
        id: "name",
        accessorKey: "name",
        header: t.colName,
        filterLabel: t.colName,
        filterType: "text",
        width: 240,
        minWidth: 180,
        cell: ({ value }) => (
          <span className="text-neutral-900 text-sm truncate" title={String(value)}>
            {String(value)}
          </span>
        ),
        footer: ({ filteredData }) => (
          <span className="text-neutral-900 font-normal">
            {dict.common.total}: {filteredData.length} {t.totalLabel}
          </span>
        ),
      },
      {
        id: "statusLabel",
        accessorFn: (row) => statusLabel(row.status),
        header: t.colStatus,
        filterLabel: t.colStatus,
        filterType: "select",
        filterSelectOptions: [t.statusRunning, t.statusEnabled, t.statusDisabled].map((v) => ({ label: v, value: v })),
        width: 150,
        minWidth: 120,
        cell: ({ row }) => <Chip label={statusLabel(row.status)} variant={STATUS_CHIP[row.status]} hasBorder />,
      },
      {
        id: "nodes",
        accessorFn: (row) => row.nodes.length,
        header: t.colNodes,
        filterLabel: t.colNodes,
        filterType: "number",
        width: 170,
        minWidth: 130,
        cell: ({ row }) => <NodesSummary nodes={row.nodes} label={t.nodesLabel} />,
      },
      {
        id: "nextRun",
        accessorFn: (row) => (row.nextRun ? row.nextRun.toISOString() : ""),
        header: t.colNextScheduled,
        filterable: false,
        width: 180,
        minWidth: 140,
        cell: ({ row }) =>
          row.nextRun ? (
            <span className="text-neutral-900 text-sm whitespace-nowrap">{formatDateTime(row.nextRun)}</span>
          ) : (
            <span className="text-neutral-800 text-sm italic">{t.noSchedule}</span>
          ),
      },
      {
        id: "lastRun",
        accessorFn: (row) => row.lastRun ?? "",
        header: t.colLastRun,
        filterable: false,
        width: 180,
        minWidth: 140,
        cell: ({ row }) =>
          row.lastRun ? (
            <span className="text-neutral-900 text-sm whitespace-nowrap">{formatDateTime(row.lastRun)}</span>
          ) : (
            <span className="text-neutral-800 text-sm italic">{t.notExecuted}</span>
          ),
      },
      {
        id: "createdBy",
        accessorKey: "createdBy",
        header: t.colCreatedBy,
        filterLabel: t.colCreatedBy,
        filterType: "text",
        width: 170,
        minWidth: 130,
        cell: ({ value }) => (
          <span className="text-neutral-900 text-sm truncate" title={String(value)}>
            {String(value)}
          </span>
        ),
      },
      {
        id: "actions",
        header: t.colActions,
        align: "center",
        width: 110,
        minWidth: 90,
        filterable: false,
        hideInExport: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <EditJobButton jobId={row.id} title={t.editJob} />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, dict, formatDateTime]
  );

  const addJobButton = (
    <Link href="/move/jobs/new">
      <Button variant="info" iconName="plus" className="cursor-pointer">
        {dict.moveJobs.create.button}
      </Button>
    </Link>
  );

  return (
    <MoveListView<JobRow>
      title={t.title}
      description={t.subtitle}
      iconName="network"
      data={rows}
      columns={columns}
      keyExtractor={(row) => row.id}
      searchPlaceholder={t.search}
      matchesSearch={matchesJobSearch}
      renderCard={(row) => <JobCard row={row} statusLabel={statusLabel} formatDateTime={formatDateTime} />}
      primaryAction={addJobButton}
      labels={{ switchToGrid: t.switchToGrid, switchToList: t.switchToList, noResults: t.noResults }}
    />
  );
}
