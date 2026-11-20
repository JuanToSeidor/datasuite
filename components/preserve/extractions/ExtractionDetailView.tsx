"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DataTable, Spinner, type DataTableColumn } from "@/components/ui";
import { useDateTimeFormatter } from "@/components/move/overview/format";
import { nodeProgressStyle } from "@/components/move/overview/nodeProgressStyle";
import { formatClock } from "@/components/move/overview/useRunningJob";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidePanel } from "@/contexts/SidePanelContext";
import { formatMessage } from "@/lib/format";
import {
  extractionDetails,
  useExtractionRun,
  type ExtractionStatus,
  type TableDetail,
  type TableStatus,
} from "./extractionRun";
import { TABLE_PANEL_WIDTH, TablePanel } from "./TablePanel";

/** Fila de la tabla: una por tabla y, al final, el resumen de las que faltan. */
interface TableRow extends TableDetail {
  key: string;
  more: number;
}

// "Extrayendo" usa outlight (borde de 1px): con hasBorder la variante light no tiene tokens propios.
const RESULT_VARIANT: Record<TableStatus, "outlight" | "success" | "warning"> = {
  extracting: "outlight",
  matches: "success",
  matchesWithErrors: "warning",
};

/** Estado de la fila en el formato de los nodos de Move (fondo de avance compartido). */
const NODE_STATUS = { extracting: "running", matches: "completed", matchesWithErrors: "warning" } as const;

function TableStatusIcon({ status }: { status: TableStatus }) {
  if (status === "matches") {
    return (
      <span className="flex justify-center text-success-main">
        <CaralIcon name="check" size={24} color="currentColor" />
      </span>
    );
  }
  if (status === "matchesWithErrors") {
    return (
      <span className="flex justify-center text-warning-main">
        <CaralIcon name="triangleExclamation" size={24} color="currentColor" />
      </span>
    );
  }
  return (
    <span className="flex justify-center">
      <Spinner size={24} tone="neutral" />
    </span>
  );
}

