"use client";

import React, { useMemo } from "react";
import { Chip } from "caralstable";
import { DataTable, type DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import checksData from "@/data/preserve/extractionChecks.json";
import scanData from "@/data/preserve/extractionSource.json";
import { AlertCard } from "./AlertCard";
import { extractionDestinations } from "./CutOffStep";

type CheckStatus = "passed" | "warning" | "toDecide";

interface CheckData {
  id: string;
  status: CheckStatus;
  params?: Record<string, string | number>;
}

interface CheckRow {
  number: number;
  id: string;
  status: CheckStatus;
  name: string;
  detail: string;
}

const checks = checksData.checks as CheckData[];
const scanTables = scanData.tables;

const STATUS_VARIANT: Record<CheckStatus, "success" | "warning" | "info"> = {
  passed: "success",
  warning: "warning",
  toDecide: "info",
};

interface ConfirmationStepProps {
  cutOff: string;
  destinationId: string;
  onBackToCutOff: () => void;
}

/** Paso 3 · Confirmación: resumen del archivo y chequeos previos a la extracción. */
export function ConfirmationStep({ cutOff, destinationId, onBackToCutOff }: ConfirmationStepProps) {
  const { dict, language } = useLanguage();
  const t = dict.preserve.extraction;

  const numberFormat = useMemo(() => new Intl.NumberFormat(language), [language]);
  const oneDecimal = useMemo(
    () => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }),
    [language],
  );

  const destination =
    extractionDestinations.destinations.find((d) => d.id === destinationId)?.label ?? "";

  const totalTables = scanTables.reduce((sum, r) => sum + r.tables.length, 0);
  const totalGb = scanTables.reduce((sum, r) => sum + r.sizeGb, 0);
  const sizeLabel =
    totalGb >= 1000
      ? `${oneDecimal.format(totalGb / 1000)} TB`
      : `${oneDecimal.format(totalGb)} GB`;

  const statusLabel: Record<CheckStatus, string> = {
    passed: t.statusPassed,
    warning: t.statusWarning,
    toDecide: t.statusToDecide,
  };

  const rows = useMemo<CheckRow[]>(() => {
    const text: Record<string, { name: string; detail: string }> = {
      mandt: { name: t.checkMandtName, detail: t.checkMandtDetail },
      matdoc: { name: t.checkMatdocName, detail: t.checkMatdocDetail },
      decimals: { name: t.checkDecimalsName, detail: t.checkDecimalsDetail },
      acdoca: { name: t.checkAcdocaName, detail: t.checkAcdocaDetail },
      codeLists: { name: t.checkCodeListsName, detail: t.checkCodeListsDetail },
      volume: { name: t.checkVolumeName, detail: t.checkVolumeDetail },
      dialect: { name: t.checkDialectName, detail: t.checkDialectDetail },
    };
    return checks.map((check, i) => {
      // Los números de los parámetros se formatean según el idioma.
      const params = Object.fromEntries(
        Object.entries(check.params ?? {}).map(([k, v]) => [
          k,
          typeof v === "number" ? numberFormat.format(v) : v,
        ]),
      );
      return {
        number: i + 1,
        id: check.id,
        status: check.status,
        name: text[check.id]?.name ?? check.id,
        detail: formatMessage(text[check.id]?.detail ?? "", params),
      };
    });
    // Los textos dependen del idioma activo a través de `t`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, numberFormat]);

  const warnings = checks.filter((c) => c.status === "warning").length;

  const columns = useMemo<DataTableColumn<CheckRow>[]>(
    () => [
      {
        id: "number",
        header: t.colNumber,
        accessorKey: "number",
        width: 64,
        filterType: "none",
        cell: ({ value }) => <span className="font-bold text-neutral-900">{value}</span>,
      },
      {
        id: "check",
        header: t.colCheck,
        accessorKey: "name",
        width: 340,
        filterType: "none",
        cell: ({ value }) => <span className="font-bold text-neutral-900">{value}</span>,
      },
      {
        id: "result",
        header: t.colResult,
        accessorKey: "status",
        width: 160,
        filterType: "none",
        cell: ({ row }) => (
          <Chip
            variant={STATUS_VARIANT[row.status]}
            label={statusLabel[row.status]}
            hasBorder
          />
        ),
      },
      {
        id: "detail",
        header: t.colDetail,
        accessorKey: "detail",
        filterType: "none",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
    ],
    // statusLabel depende de `t`, que ya está en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return (
    <section className="flex w-full flex-col gap-4 rounded-lg bg-container p-5 font-poppins">
      <h2 className="text-2xl font-bold text-neutral-900">{t.confirmationTitle}</h2>

      {/* Resumen del archivo */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-neutral-300 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <dl className="flex flex-col gap-3 text-sm">
          <SummaryRow label={t.summaryCutOff} value={cutOff.replace("T", " ")} />
          <SummaryRow label={t.destinationLabel} value={destination} />
          <SummaryRow label={t.summaryAfterwards} value={t.summaryAfterwardsValue} />
        </dl>
        <div className="flex flex-col justify-center gap-1 lg:border-l lg:border-neutral-300 lg:pl-4">
          <p className="text-sm text-neutral-900">
            {formatMessage(t.summaryVolume, { size: sizeLabel, n: totalTables })}
          </p>
          <p className="text-xs text-neutral-800">{t.summaryWindow}</p>
        </div>
      </div>

      {/* Chequeos previos */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-neutral-900">{t.checksTitle}</h3>

        {warnings > 0 && (
          <AlertCard
            tone="warning"
            iconName="triangleExclamation"
            title={formatMessage(t.warningsTitle, { n: warnings })}
            text={t.warningsText}
            actionLabel={t.backToStep2}
            onAction={onBackToCutOff}
          />
        )}

        <DataTable<CheckRow>
          data={rows}
          columns={columns}
          keyExtractor={(row) => row.id}
          canSearch={false}
          canFilterColumns={false}
          canExport={false}
          canExpand={false}
          canReadjust={false}
        />

        <p className="text-xs text-neutral-800">{t.checksFooter}</p>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <dt className="w-40 shrink-0 text-neutral-800">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
