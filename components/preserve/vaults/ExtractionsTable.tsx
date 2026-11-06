"use client";

import React, { useMemo } from "react";
import { Chip } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { ArchiveExtraction, ExtractionStatus } from "./detailTypes";

/** Historial de extracciones que alimentan el archivo. */
export function ExtractionsTable({ rows, className }: { rows: ArchiveExtraction[]; className?: string }) {
  const { dict } = useLanguage();
  const t = dict.preserve.vaults;

  const columns = useMemo<DataTableColumn<ArchiveExtraction>[]>(
    () => [
      {
        id: "extraction",
        header: t.extractionsColExtraction,
        width: 180,
        filterable: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-neutral-900">{row.id}</span>
            <span className="text-xs text-neutral-800">{formatMessage(t.extractionBy, { name: row.by })}</span>
          </div>
        ),
      },
      {
        id: "archive",
        header: t.colArchive,
        accessorKey: "archive",
        width: 200,
        filterable: false,
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "scope",
        header: t.extractionsColScope,
        accessorKey: "scope",
        width: 240,
        filterable: false,
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "status",
        header: t.colStatus,
        width: 300,
        filterable: false,
        cell: ({ row }) => {
          const isDiff = row.status === "completeDifferences";
          const label: Record<ExtractionStatus, string> = {
            completeDifferences: t.statusCompleteDifferences,
            completeMatches: t.statusCompleteMatches,
          };
          return (
            <div className="flex flex-col items-start gap-1">
              <Chip variant={isDiff ? "danger" : "success"} label={label[row.status]} hasBorder />
              <span className="text-xs text-neutral-800">
                {isDiff ? formatMessage(t.reconMissing, { n: row.missingRows }) : t.reconMatches}
              </span>
            </div>
          );
        },
      },
      {
        id: "progress",
        header: t.extractionsColProgress,
        width: 200,
        filterable: false,
        cell: ({ row }) => (
          <div className="flex w-full flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-300">
              <div
                className={`h-2 rounded-full ${row.status === "completeDifferences" ? "bg-danger-main" : "bg-success-main"}`}
                style={{ width: `${row.progress}%` }}
              />
            </div>
            <span className="text-xs text-neutral-800">{row.progress}%</span>
          </div>
        ),
      },
      {
        id: "started",
        header: t.extractionsColStarted,
        accessorKey: "started",
        width: 190,
        filterable: false,
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "duration",
        header: t.extractionsColDuration,
        accessorKey: "duration",
        width: 160,
        filterable: false,
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
    ],
    [t]
  );

  return (
    <DataTable<ArchiveExtraction>
      variant="embedded"
      className={className}
      data={rows}
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
