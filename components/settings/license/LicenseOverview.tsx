"use client";

import React, { useMemo } from "react";
import { Button, Chip } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import {
  EXPIRING_WINDOW_DAYS,
  ModuleLicense,
  isExpiringSoon,
  parseIsoDate,
} from "./licenseData";

interface LicenseOverviewProps {
  modules: ModuleLicense[];
  onOpenModule: (moduleId: string) => void;
}

/** Tarjeta KPI: etiqueta, valor destacado y detalle a la derecha. */
function KpiCard({ label, value, detail }: { label: string; value: React.ReactNode; detail: string }) {
  return (
    <div className="bg-neutral-100 border border-neutral-800 rounded-lg p-2.5 flex flex-col justify-center min-w-0">
      <p className="text-base text-neutral-800 truncate">{label}</p>
      <div className="flex items-center gap-2.5 min-w-0">
        <p className="font-poppins font-semibold text-3xl text-neutral-900 tracking-tight">{value}</p>
        <p className="text-base text-neutral-800 truncate">{detail}</p>
      </div>
    </div>
  );
}

export function LicenseOverview({ modules, onOpenModule }: LicenseOverviewProps) {
  const { dict, language } = useLanguage();
  const t = dict.settings.license;

  const kpis = useMemo(() => {
    const active = modules.filter((m) => m.status === "active");
    const origins = active
      .flatMap((m) => m.quotas)
      .filter((q) => q.id === "origins")
      .reduce((acc, q) => ({ used: acc.used + q.used, total: acc.total + q.total }), { used: 0, total: 0 });
    const expiring = active.filter((m) => isExpiringSoon(m.validUntil)).length;
    return { active: active.length, origins, expiring };
  }, [modules]);

  const columns = useMemo<DataTableColumn<ModuleLicense>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: t.colModule,
        filterType: "text",
        cell: ({ value }) => <span className="text-base text-neutral-900">{value}</span>,
      },
      {
        id: "status",
        accessorKey: "status",
        header: t.colStatus,
        width: 244,
        filterType: "select",
        filterSelectOptions: [
          { label: t.statusActive, value: "active" },
          { label: t.statusUnlicensed, value: "unlicensed" },
        ],
        cell: ({ value }) =>
          value === "active" ? (
            <Chip variant="success" label={t.statusActive} hasBorder />
          ) : (
            <Chip variant="light" label={t.statusUnlicensed} hasBorder />
          ),
      },
      {
        id: "validUntil",
        accessorKey: "validUntil",
        header: t.colValidity,
        width: 308,
        filterType: "none",
        cell: ({ value }) => (
          <span className="text-base text-neutral-900">
            {value
              ? formatMessage(t.validUntil, {
                  date: parseIsoDate(value).toLocaleDateString(language, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })
              : "-"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        align: "right",
        filterType: "none",
        resizable: false,
        hideInExport: true,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            hasBorder
            className="border! border-neutral-800! text-neutral-900"
            onClick={() => onOpenModule(row.id)}
          >
            {row.status === "active" ? t.manage : t.addLicense}
          </Button>
        ),
      },
    ],
    [t, language, onOpenModule]
  );

  return (
    <div className="w-full flex flex-col gap-5 text-left font-poppins">
      {/* Título y descripción */}
      <div className="pt-5 min-w-0">
        <h3 className="font-poppins font-semibold text-3xl text-neutral-900 tracking-tight">{t.title}</h3>
        <p className="text-base text-neutral-800">{t.subtitle}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <KpiCard
          label={t.kpiActiveModules}
          value={kpis.active}
          detail={formatMessage(t.ofAvailable, { total: modules.length })}
        />
        <KpiCard
          label={t.kpiOrigins}
          value={kpis.origins.used}
          detail={formatMessage(t.ofAvailable, { total: kpis.origins.total })}
        />
        <KpiCard
          label={t.kpiExpiring}
          value={kpis.expiring}
          detail={formatMessage(kpis.expiring === 1 ? t.expiringOne : t.expiringMany, {
            days: EXPIRING_WINDOW_DAYS,
          })}
        />
      </div>

      {/* Módulos disponibles */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-end gap-1.5">
          <h4 className="font-poppins font-semibold text-xl text-neutral-900">{t.availableModules}</h4>
          <span className="text-base text-neutral-800">{formatMessage(t.modulesCount, { n: modules.length })}</span>
        </div>
        <DataTable<ModuleLicense>
          data={modules}
          columns={columns}
          keyExtractor={(m) => m.id}
          hideToolbar
          canSearch={false}
          canExport={false}
          canExpand={false}
        />
      </div>
    </div>
  );
}
