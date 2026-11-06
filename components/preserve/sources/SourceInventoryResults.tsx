"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Toggle } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DataTable, DataTableColumn } from "@/components/ui";
import { Select } from "@/components/ui/Select";
import { AnimatedKpi, type AnimatedKpiProps } from "@/components/ui/AnimatedKpi";
import { LoadingLogo } from "@/components/ui/LoadingLogo";
import { suiteConfig } from "@/config/suite";
import { useLanguage } from "@/contexts/LanguageContext";

export type InventoryNote =
  | "viewNotExtracted"
  | "codeList"
  | "operational"
  | "technical"
  | "clientZ";

export interface InventoryTableRow {
  table: string;
  description: string;
  component: string;
  type: "transparent" | "view";
  deliveryClass: string;
  dataClass: string;
  fields: number;
  records: number | null;
  sizeGb: number | null;
  note: InventoryNote;
  selected: boolean;
}

export interface InventoryScanMeta {
  scannedAt: string;
  scannedBy: string;
  detectedVersion: string;
  dictionaryObjects: number;
  transparentTables: number;
  tablesWithData: number;
  totalVolumeTb: number;
}

const STALE_AFTER_DAYS = 30;
// Ritmo de aparición de las filas de la tabla.
const ROW_DELAY_MS = 180;
const ROW_DURATION_MS = 550;

function formatSize(sizeGb: number | null, lessThan: string) {
  if (sizeGb === null) return "—";
  if (sizeGb < 0.1) return lessThan;
  if (sizeGb >= 1000) return `${(sizeGb / 1000).toFixed(1)} TB`;
  return `${sizeGb} GB`;
}

function formatNumber(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
}

function formatScanDate(scannedAt: string) {
  return scannedAt.slice(0, 16).replace("T", " ");
}

function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

