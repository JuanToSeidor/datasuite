"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Chip, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DataTable, Spinner, type DataTableColumn } from "@/components/ui";
import { EndpointLogo } from "@/components/move/nodes/nodeShared";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { SidePanelHeader } from "./SidePanelHeader";
import { useDateTimeFormatter, useLocaleTag } from "./format";
import type { DestinationPreview, JobEndpoint, JobNodeRun } from "./types";
import { formatShortDuration } from "./useRunningJob";

/** Ancho del panel lateral para el detalle de un nodo (la tabla de preview necesita espacio). */
export const JOB_NODE_PANEL_WIDTH = 600;

const PREVIEW_ROW_LIMIT = 20;
const PREVIEW_COLUMN_WIDTHS: Record<string, number> = { MANDT: 100, KUNNR: 140, LAND1: 100 };

type PreviewRow = Record<string, string> & { __id: string };

/** Paso del recorrido origen → destino: punto de estado + logo + nombre. */
function EndpointStep({ endpoint, done, isLast }: { endpoint: JobEndpoint; done: boolean; isLast?: boolean }) {
  return (
    <div className="relative flex items-start gap-3">
      {/* Conector vertical hacia el siguiente paso */}
      {!isLast && <span aria-hidden className="absolute left-[13px] top-7 h-[calc(100%-4px)] w-0.5 bg-neutral-500" />}
      <span
        aria-hidden
        className={`relative z-10 size-7 shrink-0 rounded-full transition-colors duration-500 ${
          done ? "bg-success-main" : "bg-neutral-500"
        }`}
      />
      <EndpointLogo brandName={endpoint.brandName} size={24} />
      <div className="flex min-w-0 flex-col pb-4">
        <span className="truncate text-lg font-bold text-neutral-900">{endpoint.name}</span>
        <span className="truncate text-xs font-medium text-neutral-900">{endpoint.type}</span>
      </div>
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col p-2.5">
      <span className="text-lg font-semibold text-neutral-800">{value}</span>
      <span className="text-sm text-neutral-800">{label}</span>
    </div>
  );
}

