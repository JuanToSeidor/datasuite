"use client";

import React, { useMemo, useState } from "react";
import { DataTable, Select, type DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCard } from "./AlertCard";
import { formatMessage } from "@/lib/format";
import extractionSourceData from "@/data/preserve/extractionSource.json";
import sourcesData from "@/data/preserve/sources.json";

interface ScanComponentRow {
  component: string;
  tables: string[];
  records: number;
  sizeGb: number;
}

interface ExtractionSourceData {
  scan: { date: string; system: string };
  supportTables: string[];
  volatileTables: string[];
  tables: ScanComponentRow[];
}

const data = extractionSourceData as ExtractionSourceData;

/** Conexiones SAP del Core disponibles como origen (mismo registro que Source inventory). */
export const sapConnections = sourcesData.sapConnections;

interface SourceStepProps {
  sourceId: string;
  onSourceChange: (id: string) => void;
}

/** Paso 1 · Source: origen SAP, avisos de tablas y componentes del inventario a extraer. */
export function SourceStep({ sourceId, onSourceChange }: SourceStepProps) {
  const { dict, language } = useLanguage();
  const t = dict.preserve.extraction;

  const [showSupportAlert, setShowSupportAlert] = useState(true);
  const [showVolatileAlert, setShowVolatileAlert] = useState(true);

  const source = sapConnections.find((c) => c.id === sourceId) ?? sapConnections[0];
  const sourceOptions = useMemo(
    () => sapConnections.map((c) => ({ value: c.id, label: c.name })),
    [],
  );

  const numberFormat = useMemo(() => new Intl.NumberFormat(language), [language]);
  const oneDecimal = useMemo(
    () => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }),
    [language],
  );
  const formatSize = (gb: number) => {
    if (gb < 0.1) return t.lessThanOneGb;
    if (gb >= 1000) return `${oneDecimal.format(gb / 1000)} TB`;
    return `${oneDecimal.format(gb)} GB`;
  };

  const totalRecords = data.tables.reduce((sum, r) => sum + r.records, 0);
  const totalGb = data.tables.reduce((sum, r) => sum + r.sizeGb, 0);
  const totalTables = data.tables.reduce((sum, r) => sum + r.tables.length, 0);

  const columns = useMemo<DataTableColumn<ScanComponentRow>[]>(
    () => [
      {
        id: "component",
        header: t.colComponent,
        accessorKey: "component",
        width: 140,
        filterType: "none",
        cell: ({ value }) => <span className="font-bold text-neutral-900">{value}</span>,
        footer: <span className="font-bold text-neutral-900">{t.footerTotal}</span>,
      },
      {
        id: "tables",
        header: t.colTables,
        accessorFn: (row) => row.tables.join(", "),
        width: 480,
        filterType: "none",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
        footer: (
          <span className="font-bold text-neutral-900">
            {formatMessage(t.tablesCount, { n: totalTables })}
          </span>
        ),
      },
      {
        id: "records",
        header: t.colRecords,
        accessorKey: "records",
        align: "right",
        width: 180,
        filterType: "none",
        cell: ({ value }) => <span className="text-neutral-900">{numberFormat.format(value)}</span>,
        footer: (
          <span className="font-bold text-neutral-900">{numberFormat.format(totalRecords)}</span>
        ),
      },
      {
        id: "size",
        header: t.colSize,
        accessorKey: "sizeGb",
        align: "right",
        width: 140,
        filterType: "none",
        cell: ({ value }) => <span className="text-neutral-900">{formatSize(value)}</span>,
        footer: <span className="font-bold text-neutral-900">{formatSize(totalGb)}</span>,
      },
    ],
    // formatSize depende de language a través de oneDecimal; t cambia con el idioma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, numberFormat, oneDecimal, totalRecords, totalGb, totalTables],
  );

  return (
    <section className="flex w-full flex-col gap-4 rounded-lg bg-container p-5 font-poppins">
      {/* Origen: conexión SAP + resumen del inventario */}
      <div className="flex flex-col gap-1">
        <div className="w-fit min-w-[280px]">
          <Select
            options={sourceOptions}
            value={source.id}
            onValueChange={(v) => onSourceChange(String(v))}
          />
        </div>
        <p className="text-sm text-neutral-800">
          {formatMessage(t.sourceFrom, {
            source: source.name,
            system: data.scan.system,
            date: data.scan.date,
          })}
        </p>
      </div>

      {/* Avisos: tablas de soporte faltantes y tablas volátiles */}
      {(showSupportAlert || showVolatileAlert) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {showSupportAlert && (
            <AlertCard
              tone="info"
              iconName="circleInfo"
              title={formatMessage(t.supportTitle, { tables: data.supportTables.join(", ") })}
              text={t.supportText}
              actionLabel={t.supportAction}
              onDismiss={() => setShowSupportAlert(false)}
              closeLabel={t.close}
            />
          )}
          {showVolatileAlert && (
            <AlertCard
              tone="warning"
              iconName="triangleExclamation"
              title={formatMessage(t.volatileTitle, { tables: data.volatileTables.join(", ") })}
              text={t.volatileText}
              actionLabel={t.volatileAction}
              onDismiss={() => setShowVolatileAlert(false)}
              closeLabel={t.close}
            />
          )}
        </div>
      )}

      {/* Componentes y tablas del inventario */}
      <DataTable<ScanComponentRow>
        data={data.tables}
        columns={columns}
        keyExtractor={(row) => row.component}
        canSearch={false}
        canFilterColumns={false}
        canExport={false}
        canExpand={false}
        canReadjust={false}
      />
    </section>
  );
}
