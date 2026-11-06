"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { ArchiveTablesTable } from "./ArchiveTablesTable";
import { ChecksTable } from "./ChecksTable";
import { CatalogTable } from "./CatalogTable";
import { ExtractionsTable } from "./ExtractionsTable";
import type { PreserveVaultDetailsData } from "./detailTypes";
import type { PreserveVaultsData } from "./types";
import vaultsData from "@/data/preserve/vaults.json";
import vaultDetailsData from "@/data/preserve/vaultDetails.json";

const data = vaultsData as PreserveVaultsData;
const details = vaultDetailsData as PreserveVaultDetailsData;

/**
 * Detalle de un archivo: pestañas Tablas / Verificaciones / Catálogo / Extracciones.
 * La altura de cada tabla se limita a la pantalla; con intro (texto arriba) se resta más espacio.
 */
export function VaultDetailView({ vaultId }: { vaultId: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.preserve.vaults;
  const [tabIndex, setTabIndex] = useState(0);

  const vault = data.vaults.find((v) => v.id === vaultId);

  if (!vault) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-start gap-3 font-poppins">
        <p className="text-neutral-900">{t.notFound}</p>
        <Button variant="light" hasBorder onClick={() => router.push("/preserve/vaults")}>
          {t.backToVaults}
        </Button>
      </div>
    );
  }

  const isQueryable = vault.status === "queryable";

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          {/* Breadcrumb: volver a la lista de archivos */}
          <nav className="flex items-center gap-1 text-sm">
            <Button variant="ghost" size="sm" onClick={() => router.push("/preserve/vaults")}>
              <span className="flex items-center gap-1 text-info-main">
                <CaralIcon name="arrowLeft" size={18} color="currentColor" />
                {t.title}
              </span>
            </Button>
            <span className="text-neutral-800">/</span>
            <span className="text-neutral-800">{vault.archive}</span>
          </nav>
          <h1 className="text-2xl font-bold text-neutral-900">{vault.archive}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        {isQueryable ? (
          <Chip variant="success" label={t.queryable} hasBorder />
        ) : (
          <Chip variant="info" label={formatMessage(t.statusExtracting, { progress: vault.progress ?? 0 })} hasBorder />
        )}
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-container p-4">
        {/* Pestañas + resumen del archivo */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            tabs={[{ label: t.tabTables }, { label: t.tabChecks }, { label: t.tabCatalog }, { label: t.tabExtractions }]}
            activeIndex={tabIndex}
            onChange={setTabIndex}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Chip variant="success" label={formatMessage(t.cutOffDate, { date: vault.cutOffDate })} iconName="calendar" hasBorder />
            <span className="text-sm text-neutral-900">
              {formatMessage(t.detailInfo, {
                product: vault.source.product,
                client: vault.source.client,
                size: vault.volume.size,
                tables: vault.volume.tables,
              })}
            </span>
            {isQueryable && (
              <span className="flex items-center gap-2 text-sm text-neutral-900">
                <span className="h-2.5 w-2.5 rounded-full bg-success-main" />
                {t.queryable}
              </span>
            )}
          </div>
        </div>

        {/* Altura: 100vh menos encabezado, pestañas y márgenes (320px; 360px cuando hay texto introductorio). */}
        {tabIndex === 0 && <ArchiveTablesTable rows={data.tables} className="max-h-[calc(100vh-348px)]!" />}
        {tabIndex === 1 && <ChecksTable rows={details.checks} className="max-h-[calc(100vh-388px)]!" />}
        {tabIndex === 2 && (
          <CatalogTable
            rows={details.catalog.rows}
            tablesEnabled={details.catalog.tablesEnabled}
            totalTables={vault.volume.tables}
            className="max-h-[calc(100vh-388px)]!"
          />
        )}
        {tabIndex === 3 && <ExtractionsTable rows={details.extractions} className="max-h-[calc(100vh-388px)]!" />}
      </section>
    </div>
  );
}
