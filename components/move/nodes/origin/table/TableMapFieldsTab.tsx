"use client";

import { useMemo, useRef, useState } from "react";
import { Tabs } from "caralstable";
import { Checkbox, DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { TableExportSettings, type BatchSettings } from "./TableExportSettings";

export interface SapField {
  name: string;
  type: string;
  length: number;
  description: string;
  /** Se incluye en la extracción. */
  selected: boolean;
  /** Aplica la conversión de formato SAP (ALPHA, fechas...). */
  conversion: boolean;
}

export interface SapTableState {
  name: string;
  fields: SapField[];
}

const MIN_TABLE_HEIGHT = 160;
const MAX_TABLE_HEIGHT = 800;
const DEFAULT_TABLE_HEIGHT = 372;
const EXPANDED_TABLE_HEIGHT = 590;

/** Extracción por tabla: tablas agregadas, selección de campos y ajustes de exportación. */
export function TableMapFieldsTab({
  tables,
  expanded = false,
  activeTable,
  onActiveTableChange,
  onTableChange,
  batch,
  onBatchChange,
}: {
  tables: SapTableState[];
  /** Con el panel expandido la tabla arranca más alta. */
  expanded?: boolean;
  activeTable: string;
  onActiveTableChange: (name: string) => void;
  onTableChange: (table: SapTableState) => void;
  batch: BatchSettings;
  onBatchChange: (next: BatchSettings) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const table = tables.find((item) => item.name === activeTable);
  const activeIndex = Math.max(
    tables.findIndex((item) => item.name === activeTable),
    0
  );

  // null = altura por defecto según el modo; al arrastrar el asa se fija una altura manual.
  const [manualHeight, setManualHeight] = useState<number | null>(null);
  const tableHeight = manualHeight ?? (expanded ? EXPANDED_TABLE_HEIGHT : DEFAULT_TABLE_HEIGHT);
  const setTableHeight = (update: (height: number) => number) => setManualHeight(update(tableHeight));
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const setField = (name: string, patch: Partial<SapField>) => {
    if (!table) return;
    onTableChange({
      ...table,
      fields: table.fields.map((field) => (field.name === name ? { ...field, ...patch } : field)),
    });
  };

  const selectedCount = table?.fields.filter((field) => field.selected).length ?? 0;
  const allSelected = !!table && selectedCount === table.fields.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const columns = useMemo<DataTableColumn<SapField>[]>(
    () => [
      {
        id: "selected",
        header: (
          <div className="flex items-center justify-center">
            <Checkbox
              variant="info"
              checked={allSelected}
              indeterminate={someSelected}
              ariaLabel={t.selectAllFields}
              title={t.selectAllFields}
              onChange={(checked) =>
                table &&
                onTableChange({ ...table, fields: table.fields.map((field) => ({ ...field, selected: checked })) })
              }
            />
          </div>
        ),
        align: "center",
        width: 56,
        minWidth: 56,
        filterable: false,
        resizable: false,
        hideInExport: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.selected}
              ariaLabel={t.selectField.replace("{field}", row.name)}
              onChange={(checked) => setField(row.name, { selected: checked })}
            />
          </div>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: t.colField,
        filterType: "text",
        width: 110,
        cell: ({ value }) => <span className="text-base text-neutral-900">{String(value)}</span>,
      },
      {
        id: "type",
        accessorKey: "type",
        header: t.colType,
        filterType: "text",
        width: 130,
        cell: ({ value }) => <span className="text-base text-neutral-900">{String(value)}</span>,
      },
      {
        id: "length",
        accessorKey: "length",
        header: t.colLength,
        filterType: "number",
        width: 80,
        cell: ({ value }) => <span className="text-base text-neutral-900">{String(value)}</span>,
      },
      {
        id: "description",
        accessorKey: "description",
        header: t.colDescription,
        filterType: "text",
        minWidth: 180,
        cell: ({ value }) => <span className="text-base text-neutral-900">{String(value)}</span>,
      },
      {
        id: "conversion",
        accessorKey: "conversion",
        header: t.colConversion,
        align: "center",
        width: 120,
        filterable: false,
        resizable: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              variant="neutral"
              checked={row.conversion}
              ariaLabel={t.convertField.replace("{field}", row.name)}
              onChange={(checked) => setField(row.name, { conversion: checked })}
            />
          </div>
        ),
      },
    ],
    // setField depende de `table`, que ya está en la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, table, allSelected, someSelected, onTableChange]
  );

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startHeight: tableHeight };
    setIsDragging(true);
  };
  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const next = dragRef.current.startHeight + (e.clientY - dragRef.current.startY);
    setManualHeight(Math.min(MAX_TABLE_HEIGHT, Math.max(MIN_TABLE_HEIGHT, next)));
  };
  const onHandlePointerUp = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const tablesBar = (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-base text-neutral-900">{t.tables}</span>
      {tables.length > 0 && (
        <Tabs
          tabs={tables.map((item) => ({ label: item.name }))}
          activeIndex={activeIndex}
          onChange={(index) => onActiveTableChange(tables[index].name)}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold tracking-tight text-seidor-main-text">{t.tabMapFields}</h3>
        <p className="text-sm text-neutral-800">{t.mapFieldsDesc}</p>
      </div>
      <div style={{ ["--fields-h" as string]: `${tableHeight}px` }}>
        <DataTable<SapField>
          variant="embedded"
          data={table?.fields ?? []}
          columns={columns}
          keyExtractor={(row) => row.name}
          canSearch={true}
          searchPlaceholder={t.searchField}
          canFilterColumns={false}
          canFilterErrors={false}
          canExport={false}
          canExpand={true}
          toolbarLeft={tablesBar}
          // El toolbar embebido es sticky sin fondo: sin esto las filas se ven a través al hacer scroll.
          toolbarClassName="bg-container"
          tableContainerClassName={`max-h-[var(--fields-h)] ${
            isDragging ? "" : "transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none"
          }`}
        />
      </div>

      {/* Asa para ajustar la altura de la tabla de campos */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label={t.resizeFields}
        title={t.resizeFields}
        tabIndex={0}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
        onDoubleClick={() => setManualHeight(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") setTableHeight((h) => Math.max(MIN_TABLE_HEIGHT, h - 20));
          if (e.key === "ArrowDown") setTableHeight((h) => Math.min(MAX_TABLE_HEIGHT, h + 20));
        }}
        className="group flex w-full cursor-row-resize touch-none justify-center py-1 outline-none"
      >
        <span className="h-[5px] w-[100px] rounded-full bg-neutral-500 transition-colors group-hover:bg-neutral-800 group-focus-visible:bg-info-main" />
      </div>

      <TableExportSettings fields={table?.fields ?? []} value={batch} onChange={onBatchChange} />
    </div>
  );
}
