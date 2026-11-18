"use client";

import React, { useMemo } from "react";
import { Chip } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { CatalogRow, CatalogStatus } from "./detailTypes";

const STATUS_CHIP: Record<CatalogStatus, "inCatalog" | "outNeedsSap" | "waitingValidation"> = {
  inCatalog: "inCatalog",
  outNeedsSap: "outNeedsSap",
  waitingValidation: "waitingValidation",
};

/** Catálogo de tablas que habilitan las preguntas validadas. */
export function CatalogTable({
  rows,
  tablesEnabled,
  totalTables,
  className,
}: {
  rows: CatalogRow[];
  tablesEnabled: number;
  totalTables: number;
  className?: string;
}) {
  const { dict } = useLanguage();
  const t = dict.preserve.vaults;

  const statusLabel: Record<CatalogStatus, string> = {
    inCatalog: t.statusInCatalog,
    outNeedsSap: t.statusOutNeedsSap,
    waitingValidation: t.statusWaitingValidation,
  };

  const columns = useMemo<DataTableColumn<CatalogRow>[]>(
    () => [
      {
        id: "table",
        header: t.catalogColTable,
        accessorKey: "table",
        width: 200,
        filterType: "text",
        cell: ({ value }) => <span className="font-bold text-neutral-900">{value}</span>,
      },
      {
        id: "questions",
        header: t.catalogColQuestions,
        accessorFn: (row) => row.questions.map((q) => `#${q}`).join(", "),
        width: 400,
        filterType: "text",
        cell: ({ row }) => (
          <span className="text-info-main">{row.questions.map((q) => `#${q}`).join(", ")}</span>
        ),
      },
      {
        id: "status",
        header: t.catalogColStatus,
        accessorFn: (row) => statusLabel[row.status],
        width: 260,
        filterType: "select",
        cell: ({ row }) => {
          const variant =
            STATUS_CHIP[row.status] === "inCatalog"
              ? "success"
              : row.status === "outNeedsSap"
                ? "light"
                : "warning";
          return <Chip variant={variant} label={statusLabel[row.status]} hasBorder />;
        },
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-900">
        {formatMessage(t.catalogIntro, { total: totalTables, n: tablesEnabled })}
      </p>
      <DataTable<CatalogRow>
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
    </div>
  );
}
