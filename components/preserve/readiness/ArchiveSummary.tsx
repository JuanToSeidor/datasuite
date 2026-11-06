"use client";

import React, { useState } from "react";
import { Chip } from "caralstable";
import { Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { PreserveReadinessData } from "./types";

/** Barra superior: archivo en uso, fecha de corte, datos de origen y estado consultable. */
export function ArchiveSummary({ data }: { data: PreserveReadinessData }) {
  const { dict } = useLanguage();
  const t = dict.preserve.readiness;
  const [archive, setArchive] = useState(data.selected);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-neutral-300 bg-neutral-100 p-3">
      <div className="min-w-[260px]">
        <Select
          label={t.archiveLabel}
          value={archive}
          onValueChange={(value) => setArchive(String(value))}
          options={data.archives.map((id) => ({ value: id, label: id }))}
        />
      </div>

      <Chip variant="success" label={formatMessage(t.cutoffDate, { date: data.cutoffDate })} iconName="calendar" hasBorder />

      <span className="text-sm text-neutral-900">
        {formatMessage(t.sourceInfo, {
          system: data.source.system,
          client: data.source.client,
          size: data.source.size,
          tables: data.source.tables,
        })}
      </span>

      <span className="flex items-center gap-2 text-sm text-neutral-900">
        <span className="h-2.5 w-2.5 rounded-full bg-success-main" />
        {t.queryable}
      </span>
    </div>
  );
}
