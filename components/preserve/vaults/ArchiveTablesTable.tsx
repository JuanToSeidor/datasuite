"use client";

import React, { useMemo } from "react";
import { Chip } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { ArchiveTable, TableAvailability } from "./types";

const AVAILABILITY_TONE: Record<TableAvailability, string> = {
  servable: "text-success-main",
  servableAsOf: "text-success-main",
  notServable: "text-warning-main",
  notExtracted: "text-neutral-800",
};

/** Tabla de tablas del archivo: disponibilidad y conciliación contra el dump. */
export function ArchiveTablesTable({ rows, className }: { rows: ArchiveTable[]; className?: string }) {
  const { language, dict } = useLanguage();
  const t = dict.preserve.vaults;

  const numberFormat = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "es-ES";

  const availabilityLabel: Record<TableAvailability, string> = {
    servable: t.availabilityServable,
    servableAsOf: t.availabilityServableAsOf,
    notServable: t.availabilityNotServable,
    notExtracted: t.availabilityNotExtracted,
  };

  const columns = useMemo<DataTableColumn<ArchiveTable>[]>(
    () => [
      {
        id: "table",
        header: t.colTable,
        accessorKey: "table",
        width: 120,
        filterType: "text",
        cell: ({ value }) => <span className="text-base font-bold text-neutral-900">{value}</span>,
      },
      {
        id: "description",
        header: t.colDescription,
        accessorKey: "description",
        width: 260,
        filterType: "text",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "component",
        header: t.colComponent,
        accessorKey: "component",
        width: 140,
        filterType: "select",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "dataClass",
        header: t.colDataClass,
        accessorKey: "dataClass",
        width: 190,
        filterType: "select",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-neutral-900">{row.dataClass}</span>
            <span className="text-xs text-neutral-800">{row.dataKind}</span>
          </div>
        ),
      },
      {
        id: "records",
        header: t.colRecords,
        accessorKey: "records",
        width: 140,
        align: "right",
        filterType: "number",
        cell: ({ value }) => (
          <span className="text-neutral-900">{value === null ? "—" : Number(value).toLocaleString(numberFormat)}</span>
        ),
      },
      {
        id: "inArchive",
        header: t.colInArchive,
        accessorFn: (row) => availabilityLabel[row.availability],
        width: 380,
        filterType: "select",
        cell: ({ row }) => {
          const noteKey =
            row.availability === "servableAsOf"
              ? t.noteServableAsOf
              : row.availability === "notServable"
                ? t.noteNotServable
                : null;
          return (
            <div className="flex flex-col whitespace-normal">
              <span className={`font-medium ${AVAILABILITY_TONE[row.availability]}`}>
                {availabilityLabel[row.availability]}
              </span>
              {noteKey && <span className="text-xs text-neutral-800">{noteKey}</span>}
            </div>
          );
        },
      },
      {
        id: "reconciliation",
        header: t.colReconciliation,
        accessorFn: (row) =>
          row.reconciliation.type === "matches"
            ? t.reconMatches
            : row.reconciliation.type === "missing"
              ? t.reconMissingLabel
              : t.reconNotInDump,
        width: 200,
        filterType: "select",
        cell: ({ row }) => {
          const r = row.reconciliation;
          if (r.type === "matches") return <Chip variant="success" label={t.reconMatches} hasBorder />;
          if (r.type === "missing")
            return <Chip variant="danger" label={formatMessage(t.reconMissing, { n: r.n })} hasBorder />;
          return <Chip variant="warning" label={t.reconNotInDump} hasBorder />;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, numberFormat]
  );

  return (
    <DataTable<ArchiveTable>
      variant="embedded"
      tableContainerClassName="border! border-container!"
      className={className}
      data={rows}
      columns={columns}
      keyExtractor={(row) => row.table}
      canSearch={false}
      canFilterColumns
      canExport={false}
      canExpand={false}
      canReadjust
    />
  );
}
