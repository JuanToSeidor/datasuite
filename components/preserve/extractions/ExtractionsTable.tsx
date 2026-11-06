"use client";

import React, { useMemo } from "react";
import { Button, Chip } from "caralstable";
import { DataTable, type DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import extractionsData from "@/data/preserve/extractions.json";

type ExtractionStatus = "extracting" | "withDifferences" | "matches";

type ScopeData =
  | { type: "tables"; count: number }
  | { type: "reextraction"; table: string };

type StatusDetailData =
  | { kind: "drift"; count: number }
  | { kind: "missing"; count: number }
  | { kind: "matches" };

export interface ExtractionRecord {
  id: string;
  owner: string;
  archive: string;
  scope: ScopeData;
  status: ExtractionStatus;
  progress: number;
  statusDetail: StatusDetailData;
  started: string;
  durationMinutes: number;
  running: boolean;
}

const extractions = extractionsData.extractions as ExtractionRecord[];

const STATUS_VARIANT: Record<ExtractionStatus, "light" | "danger" | "success"> = {
  extracting: "light",
  withDifferences: "danger",
  matches: "success",
};

const PROGRESS_COLOR: Record<ExtractionStatus, string> = {
  extracting: "bg-info-main",
  withDifferences: "bg-danger-main",
  matches: "bg-success-main",
};

/** Tabla de extracciones (en proceso y completadas) de Preserve. */
export function ExtractionsTable({ onOpen }: { onOpen: (id: string) => void }) {
  const { dict, language } = useLanguage();
  const t = dict.preserve.extractions;

  const numberFormat = useMemo(() => new Intl.NumberFormat(language), [language]);

  const statusLabel: Record<ExtractionStatus, string> = {
    extracting: t.statusExtracting,
    withDifferences: t.statusWithDifferences,
    matches: t.statusMatches,
  };

  const scopeLabel = (scope: ScopeData) =>
    scope.type === "tables"
      ? formatMessage(t.tablesCount, { n: scope.count })
      : formatMessage(t.reextraction, { table: scope.table });

  const statusDetailLabel = (detail: StatusDetailData) => {
    if (detail.kind === "drift") return formatMessage(t.driftRows, { n: detail.count });
    if (detail.kind === "missing") return formatMessage(t.rowsMissing, { n: detail.count });
    return t.statusMatchesDetail;
  };

  const durationLabel = (row: ExtractionRecord) => {
    const hours = Math.floor(row.durationMinutes / 60);
    const minutes = String(row.durationMinutes % 60).padStart(2, "0");
    const base = formatMessage(t.durationFormat, { h: hours, m: minutes });
    return row.running ? `${base} ${t.running}` : base;
  };

  const columns = useMemo<DataTableColumn<ExtractionRecord>[]>(
    () => [
      {
        id: "extraction",
        header: t.colExtraction,
        accessorKey: "id",
        width: 200,
        filterType: "none",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-neutral-900">{row.id}</span>
            <span className="text-sm font-medium text-neutral-800">
              {formatMessage(t.byOwner, { name: row.owner })}
            </span>
          </div>
        ),
      },
      {
        id: "archive",
        header: t.colArchive,
        accessorKey: "archive",
        width: 220,
        filterType: "none",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "scope",
        header: t.colScope,
        accessorFn: (row) => scopeLabel(row.scope),
        width: 220,
        filterType: "none",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "status",
        header: t.colStatus,
        accessorFn: (row) => row.status,
        width: 280,
        filterType: "none",
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1.5">
            <Chip
              variant={STATUS_VARIANT[row.status]}
              label={statusLabel[row.status]}
              hasBorder
            />
            <span className="text-sm font-medium text-neutral-900">
              {statusDetailLabel(row.statusDetail)}
            </span>
          </div>
        ),
      },
      {
        id: "progress",
        header: t.colProgress,
        accessorKey: "progress",
        width: 200,
        minWidth: 140,
        filterType: "none",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-500">
              <div
                className={`h-full rounded-full ${PROGRESS_COLOR[row.status]}`}
                style={{ width: `${row.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-neutral-900">{row.progress}%</span>
          </div>
        ),
      },
      {
        id: "started",
        header: t.colStarted,
        accessorKey: "started",
        width: 170,
        filterType: "none",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "duration",
        header: t.colDuration,
        accessorKey: "durationMinutes",
        width: 200,
        filterType: "none",
        cell: ({ row }) => <span className="text-neutral-900">{durationLabel(row)}</span>,
      },
      {
        id: "open",
        header: "",
        accessorKey: "id",
        width: 56,
        minWidth: 56,
        resizable: false,
        filterType: "none",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            isIconButton
            iconName="chevronRigth"
            title={t.openExtraction}
            aria-label={t.openExtraction}
            onClick={() => onOpen(row.id)}
          />
        ),
      },
    ],
    // Las etiquetas dependen del idioma a través de `t`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, numberFormat, onOpen],
  );

  return (
    <DataTable<ExtractionRecord>
      data={extractions}
      columns={columns}
      keyExtractor={(row) => row.id}
      canSearch={false}
      canFilterColumns={false}
      canExport={false}
      canExpand={false}
      canReadjust={false}
    />
  );
}
