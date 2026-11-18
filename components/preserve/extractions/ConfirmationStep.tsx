"use client";

import React, { useMemo, useState } from "react";
import { Button, Chip } from "caralstable";
import { Brand, CaralIcon, type CaralBrandName } from "@/components/icons";
import { Checkbox, DataTable, Select, type DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import checksData from "@/data/preserve/extractionChecks.json";
import scanData from "@/data/preserve/extractionSource.json";
import planData from "@/data/preserve/extractionPlan.json";
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

/** Segundos fijos que cuesta levantar un nodo, aunque lea pocas filas. */
const NODE_OVERHEAD_SECONDS = 5;

/**
 * Estimación del plan de ejecución: cada tabla la lee un carril; las más grandes
 * arrancan primero y cada carril toma la siguiente al terminar (scheduling LPT).
 * Las tablas pequeñas comparten un único nodo.
 */
function estimatePlan(lanes: number) {
  // El inventario trae registros por componente: se reparten entre sus tablas.
  const tables = scanTables.flatMap((group) =>
    group.tables.map(() => group.records / group.tables.length),
  );
  const small = tables.filter((r) => r <= planData.smallTableRecords);
  const large = tables.filter((r) => r > planData.smallTableRecords);

  const jobs = large.map((r) => r / planData.rowsPerSecondPerLane + NODE_OVERHEAD_SECONDS);
  if (small.length > 0) {
    const smallRows = small.reduce((sum, r) => sum + r, 0);
    jobs.push(smallRows / planData.rowsPerSecondPerLane + NODE_OVERHEAD_SECONDS);
  }
  jobs.sort((a, b) => b - a);

  const laneLoad = new Array<number>(lanes).fill(0);
  for (const job of jobs) {
    const next = laneLoad.indexOf(Math.min(...laneLoad));
    laneLoad[next] += job;
  }

  return {
    seconds: Math.max(...laneLoad),
    nodes: jobs.length,
    smallTables: small.length,
  };
}

interface ConfirmationStepProps {
  sourceName: string;
  cutOff: string;
  destinationId: string;
  onBackToCutOff: () => void;
}

/** Paso 3 · Confirmación: resumen del archivo, plan de ejecución y chequeos previos. */
export function ConfirmationStep({
  sourceName,
  cutOff,
  destinationId,
  onBackToCutOff,
}: ConfirmationStepProps) {
  const { dict, language } = useLanguage();
  const t = dict.preserve.extraction;

  const [lanes, setLanes] = useState(planData.recommendedLanes);
  const [saveAsDataset, setSaveAsDataset] = useState(true);

  const numberFormat = useMemo(() => new Intl.NumberFormat(language), [language]);
  const oneDecimal = useMemo(
    () => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }),
    [language],
  );

  const destination = extractionDestinations.destinations.find((d) => d.id === destinationId);

  const totalTables = scanTables.reduce((sum, r) => sum + r.tables.length, 0);
  const totalGb = scanTables.reduce((sum, r) => sum + r.sizeGb, 0);
  const sizeLabel =
    totalGb >= 1000
      ? `${oneDecimal.format(totalGb / 1000)} TB`
      : `${oneDecimal.format(totalGb)} GB`;

  const plan = useMemo(() => estimatePlan(lanes), [lanes]);
  const durationLabel =
    plan.seconds < 60
      ? t.estimateLessMinute
      : plan.seconds < 3600
        ? formatMessage(t.estimateMinutes, { n: Math.round(plan.seconds / 60) })
        : formatMessage(t.estimateHours, { n: oneDecimal.format(plan.seconds / 3600) });

  const laneOptions = useMemo(
    () =>
      planData.laneOptions.map((n) => ({
        value: n,
        label: n === planData.recommendedLanes ? formatMessage(t.parallelRecommended, { n }) : String(n),
      })),
    [t],
  );

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
        minWidth: 56,
        filterType: "none",
        cell: ({ value }) => <span className="font-bold text-neutral-900">{value}</span>,
      },
      {
        id: "check",
        header: t.colCheck,
        accessorKey: "name",
        width: 340,
        filterType: "text",
        cell: ({ value }) => <span className="font-bold text-neutral-900">{value}</span>,
      },
      {
        id: "result",
        header: t.colResult,
        // Se filtra y busca por la etiqueta traducida, no por el código interno.
        accessorFn: (row) => statusLabel[row.status],
        width: 160,
        filterType: "select",
        filterSelectOptions: (Object.keys(STATUS_VARIANT) as CheckStatus[]).map((s) => ({
          label: statusLabel[s],
          value: statusLabel[s],
        })),
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
        width: 520,
        filterType: "text",
        cell: ({ value }) => <span className="text-neutral-900">{value}</span>,
      },
    ],
    // statusLabel depende de `t`, que ya está en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return (
    <>
      <section className="flex w-full flex-col gap-2.5 rounded-lg bg-container p-2.5 font-poppins">
        <h2 className="text-xl font-semibold text-neutral-900">{t.confirmationTitle}</h2>

        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {/* Columna izquierda: resumen, dataset y chequeos */}
          <div className="flex min-w-0 flex-col">
            <div className="grid grid-cols-2 gap-2.5 border-b border-neutral-300 py-2.5">
              <h3 className="col-span-2 px-2.5 text-lg font-semibold text-neutral-900">
                {t.summaryTitle}
              </h3>
              <SummaryItem brand="SAP" label={t.summarySource} value={sourceName} />
              <SummaryItem
                brand={destination?.brand as CaralBrandName | undefined}
                label={t.destinationLabel}
                value={destination?.label ?? ""}
              />
              <SummaryItem
                label={t.summaryTables}
                value={formatMessage(t.summaryTablesValue, { n: totalTables, size: sizeLabel })}
              />
              <SummaryItem label={t.summaryCutOff} value={cutOff.replace("T", " ")} />
              <SummaryItem
                className="col-span-2"
                label={t.summaryAfterwards}
                value={t.summaryAfterwardsValue}
              />
            </div>

            <div className="flex flex-col gap-2.5 border-b border-neutral-300 p-2.5">
              <h3 className="text-lg font-semibold text-neutral-900">{t.datasetTitle}</h3>
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox checked={saveAsDataset} onChange={setSaveAsDataset} />
                <span className="flex min-w-0 flex-col">
                  <span className="text-base text-neutral-900">{t.datasetSave}</span>
                  <span className="text-sm text-neutral-800">{t.datasetSaveHint}</span>
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-2.5 p-2.5">
              <h3 className="text-lg font-semibold text-neutral-900">{t.checksTitle}</h3>
              {warnings > 0 ? (
                <ChecksBanner
                  tone="warning"
                  title={formatMessage(t.warningsTitle, { n: warnings })}
                  text={t.warningsText}
                  action={
                    <Button variant="ghost" size="sm" onClick={onBackToCutOff}>
                      {t.backToStep2}
                    </Button>
                  }
                />
              ) : (
                <ChecksBanner tone="success" title={t.checksPassedTitle} text={t.checksAgainText} />
              )}
            </div>
          </div>

          {/* Columna derecha: cómo se ejecuta */}
          <div className="flex min-w-0 flex-col gap-5 rounded-lg bg-info-100 p-2.5">
            <h3 className="text-lg font-semibold text-neutral-900">{t.howItRunsTitle}</h3>

            <Select
              label={t.parallelLabel}
              className="bg-neutral-100!"
              helperText={formatMessage(t.parallelHelper, { max: planData.maxLanes })}
              options={laneOptions}
              value={lanes}
              onValueChange={(v) => setLanes(Number(v))}
            />

            <div className="flex flex-wrap items-center gap-2.5 rounded-lg bg-container p-2.5">
              <p className="min-w-[140px] flex-1 text-3xl font-semibold tracking-tight text-neutral-900">
                {durationLabel}
              </p>
              <div className="flex min-w-[220px] flex-[2] flex-col">
                <p className="text-xl text-neutral-900">
                  {formatMessage(t.estimateNodes, { nodes: plan.nodes, lanes })}
                </p>
                {plan.smallTables > 0 && (
                  <p className="text-base text-neutral-800">
                    {formatMessage(t.estimateShared, {
                      n: plan.smallTables,
                      records: numberFormat.format(planData.smallTableRecords),
                    })}
                  </p>
                )}
              </div>
            </div>

            <p className="rounded-lg border border-neutral-800 px-5 py-4 text-base text-neutral-900">
              {t.estimateNote}
            </p>
          </div>
        </div>
      </section>

      <DataTable<CheckRow>
        data={rows}
        columns={columns}
        keyExtractor={(row) => row.id}
        hideToolbar
        className="border-container!"
        canSearch={false}
        canFilterColumns
        canReadjust
        canExpand={false}
        canExport={false}
      />
    </>
  );
}

