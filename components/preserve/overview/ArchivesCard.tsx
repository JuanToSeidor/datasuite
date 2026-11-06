import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { CardFooterLink, Metric, OverviewCard } from "./OverviewCard";
import type { PreserveOverviewData } from "../types";

export function ArchivesCard({ data }: { data: PreserveOverviewData["archives"] }) {
  const { dict } = useLanguage();
  const t = dict.preserve.overview;

  return (
    <OverviewCard
      title={t.archivesTitle}
      footer={<CardFooterLink label={t.viewArchives} />}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Metric value={data.total} label={t.archivesCount} />
        <Metric value={data.queryable} label={t.queryableCount} />
      </div>
      <p className="text-sm text-neutral-800">
        {formatMessage(t.archivesExtracting, { id: data.extracting.id, progress: data.extracting.progress })}
      </p>
    </OverviewCard>
  );
}
