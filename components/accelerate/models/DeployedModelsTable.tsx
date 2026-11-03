"use client";

import React, { useMemo } from "react";
import { Button } from "caralstable";
import { Brand } from "@/components/icons";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { ModelStatusCell } from "./ModelStatusCell";
import type { AccelerateModel } from "../types";

interface DeployedModelsTableProps {
  models: AccelerateModel[];
  onOpenActions: (model: AccelerateModel) => void;
  /** Muestra título y descripción en el toolbar (true en Resumen; la página Modelos ya tiene encabezado). */
  showTitle?: boolean;
  /** Acciones extra al extremo derecho del toolbar. */
  toolbarRight?: React.ReactNode | ((props: { isMaximized: boolean }) => React.ReactNode);
  /** Borde marcado alrededor de la tabla (página Modelos, donde va directo sobre el fondo). */
  bordered?: boolean;
}

/** Texto secundario de una celda: rojo cuando la fila está en error. */
function SubText({ isError, children }: { isError: boolean; children: React.ReactNode }) {
  return (
    <span className={`block truncate text-base ${isError ? "text-danger-main" : "text-neutral-800"}`}>
      {children}
    </span>
  );
}

export function DeployedModelsTable({ models, onOpenActions, showTitle = true, toolbarRight, bordered = false }: DeployedModelsTableProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.overview;

  const columns = useMemo<DataTableColumn<AccelerateModel>[]>(() => {
    const timeAgo = (minutes: number) =>
      minutes >= 60
        ? formatMessage(t.hoursAgo, { n: Math.floor(minutes / 60) })
        : formatMessage(t.minutesAgo, { n: minutes });

    return [
      {
        id: "status",
        accessorKey: "status",
        header: t.colStatus,
        filterType: "select",
        filterLabel: t.colStatus,
        filterSelectOptions: [
          { label: t.statusActive, value: "active" },
          { label: t.statusDeploying, value: "deploying" },
          { label: t.statusError, value: "error" },
        ],
        width: 140,
        cell: ({ row }) => <ModelStatusCell model={row} />,
      },
      {
        id: "model",
        accessorKey: "name",
        header: t.colModel,
        filterType: "none",
        width: 230,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="truncate text-base text-neutral-900">{row.name}</span>
            <SubText isError={row.status === "error"}>
              {formatMessage(t.companiesVersion, {
                companies: row.companies.join(", "),
                version: row.version,
              })}
            </SubText>
          </div>
        ),
      },
      {
        id: "source",
        accessorFn: (row) => `${row.source.system} · ${row.source.product}`,
        header: t.colSource,
        filterType: "none",
        width: 300,
        cell: ({ row, value }) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Brand name={row.source.brand} size={20} />
              <span className="truncate text-base text-neutral-900">{value}</span>
            </div>
            <SubText isError={row.status === "error"}>
              {formatMessage(t.client, { client: row.source.client })}
            </SubText>
          </div>
        ),
      },
      {
        id: "destination",
        accessorFn: (row) => row.destination.name,
        header: t.colDestination,
        filterType: "none",
        width: 320,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Brand name={row.destination.brand} size={20} />
              <span className="truncate text-base text-neutral-900">{row.destination.name}</span>
            </div>
            <SubText isError={row.status === "error"}>
              {row.destination.lakehouse} · {row.destination.workspace}
            </SubText>
          </div>
        ),
      },
      {
        id: "freshness",
        accessorFn: (row) => row.freshness.lastLoad,
        header: t.colFreshness,
        filterType: "none",
        width: 280,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="truncate text-base text-neutral-900">{row.freshness.lastLoad}</span>
            <SubText isError={row.status === "error"}>
              {formatMessage(t.freshnessDetail, {
                ago: timeAgo(row.freshness.minutesAgo),
                upToDate: row.freshness.tablesUpToDate,
                total: row.freshness.tablesTotal,
              })}
            </SubText>
          </div>
        ),
      },
      {
        id: "dashboards",
        accessorKey: "dashboards",
        header: t.colDashboards,
        filterType: "none",
        align: "center",
        width: 110,
        cell: ({ value }) => (
          <span className="text-base text-neutral-900">{value > 0 ? value : "-"}</span>
        ),
      },
      {
        id: "actions",
        header: t.colActions,
        filterType: "none",
        align: "center",
        width: 110,
        resizable: false,
        hideInExport: true,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            isIconButton
            iconName="dots"
            onClick={() => onOpenActions(row)}
            title={t.modelActions}
            aria-label={t.modelActions}
          />
        ),
      },
    ];
  }, [t, onOpenActions]);

  return (
    <DataTable<AccelerateModel>
      title={showTitle ? t.modelsTitle : undefined}
      description={showTitle ? t.modelsDescription : undefined}
      variant="embedded"
      tableContainerClassName={bordered ? "border-neutral-800!" : undefined}
      data={models}
      columns={columns}
      keyExtractor={(row) => row.id}
      rowClassName={(row) => (row.status === "error" ? "bg-danger-light" : undefined)}
      canSearch={true}
      searchPlaceholder={t.searchModels}
      customSearchFn={(row, query) =>
        [
          row.name,
          row.version,
          row.source.system,
          row.source.product,
          row.destination.name,
          row.destination.lakehouse,
          row.destination.workspace,
        ].some((v) => v.toLowerCase().includes(query.toLowerCase()))
      }
      canFilterColumns={true}
      canFilterErrors={false}
      canExport={false}
      canExpand={true}
      toolbarRight={toolbarRight}
    />
  );
}
