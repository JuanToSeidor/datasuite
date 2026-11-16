"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import originData from "@/data/move/originSource.json";
import { BapiFunctionsTab } from "./BapiFunctionsTab";
import { OriginReportTab } from "./OriginReportTab";
import { OriginPreviewTab } from "./OriginPreviewTab";
import { TableMapFieldsTab, type SapTableState } from "./table/TableMapFieldsTab";
import { DEFAULT_SQL, TableSqlEditorTab, type SqlSettings, type TableJoin } from "./table/TableSqlEditorTab";
import { DEFAULT_BATCH, type BatchSettings } from "./table/TableExportSettings";

/** Selección del paso Origen; la guarda el formulario del nodo para validar el avance. */
export interface OriginSelection {
  sourceId: string;
  extractionType: string;
}

type ExtractionType = "BAPI" | "Table" | "Report" | "ODP";

interface SapTableDefinition {
  name: string;
  description: string;
  fields: SapTableState["fields"];
}

// Ancho fijo del panel de conexión: el contenedor anima de este ancho a 0 sin que el contenido se reacomode.
const LEFT_PANEL_WIDTH = "lg:w-[clamp(320px,32vw,433px)]";

const tableCatalog = originData.tables as SapTableDefinition[];

function cloneTable(name: string): SapTableState | undefined {
  const def = tableCatalog.find((table) => table.name === name);
  return def ? { name: def.name, fields: def.fields.map((field) => ({ ...field })) } : undefined;
}

/**
 * Paso Origen del nodo: a la izquierda la conexión SAP y el tipo de extracción;
 * a la derecha la configuración propia de ese tipo (BAPI, Table, Report...).
 */
