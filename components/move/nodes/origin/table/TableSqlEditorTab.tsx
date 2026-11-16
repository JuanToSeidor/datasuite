"use client";

import { useMemo, useRef, useState } from "react";
import { Button, Drawer, Toggle } from "caralstable";
import type { Icons } from "@/components/icons";
import { CaralIcon } from "@/components/icons";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import originData from "@/data/move/originSource.json";
import type { SapTableState } from "./TableMapFieldsTab";

export interface JoinMapping {
  left: string;
  right: string;
}

export interface TableJoin {
  leftTable: string;
  rightTable: string;
  /** inner | left | right | full */
  type: string;
  mappings: JoinMapping[];
}

export interface SqlVariable {
  name: string;
  /** string | number | date */
  type: string;
  value: string;
}

/** Joins, condición WHERE y variables de una extracción por tabla. Las tablas unidas son las que aparecen en "Mapear campos". */
export interface SqlSettings {
  joins: TableJoin[];
  where: string;
  variables: SqlVariable[];
}

export const DEFAULT_SQL: SqlSettings = {
  joins: originData.defaultJoins,
  where: originData.defaultWhere,
  variables: originData.defaultVariables,
};

const JOIN_ICONS: Record<string, Icons> = {
  inner: "innerJoin",
  left: "leftJoin",
  right: "rigthJoin",
  full: "fullJoin",
};
const JOIN_SQL: Record<string, string> = {
  inner: "INNER JOIN",
  left: "LEFT OUTER JOIN",
  right: "RIGHT OUTER JOIN",
  full: "FULL OUTER JOIN",
};

const EMPTY_MAPPING: JoinMapping = { left: "", right: "" };
const VARIABLE_NAME = /^[a-z_][a-z0-9_]*$/i;

function emptyDraft(baseTable: string): TableJoin {
  return { leftTable: baseTable, rightTable: "", type: "inner", mappings: [{ ...EMPTY_MAPPING }] };
}

function joinCondition(join: TableJoin) {
  return join.mappings.map((m) => `${join.leftTable}~${m.left} = ${join.rightTable}~${m.right}`).join(" AND ");
}

/** Consulta completa (Open SQL) a partir de los campos seleccionados, los joins y la condición. */
export function buildQuery(tables: SapTableState[], sql: SqlSettings) {
  const base = tables[0];
  if (!base) return "";
  const columns = tables.flatMap((table) =>
    table.fields.filter((field) => field.selected).map((field) => `${table.name}~${field.name}`)
  );
  const lines = [`SELECT ${columns.length > 0 ? columns.join(",\n       ") : "*"}`, `  FROM ${base.name}`];
  for (const join of sql.joins) {
    lines.push(`  ${JOIN_SQL[join.type] ?? "INNER JOIN"} ${join.rightTable} ON ${joinCondition(join)}`);
  }
  if (sql.where.trim()) lines.push(` WHERE ${sql.where.trim()}`);
  return lines.join("\n");
}

