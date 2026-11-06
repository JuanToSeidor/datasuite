"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DataTable, type DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import detailsData from "@/data/preserve/extractionDetails.json";

type TableStatus = "extracting" | "matches";
type ExtractionStatus = "extracting" | "withDifferences" | "matches";

interface TableDetail {
  table: string;
  leftSap: number | null;
  arrived: number | null;
  progress: number;
  difference: number | null;
  status: TableStatus;
}

interface ExtractionDetail {
  status: ExtractionStatus;
  route: { source: string; destination: string };
  progress: number;
  remainingTables: number;
  tables: TableDetail[];
}

/** Fila de la tabla: una por tabla y, al final, el resumen de las que faltan. */
interface TableRow extends TableDetail {
  key: string;
  more: number;
}

const details = detailsData as Record<string, ExtractionDetail>;

const STATUS_VARIANT: Record<TableStatus, "light" | "success"> = {
  extracting: "light",
  matches: "success",
};

interface ExtractionDetailViewProps {
  extractionId: string;
}

/** Detalle de una extracción: avance global y conciliación por tabla. */
export function ExtractionDetailView({ extractionId }: ExtractionDetailViewProps) {
  const router = useRouter();
  const { dict, language } = useLanguage();
  const t = dict.preserve.extractions;
  const td = dict.preserve.extractionDetail;

  const numberFormat = useMemo(() => new Intl.NumberFormat(language), [language]);
  const detail = details[extractionId];
  const listHref = "/preserve/extractions";

  const statusLabel: Record<ExtractionStatus, string> = {
    extracting: t.statusExtracting,
    withDifferences: t.statusWithDifferences,
    matches: t.statusMatches,
  };

  const rows = useMemo<TableRow[]>(() => {
    if (!detail) return [];
    const tableRows: TableRow[] = detail.tables.map((row) => ({
      ...row,
      key: row.table,
      more: 0,
    }));
    if (detail.remainingTables > 0) {
      tableRows.push({
        key: "more",
        table: "",
        leftSap: null,
        arrived: null,
        progress: 0,
        difference: null,
        status: "extracting",
        more: detail.remainingTables,
      });
    }
    return tableRows;
  }, [detail]);

  const columns = useMemo<DataTableColumn<TableRow>[]>(
    () => [
      {
        id: "table",
        header: td.colTable,
        accessorKey: "table",
        width: 300,
        filterType: "none",
        cell: ({ row }) =>
          row.more > 0 ? (
            <span className="text-neutral-900">{formatMessage(td.moreTables, { n: row.more })}</span>
          ) : (
            <span className="font-medium text-neutral-900">{row.table}</span>
          ),
      },
      {
        id: "leftSap",
        header: td.colLeftSap,
        accessorKey: "leftSap",
        width: 200,
        filterType: "none",
        cell: ({ value }) => (
          <span className="text-neutral-900">
            {value === null ? "–" : numberFormat.format(value)}
          </span>
        ),
      },
      {
        id: "arrived",
        header: td.colArrived,
        accessorKey: "arrived",
        width: 240,
        filterType: "none",
        cell: ({ value }) => (
          <span className="text-neutral-900">
            {value === null ? "–" : numberFormat.format(value)}
          </span>
        ),
      },
      {
        id: "progress",
        header: t.colProgress,
        accessorKey: "progress",
        width: 200,
        minWidth: 140,
        filterType: "none",
        cell: ({ row }) =>
          row.more > 0 ? (
            <span className="text-neutral-900">–</span>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-500">
                <div
                  className={`h-full rounded-full ${row.progress >= 100 ? "bg-success-main" : "bg-info-main"}`}
                  style={{ width: `${row.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-neutral-900">{row.progress}%</span>
            </div>
          ),
      },
      {
        id: "difference",
        header: td.colDifference,
        accessorKey: "difference",
        width: 180,
        filterType: "none",
        cell: ({ row }) => {
          if (row.more > 0) return <span className="text-neutral-900">–</span>;
          if (row.difference === null) {
            return (
              <span className="text-neutral-900">
                {row.status === "extracting" ? td.runningDifference : "–"}
              </span>
            );
          }
          return <span className="text-neutral-900">{numberFormat.format(row.difference)}</span>;
        },
      },
      {
        id: "result",
        header: t.colStatus,
        accessorKey: "status",
        width: 180,
        filterType: "none",
        cell: ({ row }) => (
          <Chip
            variant={STATUS_VARIANT[row.status]}
            label={row.status === "matches" ? t.statusMatches : t.statusExtracting}
            hasBorder
          />
        ),
      },
    ],
    // Las etiquetas dependen del idioma a través de `t` y `td`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, td, numberFormat],
  );

  if (!detail) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-3 rounded-2xl bg-container p-10 text-center font-poppins">
        <p className="text-base text-neutral-900">{td.noDetail}</p>
        <Button variant="light" hasBorder iconName="arrowLeft" onClick={() => router.push(listHref)}>
          {td.backToList}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado: migas, título, ruta y avance global */}
      <header className="flex flex-col gap-3 rounded-2xl bg-container px-4 py-3">
        <nav aria-label={t.title} className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={listHref}
            className="flex items-center gap-1.5 text-info-main transition-colors hover:text-info-hard"
          >
            <CaralIcon name="arrowLeft" size={18} color="currentColor" />
            {t.title}
          </Link>
          <span className="text-neutral-800">/</span>
          <span aria-current="page" className="text-neutral-800">
            {extractionId}
          </span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-neutral-900">
              {formatMessage(td.detailTitle, { status: statusLabel[detail.status], id: extractionId })}
            </h1>
            <p className="text-sm text-neutral-800">
              {`${detail.route.source} → ${detail.route.destination}`}
            </p>
          </div>
          <span className="text-5xl font-extrabold text-success-main">{detail.progress}%</span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-500">
          <div className="h-full rounded-full bg-success-main" style={{ width: `${detail.progress}%` }} />
        </div>
      </header>

      {/* Conciliación por tabla */}
      <section className="rounded-2xl bg-container p-4">
        <DataTable<TableRow>
          data={rows}
          columns={columns}
          keyExtractor={(row) => row.key}
          canSearch={false}
          canFilterColumns={false}
          canExport={false}
          canExpand={false}
          canReadjust={false}
        />
      </section>
    </div>
  );
}
