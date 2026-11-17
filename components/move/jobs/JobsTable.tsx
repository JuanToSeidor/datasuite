"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
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
  disabled: "bg-warning-main",
};

const STATUS_CHIP: Record<JobListStatus, "info" | "success" | "warning"> = {
  running: "info",
  enabled: "success",
  disabled: "warning",
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
    <div className="flex flex-col gap-4 p-5 rounded-lg bg-container border border-neutral-500 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-100 text-info-main">
            <CaralIcon name="network" size={22} />
          </span>
          <div className="min-w-0">
            <p className="font-poppins font-semibold text-base text-neutral-900 truncate" title={row.name}>
              {row.name}
            </p>
            <p className="text-xs text-neutral-800 truncate">{t.createdBy.replace("{name}", row.createdBy)}</p>
          </div>
        </div>
        <Chip label={statusLabel(row.status)} variant={STATUS_CHIP[row.status]} hasBorder />
      </div>

      {row.nodes.length > 0 ? (
        <NodesSummary nodes={row.nodes} label={t.nodesLabel} />
      ) : (
        <p className="text-sm text-neutral-800">{t.noNodes}</p>
      )}

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-neutral-800">{t.nextRun}</dt>
          <dd className="text-neutral-900 truncate">{row.nextRun ? formatDateTime(row.nextRun) : t.noSchedule}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-neutral-800">{t.lastRun}</dt>
          <dd className="text-neutral-900 truncate">{row.lastRun ? formatDateTime(row.lastRun) : t.notExecuted}</dd>
        </div>
      </dl>

      <div className="mt-auto flex justify-end">
        <Link href={getJobEditorHref(row.id)}>
          <Button variant="ghost" hasBorder iconName="edit" className="border! border-neutral-800! text-neutral-900 cursor-pointer">
            {t.editJob}
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
