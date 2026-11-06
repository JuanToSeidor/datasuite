"use client";

import React, { useState } from "react";
import { CaralIcon } from "@/components/icons";
import { Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { CardFooterLink, OverviewCard } from "./OverviewCard";
import type { PreserveOverviewData, PreserveStep } from "../types";

const STEP_LABEL_KEY = {
  checks: "stepChecks",
  seed: "stepSeed",
  adjustment: "stepAdjustment",
  validation: "stepValidation",
  catalog: "stepCatalog",
  agent: "stepAgent",
} as const;

type ReadinessData = PreserveOverviewData["readiness"];

export function ReadinessCard({ data }: { data: ReadinessData }) {
  const { dict } = useLanguage();
  const t = dict.preserve.overview;
  const [archive, setArchive] = useState(data.selected);
  const phaseStep = data.steps[data.currentPhase - 1];

  return (
    <OverviewCard title={t.readinessTitle} footer={<CardFooterLink label={t.viewReadiness} />}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-neutral-900">{t.readinessArchive}</span>
        <Select
          value={archive}
          onValueChange={(value) => setArchive(String(value))}
          options={data.archives.map((id) => ({ value: id, label: id }))}
        />
        <span className="text-xs text-neutral-800">
          {formatMessage(t.readinessPhase, {
            current: data.currentPhase,
            total: data.steps.length,
            name: phaseStep ? t[STEP_LABEL_KEY[phaseStep.id]] : "",
          })}
        </span>
      </div>

      <ol className="flex flex-col">
        {data.steps.map((step, index) => (
          <StepRow
            key={step.id}
            index={index + 1}
            step={step}
            label={t[STEP_LABEL_KEY[step.id]]}
            isLast={index === data.steps.length - 1}
          />
        ))}
      </ol>

      <p className="text-sm text-neutral-800">{t.readinessFooter}</p>
    </OverviewCard>
  );
}

function StepRow({ index, step, label, isLast }: { index: number; step: PreserveStep; label: string; isLast: boolean }) {
  const isDone = step.state === "done";
  const isActive = step.state === "active";

  const circleClass = isDone
    ? "bg-success-main text-container"
    : isActive
      ? "bg-info-main text-container"
      : "border-2 border-neutral-400 bg-container text-neutral-800";

  return (
    <li className="relative flex items-center gap-3 py-1.5">
      {!isLast && <span className="absolute left-[15px] top-[38px] h-[calc(100%-22px)] w-px bg-neutral-300" />}
      <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${circleClass}`}>
        {isDone ? <CaralIcon name="check" size={18} color="currentColor" /> : null}
      </span>
      <span className="flex flex-1 items-center gap-2 text-base text-neutral-900">
        <span className="text-neutral-800">#{index}</span>
        {label}
      </span>
      <CaralIcon name="chevronRigth" size={18} color="currentColor" />
    </li>
  );
}