function SummaryItem({
  label,
  value,
  brand,
  className = "",
}: {
  label: string;
  value: string;
  brand?: CaralBrandName;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 px-2.5 ${className}`}>
      {brand && (
        <span className="flex shrink-0 items-center rounded-full bg-neutral-100 p-1.5">
          <Brand name={brand} size={24} />
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="text-sm text-neutral-800">{label}</span>
        <span className="text-base text-neutral-900">{value}</span>
      </div>
    </div>
  );
}

const BANNER_TONE = {
  success: { strip: "bg-success-main", body: "bg-success-light", title: "text-success-hard", text: "text-success-main" },
  warning: { strip: "bg-warning-main", body: "bg-warning-light", title: "text-neutral-900", text: "text-neutral-800" },
} as const;

/** Resultado global de los chequeos previos: franja con ícono + título y detalle. */
function ChecksBanner({
  tone,
  title,
  text,
  action,
}: {
  tone: keyof typeof BANNER_TONE;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  const styles = BANNER_TONE[tone];
  return (
    <div className={`flex items-stretch gap-2.5 overflow-hidden rounded-lg ${styles.body}`}>
      <span className={`flex w-11 shrink-0 items-center justify-center text-neutral-100 ${styles.strip}`}>
        <CaralIcon
          name={tone === "success" ? "circleInfo" : "triangleExclamation"}
          size={24}
          color="currentColor"
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col py-2.5">
        <p className={`text-base ${styles.title}`}>{title}</p>
        <p className={`text-sm font-medium ${styles.text}`}>{text}</p>
      </div>
      {action && <div className="flex shrink-0 items-center pr-2.5">{action}</div>}
    </div>
  );
}
