"use client";

import React, { useState } from "react";
import { Button } from "caralstable";
import { DataTable, DataTableColumn, Input } from "@/components/ui";
import type { Icons } from "@/components/icons";

export type MoveListViewMode = "list" | "grid";

/** Tarjeta que agrupa título, descripción y acciones (Figma: container, radio 8px, padding 20px). */
const HEADER_CARD_CLASS = "bg-container rounded-lg p-5";

export interface MoveListViewProps<T> {
  title: string;
  description: string;
  iconName: Icons;
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  /** Búsqueda compartida por la lista y la grilla. */
  searchPlaceholder: string;
  matchesSearch: (row: T, query: string) => boolean;
  /** Tarjeta de la vista de grilla. */
  renderCard: (row: T) => React.ReactNode;
  /** Acción primaria (p. ej. "Agregar nodo"), siempre al extremo derecho. */
  primaryAction?: React.ReactNode;
  labels: { switchToGrid: string; switchToList: string; noResults: string };
  defaultViewMode?: MoveListViewMode;
}

/**
 * Listado genérico de Move (nodos, jobs…): vista de lista con `DataTable` embebida
 * y vista de tarjetas, con búsqueda compartida y la misma barra de herramientas.
 */
export function MoveListView<T>({
  title,
  description,
  iconName,
  data,
  columns,
  keyExtractor,
  searchPlaceholder,
  matchesSearch,
  renderCard,
  primaryAction,
  labels,
  defaultViewMode = "list",
}: MoveListViewProps<T>) {
  const [viewMode, setViewMode] = useState<MoveListViewMode>(defaultViewMode);
  const [searchQuery, setSearchQuery] = useState("");

  if (viewMode === "list") {
    return (
      <DataTable<T>
        variant="embedded"
        toolbarClassName={HEADER_CARD_CLASS}
        title={title}
        description={description}
        iconName={iconName}
        data={data}
        columns={columns}
        keyExtractor={keyExtractor}
        canSearch={true}
        searchPlaceholder={searchPlaceholder}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        customSearchFn={matchesSearch}
        canFilterColumns={true}
        canFilterErrors={false}
        canExport={false}
        canExpand={true}
        toolbarRight={({ isMaximized }) => (
          <div className="flex items-center gap-2.5">
            {!isMaximized && (
              <Button
                variant="ghost"
                isIconButton
                iconName="grid"
                className="border border-neutral-500 cursor-pointer"
                onClick={() => setViewMode("grid")}
                title={labels.switchToGrid}
              />
            )}
            {primaryAction}
          </div>
        )}
      />
    );
  }

  const visibleRows = data.filter((row) => matchesSearch(row, searchQuery));

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Toolbar (mismo layout que la variante embedded de DataTable) */}
      <div className={`w-full flex flex-wrap items-center justify-between gap-3 ${HEADER_CARD_CLASS}`}>
        <div className="flex flex-col pr-1">
          <h3 className="text-xl font-bold text-seidor-main-text font-poppins">{title}</h3>
          <p className="text-sm text-neutral-800 font-normal font-poppins">{description}</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-56 sm:w-64">
            <Input
              iconName="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </div>
          <Button
            variant="ghost"
            isIconButton
            iconName="list"
            className="border border-neutral-500 cursor-pointer"
            onClick={() => setViewMode("list")}
            title={labels.switchToList}
          />
          {primaryAction}
        </div>
      </div>

      {visibleRows.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-2.5">
          {visibleRows.map((row) => (
            <React.Fragment key={keyExtractor(row)}>{renderCard(row)}</React.Fragment>
          ))}
        </div>
      ) : (
        <div className="w-full rounded-xl border border-neutral-500 bg-container p-10 text-center text-sm text-neutral-800">
          {labels.noResults}
        </div>
      )}
    </div>
  );
}
