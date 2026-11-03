"use client";

import React from "react";
import { Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { ConnectionHealth, SapEnvironment, SapSource } from "../types";
import { SelectionSummaryCard } from "./SelectionSummaryCard";
import { RegisterInCoreLink } from "./RegisterInCoreLink";

const HEALTH_TONE: Record<ConnectionHealth, string> = {
  healthy: "text-neutral-900",
  degraded: "text-warning-hard",
  unreachable: "text-danger-main",
};

interface OriginStepProps {
  sources: SapSource[];
  source: SapSource;
  onSourceChange: (id: string) => void;
  companies: string[];
  onToggleCompany: (code: string) => void;
}

/** Paso 1: conexión SAP del Core + sociedades a incluir. */
export function OriginStep({
  sources,
  source,
  onSourceChange,
  companies,
  onToggleCompany,
}: OriginStepProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.deploy;

  const envLabel: Record<SapEnvironment, string> = {
    production: t.envProduction,
    quality: t.envQuality,
    development: t.envDevelopment,
  };
  const healthLabel: Record<ConnectionHealth, string> = {
    healthy: t.healthHealthy,
    degraded: t.healthDegraded,
    unreachable: t.healthUnreachable,
  };

  return (
    <section className="mx-auto flex w-full max-w-[776px] flex-col gap-5 rounded-lg bg-container p-5 font-poppins">
      <div className="flex flex-col gap-3">
        <StepHeading title={t.originTitle} subtitle={t.originSubtitle} />
        <Select
          label={t.sourceLabel}
          brand="SAP"
          value={source.id}
          onValueChange={(v) => onSourceChange(String(v))}
          options={sources.map((s) => ({
            value: s.id,
            label: s.name,
            brand: "SAP",
          }))}
        />
        <SelectionSummaryCard
          brand="SAP"
          title={source.name}
          subtitle={[
            source.product,
            envLabel[source.environment],
            formatMessage(t.client, { client: source.client }),
          ].join(" · ")}
          meta={
            <span className={HEALTH_TONE[source.health]}>
              {healthLabel[source.health]} ·{" "}
              {formatMessage(t.verifiedAt, { time: source.verifiedAt })}
            </span>
          }
        />
      </div>

      <div className="h-px w-full bg-neutral-500" />

      <div className="flex flex-col gap-2">
        <StepHeading title={t.scopeTitle} subtitle={t.scopeSubtitle} />
        <ul className="flex flex-col">
          {source.companies.map((c, i) => {
            const checked = companies.includes(c.code);
            return (
              <li
                key={c.code}
                className={
                  i < source.companies.length - 1
                    ? "border-b border-neutral-500"
                    : ""
                }
              >
                <label className="flex cursor-pointer items-center gap-4 rounded-lg px-2.5 py-4 transition-colors hover:bg-neutral-500/40">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCompany(c.code)}
                    className="size-6 shrink-0 cursor-pointer accent-success-main"
                  />
                  <span className="text-lg text-neutral-900">
                    {c.code} · {c.name} · {c.currency}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {companies.length === 0 && (
          <p className="text-sm text-danger-main">{t.noCompanies}</p>
        )}
      </div>

      <RegisterInCoreLink label={t.missingSap} />
    </section>
  );
}

export function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-seidor-main-text">{title}</h2>
      <p className="text-base text-neutral-800">{subtitle}</p>
    </div>
  );
}
