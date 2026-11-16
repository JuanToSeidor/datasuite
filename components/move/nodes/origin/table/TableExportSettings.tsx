"use client";

import { useMemo } from "react";
import { Toggle } from "caralstable";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import originData from "@/data/move/originSource.json";
import type { SapField } from "./TableMapFieldsTab";

export interface BatchSettings {
  enabled: boolean;
  /** "date": rangos de fecha. "string": lista de valores exactos, parciales o rangos. */
  type: string;
  field: string;
  // Fecha
  dateMode: string;
  from: string;
  to: string;
  every: string;
  // String
  valuesSource: string;
  values: string;
}

export const DEFAULT_BATCH: BatchSettings = {
  enabled: true,
  type: originData.batch.types[0],
  field: "",
  dateMode: originData.batch.dateModes[0],
  from: "",
  to: "",
  every: originData.batch.batchEvery[2],
  valuesSource: originData.batch.valuesSources[0],
  values: "",
};

// Tipos SAP que pueden servir para partir la extracción en lotes.
const DATE_TYPES = ["DATS"];
const STRING_TYPES = ["CHAR", "CLNT", "NUMC", "CUKY", "LANG", "UNIT"];

/** Rangos mal escritos de la lista manual (p.ej. "001-", "-9", "1-2-3"). Los parciales con % no son rangos. */
function invalidRanges(values: string) {
  return values
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.includes("-") && !token.includes("%"))
    .filter((token) => {
      const parts = token.split("-");
      return parts.length !== 2 || parts.some((part) => part.trim() === "");
    });
}

/** Ajustes de exportación de una extracción por tabla: lotes por campo de fecha o de texto. */
export function TableExportSettings({
  fields,
  value,
  onChange,
}: {
  fields: SapField[];
  value: BatchSettings;
  onChange: (next: BatchSettings) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const isDate = value.type === "date";
  const set = (patch: Partial<BatchSettings>) => onChange({ ...value, ...patch });

  const typeLabels: Record<string, string> = { date: t.batchTypeDate, string: t.batchTypeString };
  const dateModeLabels: Record<string, string> = { standard: t.dateModeStandard, fiscal: t.dateModeFiscal };
  const everyLabels: Record<string, string> = {
    day: t.everyDay,
    week: t.everyWeek,
    month: t.everyMonth,
    quarter: t.everyQuarter,
    year: t.everyYear,
  };
  const sourceLabels: Record<string, string> = { manual: t.valuesManual, distinct: t.valuesDistinct };

  const fieldOptions = useMemo(() => {
    const allowed = isDate ? DATE_TYPES : STRING_TYPES;
    return fields
      .filter((field) => allowed.includes(field.type))
      .map((field) => ({ value: field.name, label: `${field.name} · ${field.description}` }));
  }, [fields, isDate]);

  const rangeErrors = isDate ? [] : invalidRanges(value.values);

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-xl font-semibold tracking-tight text-seidor-main-text">{t.exportSettings}</h3>

      <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-500">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-500 p-2.5">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-neutral-900">{t.batchTitle}</span>
            <span className="text-sm font-medium text-neutral-800">{t.batchDesc}</span>
          </div>
          <Toggle checked={value.enabled} onChange={(enabled) => set({ enabled })} label={t.enableBatching} />
        </div>

        {value.enabled && (
          <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-4">
            <div className="sm:col-span-4">
              {/* En string el tipo va angosto, como en el diseño; en fecha ocupa toda la fila */}
              <div className={isDate ? "" : "sm:w-[calc(25%-7.5px)]"}>
                <Select
                  label={t.batchType}
                  options={originData.batch.types.map((type) => ({ value: type, label: typeLabels[type] ?? type }))}
                  value={value.type}
                  onValueChange={(next) => set({ type: String(next), field: "" })}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Select
                label={isDate ? t.dateField : t.batchField}
                placeholder={isDate ? t.dateFieldPlaceholder : t.batchFieldPlaceholder}
                options={fieldOptions}
                value={value.field}
                onValueChange={(next) => set({ field: String(next) })}
              />
            </div>

            {isDate ? (
              <>
                <div className="sm:col-span-2">
                  <Select
                    label={t.dateMode}
                    options={originData.batch.dateModes.map((mode) => ({
                      value: mode,
                      label: dateModeLabels[mode] ?? mode,
                    }))}
                    value={value.dateMode}
                    onValueChange={(next) => set({ dateMode: String(next) })}
                  />
                </div>
                <Input
                  label={t.batchFrom}
                  placeholder="20240101"
                  inputMode="numeric"
                  value={value.from}
                  onChange={(e) => set({ from: e.target.value })}
                />
                <Input
                  label={t.batchTo}
                  placeholder="20241231"
                  inputMode="numeric"
                  value={value.to}
                  onChange={(e) => set({ to: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Select
                    label={t.batchEvery}
                    options={originData.batch.batchEvery.map((every) => ({
                      value: every,
                      label: everyLabels[every] ?? every,
                    }))}
                    value={value.every}
                    onValueChange={(next) => set({ every: String(next) })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="sm:col-span-2">
                  <Select
                    label={t.valuesSource}
                    options={originData.batch.valuesSources.map((source) => ({
                      value: source,
                      label: sourceLabels[source] ?? source,
                    }))}
                    value={value.valuesSource}
                    onValueChange={(next) => set({ valuesSource: String(next) })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-4">
                  {value.valuesSource === "manual" ? (
                    <>
                      <Input
                        label={t.batchValues}
                        placeholder="100, Domestic%, 0010000000-0014000000"
                        value={value.values}
                        error={
                          rangeErrors.length > 0
                            ? t.valuesRangeError.replace("{value}", rangeErrors.join(", "))
                            : undefined
                        }
                        onChange={(e) => set({ values: e.target.value })}
                      />
                      <p className="text-xs font-medium text-neutral-800">
                        {t.valuesHelpExact}: <code className="font-mono">100</code> · {t.valuesHelpPartial}:{" "}
                        <code className="font-mono">Domestic%</code> · {t.valuesHelpRange}:{" "}
                        <code className="font-mono">0010000000-0014000000</code> {t.valuesHelpBetween}.{" "}
                        {t.valuesHelpMultiple}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs font-medium text-neutral-800">{t.valuesDistinctHelp}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