/** Dato del encabezado: valor + etiqueta (atenuado mientras la extracción está en curso). */
function Stat({ value, label, emphasized }: { value: string; label: string; emphasized: boolean }) {
  return (
    <div className={`flex flex-col ${emphasized ? "text-neutral-900" : "text-neutral-800"}`}>
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

interface ExtractionDetailViewProps {
  extractionId: string;
}

/**
 * Detalle de una extracción (mismo lenguaje visual que el job en ejecución de Move):
 * encabezado con avance global y tiempos, conciliación por tabla y comentarios.
 */
export function ExtractionDetailView({ extractionId }: ExtractionDetailViewProps) {
  const router = useRouter();
  const { dict, language } = useLanguage();
  const t = dict.preserve.extractions;
  const td = dict.preserve.extractionDetail;
  const formatDateTime = useDateTimeFormatter();

  const numberFormat = useMemo(() => new Intl.NumberFormat(language), [language]);
  const detail = extractionDetails[extractionId];
  const listHref = "/preserve/extractions";
  // Avance: las extracciones en vivo (primer despliegue) se simulan tabla por tabla; el resto solo mueve el reloj.
  const run = useExtractionRun(detail);
  const isRunning = run?.isRunning ?? false;

  // Hasta el primer pintado el fondo de avance de las filas queda en 0, para que se llene desde 0.
  const [hasPainted, setHasPainted] = useState(false);
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setHasPainted(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  const statusLabel: Record<ExtractionStatus, string> = {
    extracting: t.statusExtracting,
    withDifferences: t.statusWithDifferences,
    matches: t.statusMatches,
  };
  const resultLabel: Record<TableStatus, string> = {
    extracting: t.statusExtracting,
    matches: t.statusMatches,
    matchesWithErrors: td.statusMatchesWithErrors,
  };

  // Las tablas restantes se resumen en una fila hasta que se pide verlas todas.
  const [showAllTables, setShowAllTables] = useState(false);
  const pendingCount = run?.pendingTables.length ?? 0;

  const rows = useMemo<TableRow[]>(() => {
    if (!run) return [];
    const toRow = (row: TableDetail): TableRow => ({ ...row, key: row.table, more: 0 });
    const tableRows: TableRow[] = run.tables.map(toRow);
    if (showAllTables) {
      tableRows.push(...run.pendingTables.map(toRow));
    } else if (pendingCount > 0) {
      // Resumen: sigue "extrayendo" mientras quede alguna tabla por terminar.
      const pendingDone = run.pendingTables.every((row) => row.status !== "extracting");
      tableRows.push({
        key: "more",
        table: "",
        leftSap: null,
        arrived: null,
        progress: 0,
        difference: null,
        status: pendingDone ? "matches" : "extracting",
        more: pendingCount,
      });
    }
    return tableRows;
  }, [run, showAllTables, pendingCount]);

  // Detalle de la tabla seleccionada en el panel lateral (como los nodos de Move). Se vuelve a
  // pasar el contenido en cada cambio de la fila para ver el avance en vivo.
  const { isSidePanelOpen, openSidePanel, closeSidePanel } = useSidePanel();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const selectedRow = useMemo(
    () => (run && selectedTable ? [...run.tables, ...run.pendingTables].find((r) => r.table === selectedTable) ?? null : null),
    [run, selectedTable],
  );
  useEffect(() => {
    if (!selectedRow || !detail) return;
    openSidePanel(
      <TablePanel key={selectedRow.table} row={selectedRow} detail={detail} onClose={closeSidePanel} />,
      { width: TABLE_PANEL_WIDTH },
    );
  }, [selectedRow, detail, openSidePanel, closeSidePanel]);
  // Si el panel se cierra (X, cambio de ruta...), se limpia la selección.
  const wasPanelOpen = useRef(false);
  useEffect(() => {
    if (wasPanelOpen.current && !isSidePanelOpen && selectedTable !== null) setSelectedTable(null);
    wasPanelOpen.current = isSidePanelOpen;
  }, [isSidePanelOpen, selectedTable]);

  const records = useMemo(
    () =>
      run ? [...run.tables, ...run.pendingTables].reduce((sum, row) => sum + (row.arrived ?? 0), 0) : 0,
    [run],
  );

  const columns = useMemo<DataTableColumn<TableRow>[]>(() => {
    const dash = <span>–</span>;
    const count = (value: number | null) => (value === null ? dash : numberFormat.format(value));
    return [
      {
        id: "status",
        header: "",
        accessorKey: "status",
        filterType: "none",
        width: 56,
        resizable: false,
        align: "center",
        cell: ({ row }) => <TableStatusIcon status={row.status} />,
      },
      {
        id: "table",
        header: td.colTable,
        accessorKey: "table",
        width: 220,
        filterType: "none",
        cell: ({ row }) => (row.more > 0 ? formatMessage(td.moreTables, { n: row.more }) : row.table),
      },
      {
        id: "progress",
        header: td.colCompleted,
        accessorKey: "progress",
        width: 140,
        filterType: "none",
        cell: ({ row }) => (row.more > 0 ? dash : <span className="text-sm font-medium">{row.progress}%</span>),
      },
      {
        id: "leftSap",
        header: td.colLeftSap,
        accessorKey: "leftSap",
        width: 180,
        filterType: "none",
        cell: ({ value }) => count(value),
      },
      {
        id: "arrived",
        header: td.colArrived,
        accessorKey: "arrived",
        width: 220,
        filterType: "none",
        cell: ({ value }) => count(value),
      },
      {
        id: "difference",
        header: td.colDifference,
        accessorKey: "difference",
        width: 160,
        filterType: "none",
        cell: ({ row }) => {
          if (row.more > 0) return dash;
          if (row.difference === null) return row.status === "extracting" ? td.runningDifference : dash;
          return numberFormat.format(row.difference);
        },
      },
      {
        id: "result",
        header: td.colResult,
        accessorKey: "status",
        width: 200,
        filterType: "none",
        cell: ({ row }) =>
          row.status === "extracting" ? (
            <Chip variant="outlight" label={resultLabel.extracting} className="bg-container" />
          ) : (
            <Chip variant={RESULT_VARIANT[row.status]} label={resultLabel[row.status]} hasBorder />
          ),
      },
    ];
    // Las etiquetas dependen del idioma a través de `t` y `td`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, td, numberFormat]);

  if (!detail || !run) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-3 rounded-2xl bg-container p-10 text-center font-poppins">
        <p className="text-base text-neutral-900">{td.noDetail}</p>
        <Button variant="light" hasBorder iconName="arrowLeft" onClick={() => router.push(listHref)}>
          {td.backToList}
        </Button>
      </div>
    );
  }

  // El comentario resalta la tabla con error.
  const [commentBefore, commentAfter = ""] = td.commentError.split("{table}");

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2.5 pb-10 font-poppins">
      {/* Encabezado: migas, título y ruta · barra de avance · resumen */}
      <header className="flex flex-col overflow-hidden rounded-2xl bg-container">
        <div className="flex flex-col p-4 pb-3">
          <nav aria-label={t.title} className="flex flex-wrap items-center gap-2 pb-2 text-base">
            <Link
              href={listHref}
              className="flex items-center gap-2 text-info-main transition-colors hover:text-info-hard"
            >
              <CaralIcon name="arrowLeft" size={20} color="currentColor" />
              {t.title}
            </Link>
            <span className="text-neutral-800">/</span>
            <span aria-current="page" className="text-neutral-800">
              {extractionId}
            </span>
          </nav>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {formatMessage(td.detailTitle, { status: statusLabel[run.status], id: extractionId })}
          </h1>
          <p className="text-base text-neutral-800">{`${detail.route.source} → ${detail.route.destination}`}</p>
        </div>

        <div
          className="h-2.5 w-full bg-success-light"
          role="progressbar"
          aria-valuenow={run.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-success-main transition-[width] duration-500" style={{ width: `${run.progress}%` }} />
        </div>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 p-4">
          <span className="text-5xl font-extrabold text-success-main">
            {formatMessage(td.completed, { n: run.progress })}
          </span>
          <div className="grid min-w-[min(100%,440px)] flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat value={formatDateTime(run.startedAt)} label={td.timeStart} emphasized={!isRunning} />
            <Stat value={formatClock(run.elapsedSeconds)} label={td.elapsed} emphasized={!isRunning} />
            <Stat
              value={formatMessage(td.rows, { n: numberFormat.format(records) })}
              label={td.records}
              emphasized={!isRunning}
            />
          </div>
        </div>
      </header>

      {/* Conciliación por tabla */}
      <section className="overflow-hidden rounded-2xl bg-container">
        <DataTable<TableRow>
          variant="embedded"
          data={rows}
          columns={columns}
          keyExtractor={(row) => row.key}
          // Fondo de avance por fila (mismo degradado que los nodos de Move); la fila con errores
          // mantiene su fondo de aviso.
          rowStyle={(row) =>
            nodeProgressStyle(
              { status: NODE_STATUS[row.status], progress: row.more > 0 ? 0 : row.progress },
              { isSelected: row.more === 0 && row.table === selectedTable, isVisible: hasPainted },
            )
          }
          // Clic en una tabla: abre su detalle; en el resumen: despliega todas las tablas.
          onRowClick={(row) => (row.more > 0 ? setShowAllTables(true) : setSelectedTable(row.table))}
          // Seleccionada: fondo info-100 y borde info-main alrededor de la fila (como en Move; los bordes
          // van en las celdas porque la tabla usa border-separate). Con una tabla abierta, el resto se atenúa.
          rowClassName={(row) =>
            row.more === 0 && row.table === selectedTable
              ? "cursor-pointer bg-info-100 text-neutral-900 [&>td]:border-y! [&>td]:border-info-main! [&>td:first-child]:border-l! [&>td:last-child]:border-r!"
              : `cursor-pointer [&>td]:border-b [&>td]:border-neutral-500 ${
                  row.status === "matchesWithErrors" ? "bg-warning-light" : "bg-container"
                } ${selectedTable ? "text-neutral-800" : "text-neutral-900"}`
          }
          canSearch={false}
          canFilterColumns={false}
          canFilterErrors={false}
          canExport={false}
          canExpand={false}
          canReadjust={false}
        />
        {pendingCount > 0 && (
          <div className="flex justify-center p-2">
            <Button
              variant="ghost"
              size="sm"
              iconName={showAllTables ? "chevronUp" : "chevronDown"}
              aria-expanded={showAllTables}
              onClick={() => setShowAllTables((prev) => !prev)}
            >
              {showAllTables ? td.showLess : formatMessage(td.showAllTables, { n: pendingCount })}
            </Button>
          </div>
        )}
      </section>

      {/* Comentarios */}
      {detail.errorTable && run.showError && (
        <section className="flex flex-col rounded-2xl bg-container p-4">
          <h2 className="text-xl font-semibold text-neutral-900">{td.commentsTitle}</h2>
          <p className="text-base text-neutral-800">
            {commentBefore}
            <span className="text-info-main">{detail.errorTable}</span>
            {commentAfter}
          </p>
        </section>
      )}
    </div>
  );
}
