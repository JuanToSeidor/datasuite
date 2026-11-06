import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CardFooterLink, Metric, OverviewCard } from "./OverviewCard";
import type { PreserveOverviewData } from "../types";

export function QuestionsCard({ data }: { data: PreserveOverviewData["questions"] }) {
  const { dict } = useLanguage();
  const t = dict.preserve.overview;

  return (
    <OverviewCard title={t.questionsTitle} footer={<CardFooterLink label={t.viewQuestions} />}>
      <Metric value={data.validated} label={t.questionsValidated} />
      <div className="grid grid-cols-2 gap-2">
        <Metric value={data.pending} label={t.questionsPending} tone="warning" />
        <Metric value={data.needSap} label={t.questionsNeedSap} />
      </div>
    </OverviewCard>
  );
}
