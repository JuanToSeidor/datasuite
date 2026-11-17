"use client";

import { useState } from "react";
import { Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DestinationConfig, SetDestinationConfig } from "../types";

const EXPORT_FORMATS = [
  { value: "csv", label: "Csv" },
  { value: "parquet", label: "Parquet" },
];

/** Formato del archivo exportado (`type_file`): es lo que habilita avanzar del paso Sync. */
export default function SelectExportTo({
  destinationConfig,
  setDestinationConfig,
}: {
  destinationConfig: DestinationConfig | null;
  setDestinationConfig: SetDestinationConfig;
}) {
  const { t } = useLanguage();
  const [exportTo, setExportTo] = useState<string | null>(destinationConfig?.type_file ?? null);

  return (
    <Select
      label={t("moveJobsEditor.create.destination.exportTo")}
      options={EXPORT_FORMATS}
      value={exportTo ?? ""}
      placeholder={t("moveJobsEditor.create.destination.select")}
      onValueChange={(value) => {
        const next = String(value);
        setExportTo(next);
        setDestinationConfig((prev) => ({ ...prev, type_file: next }));
      }}
    />
  );
}
