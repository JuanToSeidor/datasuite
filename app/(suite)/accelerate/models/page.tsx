"use client";

import React, { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "caralstable";
import {
  CatalogView,
  DeployedModelsTable,
  ModelActionsDrawer,
} from "@/components/accelerate/models";
import type { AccelerateCatalogItem, AccelerateModel } from "@/components/accelerate/types";
import { useLanguage } from "@/contexts/LanguageContext";
import catalogData from "@/data/accelerate/catalog.json";
import modelsData from "@/data/accelerate/models.json";

const catalog = catalogData as AccelerateCatalogItem[];
const models = modelsData as AccelerateModel[];

const TAB_IDS = ["catalog", "deployed"] as const;

function ModelsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();
  const t = dict.accelerate.models;

  const activeIndex = Math.max(0, TAB_IDS.indexOf(searchParams.get("tab") as (typeof TAB_IDS)[number]));

  const [actionsModel, setActionsModel] = useState<AccelerateModel | null>(null);
  const openActions = useCallback((model: AccelerateModel) => setActionsModel(model), []);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <Tabs
          tabs={[{ label: t.tabCatalog }, { label: t.tabDeployed }]}
          activeIndex={activeIndex}
          onChange={(idx) => router.push(`/accelerate/models?tab=${TAB_IDS[idx]}`, { scroll: false })}
        />
      </header>

      {activeIndex === 0 ? (
        <CatalogView
          catalog={catalog}
          models={models}
          onViewDetail={(item) => router.push(`/accelerate/models/${item.id}`)}
          onDeploy={(item) => router.push(`/accelerate/models/${item.id}/deploy`)}
        />
      ) : (
        <DeployedModelsTable models={models} onOpenActions={openActions} showTitle={false} bordered />
      )}

      <ModelActionsDrawer model={actionsModel} onClose={() => setActionsModel(null)} />
    </div>
  );
}

export default function AccelerateModelsPage() {
  const { dict } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 font-poppins text-neutral-800">{dict.common.loading}</div>}>
      <ModelsContent />
    </Suspense>
  );
}