/** Extracción por tabla: joins entre tablas, filtro WHERE y variables de la consulta. */
export function TableSqlEditorTab({
  tables,
  value,
  onSaveJoin,
  onRemoveJoin,
  onChange,
}: {
  tables: SapTableState[];
  value: SqlSettings;
  /** Crea (index = null) o reemplaza un join. Quien lo recibe agrega la tabla derecha a la extracción. */
  onSaveJoin: (join: TableJoin, index: number | null) => void;
  onRemoveJoin: (index: number) => void;
  onChange: (next: SqlSettings) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const baseTable = tables[0]?.name ?? "";

  const [draft, setDraft] = useState<TableJoin>(() => emptyDraft(baseTable));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState(true);
  const [isVariableOpen, setIsVariableOpen] = useState(false);
  const whereRef = useRef<HTMLTextAreaElement>(null);

  const joinTypeLabels: Record<string, string> = {
    inner: t.joinInner,
    left: t.joinLeft,
    right: t.joinRight,
    full: t.joinFull,
  };

  const fieldsOf = (name: string) =>
    (tables.find((table) => table.name === name) ?? catalogTable(name))?.fields ?? [];

  // Izquierda: tablas que ya forman parte de la extracción. Derecha: catálogo sin las ya unidas
  // (salvo la del join que se está editando).
  const leftOptions = tables.map((table) => ({ value: table.name, label: table.name }));
  const rightOptions = originData.tables
    .filter((table) => table.name !== draft.leftTable)
    .filter(
      (table) =>
        !tables.some((item) => item.name === table.name) ||
        (editingIndex !== null && value.joins[editingIndex]?.rightTable === table.name)
    )
    .map((table) => ({ value: table.name, label: `${table.name} · ${table.description}` }));
  const leftFieldOptions = fieldsOf(draft.leftTable).map((field) => ({ value: field.name, label: field.name }));
  const rightFieldOptions = fieldsOf(draft.rightTable).map((field) => ({ value: field.name, label: field.name }));

  const isDraftValid =
    draft.leftTable !== "" &&
    draft.rightTable !== "" &&
    draft.mappings.length > 0 &&
    draft.mappings.every((m) => m.left !== "" && m.right !== "");

  const setMapping = (index: number, patch: Partial<JoinMapping>) =>
    setDraft((prev) => ({
      ...prev,
      mappings: prev.mappings.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));

  // Al elegir la tabla derecha se proponen las llaves con el mismo nombre en ambas tablas (MANDT, KUNNR...).
  const selectRightTable = (name: string) => {
    const leftNames = new Set(fieldsOf(draft.leftTable).map((field) => field.name));
    const shared = fieldsOf(name)
      .filter((field) => leftNames.has(field.name))
      .map((field) => ({ left: field.name, right: field.name }));
    setDraft((prev) => ({ ...prev, rightTable: name, mappings: shared.length > 0 ? shared : [{ ...EMPTY_MAPPING }] }));
  };

  const resetDraft = () => {
    setDraft(emptyDraft(baseTable));
    setEditingIndex(null);
  };

  const saveDraft = () => {
    if (!isDraftValid) return;
    onSaveJoin(draft, editingIndex);
    resetDraft();
  };

  const insertVariable = (name: string) => {
    const token = `@${name}`;
    const el = whereRef.current;
    const start = el?.selectionStart ?? value.where.length;
    const end = el?.selectionEnd ?? value.where.length;
    const before = value.where.slice(0, start);
    const spacer = before && !before.endsWith(" ") ? " " : "";
    onChange({ ...value, where: `${before}${spacer}${token}${value.where.slice(end)}` });
    requestAnimationFrame(() => {
      const caret = before.length + spacer.length + token.length;
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const fullQuery = useMemo(() => buildQuery(tables, value), [tables, value]);

  return (
    <div className="flex flex-col gap-7">
      {/* Join Clause */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader title={t.joinTitle} description={t.joinDesc} />

        {value.joins.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {value.joins.map((join, index) => (
              <li
                key={`${join.leftTable}-${join.rightTable}`}
                className={`flex items-center gap-3 rounded-lg border px-3 py-1.5 ${
                  editingIndex === index ? "border-info-main bg-info-light" : "border-neutral-500"
                }`}
              >
                <span className="shrink-0 text-neutral-900">
                  <CaralIcon name={JOIN_ICONS[join.type] ?? "innerJoin"} size={20} />
                </span>
                <code className="min-w-0 flex-1 break-words font-mono text-sm text-neutral-900">
                  {join.leftTable} {JOIN_SQL[join.type]} {join.rightTable} ON {joinCondition(join)}
                </code>
                <Button
                  variant="ghost"
                  isIconButton
                  iconName="edit"
                  title={t.editJoin}
                  onClick={() => {
                    setDraft({ ...join, mappings: join.mappings.map((m) => ({ ...m })) });
                    setEditingIndex(index);
                  }}
                />
                <Button
                  variant="ghost"
                  isIconButton
                  iconName="x"
                  title={t.removeJoin.replace("{table}", join.rightTable)}
                  onClick={() => {
                    onRemoveJoin(index);
                    if (editingIndex !== null) resetDraft();
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Select
            label={t.leftTable}
            options={leftOptions}
            value={draft.leftTable}
            onValueChange={(next) =>
              setDraft((prev) => ({ ...prev, leftTable: String(next), mappings: [{ ...EMPTY_MAPPING }] }))
            }
          />
          <Select
            label={t.rightTable}
            placeholder={t.rightTablePlaceholder}
            options={rightOptions}
            value={draft.rightTable}
            onValueChange={(next) => selectRightTable(String(next))}
          />
          <Select
            label={t.joinType}
            options={originData.joinTypes.map((type) => ({
              value: type,
              label: joinTypeLabels[type] ?? type,
              iconName: JOIN_ICONS[type],
            }))}
            value={draft.type}
            onValueChange={(next) => setDraft((prev) => ({ ...prev, type: String(next) }))}
          />
        </div>

        <span className="text-sm font-medium text-neutral-800">{t.joinMapping}</span>
        <div className="flex flex-col gap-2.5">
          {draft.mappings.map((mapping, index) => (
            <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2.5">
              <Select
                label={t.leftField}
                placeholder={t.fieldPlaceholder}
                options={leftFieldOptions}
                value={mapping.left}
                disabled={!draft.leftTable}
                onValueChange={(next) => setMapping(index, { left: String(next) })}
              />
              <Select
                label={t.rightField}
                placeholder={t.fieldPlaceholder}
                options={rightFieldOptions}
                value={mapping.right}
                disabled={!draft.rightTable}
                onValueChange={(next) => setMapping(index, { right: String(next) })}
              />
              {/* Con un solo par no se puede quitar; se oculta pero conserva el espacio para alinear las filas */}
              <div className={draft.mappings.length === 1 ? "invisible" : ""}>
                <Button
                  variant="ghost"
                  isIconButton
                  iconName="x"
                  title={t.removeJoinField}
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, mappings: prev.mappings.filter((_, i) => i !== index) }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Button
            variant="light"
            hasBorder
            size="sm"
            iconName="plus"
            onClick={() => setDraft((prev) => ({ ...prev, mappings: [...prev.mappings, { ...EMPTY_MAPPING }] }))}
          >
            {t.addJoinField}
          </Button>
          <div className="flex gap-2.5">
            <Button variant="light" hasBorder onClick={resetDraft}>
              {editingIndex !== null ? dict.common.cancel : t.clean}
            </Button>
            <Button variant="info" disabled={!isDraftValid} onClick={saveDraft}>
              {editingIndex !== null ? t.updateJoin : t.makeJoin}
            </Button>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-500" />

      {/* Where */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeader title={t.whereTitle} description={t.whereDesc} />
          <Button variant="light" hasBorder iconName="plus" onClick={() => setIsVariableOpen(true)}>
            {t.createVariable}
          </Button>
        </div>

        <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-500">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-500 p-2.5">
            <p className="min-w-0 flex-1 text-sm font-medium text-neutral-800">
              {t.whereNote} <code className="font-mono">kna1~mandt = 400 and kna1~erdat &gt; @datefrom</code>
            </p>
            <Toggle checked={editorMode} onChange={setEditorMode} label={t.editorMode} />
          </div>
          <div className="flex min-h-[83px]">
            <div className="flex w-24 shrink-0 items-center justify-center bg-neutral-500 p-2.5 sm:w-[151px]">
              <span className="text-xl font-semibold tracking-tight text-neutral-800">
                {editorMode ? "WHERE" : "SQL"}
              </span>
            </div>
            {editorMode ? (
              <textarea
                ref={whereRef}
                aria-label={t.whereTitle}
                spellCheck={false}
                rows={3}
                value={value.where}
                placeholder={t.wherePlaceholder}
                onChange={(e) => onChange({ ...value, where: e.target.value })}
                className="min-w-0 flex-1 resize-y bg-transparent p-2.5 font-mono text-sm leading-6 text-neutral-900 outline-none placeholder:text-neutral-800"
              />
            ) : (
              <pre
                aria-label={t.fullQuery}
                className="min-w-0 flex-1 overflow-x-auto p-2.5 font-mono text-sm leading-6 text-neutral-900"
              >
                {fullQuery}
              </pre>
            )}
          </div>
        </div>

        {value.variables.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-neutral-800">{t.variables}</span>
            {value.variables.map((variable) => (
              <Button
                key={variable.name}
                variant="light"
                hasBorder
                size="sm"
                title={t.insertVariable.replace("{value}", variable.value || "—")}
                disabled={!editorMode}
                onClick={() => insertVariable(variable.name)}
              >
                <span className="font-mono">@{variable.name}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {isVariableOpen && (
        <VariableDrawer
          existing={value.variables.map((variable) => variable.name)}
          onClose={() => setIsVariableOpen(false)}
          onCreate={(variable) => {
            onChange({ ...value, variables: [...value.variables, variable] });
            setIsVariableOpen(false);
          }}
        />
      )}
    </div>
  );
}

function catalogTable(name: string) {
  return originData.tables.find((table) => table.name === name);
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <h3 className="text-xl font-semibold tracking-tight text-seidor-main-text">{title}</h3>
      <p className="text-sm text-neutral-800">{description}</p>
    </div>
  );
}

function VariableDrawer({
  existing,
  onClose,
  onCreate,
}: {
  existing: string[];
  onClose: () => void;
  onCreate: (variable: SqlVariable) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const [variable, setVariable] = useState<SqlVariable>({ name: "", type: originData.variableTypes[0], value: "" });

  const typeLabels: Record<string, string> = {
    string: t.variableTypeString,
    number: t.variableTypeNumber,
    date: t.variableTypeDate,
  };
  const name = variable.name.trim();
  const nameError =
    name === ""
      ? undefined
      : !VARIABLE_NAME.test(name)
        ? t.variableNameInvalid
        : existing.includes(name)
          ? t.variableNameTaken
          : undefined;

  return (
    <Drawer isOpen onClose={onClose} title={t.createVariable} size="md">
      <form
        className="flex h-full flex-col justify-between gap-6 pt-2 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name && !nameError) onCreate({ ...variable, name });
        }}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-800">{t.variableDesc}</p>
          <Input
            label={t.variableName}
            placeholder="datefrom"
            value={variable.name}
            error={nameError}
            detail={t.variableNameHelp}
            onChange={(e) => setVariable((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Select
            label={t.variableType}
            options={originData.variableTypes.map((type) => ({ value: type, label: typeLabels[type] ?? type }))}
            value={variable.type}
            onValueChange={(next) => setVariable((prev) => ({ ...prev, type: String(next) }))}
          />
          <Input
            label={t.variableValue}
            placeholder={variable.type === "date" ? "20240101" : variable.type === "number" ? "400" : "DOMESTIC"}
            value={variable.value}
            onChange={(e) => setVariable((prev) => ({ ...prev, value: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="light" hasBorder onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" variant="info" disabled={!name || Boolean(nameError)}>
            {t.createVariable}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
