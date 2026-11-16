"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import originData from "@/data/move/originSource.json";

type PreviewRow = Record<string, string> & { __id: string };

const { columns: PREVIEW_COLUMNS, rows: PREVIEW_ROWS } = originData.preview;

const previewData: PreviewRow[] = PREVIEW_ROWS.map((cells, rowIndex) => {
  const row: PreviewRow = { __id: `row-${rowIndex}` };
  PREVIEW_COLUMNS.forEach((column, i) => {
    row[column] = cells[i];
  });
  return row;
});

/** `embedded`: sin tarjeta propia, para ir dentro del panel derecho del paso Origen. */
export function OriginPreviewTab({ embedded = false }: { embedded?: boolean } = {}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Demo: simula volver a leer la muestra desde SAP.
  const handleRefresh = () => {
    setIsRefreshing(true);
    timerRef.current = setTimeout(() => setIsRefreshing(false), 800);
  };

  const columns = useMemo<DataTableColumn<PreviewRow>[]>(
    () =>
      PREVIEW_COLUMNS.map((column) => ({
        id: column,
        accessorKey: column,
        header: column,
        filterType: "text",
        minWidth: 140,
        cell: ({ value }) => <span className="text-sm text-neutral-900">{String(value)}</span>,
      })),
    []
  );

  return (
    <section className={`flex flex-col gap-3 ${embedded ? "" : "rounded-[12px] bg-container p-5"}`}>
      <DataTable<PreviewRow>
        variant="embedded"
        title={t.previewTitle}
        data={previewData}
        columns={columns}
        keyExtractor={(row) => row.__id}
        canSearch={false}
        canFilterColumns={false}
        canFilterErrors={false}
        canExport={false}
        canExpand={true}
        toolbarRight={
          <Button
            variant="light"
            hasBorder
            isIconButton
            iconName="sync"
            title={t.refresh}
            isLoading={isRefreshing}
            onClick={handleRefresh}
          />
        }
      />
    </section>
  );
}
