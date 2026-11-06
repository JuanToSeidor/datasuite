import React from "react";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

/** Aviso: el agente Analyze se habilita cuando el catálogo está cerrado. */
export function AnalyzeBanner() {
  const { dict } = useLanguage();
  const t = dict.preserve.readiness;

  return (
    <section className="flex overflow-hidden rounded-2xl bg-info-light font-poppins">
      <div className="flex w-12 shrink-0 items-start justify-center bg-info-main pt-4 text-container">
        <CaralIcon name="circleInfo" size={24} color="currentColor" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-xl font-bold text-info-main">{t.bannerTitle}</h2>
        <p className="max-w-[1000px] text-sm font-medium text-info-main">{t.bannerText}</p>
        <div className="pt-1">
          <Button variant="info" size="sm">
            {t.viewCatalog}
          </Button>
        </div>
      </div>
    </section>
  );
}
