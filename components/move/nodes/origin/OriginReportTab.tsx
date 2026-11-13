"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "caralstable";
import { DataTable, DataTableColumn, Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import originData from "@/data/move/originSource.json";

interface ReportColumn {
  id: string;
  name: string;
  offset: number;
  width: number;
}

const LINE_PREFIX = 2; // "| " al inicio de cada fila de la tabla del reporte
const CELL_SEPARATOR = 3; // " | " entre celdas
const RULER_STEP = 5;

// Construye el texto plano del reporte SAP y detecta sus columnas (offset y ancho en caracteres).
function buildReport() {
  const { headerLines, columns, rows } = originData.report;
  const widths = columns.map((c) => c.width);
  const formatRow = (cells: string[]) =>
    "| " + cells.map((cell, i) => cell.padEnd(widths[i])).join(" | ") + " |";
  const separator = "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|";

  const lines = [...headerLines, "", formatRow(columns.map((c) => c.name)), separator, ...rows.map(formatRow)];

  let offset = LINE_PREFIX;
  const detected: ReportColumn[] = columns.map((column, i) => {
    const item = { id: `col-${i}`, name: column.name, offset, width: column.width };
    offset += column.width + CELL_SEPARATOR;
    return item;
  });

  return { lines, detected, headerCount: headerLines.length + 1 };
}

const REPORT = buildReport();
const TOTAL_CHARS =
  Math.ceil((Math.max(...REPORT.lines.map((line) => line.length)) + RULER_STEP) / RULER_STEP) * RULER_STEP;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function ReportLine({ number, text, muted }: { number: number; text: string; muted: boolean }) {
  return (
    <div className="flex">
      <span className="w-16 shrink-0 bg-neutral-500/40 px-3 text-right font-poppins text-xs leading-7 text-neutral-800">
        {number}
      </span>
      <span className={`whitespace-pre px-3 leading-7 ${muted ? "text-neutral-800" : "text-neutral-900"}`}>
        {text || " "}
      </span>
    </div>
  );
}

export function OriginReportTab() {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;

  const [columns, setColumns] = useState<ReportColumn[]>(REPORT.detected);
  const [dynamicWidths, setDynamicWidths] = useState(false);
  const [skipTop, setSkipTop] = useState(REPORT.headerCount);
  const [skipBottom, setSkipBottom] = useState(0);
  const [keywords, setKeywords] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isMaximized) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMaximized(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMaximized]);

  const total = REPORT.lines.length;
  const top = clamp(skipTop, 0, total);
  const bottom = clamp(skipBottom, 0, total - top);
  const keywordList = keywords
    .split("\n")
    .map((k) => k.trim())
    .filter(Boolean);
  const matchesKeyword = (line: string) => keywordList.some((k) => line.toLowerCase().includes(k.toLowerCase()));

  const columnDefs = useMemo<DataTableColumn<ReportColumn>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: t.colName,
        filterType: "text",
        minWidth: 140,
        cell: ({ value }) => <span className="text-sm text-neutral-900">{String(value)}</span>,
      },
      {
        id: "offset",
        accessorKey: "offset",
        header: t.colOffset,
        filterType: "number",
        width: 100,
        cell: ({ value }) => <span className="text-sm text-neutral-900">{String(value)}</span>,
      },
      {
        id: "width",
        accessorKey: "width",
        header: t.colWidth,
        filterType: "number",
        width: 100,
        cell: ({ value }) => <span className="text-sm text-neutral-900">{String(value)}</span>,
      },
      {
        id: "action",
        header: t.colAction,
        align: "center",
        width: 90,
        filterable: false,
        resizable: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              isIconButton
              iconName="trash"
              className="text-danger-main!"
              title={t.deleteColumn}
              onClick={() => setColumns((prev) => prev.filter((c) => c.id !== row.id))}
            />
          </div>
        ),
      },
    ],
    [t]
  );

  return (
    <>
      {isMaximized && (
        <div className="fixed inset-0 z-[60] bg-neutral-900/40" onClick={() => setIsMaximized(false)} />
      )}
      <section
        className={`flex flex-col gap-5 bg-container p-5 ${
          isMaximized ? "fixed inset-2 z-[70] overflow-auto rounded-[16px] shadow-xl sm:inset-4" : "rounded-[12px]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">{t.reportTitle}</h3>
          <div className="flex items-center gap-2">
            <Button variant="light" hasBorder isIconButton iconName="circleInfo" title={t.reportInfo} />
            <Button
              variant="light"
              hasBorder
              isIconButton
              iconName={isMaximized ? "arrowsMinimize" : "arrowsMaximize"}
              title={isMaximized ? t.minimize : t.maximize}
              onClick={() => setIsMaximized((v) => !v)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Columnas */}
          <div className="flex min-w-0 flex-col gap-3">
            <span className="text-xs font-medium text-neutral-800">{t.columns}</span>
            <Button
              variant="light"
              hasBorder
              iconName="megaphone"
              className="w-full justify-center"
              onClick={() => setColumns(REPORT.detected)}
            >
              {t.autoDetect}
            </Button>
            <label className="flex cursor-pointer items-center justify-center gap-2 py-1 text-sm text-neutral-900">
              <input
                type="checkbox"
                className="size-4 cursor-pointer accent-info-main"
                checked={dynamicWidths}
                onChange={(e) => setDynamicWidths(e.target.checked)}
              />
              {t.dynamicWidths}
            </label>
            <DataTable<ReportColumn>
              variant="embedded"
              data={columns}
              columns={columnDefs}
              keyExtractor={(row) => row.id}
              canSearch={false}
              canFilterColumns={false}
              canFilterErrors={false}
              canExport={false}
              canExpand={false}
            />
          </div>

          {/* Filas */}
          <div className="flex min-w-0 flex-col gap-3">
            <span className="text-xs font-medium text-neutral-800">{t.rows}</span>
            <Input
              label={t.skipTop}
              type="number"
              min={0}
              value={String(skipTop)}
              onChange={(e) => setSkipTop(Math.max(0, Number(e.target.value) || 0))}
            />
            <Input
              label={t.skipBottom}
              type="number"
              min={0}
              value={String(skipBottom)}
              onChange={(e) => setSkipBottom(Math.max(0, Number(e.target.value) || 0))}
            />
            <Input
              label={t.skipKeywords}
              multiline
              rows={6}
              placeholder={t.skipKeywordsPlaceholder}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>

        {/* Visor del reporte con regla de caracteres */}
        <div className="overflow-x-auto rounded-lg border border-neutral-500">
          <div className="min-w-max font-mono text-sm">
            <div className="flex border-b border-neutral-500">
              <span className="flex w-16 shrink-0 items-end bg-neutral-500/40 px-2 pb-1 font-poppins text-[11px] font-medium text-neutral-900">
                {t.rowNo}
              </span>
              <div className="relative mx-3 h-10" style={{ width: `${TOTAL_CHARS}ch` }}>
                {Array.from({ length: TOTAL_CHARS + 1 }, (_, i) => (
                  <div
                    key={i}
                    className={`absolute bottom-0 w-px ${i % RULER_STEP === 0 ? "h-3.5 bg-neutral-800" : "h-1.5 bg-neutral-500"}`}
                    style={{ left: `${i}ch` }}
                  />
                ))}
                {Array.from({ length: TOTAL_CHARS / RULER_STEP + 1 }, (_, i) => (
                  <div key={`label-${i}`} className="absolute top-1" style={{ left: `${i * RULER_STEP}ch` }}>
                    <span className="font-poppins text-[10px] leading-none text-neutral-900">{i * RULER_STEP}</span>
                  </div>
                ))}
              </div>
            </div>

            {REPORT.lines.slice(0, top).map((line, i) => (
              <ReportLine key={`top-${i}`} number={i + 1} text={line} muted />
            ))}

            <div className="relative border-t-2 border-info-main">
              {REPORT.lines.slice(top, total - bottom).map((line, i) => (
                <ReportLine key={`row-${i}`} number={top + i + 1} text={line} muted={matchesKeyword(line)} />
              ))}
              <div className="pointer-events-none absolute inset-y-0 left-[calc(4rem+0.75rem)]">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="absolute inset-y-0 rounded-sm bg-success-main/30"
                    style={{ left: `${column.offset}ch`, width: `${column.width}ch` }}
                  />
                ))}
              </div>
            </div>

            {bottom > 0 && (
              <div className="border-t-2 border-info-main">
                {REPORT.lines.slice(total - bottom).map((line, i) => (
                  <ReportLine key={`bottom-${i}`} number={total - bottom + i + 1} text={line} muted />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
