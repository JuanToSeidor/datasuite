"use client";

import React from "react";
import { Button, Chip } from "caralstable";
import { BrandPill } from "../BrandPill";
import { CatalogStatusBadge, type CatalogStatus } from "./CatalogStatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { AccelerateCatalogItem } from "../types";

interface CatalogCardProps {
  item: AccelerateCatalogItem;
  deployments: { total: number; active: number };
  onViewDetail: (item: AccelerateCatalogItem) => void;
  onDeploy: (item: AccelerateCatalogItem) => void;
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col rounded-xl bg-neutral-500 px-3 py-2.5">
      <span className="text-xl font-bold text-warning-main">{value}</span>
      <span className="text-base text-neutral-900">{label}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-neutral-800">{children}</span>;
}

export function CatalogCard({ item, deployments, onViewDetail, onDeploy }: CatalogCardProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.models;
  const isAvailable = item.availability === "available";
  const status: CatalogStatus = !isAvailable ? "comingSoon" : item.contracted ? "contracted" : "unavailable";

  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl bg-container p-4 font-poppins">
      {/* Encabezado: sigla, nombre, área y estado */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`flex size-13 shrink-0 items-center justify-center rounded-lg text-2xl font-bold text-neutral-100 ${
              isAvailable ? "bg-warning-main" : "bg-neutral-500"
            }`}
          >
            {item.code}
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-2xl font-bold text-neutral-900">{item.name}</h2>
            <span className="truncate text-sm text-neutral-800">{item.area}</span>
          </div>
        </div>
        <div className="zoom-70">
          <CatalogStatusBadge
          status={status}
          label={status === "contracted" ? t.contracted : status === "unavailable" ? t.unavailable : t.comingSoon}
        />
        </div>
      </header>

      <div className="h-0.5 w-full bg-neutral-500" />

      <p className="text-base text-neutral-800">{item.description}</p>

      {item.stats && (
        <div className="grid grid-cols-3 gap-2.5">
          <Stat value={item.stats.dashboards} label={t.statDashboards} />
          <Stat value={item.stats.destinationObjects} label={t.statObjects} />
          <Stat value={item.stats.version} label={t.statVersion} />
        </div>
      )}

      {/* Tablas SAP */}
      <div className="flex flex-col gap-1.5">
        <SectionLabel>
          {isAvailable
            ? formatMessage(t.requiredTables, { n: item.sapTables.length })
            : t.plannedTables}
        </SectionLabel>
        {/* El Chip de Caral tiene tamaño fijo: zoom lo reduce un 15% incluyendo su espacio en el layout. */}
        <div className="flex flex-wrap gap-2 [zoom:0.85]">
          {item.sapTables.map((table) => (
            <Chip key={table} label={table} variant={isAvailable ? "warning" : "outlight"} hasBorder={isAvailable} />
          ))}
        </div>
      </div>

      {/* Destinos */}
      {item.destinations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t.availableDestinations}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {item.destinations.map((dest) => (
              <BrandPill
                key={dest.name}
                brand={dest.brand}
                enabled={dest.available}
                label={dest.available ? dest.name : formatMessage(t.destinationComingSoon, { name: dest.name })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pie: resumen de despliegues + acciones */}
      <footer className="mt-auto flex flex-col gap-3">
        <div className="h-0.5 w-full bg-neutral-500" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-neutral-800">
            {isAvailable
              ? formatMessage(t.deploymentsSummary, deployments)
              : formatMessage(t.availableInStage, { stage: item.stage ?? "" })}
          </span>
          <div className="flex items-center gap-3">
            <Button variant="light" hasBorder onClick={() => onViewDetail(item)}>
              {t.viewDetail}
            </Button>
            {isAvailable && (
              <Button
                variant="warning"
                iconName="planeDeparture"
                disabled={!item.contracted}
                title={item.contracted ? undefined : t.unavailable}
                onClick={() => onDeploy(item)}
              >
                {t.deploy}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </article>
  );
}
