"use client";

import React from "react";
import { Button } from "caralstable";
import {
  ExtractionVolumeCard,
  JobRunningCard,
  QuickAccessCard,
  SectionLabel,
  UpcomingExtractionsCard,
} from "@/components/move/overview";
import type { MoveOverviewData } from "@/components/move/overview/types";
import { useLanguage } from "@/contexts/LanguageContext";
import overviewData from "@/data/move/overview.json";

const data = overviewData as MoveOverviewData;

export default function MoveOverviewPage() {
  const { dict } = useLanguage();
  const t = dict.move.overview;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="light" hasBorder iconName="book">
            {t.help}
          </Button>
          <Button variant="info" iconName="plus">
            {t.newExtraction}
          </Button>
        </div>
      </header>

      {/* Accesos rápidos */}
      <SectionLabel>{t.quickAccess}</SectionLabel>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <QuickAccessCard href="/move/nodes" iconName="cubeInCube" title={t.nodesTitle} description={t.nodesDesc} />
        <QuickAccessCard href="/move/jobs" iconName="network" title={t.jobsTitle} description={t.jobsDesc} />
        <QuickAccessCard href="/move/activity" iconName="screenChart" title={t.monitorTitle} description={t.monitorDesc} />
      </section>

      {/* Información */}
      <SectionLabel>{t.information}</SectionLabel>
      <JobRunningCard job={data.runningJob} destinationPreview={data.destinationPreview} />

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <ExtractionVolumeCard className="lg:col-span-2" />
        <UpcomingExtractionsCard />
      </section>
    </div>
  );
}
