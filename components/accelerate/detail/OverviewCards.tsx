"use client";

import React from "react";
import { Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AccelerateCatalogDetail } from "../types";

/** "Descripción funcional" + grilla de capacidades del modelo. */
export function FunctionalDescriptionCard({ detail }: { detail: AccelerateCatalogDetail }) {
  const { dict } = useLanguage();
  const t = dict.accelerate.detail;

  return (
    <section className="flex h-full flex-col gap-4 rounded-2xl bg-container p-5 font-poppins">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-neutral-900">{t.functionalDescription}</h2>
        <p className="text-base text-neutral-900">{detail.functionalDescription}</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {detail.features.map((f) => (
          <div key={f.title} className="flex items-center gap-3 rounded-xl bg-neutral-500 px-3 py-2.5">
            <span className="shrink-0 text-success-main">
              <CaralIcon name="check" size={24} color="currentColor" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-base font-semibold text-neutral-900">{f.title}</span>
              <span className="text-sm text-neutral-900">{f.description}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** "Ficha del modelo" (datos técnicos) + "Informes Power BI". */
export function ModelSheetCard({ detail }: { detail: AccelerateCatalogDetail }) {
  const { dict } = useLanguage();
  const t = dict.accelerate.detail;
  const { sheet } = detail;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t.sapModule, value: sheet.sapModule },
    { label: t.source, value: sheet.source },
    {
      label: t.destinations,
      value: (
        <>
          {sheet.destinations}
          {sheet.destinationsDetail && <span className="text-sm"> ({sheet.destinationsDetail})</span>}
        </>
      ),
    },
    { label: t.extraction, value: sheet.extraction },
    { label: t.reportingCurrency, value: sheet.reportingCurrency },
  ];

  return (
    <section className="flex h-full flex-col gap-3 rounded-2xl bg-container p-5 font-poppins">
      <h2 className="text-xl font-bold text-neutral-900">{t.modelSheet}</h2>
      <dl className="grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-x-4 gap-y-2">
        {rows.map((r) => (
          <React.Fragment key={r.label}>
            <dt className="text-xs text-neutral-800">{r.label}</dt>
            <dd className="text-base text-neutral-900">{r.value}</dd>
          </React.Fragment>
        ))}
      </dl>

      {detail.reports.length > 0 && (
        <>
          <div className="h-px w-full bg-neutral-500" />
          <h2 className="text-xl font-bold text-neutral-900">{t.powerBiReports}</h2>
          {/* Chip de Caral con tamaño fijo: zoom lo reduce manteniendo el layout compacto. */}
          <div className="flex flex-wrap gap-2 [zoom:0.85]">
            {detail.reports.map((r) => (
              <Chip key={r} variant="outlight" label={r} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
