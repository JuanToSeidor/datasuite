"use client";

import React, { useMemo, useState } from "react";
import { Button, Chip } from "caralstable";
import { CaralIcon, type Icons } from "@/components/icons";
import { DataTable, DataTableColumn, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { AccelerateCatalogDetail, SourceTable, SourceTableStatus } from "../types";

const STATUS_STYLE: Record<SourceTableStatus, { variant: "success" | "warning" | "danger"; icon: Icons; text: string }> = {
  available: { variant: "success", icon: "check", text: "text-success-main" },
  outdated: { variant: "warning", icon: "triangleExclamation", text: "text-warning-main" },
  missing: { variant: "danger", icon: "x", text: "text-danger-main" },
};

interface SourceTablesSectionProps {
  sourceTables: NonNullable<AccelerateCatalogDetail["sourceTables"]>;
  onOpenMove: (table: SourceTable) => void;
}

export function SourceTablesSection({ sourceTables, onOpenMove }: SourceTablesSectionProps) {
  const { dict, language } = useLanguage();
  const t = dict.accelerate.detail;

  const [envId, setEnvId] = useState(sourceTables.environments[0]?.id);
  const env = sourceTables.environments.find((e) => e.id === envId) ?? sourceTables.environments[0];
  const tables = env?.tables ?? [];

  const statusLabel: Record<SourceTableStatus, string> = {
    available: t.statusAvailable,
    outdated: t.statusOutdated,
    missing: t.statusMissing,
  };

  const counts = useMemo(
    () => ({
      available: tables.filter((r) => r.status === "available").length,
      outdated: tables.filter((r) => r.status === "outdated").length,
      missing: tables.filter((r) => r.status === "missing").length,
    }),
    [tables]
  );

  const columns = useMemo<DataTableColumn<SourceTable>[]>(() => {
    const numberFormat = new Intl.NumberFormat(language === "en" ? "en-US" : "es-CL");
    const frequency = (min: number) =>
      min <= 0
        ? t.noFlow
        : min >= 60
          ? formatMessage(t.everyHours, { n: Math.round(min / 60) })
          : formatMessage(t.everyMinutes, { n: min });

    return [
      { id: "table", accessorKey: "table", header: t.colTable, filterType: "none", width: 100 },
      { id: "description", accessorKey: "description", header: t.colDescription, filterType: "none", width: 300 },
      {
        id: "records",
        accessorKey: "records",
        header: t.colRecords,
        filterType: "none",
        width: 170,
        cell: ({ value }) => <span>{numberFormat.format(value)}</span>,
      },
      {
        id: "lastLoad",
        accessorKey: "lastLoad",
        header: t.colLastLoad,
        filterType: "none",
        width: 200,
        cell: ({ value }) => <span className="text-neutral-800">{value || "—"}</span>,
      },
      {
        id: "flow",
        accessorKey: "flow",
        header: t.colFlow,
        filterType: "none",
        width: 210,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="truncate text-neutral-900">{row.flow || "—"}</span>
            <span className="text-neutral-800">{frequency(row.frequencyMinutes)}</span>
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: t.colStatus,
        filterType: "none",
        width: 210,
        cell: ({ row }) => {
          const s = STATUS_STYLE[row.status];
          return <Chip variant={s.variant} hasBorder iconName={s.icon} label={statusLabel[row.status]} />;
        },
      },
      {
        id: "actions",
        header: t.colActions,
        filterType: "none",
        align: "right",
        width: 160,
        resizable: false,
        cell: ({ row }) =>
          row.flow ? (
            <Button variant="ghost" size="sm" onClick={() => onOpenMove(row)} className="text-info-main!">
              {t.viewInMove}
            </Button>
          ) : null,
      },
    ];
    // statusLabel deriva de t
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, language, onOpenMove]);

  const summary: { status: SourceTableStatus; label: string }[] = [
    { status: "available", label: formatMessage(t.summaryAvailable, { n: counts.available }) },
    { status: "outdated", label: formatMessage(t.summaryOutdated, { n: counts.outdated }) },
    { status: "missing", label: formatMessage(t.summaryMissing, { n: counts.missing }) },
  ];

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-container p-4 font-poppins">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-seidor-main-text">{t.sourceTablesTitle}</h2>
          <p className="text-sm text-neutral-800">
            {formatMessage(t.sourceTablesSubtitle, { date: sourceTables.consultedAt })}
          </p>
        </div>
        {sourceTables.environments.length > 0 && (
          <div className="w-60">
            <Select
              brand="SAP"
              value={envId}
              onValueChange={(v) => setEnvId(String(v))}
              options={sourceTables.environments.map((e) => ({ value: e.id, label: e.label, brand: "SAP" as const }))}
              placeholder={t.sapEnvironment}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {summary.map((s) => (
          <span key={s.status} className="flex items-center gap-2 text-base text-neutral-900">
            <span className={STATUS_STYLE[s.status].text}>
              <CaralIcon name={STATUS_STYLE[s.status].icon} size={22} color="currentColor" />
            </span>
            {s.label}
          </span>
        ))}
      </div>

      <DataTable<SourceTable>
        variant="embedded"
        data={tables}
        columns={columns}
        keyExtractor={(row) => row.table}
        rowClassName={(row) => (row.status === "missing" ? "bg-danger-light" : undefined)}
        canSearch={false}
        canFilterColumns={false}
        canFilterErrors={false}
        canExport={false}
        canExpand={false}
      />
    </section>
  );
}
