"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";
import {
  ActiveDataCard,
  AlertBanner,
  KpiCard,
  RecentActivityCard,
} from "@/components/accelerate/overview";
import { DeployedModelsTable, ModelActionsDrawer } from "@/components/accelerate/models";
import type { AccelerateActivity, AccelerateAlert, AccelerateModel } from "@/components/accelerate/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import modelsData from "@/data/accelerate/models.json";
import overviewData from "@/data/accelerate/overview.json";
import activityData from "@/data/accelerate/activity.json";

const models = modelsData as AccelerateModel[];
const alerts = overviewData.alerts as AccelerateAlert[];
/** El Resumen muestra los 3 eventos más recientes; el historial completo está en /accelerate/activity. */
const activity = (activityData as AccelerateActivity[]).slice(0, 3);
const { kpis, move, customer } = overviewData;

/**
 * Vista previa del Resumen: máximo 3 modelos, priorizando los que requieren atención
 * (error, desplegando) y mostrándolos en orden activo → desplegando → error.
 * La lista completa está en /accelerate/models?tab=deployed.
 */
const OVERVIEW_MODELS_LIMIT = 3;
const STATUS_PRIORITY: Record<AccelerateModel["status"], number> = { error: 0, deploying: 1, active: 2 };
const overviewModels = [...models]
  .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status])
  .slice(0, OVERVIEW_MODELS_LIMIT)
  .sort((a, b) => STATUS_PRIORITY[b.status] - STATUS_PRIORITY[a.status]);

export default function AccelerateOverviewPage() {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.accelerate.overview;

  const [actionsModel, setActionsModel] = useState<AccelerateModel | null>(null);
  const openActions = useCallback((model: AccelerateModel) => setActionsModel(model), []);

  const statusCount = useMemo(
    () => ({
      active: models.filter((m) => m.status === "active").length,
      deploying: models.filter((m) => m.status === "deploying").length,
      error: models.filter((m) => m.status === "error").length,
    }),
    []
  );

  const goToMove = () => router.push("/move");

  const alertBanners = alerts.map((alert) => (
    <AlertBanner
      key={alert.id}
      variant={alert.severity}
      message={formatMessage(t.alertPausedFlow, {
        flow: alert.flow,
        date: alert.pausedSince,
        affects: alert.affects,
      })}
      onOpen={goToMove}
      openLabel={t.openInMove}
    />
  ));

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{formatMessage(t.subtitle, { customer })}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="light" hasBorder onClick={() => router.push("/accelerate/dashboards")}>
            {t.viewDashboards}
          </Button>
          {/* El asistente arranca desde un ACT-IN concreto: primero se elige en el catálogo. */}
          <Button variant="warning" iconName="plus" onClick={() => router.push("/accelerate/models?tab=catalog")}>
            {t.deployModel}
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          value={models.length}
          label={t.kpiModels}
          detail={formatMessage(t.kpiModelsDetail, statusCount)}
        />
        <KpiCard value={kpis.dashboardsPublished} label={t.kpiDashboards} detail={kpis.dashboardsPlatform} />
        <KpiCard
          value={kpis.sapTablesUpToDate}
          valueSuffix={`/${kpis.sapTablesTotal}`}
          label={t.kpiTables}
          detail={formatMessage(t.kpiTablesDetail, { table: kpis.staleTable, system: kpis.staleSystem })}
        />
        <KpiCard
          value={kpis.lastMoveLoadTime}
          label={t.kpiLastLoad}
          detail={`${kpis.lastMoveLoadDate} · ${formatMessage(t.minutesAgo, { n: kpis.lastMoveLoadMinutesAgo })}`}
        />
      </section>

      {/* Alertas */}
      {alertBanners}

      {/* Modelos desplegados */}
      <section className="flex flex-col gap-2 rounded-2xl bg-container p-4">
        <DeployedModelsTable models={overviewModels} onOpenActions={openActions} />
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => router.push("/accelerate/models?tab=deployed")}>
            <span className="flex items-center gap-1 font-normal text-neutral-800">
              {t.viewAllModels}
              <CaralIcon name="chevronRigth" size={18} color="currentColor" />
            </span>
          </Button>
        </div>
      </section>

      {/* Datos activos + Actividad reciente */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ActiveDataCard
          activeFlows={move.activeFlows}
          recordsToday={move.recordsToday}
          pausedFlows={move.pausedFlows}
          onOpenMove={goToMove}
        >
          {alertBanners}
        </ActiveDataCard>
        <RecentActivityCard items={activity} onViewAll={() => router.push("/accelerate/activity")} />
      </section>

      <ModelActionsDrawer model={actionsModel} onClose={() => setActionsModel(null)} />
    </div>
  );
}
