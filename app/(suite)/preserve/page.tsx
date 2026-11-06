"use client";

import React from "react";
import { Button } from "caralstable";
import {
  ArchivesCard,
  ExtractionCard,
  PrinciplesCard,
  QuestionsCard,
  ReadinessCard,
} from "@/components/preserve/overview";
import type { PreserveOverviewData } from "@/components/preserve/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import overviewData from "@/data/preserve/overview.json";

const data = overviewData as PreserveOverviewData;

export default function PreserveOverviewPage() {
  const { dict } = useLanguage();
  const t = dict.preserve.overview;

  const { latestExtraction, dumpChecks } = data;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="light" hasBorder iconName="chats">
            {t.askAnalyze}
          </Button>
          <Button variant="success" iconName="plus">
            {t.newExtraction}
          </Button>
        </div>
      </header>

      {/* Cuerpo: columna principal + columna de preparación */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-3">
          <ArchivesCard data={data.archives} />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <QuestionsCard data={data.questions} />

            <ExtractionCard
              title={t.extractionTitle}
              reference={latestExtraction.ref}
              matdoc={latestExtraction.matdoc}
              chip={{ variant: "danger", label: t.chipReconDiff, iconName: "triangleExclamation" }}
              rows={[
                { label: t.rowsSource, value: latestExtraction.sapRows },
                { label: t.rowsArrived, value: formatMessage(t.missingRows, { n: latestExtraction.missingRows }) },
              ]}
              footerLabel={formatMessage(t.viewRows, { n: latestExtraction.missingRows })}
            />

            <ExtractionCard
              title={t.dumpTitle}
              reference={dumpChecks.ref}
              matdoc={dumpChecks.matdoc}
              chip={{
                variant: "warning",
                label: formatMessage(t.dumpSummary, {
                  ok: dumpChecks.ok,
                  total: dumpChecks.total,
                  warnings: dumpChecks.warnings,
                }),
                iconName: "triangleExclamation",
              }}
              rows={[{ label: t.dumpErrorLabel, value: t.dumpErrorText }]}
              footerLabel={formatMessage(t.viewRows, { n: dumpChecks.missingRows })}
            />
          </div>
        </div>

        <ReadinessCard data={data.readiness} />
      </section>

      {/* Principios de respuesta */}
      <PrinciplesCard />
    </div>
  );
}