function DetailsTab({ node, nextRunAt }: { node: JobNodeRun; nextRunAt: string }) {
  const { dict } = useLanguage();
  const t = dict.move.overview.nodePanel;
  const formatDateTime = useDateTimeFormatter();
  const locale = useLocaleTag();

  const loadedRecords = Math.round((node.records * node.progress) / 100);

  const status = {
    running: {
      icon: <Spinner size={24} tone="info" />,
      label: formatMessage(t.statusRunning, { n: node.progress }),
      text: "text-info-main",
      chip: { variant: "info" as const, status: "waiting" as const, label: t.chipRunning },
      comment: t.commentRunning,
    },
    completed: {
      icon: <CaralIcon name="check" size={24} color="currentColor" />,
      label: t.statusCompleted,
      text: "text-success-main",
      chip: { variant: "success" as const, status: "success" as const, label: t.chipSuccess },
      comment: t.commentCompleted,
    },
    warning: {
      icon: <CaralIcon name="triangleExclamation" size={24} color="currentColor" />,
      label: t.statusWarning,
      text: "text-warning-main",
      chip: { variant: "warning" as const, status: "warning" as const, label: t.chipWarning },
      comment: node.issue === "noData" ? t.commentNoData : t.commentCompleted,
    },
  }[node.status];

  return (
    <div className="flex flex-col gap-4">
      {/* Estado */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-500 pb-3">
        <span className={`flex items-center gap-2 text-xl font-semibold ${status.text}`}>
          {status.icon}
          {status.label}
        </span>
        <Chip variant={status.chip.variant} status={status.chip.status} label={status.chip.label} hasBorder />
      </div>

      {/* Recorrido origen → destino */}
      <div className="flex flex-col">
        <EndpointStep endpoint={node.source} done />
        <EndpointStep endpoint={node.destination} done={node.status !== "running"} isLast />
      </div>

      {/* Comentarios */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-neutral-900">{t.commentsTitle}</h3>
        <p className="text-sm text-neutral-900">{status.comment}</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-neutral-500 [&>*:nth-child(odd)]:border-r [&>*:nth-child(-n+2)]:border-b [&>*]:border-neutral-500">
        <StatCell value={formatDateTime(node.startedAt)} label={t.lastRun} />
        <StatCell value={formatDateTime(nextRunAt)} label={t.nextRun} />
        <StatCell value={formatShortDuration(node.elapsedSeconds)} label={t.timePerNode} />
        <StatCell
          value={formatMessage(t.rows, { n: loadedRecords.toLocaleString(locale) })}
          label={t.records}
        />
      </div>
    </div>
  );
}

function PreviewTab({ node, preview }: { node: JobNodeRun; preview: DestinationPreview }) {
  const { dict } = useLanguage();
  const t = dict.move.overview.nodePanel;
  const locale = useLocaleTag();
  const [queriedAt, setQueriedAt] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Demo: simula volver a consultar la tabla de destino.
  const handleRefresh = () => {
    setIsRefreshing(true);
    timerRef.current = setTimeout(() => {
      setQueriedAt(new Date());
      setIsRefreshing(false);
    }, 800);
  };

  const rows = useMemo<PreviewRow[]>(
    () =>
      preview.rows.slice(0, PREVIEW_ROW_LIMIT).map((cells, rowIndex) => {
        const row: PreviewRow = { __id: `row-${rowIndex}` };
        preview.columns.forEach((column, i) => {
          row[column] = cells[i];
        });
        return row;
      }),
    [preview]
  );

  const columns = useMemo<DataTableColumn<PreviewRow>[]>(
    () =>
      preview.columns.map((column) => ({
        id: column,
        accessorKey: column,
        header: column,
        filterType: "none",
        // Columnas de código cortas; la de texto (nombre) se lleva el resto del ancho.
        width: PREVIEW_COLUMN_WIDTHS[column] ?? 200,
        minWidth: 70,
      })),
    [preview]
  );

  const loadedRecords = Math.round((node.records * node.progress) / 100);
  const [noticeBefore, noticeAfter = ""] = t.previewNotice.split("{current}");
  const queriedTime = queriedAt.toLocaleTimeString(locale, { hour12: false });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-neutral-900">{t.previewTitle}</h3>
        <p className="text-sm text-neutral-800">{formatMessage(t.previewSubtitle, { n: PREVIEW_ROW_LIMIT })}</p>
      </div>

      {/* Aviso integrado en el panel (el Alert de Caral se pinta como toast flotante). */}
      <div className="flex items-start gap-2.5 rounded-lg bg-neutral-500/60 p-3 text-sm text-neutral-900">
        <span className="mt-0.5 shrink-0">
          <CaralIcon name="circleInfo" size={20} color="currentColor" />
        </span>
        <p>
          {noticeBefore}
          <strong className="font-semibold">{t.previewNoticeCurrent}</strong>
          {noticeAfter}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-900">
          {formatMessage(t.previewMeta, {
            time: queriedTime,
            shown: rows.length,
            loaded: loadedRecords.toLocaleString(locale),
          })}
        </p>
        <Button
          variant="light"
          hasBorder
          isIconButton
          iconName="sync"
          title={t.refresh}
          isLoading={isRefreshing}
          onClick={handleRefresh}
        />
      </div>

      <DataTable<PreviewRow>
        variant="embedded"
        data={rows}
        columns={columns}
        keyExtractor={(row) => row.__id}
        canSearch={false}
        canFilterColumns={false}
        canFilterErrors={false}
        canExport={false}
        canExpand={false}
        canReadjust={false}
        tableContainerClassName="max-h-[340px]"
      />

      <div className="flex justify-center">
        <Button variant="light" hasBorder>
          {t.compareWithSource}
        </Button>
      </div>
    </div>
  );
}

/** Detalle de un nodo del job, mostrado en el panel lateral derecho. */
export function JobNodePanel({
  node,
  nextRunAt,
  preview,
  onClose,
}: {
  node: JobNodeRun;
  nextRunAt: string;
  preview: DestinationPreview;
  onClose: () => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.overview.nodePanel;
  const [tab, setTab] = useState(0);

  return (
    <div className="flex min-h-full flex-col font-poppins">
      <SidePanelHeader
        title={formatMessage(t.title, { source: node.source.name, destination: node.destination.name })}
        onClose={onClose}
      />

      <div className="flex flex-col gap-4 p-4">
        <div className="self-start">
          <Tabs tabs={[{ label: t.tabDetails }, { label: t.tabPreview }]} activeIndex={tab} onChange={setTab} />
        </div>
        {tab === 0 ? (
          <DetailsTab node={node} nextRunAt={nextRunAt} />
        ) : (
          <PreviewTab node={node} preview={preview} />
        )}
      </div>
    </div>
  );
}
