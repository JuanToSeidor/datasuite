"use client";

import { useState } from "react";
import { Tabs } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { OriginConfigurationTab, type OriginSelection } from "./OriginConfigurationTab";
import { OriginReportTab } from "./OriginReportTab";
import { OriginPreviewTab } from "./OriginPreviewTab";

export type { OriginSelection };

// Paso 2 del nodo: conexión SAP y cómo se leen los datos.
export function OriginStep({
  value,
  onChange,
}: {
  value: OriginSelection;
  onChange: (next: OriginSelection) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-[12px] bg-container p-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{t.title}</h2>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <Tabs
          tabs={[{ label: t.tabConfiguration }, { label: t.tabReport }, { label: t.tabPreview }]}
          activeIndex={tabIndex}
          onChange={setTabIndex}
        />
      </div>

      {tabIndex === 0 && <OriginConfigurationTab value={value} onChange={onChange} />}
      {tabIndex === 1 && <OriginReportTab />}
      {tabIndex === 2 && <OriginPreviewTab />}
    </>
  );
}
