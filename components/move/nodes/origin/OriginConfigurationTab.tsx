"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DataTable, DataTableColumn, Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import originData from "@/data/move/originSource.json";

interface SapFunction {
  name: string;
  description: string;
}

const functions = originData.functions as SapFunction[];

// Convierte un patrón con comodines (*) en una expresión regular sin distinguir mayúsculas.
function wildcardToRegExp(pattern: string) {
  const trimmed = pattern.trim() || "*";
  const escaped = trimmed.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

/** Selección del paso Origen; la guarda el formulario del nodo para validar el avance. */
export interface OriginSelection {
  sourceId: string;
  extractionType: string;
}

export function OriginConfigurationTab({
  value,
  onChange,
}: {
  value: OriginSelection;
  onChange: (next: OriginSelection) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;

  // Origen y tipo de extracción empiezan vacíos al crear: el método de
  // extracción solo se muestra cuando ambos están elegidos.
  const { sourceId, extractionType } = value;
  const setSourceId = (next: string) => onChange({ ...value, sourceId: next });
  const setExtractionType = (next: string) => onChange({ ...value, extractionType: next });
  const [exportFormat, setExportFormat] = useState(originData.exportFormats[0]);
  const [patternInput, setPatternInput] = useState("*");
  const [appliedPattern, setAppliedPattern] = useState("*");
  const [syncedFunctions, setSyncedFunctions] = useState<string[]>([functions[0].name]);

  const source = originData.connections.find((c) => c.id === sourceId);
  const isOriginReady = sourceId !== "" && extractionType !== "";

  const sourceOptions = useMemo(
    () => originData.connections.map((c) => ({ value: c.id, label: c.name, brand: "SAP" as const })),
    []
  );
  const extractionOptions = useMemo(
    () => originData.extractionTypes.map((type) => ({ value: type, label: type })),
    []
  );
  const exportOptions = useMemo(
    () => originData.exportFormats.map((format) => ({ value: format, label: format })),
    []
  );

  const filteredFunctions = useMemo(() => {
    const regex = wildcardToRegExp(appliedPattern);
    return functions.filter((fn) => regex.test(fn.name));
  }, [appliedPattern]);

  const toggleSync = (name: string) =>
    setSyncedFunctions((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const columns = useMemo<DataTableColumn<SapFunction>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: t.colName,
        filterType: "text",
        minWidth: 240,
        cell: ({ value }) => <span className="text-sm font-medium text-neutral-900">{String(value)}</span>,
      },
      {
        id: "description",
        accessorKey: "description",
        header: t.colDescription,
        filterType: "text",
        minWidth: 220,
        cell: ({ value }) => <span className="text-sm text-neutral-900">{String(value)}</span>,
      },
      {
        id: "sync",
        header: t.colSync,
        align: "center",
        width: 90,
        minWidth: 80,
        filterable: false,
        resizable: false,
        cell: ({ row }) => {
          const synced = syncedFunctions.includes(row.name);
          return (
            <div className="flex items-center justify-center">
              <Button
                variant={synced ? "info" : "ghost"}
                isIconButton
                iconName="sync"
                title={t.syncFunction}
                aria-pressed={synced}
                onClick={() => toggleSync(row.name)}
              />
            </div>
          );
        },
      },
    ],
    [t, syncedFunctions]
  );

  return (
    <>
      {/* Conexión de origen */}
      <section className="flex flex-col gap-5 rounded-[12px] bg-container p-5">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">{t.connectionSection}</h3>
          <div className="h-px w-full bg-neutral-500" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Select
              label={t.source}
              options={sourceOptions}
              value={sourceId || undefined}
              onValueChange={(value) => setSourceId(String(value))}
            />
            {source && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-success-main">
                <CaralIcon name="check" size={14} />
                {t.verified.replace("{client}", source.client)}
              </p>
            )}
          </div>
          <Select
            label={t.extractionType}
            options={extractionOptions}
            value={extractionType || undefined}
            onValueChange={(value) => setExtractionType(String(value))}
          />
        </div>

        <div className="h-px w-full bg-neutral-500" />

        <Link href="/connections" className="flex w-fit items-center gap-2 text-sm text-info-main hover:underline">
          <CaralIcon name="link" size={20} />
          {t.registerLink}
        </Link>
      </section>

      {/* Método de extracción: aparece al elegir origen y tipo de extracción */}
      {isOriginReady && (
      <section className="flex flex-col gap-4 rounded-[12px] bg-container p-5">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">{t.methodSection}</h3>
          <div className="h-px w-full bg-neutral-500" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Select
            label={t.exportFile}
            options={exportOptions}
            value={exportFormat}
            onValueChange={(value) => setExportFormat(String(value))}
          />
          <Input
            label={t.functionGroup}
            iconName="search"
            value={patternInput}
            onChange={(e) => setPatternInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setAppliedPattern(patternInput);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-neutral-800">{t.wildcardHelp}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="light"
              hasBorder
              iconName="xCircle"
              onClick={() => {
                setPatternInput("*");
                setAppliedPattern("*");
              }}
            >
              {t.clean}
            </Button>
            <Button variant="info" iconName="search" onClick={() => setAppliedPattern(patternInput)}>
              {t.search}
            </Button>
          </div>
        </div>

        <DataTable<SapFunction>
          variant="embedded"
          data={filteredFunctions}
          columns={columns}
          keyExtractor={(row) => row.name}
          canSearch={false}
          canFilterColumns={false}
          canFilterErrors={false}
          canExport={false}
          canExpand={false}
        />
      </section>
      )}
    </>
  );
}
