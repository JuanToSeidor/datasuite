"use client";

import React from "react";
import { Button } from "caralstable";
import { AnalyzeBanner, ArchiveSummary, ReadinessTable } from "@/components/preserve/readiness";
import type { PreserveReadinessData } from "@/components/preserve/readiness";
import { useLanguage } from "@/contexts/LanguageContext";
import readinessData from "@/data/preserve/readiness.json";

const data = readinessData as PreserveReadinessData;

export default function PreserveReadinessPage() {
  const { dict } = useLanguage();
  const t = dict.preserve.readiness;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <Button variant="light" hasBorder iconName="chats">
          {t.askAnalyze}
        </Button>
      </header>

      {/* Archivo en uso + fases */}
      <section className="flex flex-col gap-3 rounded-2xl bg-container p-4">
        <ArchiveSummary data={data} />
        <ReadinessTable phases={data.phases} />
      </section>

      {/* Aviso del agente */}
      <AnalyzeBanner />
    </div>
  );
}