export function OriginStep({
  value,
  onChange,
  expanded = false,
  onExpandedChange,
}: {
  value: OriginSelection;
  onChange: (next: OriginSelection) => void;
  /** Panel derecho a todo el ancho (oculta la conexión de origen). Lo controla el formulario para compactar el encabezado. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const { sourceId, extractionType } = value;
  const type = extractionType as ExtractionType | "";
  const source = originData.connections.find((c) => c.id === sourceId);
  const isOriginReady = sourceId !== "" && extractionType !== "";

  const isLeftCollapsed = expanded;
  const [tabIndex, setTabIndex] = useState(0);

  // BAPI: formato de exportación y patrón de funciones (el patrón aplicado filtra la tabla derecha).
  const [exportFormat, setExportFormat] = useState(originData.exportFormats[0]);
  const [patternInput, setPatternInput] = useState("*");
  const [appliedPattern, setAppliedPattern] = useState("*");

  // Table: tablas agregadas (cada una con su selección de campos) y la activa.
  const [tables, setTables] = useState<SapTableState[]>(() =>
    originData.defaultTables.map(cloneTable).filter((table): table is SapTableState => Boolean(table))
  );
  const [activeTable, setActiveTable] = useState<string>(originData.defaultTables[0]);
  const [tableInput, setTableInput] = useState(originData.defaultTables[0]);
  const [tableError, setTableError] = useState<string | undefined>();
  const [batch, setBatch] = useState<BatchSettings>(DEFAULT_BATCH);
  const [sql, setSql] = useState<SqlSettings>(DEFAULT_SQL);

  const sourceOptions = useMemo(
    () => originData.connections.map((c) => ({ value: c.id, label: c.name, brand: "SAP" as const })),
    []
  );
  const extractionOptions = useMemo(
    () => originData.extractionTypes.map((option) => ({ value: option, label: option })),
    []
  );
  const exportOptions = useMemo(
    () => originData.exportFormats.map((format) => ({ value: format, label: format })),
    []
  );

  const setExtractionType = (next: string) => {
    onChange({ ...value, extractionType: next });
    setTabIndex(0);
  };

  // Las tablas de la extracción son la base más las unidas por joins; conservan su selección de campos.
  const applyJoins = (base: string, joins: TableJoin[]) => {
    const names = [base, ...joins.map((join) => join.rightTable)];
    const next = names
      .map((name) => tables.find((table) => table.name === name) ?? cloneTable(name))
      .filter((table): table is SapTableState => Boolean(table));
    setTables(next);
    setSql((prev) => ({ ...prev, joins }));
    if (!names.includes(activeTable)) setActiveTable(base);
  };

  // Cambiar la tabla base reinicia los joins: estaban armados sobre la base anterior.
  const searchTable = () => {
    const name = tableInput.trim().toUpperCase();
    if (!name) return;
    if (!cloneTable(name)) {
      setTableError(t.tableNotFound.replace("{table}", name));
      return;
    }
    setTableError(undefined);
    if (tables[0]?.name === name) {
      setActiveTable(name);
      return;
    }
    applyJoins(name, []);
    setActiveTable(name);
  };

  const saveJoin = (join: TableJoin, index: number | null) => {
    const joins = index === null ? [...sql.joins, join] : sql.joins.map((item, i) => (i === index ? join : item));
    applyJoins(tables[0].name, joins);
  };

  // Al quitar un join también se quitan los que colgaban de su tabla derecha.
  const removeJoin = (index: number) => {
    const removed = new Set([sql.joins[index].rightTable]);
    const joins = sql.joins.filter((join, i) => {
      if (i === index) return false;
      if (removed.has(join.leftTable)) {
        removed.add(join.rightTable);
        return false;
      }
      return true;
    });
    applyJoins(tables[0].name, joins);
  };

  const updateTable = (next: SapTableState) =>
    setTables((prev) => prev.map((table) => (table.name === next.name ? next : table)));

  // Pestañas del panel derecho según el tipo de extracción.
  const rightTabs: { label: string; content: React.ReactNode }[] = (() => {
    const preview = { label: t.tabPreview, content: <OriginPreviewTab embedded /> };
    switch (type) {
      case "BAPI":
        return [
          { label: t.tabFunctions, content: <BapiFunctionsTab pattern={appliedPattern} /> },
          preview,
        ];
      case "Table":
        return [
          {
            label: t.tabMapFields,
            content: (
              <TableMapFieldsTab
                tables={tables}
                expanded={expanded}
                activeTable={activeTable}
                onActiveTableChange={setActiveTable}
                onTableChange={updateTable}
                batch={batch}
                onBatchChange={setBatch}
              />
            ),
          },
          {
            label: t.tabSqlEditor,
            content: (
              <TableSqlEditorTab
                tables={tables}
                value={sql}
                onSaveJoin={saveJoin}
                onRemoveJoin={removeJoin}
                onChange={setSql}
              />
            ),
          },
          preview,
        ];
      case "Report":
        return [{ label: t.tabReport, content: <OriginReportTab embedded /> }, preview];
      default:
        return [];
    }
  })();
  const safeTabIndex = Math.min(tabIndex, Math.max(rightTabs.length - 1, 0));

  // `!`: el CSS de caralstable trae `.flex-col`/`.gap-3` sin capa y le gana a los utilitarios responsive de Tailwind v4.
  return (
    <div className="flex flex-col gap-3 lg:flex-row! lg:items-start lg:gap-0!">
      {/* Conexión de origen: se pliega en ancho al expandir (sigue montada para poder animar) */}
      <div
        inert={isLeftCollapsed}
        aria-hidden={isLeftCollapsed}
        className={`overflow-hidden transition-[width,margin,opacity] duration-300 ease-in-out motion-reduce:transition-none lg:shrink-0 lg:self-stretch ${
          isLeftCollapsed
            ? "max-lg:hidden lg:mr-0 lg:w-0 lg:opacity-0"
            : `lg:mr-3 lg:opacity-100 ${LEFT_PANEL_WIDTH}`
        }`}
      >
        <section className={`flex h-full flex-col gap-5 rounded-[12px] bg-container p-5 ${LEFT_PANEL_WIDTH}`}>
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-seidor-main-text">{t.connectionSection}</h3>
            <div className="h-px w-full bg-neutral-500" />
          </div>

          <div className="flex flex-col gap-2">
            <Select
              label={t.source}
              options={sourceOptions}
              value={sourceId || undefined}
              onValueChange={(next) => onChange({ ...value, sourceId: String(next) })}
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
            onValueChange={(next) => setExtractionType(String(next))}
          />

          {isOriginReady && type === "Table" && (
            <div className="flex items-end gap-1.5">
              <div className="min-w-0 flex-1">
                <Input
                  label={t.tableBase}
                  placeholder={t.tableBasePlaceholder}
                  value={tableInput}
                  error={tableError}
                  onChange={(e) => {
                    setTableInput(e.target.value);
                    setTableError(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchTable();
                  }}
                />
              </div>
              <Button variant="info" className={tableError ? "mb-6" : ""} onClick={searchTable}>
                {t.search}
              </Button>
            </div>
          )}

          {isOriginReady && type === "BAPI" && (
            <>
              <Select
                label={t.exportFile}
                options={exportOptions}
                value={exportFormat}
                onValueChange={(next) => setExportFormat(String(next))}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-1.5">
                  <div className="min-w-0 flex-1">
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
                  <Button
                    variant="light"
                    hasBorder
                    isIconButton
                    iconName="xCircle"
                    title={t.clean}
                    onClick={() => {
                      setPatternInput("*");
                      setAppliedPattern("*");
                    }}
                  />
                  <Button variant="info" onClick={() => setAppliedPattern(patternInput)}>
                    {t.search}
                  </Button>
                </div>
                <p className="text-xs font-medium text-neutral-800">{t.wildcardHelp}</p>
              </div>
            </>
          )}

          <div className="h-px w-full bg-neutral-500" />

          <Link href="/connections" className="flex w-fit items-center gap-2 pb-5 text-base text-info-main hover:underline">
            <CaralIcon name="link" size={24} />
            {t.registerLink}
          </Link>
        </section>
      </div>

      {/* Configuración según el tipo de extracción */}
      <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-[12px] bg-container p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {isLeftCollapsed ? (
            <Button
              variant="info"
              isIconButton
              iconName="arrowRight"
              title={t.collapsePanel}
              aria-pressed
              onClick={() => onExpandedChange?.(false)}
            />
          ) : (
            <Button
              variant="light"
              hasBorder
              isIconButton
              iconName="arrowsLeftRightToLine"
              title={t.expandPanel}
              aria-pressed={false}
              onClick={() => onExpandedChange?.(true)}
            />
          )}
          {rightTabs.length > 1 && (
            <Tabs
              tabs={rightTabs.map((tab) => ({ label: tab.label }))}
              activeIndex={safeTabIndex}
              onChange={setTabIndex}
            />
          )}
        </div>

        {!isOriginReady ? (
          <EmptyState icon="circleInfo" text={t.selectToStart} />
        ) : rightTabs.length === 0 ? (
          <EmptyState icon="clock" text={t.comingSoon.replace("{type}", extractionType)} />
        ) : (
          rightTabs[safeTabIndex].content
        )}
      </section>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: "circleInfo" | "clock"; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-500 px-6 py-16 text-center">
      <span className="text-neutral-800">
        <CaralIcon name={icon} size={32} />
      </span>
      <p className="max-w-sm text-sm text-neutral-800">{text}</p>
    </div>
  );
}
