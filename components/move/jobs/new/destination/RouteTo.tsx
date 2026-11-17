"use client";

import { useState } from "react";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DestinationConfig, SetDestinationConfig } from "../types";

/** Carpeta destino opcional (`folder_name`). */
export default function RouteTo({
  destinationConfig,
  setDestinationConfig,
}: {
  destinationConfig: DestinationConfig | null;
  setDestinationConfig: SetDestinationConfig;
}) {
  const { t } = useLanguage();
  const [routeTo, setRouteTo] = useState(destinationConfig?.folder_name ?? "");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="job-template-route" className="flex items-baseline gap-1.5 text-sm font-semibold text-neutral-900">
        {t("moveJobsEditor.create.destination.routeTo")}
        <span className="text-xs font-medium text-neutral-800">{t("moveJobsEditor.create.destination.routeOptional")}</span>
        <span className="text-xs font-medium text-neutral-800">{t("moveJobsEditor.create.destination.routeExample")}</span>
      </label>
      <Input
        id="job-template-route"
        value={routeTo}
        placeholder={t("moveJobsEditor.create.destination.routePlaceholder")}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setRouteTo(next);
          setDestinationConfig((prev) => ({ ...prev, folder_name: next }));
        }}
      />
    </div>
  );
}
