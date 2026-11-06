import React from "react";
import { Chip } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { OverviewCard } from "./OverviewCard";

/** Explica los tres tipos de respuesta del producto. */
export function PrinciplesCard() {
  const { dict } = useLanguage();
  const t = dict.preserve.overview;

  const items = [
    { variant: "success" as const, label: t.principleAnswer, text: t.principleAnswerText },
    { variant: "info" as const, label: t.principleAsOf, text: t.principleAsOfText },
    { variant: "warning" as const, label: t.principleNeedsSap, text: t.principleNeedsSapText },
  ];

  return (
    <OverviewCard title={t.principlesTitle}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-3">
            <div>
              <Chip variant={item.variant} label={item.label} hasBorder />
            </div>
            <p className="text-sm text-neutral-900">{item.text}</p>
          </div>
        ))}
      </div>
    </OverviewCard>
  );
}
