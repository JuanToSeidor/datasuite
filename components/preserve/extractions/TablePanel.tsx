"use client";

import React, { useMemo, useState } from "react";
import { Chip, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Spinner } from "@/components/ui";
import { EndpointStep, PreviewTab, StatCell } from "@/components/move/overview/JobNodePanel";
import { SidePanelHeader } from "@/components/move/overview/SidePanelHeader";
import type { DestinationPreview } from "@/components/move/overview/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import tablePreviews from "@/data/preserve/tablePreviews.json";
import type { ExtractionDetail, TableDetail } from "./extractionRun";

/** Mismo ancho que el panel de nodo de Move (la tabla de preview necesita espacio). */
export { JOB_NODE_PANEL_WIDTH as TABLE_PANEL_WIDTH } from "@/components/move/overview/JobNodePanel";

const previews = tablePreviews as Record<string, DestinationPreview>;

/**
 * Filas de muestra en el destino. Las tablas principales tienen su muestra en el JSON;
 * para el resto se arma una genérica (demo sin backend).
 */
function previewFor(table: string): DestinationPreview {
  if (previews[table]) return previews[table];
  return {
    columns: ["MANDT", "KEY", "ERDAT", "ERNAM"],
    rows: Array.from({ length: 8 }, (_, i) => [
      "300",
      `${table}-${String(1000 + i * 7).padStart(6, "0")}`,
      `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i * 3) % 28 + 1).padStart(2, "0")}`,
      ["BATCH_PRES", "SAP_WFRT", "DDIC"][i % 3],
    ]),
  };
}

function DetailsTab({ row, detail }: { row: TableDetail; detail: ExtractionDetail }) {
  const { dict, language } = useLanguage();
  const t = dict.preserve.extractionDetail.tablePanel;
  const td = dict.preserve.extractionDetail;
  const numberFormat = useMemo(() => new Intl.NumberFormat(language), [language]);
  const count = (value: number | null) => (value === null ? "–" : numberFormat.format(value));

  const isQueued = row.status === "extracting" && row.progress === 0;
  const status = {
    extracting: {
      icon: <Spinner size={24} tone="info" />,
      label: isQueued ? t.statusQueued : formatMessage(t.statusRunning, { n: row.progress }),
      text: "text-info-main",
      chip: { variant: "info" as const, status: "waiting" as const, label: t.chipRunning },
      comment: isQueued ? t.commentQueued : t.commentRunning,
    },
    matches: {
      icon: <CaralIcon name="check" size={24} color="currentColor" />,
      label: t.statusMatches,
      text: "text-success-main",
      chip: { variant: "success" as const, status: "success" as const, label: t.chipSuccess },
      comment: t.commentMatches,
    },
    matchesWithErrors: {
      icon: <CaralIcon name="triangleExclamation" size={24} color="currentColor" />,
      label: td.statusMatchesWithErrors,
      text: "text-warning-main",
      chip: { variant: "warning" as const, status: "warning" as const, label: t.chipWarning },
      comment: t.commentWithErrors,
    },
  }[row.status];

  const isDone = row.status !== "extracting";

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

      {/* Recorrido SAP → archivo */}
      <div className="flex flex-col">
        <EndpointStep
          endpoint={{ name: detail.route.source, type: detail.route.sourceType, brandName: detail.route.sourceBrand }}
          done={row.progress > 0 || isDone}
        />
        <EndpointStep
          endpoint={{
            name: detail.route.destination,
            type: detail.route.destinationType,
            brandName: detail.route.destinationBrand,
          }}
          done={isDone}
          isLast
        />
      </div>

      {/* Comentarios */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-neutral-900">{t.commentsTitle}</h3>
        <p className="text-sm text-neutral-900">{status.comment}</p>
      </div>

      {/* Conciliación */}
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-neutral-500 [&>*:nth-child(odd)]:border-r [&>*:nth-child(-n+2)]:border-b [&>*]:border-neutral-500">
        <StatCell value={count(row.leftSap)} label={td.colLeftSap} />
        <StatCell value={count(row.arrived)} label={td.colArrived} />
        <StatCell value={`${row.progress}%`} label={td.colCompleted} />
        <StatCell
          value={row.difference === null ? td.runningDifference : numberFormat.format(row.difference)}
          label={td.colDifference}
        />
      </div>
    </div>
  );
}

/** Detalle de una tabla de la extracción en el panel lateral (mismo patrón que el nodo de Move). */
export function TablePanel({
  row,
  detail,
  onClose,
}: {
  row: TableDetail;
  detail: ExtractionDetail;
  onClose: () => void;
}) {
  const { dict } = useLanguage();
  const t = dict.preserve.extractionDetail.tablePanel;
  const [tab, setTab] = useState(0);
  // Mientras la tabla no empezó a llegar al archivo, el destino todavía no tiene filas.
  const preview = useMemo<DestinationPreview>(() => {
    const sample = previewFor(row.table);
    return (row.arrived ?? 0) > 0 ? sample : { columns: sample.columns, rows: [] };
  }, [row.table, row.arrived]);

  return (
    <div className="flex min-h-full flex-col font-poppins">
      <SidePanelHeader title={formatMessage(t.title, { table: row.table })} onClose={onClose} />

      <div className="flex flex-col gap-4 p-4">
        <div className="self-start">
          <Tabs tabs={[{ label: t.tabDetails }, { label: t.tabPreview }]} activeIndex={tab} onChange={setTab} />
        </div>
        {tab === 0 ? (
          <DetailsTab row={row} detail={detail} />
        ) : (
          <PreviewTab loadedRecords={row.arrived ?? 0} preview={preview} />
        )}
      </div>
    </div>
  );
}
