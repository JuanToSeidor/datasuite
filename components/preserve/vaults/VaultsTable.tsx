"use client";

import React, { useMemo } from "react";
import { Button, Chip } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { Vault } from "./types";

/** Lista de archivos (vaults) con estado y acción para abrir el detalle. */
export function VaultsTable({ vaults, onOpen }: { vaults: Vault[]; onOpen: (vault: Vault) => void }) {
  const { dict } = useLanguage();
  const t = dict.preserve.vaults;

  const columns = useMemo<DataTableColumn<Vault>[]>(
    () => [
      {
        id: "archive",
        header: t.colArchive,
        accessorKey: "archive",
        width: 200,
        filterType: "text",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "source",
        header: t.colSource,
        accessorFn: (row) =>
          `${row.source.system} · ${formatMessage(t.sourceDetail, { product: row.source.product, client: row.source.client })}`,
        width: 260,
        filterType: "text",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-neutral-900">{row.source.system}</span>
            <span className="text-xs text-neutral-800">
              {formatMessage(t.sourceDetail, { product: row.source.product, client: row.source.client })}
            </span>
          </div>
        ),
      },
      {
        id: "cutOff",
        header: t.colCutOff,
        accessorKey: "cutOffDate",
        width: 190,
        filterType: "text",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
      {
        id: "destination",
        header: t.colDestination,
        accessorFn: (row) => `${row.destination.platform} · ${row.destination.schema}`,
        width: 260,
        filterType: "text",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-neutral-900">{row.destination.platform}</span>
            <span className="text-xs text-neutral-800">{row.destination.schema}</span>
          </div>
        ),
      },
      {
        id: "volume",
        header: t.colVolume,
        accessorFn: (row) => row.volume.size,
        width: 220,
        filterType: "text",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-neutral-900">{row.volume.size}</span>
            <span className="text-xs text-neutral-800">
              {formatMessage(t.tablesRows, { tables: row.volume.tables, rows: row.volume.rows })}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: t.colStatus,
        accessorFn: (row) => (row.status === "queryable" ? t.statusQueryable : t.statusExtractingLabel),
        width: 200,
        filterType: "select",
        cell: ({ row }) =>
          row.status === "queryable" ? (
            <Chip variant="success" label={t.statusQueryable} hasBorder />
          ) : (
            <Chip
              variant="info"
              label={formatMessage(t.statusExtracting, { progress: row.progress ?? 0 })}
              hasBorder
            />
          ),
      },
      {
        id: "action",
        header: t.colAction,
        width: 90,
        filterable: false,
        resizable: false,
        align: "center",
        cell: ({ row }) => (
          <Button variant="ghost" isIconButton iconName="chevronRigth" title={t.openVault} aria-label={t.openVault} onClick={() => onOpen(row)} />
        ),
      },
    ],
    [t, onOpen]
  );

  return (
    <DataTable<Vault>
      variant="embedded"
      tableContainerClassName="border! border-container!"
      data={vaults}
      columns={columns}
      keyExtractor={(row) => row.id}
      canSearch={false}
      canFilterColumns
      canExport={false}
      canExpand={false}
      canReadjust
    />
  );
}
