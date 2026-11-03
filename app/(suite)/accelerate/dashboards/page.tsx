"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DashboardCard } from "@/components/accelerate/dashboards/DashboardCard";
import type {
  AccelerateCatalogItem,
  AccelerateDashboard,
  AccelerateModel,
} from "@/components/accelerate/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import catalogData from "@/data/accelerate/catalog.json";
import dashboardsData from "@/data/accelerate/dashboards.json";
import modelsData from "@/data/accelerate/models.json";

const catalog = catalogData as AccelerateCatalogItem[];
const dashboards = dashboardsData as AccelerateDashboard[];
const models = modelsData as AccelerateModel[];

/** Pestañas: modelos con algún despliegue + los que llegan en próximas etapas. */
const modelTabs = catalog.filter(
  (item) =>
    item.availability === "comingSoon" ||
    models.some((m) => m.catalogId === item.id) ||
    dashboards.some((d) => d.catalogId === item.id),
);

const PRODUCT_NAME = "Crestone Accelerate";

/** Inserta valores en negrita en un texto del diccionario: "generados con {product}…". */
function richMessage(template: string, values: Record<string, string>) {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const key = part.slice(1, -1);
    if (!(part.startsWith("{") && key in values)) return part;
    return key === "open" ? (
      values[key]
    ) : (
      <strong key={i} className="font-semibold text-neutral-900">
        {values[key]}
      </strong>
    );
  });
}

function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-container px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-warning-light text-warning-main">
        <CaralIcon name="presentationScreenChart" size={28} color="currentColor" />
      </span>
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <p className="max-w-md text-sm text-neutral-800">{text}</p>
      {action}
    </div>
  );
}

function DashboardsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();
  const t = dict.accelerate.dashboards;

  const activeIndex = Math.max(
    0,
    modelTabs.findIndex((item) => item.id === searchParams.get("model")),
  );
  const active = modelTabs[activeIndex];
  const items = dashboards.filter((d) => d.catalogId === active?.id);
  const platform = items[0]?.platform.name ?? "Microsoft Fabric";

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        {modelTabs.length > 1 && (
          <Tabs
            tabs={modelTabs.map((item) => ({
              label:
                item.availability === "comingSoon"
                  ? formatMessage(t.tabComingSoon, { code: item.code })
                  : item.code,
            }))}
            activeIndex={activeIndex}
            onChange={(idx) =>
              router.push(`/accelerate/dashboards?model=${modelTabs[idx].id}`, { scroll: false })
            }
          />
        )}
      </header>

      {active?.availability === "comingSoon" ? (
        <EmptyState
          title={formatMessage(t.comingSoonTitle, { name: active.name, stage: active.stage ?? 2 })}
          text={t.comingSoonText}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={formatMessage(t.emptyTitle, { name: active?.name ?? "" })}
          text={t.emptyText}
          action={
            active && (
              <Button
                variant="warning"
                iconName="planeDeparture"
                onClick={() => router.push(`/accelerate/models/${active.id}/deploy`)}
              >
                {t.deployModel}
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            role="note"
            className="flex items-center gap-3 rounded-xl border border-info-main bg-container px-4 py-3"
          >
            <span className="shrink-0 text-info-main">
              <CaralIcon name="circleInfo" size={22} color="currentColor" />
            </span>
            <p className="text-sm text-neutral-900">
              {richMessage(t.infoBanner, { product: PRODUCT_NAME, platform, open: t.open })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((dashboard) => (
              <DashboardCard key={dashboard.id} dashboard={dashboard} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AccelerateDashboardsPage() {
  const { dict } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 font-poppins text-neutral-800">{dict.common.loading}</div>}>
      <DashboardsContent />
    </Suspense>
  );
}