export function SourceInventoryResults({
  tables,
  scan,
}: {
  tables: InventoryTableRow[];
  scan: InventoryScanMeta;
}) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.preserve.sources.results;

  const [selectedTables, setSelectedTables] = useState<Set<string>>(
    () => new Set(tables.filter((r) => r.selected).map((r) => r.table))
  );

  // Filtros generales de la tabla
  const [componentFilter, setComponentFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [onlyWithData, setOnlyWithData] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const componentOptions = useMemo(
    () => [
      { value: "all", label: t.filterAll },
      ...Array.from(new Set(tables.map((r) => r.component))).map((v) => ({ value: v, label: v })),
    ],
    [tables, t.filterAll]
  );

  const deliveryOptions = useMemo(
    () => [
      { value: "all", label: t.filterAll },
      ...Array.from(new Set(tables.map((r) => r.deliveryClass))).map((v) => ({ value: v, label: v })),
    ],
    [tables, t.filterAll]
  );

  const filteredTables = useMemo(
    () =>
      tables.filter(
        (r) =>
          (componentFilter === "all" || r.component === componentFilter) &&
          (deliveryFilter === "all" || r.deliveryClass === deliveryFilter) &&
          (!onlyWithData || (r.records !== null && r.records > 0))
      ),
    [tables, componentFilter, deliveryFilter, onlyWithData]
  );

  // Mientras las filas van apareciendo, el título muestra "Cargando tablas…".
  const [isLoadingRows, setIsLoadingRows] = useState(true);
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setIsLoadingRows(false);
      return;
    }
    const lastRowEnds = (tables.length - 1) * ROW_DELAY_MS + ROW_DURATION_MS;
    const timer = window.setTimeout(() => setIsLoadingRows(false), lastRowEnds);
    return () => window.clearTimeout(timer);
  }, [tables.length]);

  const allSelected = selectedTables.size === tables.length && tables.length > 0;
  const someSelected = selectedTables.size > 0 && !allSelected;

  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleTable = (table: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) next.delete(table);
      else next.add(table);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedTables(allSelected ? new Set() : new Set(tables.map((r) => r.table)));
  };

  const selectedRows = tables.filter((r) => selectedTables.has(r.table));
  const selectedSizeGb = selectedRows.reduce((sum, r) => sum + (r.sizeGb ?? 0), 0);

  const noteLabel: Record<InventoryNote, string> = {
    viewNotExtracted: t.noteViewNotExtracted,
    codeList: t.noteCodeList,
    operational: t.noteOperational,
    technical: t.noteTechnical,
    clientZ: t.noteClientZ,
  };

  const isStale =
    (Date.now() - new Date(scan.scannedAt).getTime()) / 86_400_000 > STALE_AFTER_DAYS;

  const columns = useMemo<DataTableColumn<InventoryTableRow>[]>(
    () => ([
      {
        id: "select",
        header: (
          <input
            ref={headerCheckboxRef}
            type="checkbox"
            aria-label="select all"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 cursor-pointer accent-success-main"
          />
        ),
        width: 64,
        minWidth: 64,
        resizable: false,
        filterType: "none",
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={row.table}
            checked={selectedTables.has(row.table)}
            onChange={() => toggleTable(row.table)}
            className="h-4 w-4 cursor-pointer accent-success-main"
          />
        ),
      },
      {
        id: "table",
        accessorKey: "table",
        header: t.colTable,
        width: 170,
        cell: ({ value }) => <span className="font-semibold text-neutral-900">{value}</span>,
      },
      { id: "description", accessorKey: "description", header: t.colDescription, width: 260 },
      { id: "component", accessorKey: "component", header: t.colComponent, width: 120 },
      {
        id: "type",
        accessorFn: (r) => (r.type === "view" ? t.typeView : t.typeTransparent),
        header: t.colType,
        width: 130,
      },
      { id: "deliveryClass", accessorKey: "deliveryClass", header: t.colDeliveryClass, width: 170 },
      { id: "dataClass", accessorKey: "dataClass", header: t.colDataClass, width: 200 },
      {
        id: "fields",
        accessorKey: "fields",
        header: t.colFields,
        align: "right",
        width: 90,
        filterType: "number",
      },
      {
        id: "records",
        accessorFn: (r) => r.records ?? 0,
        header: t.colRecords,
        align: "right",
        width: 140,
        filterType: "number",
        cell: ({ row }) => formatNumber(row.records),
      },
      {
        id: "size",
        accessorFn: (r) => r.sizeGb ?? 0,
        header: t.colSize,
        align: "right",
        width: 110,
        filterType: "number",
        cell: ({ row }) => formatSize(row.sizeGb, t.lessThanOneGb),
      },
      {
        id: "note",
        accessorFn: (r) => r.note,
        header: t.colNote,
        width: 210,
        filterType: "none",
        cell: ({ row }) => <Chip variant="light" hasBorder label={noteLabel[row.note]} />,
      },
    ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTables, allSelected, dict]
  );

  const metrics: Omit<AnimatedKpiProps, "index">[] = [
    { value: scan.detectedVersion, label: t.metricVersion },
    { value: scan.dictionaryObjects.toLocaleString("en-US"), count: scan.dictionaryObjects, label: t.metricObjects },
    { value: scan.transparentTables.toLocaleString("en-US"), count: scan.transparentTables, label: t.metricTransparent },
    { value: scan.tablesWithData.toLocaleString("en-US"), count: scan.tablesWithData, label: t.metricWithData },
    { value: `${scan.totalVolumeTb} TB`, count: scan.totalVolumeTb, decimals: 1, suffix: " TB", label: t.metricVolume },
    {
      value: formatScanDate(scan.scannedAt),
      label: fill(t.metricLastScan, { by: scan.scannedBy }),
    },
  ];

  // Fila de filtros generales: una sola línea, debajo de la barra de la tabla.
  const filterRow = (
    <div className="grid w-full grid-cols-3 items-end gap-4 pb-2">
      <Select
        label={t.filterComponent}
        options={componentOptions}
        value={componentFilter}
        onValueChange={(value) => setComponentFilter(String(value))}
        containerClassName="w-full"
      />
      <Select
        label={t.filterDeliveryClass}
        options={deliveryOptions}
        value={deliveryFilter}
        onValueChange={(value) => setDeliveryFilter(String(value))}
        containerClassName="w-full"
      />
      <div className="flex w-full items-center gap-2 whitespace-nowrap pb-1.5">
        <Toggle checked={onlyWithData} onChange={setOnlyWithData} />
        <span className="text-sm font-semibold text-neutral-900">{t.filterOnlyWithData}</span>
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Filas que aparecen una a una: cada fila tiene su retraso según su posición */}
      <style>{`
        @keyframes inventory-row-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        ${tables.map((_, i) => `.inventory-row-${i} { animation: inventory-row-in ${ROW_DURATION_MS}ms ease-out both; animation-delay: ${i * ROW_DELAY_MS}ms; }`).join("\n")}
        @media (prefers-reduced-motion: reduce) {
          .inventory-row { animation: none !important; }
        }
      `}</style>

      {/* Aviso de escaneo viejo */}
      {isStale && (
        <div className="flex items-center gap-3 rounded-2xl bg-warning-main p-3 text-white">
          <CaralIcon name="triangleExclamation" size={22} />
          <div className="flex flex-1 flex-col">
            <span className="font-bold">{t.staleTitle}</span>
            <span className="text-sm">{t.staleText}</span>
          </div>
          <Button variant="light">{t.scanAgain}</Button>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {metrics.map((m, index) => (
          <AnimatedKpi key={m.label} index={index} {...m} />
        ))}
      </div>

      {/* Tabla de tablas */}
      <section className="flex flex-col gap-3 rounded-2xl bg-container p-4">
        <DataTable<InventoryTableRow>
          title={
            isLoadingRows
              ? (
                <span className="flex items-center gap-2">
                  <LoadingLogo size={22} color={suiteConfig.branches.find((b) => b.id === "preserve")?.color} />
                  {t.loadingRows}
                </span>
              )
              : fill(t.selectedSummary, {
                  count: selectedRows.length,
                  size: formatSize(selectedSizeGb, t.lessThanOneGb),
                })
          }
          data={filteredTables}
          columns={columns}
          keyExtractor={(row) => row.table}
          rowClassName={(_, index) => `inventory-row inventory-row-${index}`}
          canSearch
          canFilterColumns={false}
          canExport={false}
          searchPlaceholder={t.search}
          toolbarRight={
            <div className="flex items-center gap-2">
              <Button
                isIconButton
                iconName="filter"
                variant={filtersOpen ? "info" : "ghost"}
                hasBorder
                onClick={() => setFiltersOpen((prev) => !prev)}
              />
              <Button variant="info" onClick={() => router.push("/preserve/extractions/new")}>
                {t.useInExtraction}
              </Button>
            </div>
          }
          belowToolbar={filtersOpen ? filterRow : undefined}
        />

        <div className="flex flex-col gap-2 border-t border-neutral-300 pt-3 text-xs text-neutral-800">
          <p>{fill(t.footerShowing, { shown: filteredTables.length, total: formatNumber(scan.tablesWithData) })}</p>
          <p>{t.footerRecords}</p>
          <p>{t.footerScanOnly}</p>
        </div>
      </section>
    </div>
  );
}
