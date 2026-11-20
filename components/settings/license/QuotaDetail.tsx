"use client";

import React, { useMemo, ViewTransition } from "react";
import { createPortal } from "react-dom";
import { DataTable, DataTableColumn } from "@/components/ui";
import { EndpointLogo } from "@/components/move/nodes/nodeShared";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import {
  LicenseDict,
  LicenseNodeItem,
  LicenseOriginItem,
  LicenseQuota,
  LicenseUserItem,
  ModuleLicense,
  QUOTA_DESCRIPTION_KEY,
  QUOTA_LABEL_KEY,
  licenseHref,
} from "./licenseData";
import { LicenseBreadcrumb, QuotaUsageCard, quotaTransitionName } from "./LicenseShared";

interface QuotaDetailProps {
  module: ModuleLicense;
  quota: LicenseQuota;
  /** Contenedor bajo la tarjeta de Settings: el uso y la tabla van como bloques separados. */
  afterCard?: HTMLElement | null;
}

const text = (value: React.ReactNode) => <span className="text-base text-neutral-900">{value}</span>;

/** Logo origen + logo destino superpuestos (mismo patrón que los nodos de Move). */
function EndpointPair({ origin, destination }: { origin: string; destination: string }) {
  return (
    <div className="flex items-center shrink-0">
      <span className="-mr-3 flex items-center rounded-full bg-neutral-100 p-1.5">
        <EndpointLogo brandName={origin} size={24} />
      </span>
      <span className="relative flex items-center rounded-full bg-neutral-100 p-1.5 drop-shadow-[0_0_1.65px_rgba(0,0,0,0.09)]">
        <EndpointLogo brandName={destination} size={24} />
      </span>
    </div>
  );
}

const nodeColumns = (t: LicenseDict): DataTableColumn<LicenseNodeItem>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: t.colNodes,
    filterType: "text",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <EndpointPair origin={row.origin} destination={row.destination} />
        <span className="flex-1 min-w-0 truncate text-base text-neutral-900">{row.name}</span>
      </div>
    ),
  },
  {
    id: "tables",
    header: t.colSourceTables,
    accessorFn: (row) => row.tables.join(", "),
    filterType: "text",
    cell: ({ value }) => text(value),
  },
  {
    id: "totalTables",
    header: t.colTotalTables,
    accessorFn: (row) => row.tables.length,
    filterType: "number",
    cell: ({ value }) => text(value),
  },
];

const originColumns = (t: LicenseDict): DataTableColumn<LicenseOriginItem>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: t.colOrigin,
    filterType: "text",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex items-center rounded-full bg-neutral-100 p-1.5 shrink-0">
          <EndpointLogo brandName={row.brand} size={24} />
        </span>
        <span className="flex-1 min-w-0 truncate text-base text-neutral-900">{row.name}</span>
      </div>
    ),
  },
  { id: "environment", accessorKey: "environment", header: t.colEnvironment, filterType: "text", cell: ({ value }) => text(value) },
];

const userColumns = (t: LicenseDict): DataTableColumn<LicenseUserItem>[] => [
  { id: "name", accessorKey: "name", header: t.colUser, filterType: "text", cell: ({ value }) => text(value) },
  { id: "email", accessorKey: "email", header: t.colEmail, filterType: "text", cell: ({ value }) => text(value) },
  { id: "workspace", accessorKey: "workspace", header: t.colWorkspace, filterType: "text", cell: ({ value }) => text(value) },
];

function QuotaItemsTable({ quota, t }: { quota: LicenseQuota; t: LicenseDict }) {
  const common = {
    keyExtractor: (row: { id: string }) => row.id,
    hideToolbar: true,
    canSearch: false,
    canExport: false,
    canExpand: false,
    className: "border-container! rounded-lg!",
  };
  switch (quota.id) {
    case "nodes":
      return <DataTable<LicenseNodeItem> data={quota.items} columns={nodeColumns(t)} {...common} />;
    case "origins":
      return <DataTable<LicenseOriginItem> data={quota.items} columns={originColumns(t)} {...common} />;
    case "users":
      return <DataTable<LicenseUserItem> data={quota.items} columns={userColumns(t)} {...common} />;
  }
}

/** Tercer nivel: detalle de lo que consume una cuota de la licencia de un módulo. */
export function QuotaDetail({ module, quota, afterCard }: QuotaDetailProps) {
  const { dict } = useLanguage();
  const t = dict.settings.license;
  const quotaLabel = String(t[QUOTA_LABEL_KEY[quota.id]]);
  const moduleTitle = formatMessage(t.detailTitle, { module: module.name });

  const crumbs = useMemo(
    () => [
      { label: t.breadcrumb, href: licenseHref() },
      { label: moduleTitle, href: licenseHref(module.id) },
      { label: quotaLabel },
    ],
    [t, moduleTitle, module.id, quotaLabel]
  );

  const blocks = (
    <>
      {/* Bloque 2: uso de la cuota a todo el ancho */}
      <QuotaUsageCard
        quota={quota}
        t={t}
        surface="container"
        transitionName={quotaTransitionName(module.id, quota.id)}
      />

      {/* Bloque 3: tabla con borde container */}
      {/* Entra después de que el KPI se expande; sale rápido al volver */}
      <ViewTransition enter="license-slide-up" exit="license-fade-out" default="none">
        <div className="w-full">
          {quota.items.length === 0 ? (
            <div className="w-full p-10 text-center bg-container border border-container rounded-lg text-sm text-neutral-800">
              {t.noItems}
            </div>
          ) : (
            <QuotaItemsTable quota={quota} t={t} />
          )}
        </div>
      </ViewTransition>
    </>
  );

  return (
    <>
      {/* Bloque 1 (dentro de la tarjeta de Settings): migas, título y descripción */}
      <div className="w-full pt-5 flex flex-col gap-2 min-w-0 text-left font-poppins">
        <LicenseBreadcrumb ariaLabel={t.back} items={crumbs} />
        <div className="min-w-0">
          <h3 className="font-poppins font-semibold text-3xl text-neutral-900 tracking-tight">{quotaLabel}</h3>
          <p className="text-base text-neutral-800">{String(t[QUOTA_DESCRIPTION_KEY[quota.id]])}</p>
        </div>
      </div>

      {afterCard ? createPortal(blocks, afterCard) : <div className="w-full flex flex-col gap-2.5">{blocks}</div>}
    </>
  );
}
