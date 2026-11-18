"use client";

import React, { useMemo } from "react";
import { Button, Chip } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ArchiveCheck, CheckState } from "./detailTypes";

/** Controles previos y posteriores a la extracción de un archivo. */
export function ChecksTable({ rows, className }: { rows: ArchiveCheck[]; className?: string }) {
  const { dict } = useLanguage();
  const t = dict.preserve.vaults;

  const stateLabel = (state: CheckState) => (state === "passed" ? t.statusPassed : t.statusWarning);

  const stateChip = (state: CheckState) => (
    <Chip variant={state === "passed" ? "success" : "warning"} label={stateLabel(state)} hasBorder />
  );

  const columns = useMemo<DataTableColumn<ArchiveCheck>[]>(
    () => [
      {
        id: "number",
        header: t.checksColNumber,
        accessorKey: "id",
        width: 80,
        filterType: "number",
        resizable: false,
        cell: ({ row }) => <span className="text-neutral-900">{row.id}</span>,
      },
      {
        id: "check",
        header: t.checksColCheck,
        accessorKey: "name",
        width: 300,
        filterType: "text",
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-bold text-neutral-900">{row.name}</span>
            {row.failsSilently && <span className="text-sm text-neutral-800">{t.failsSilently}</span>}
          </div>
        ),
      },
      {
        id: "before",
        header: t.checksColBefore,
        accessorFn: (row) => stateLabel(row.before),
        width: 200,
        filterType: "select",
        cell: ({ row }) => stateChip(row.before),
      },
      {
        id: "destination",
        header: t.checksColDestination,
        accessorFn: (row) => stateLabel(row.destination),
        width: 200,
        filterType: "select",
        cell: ({ row }) => stateChip(row.destination),
      },
      {
        id: "detail",
        header: t.checksColDetail,
        accessorKey: "detail",
        width: 640,
        filterType: "text",
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-2 whitespace-normal">
            <span className="text-neutral-900">{row.detail}</span>
            {row.action && (
              <Button variant="light" size="sm" hasBorder>
                {t.addCodeLists}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-900">{t.checksIntro}</p>
      <DataTable<ArchiveCheck>
        variant="embedded"
        tableContainerClassName="border! border-container!"
        className={className}
        data={rows}
        columns={columns}
        keyExtractor={(row) => String(row.id)}
        canSearch={false}
        canFilterColumns
        canExport={false}
        canExpand={false}
        canReadjust
      />
    </div>
  );
}
