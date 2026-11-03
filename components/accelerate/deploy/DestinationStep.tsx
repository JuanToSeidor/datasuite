"use client";

import React from "react";
import { Brand, type CaralBrandName } from "@/components/icons";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { AccelerateCatalogItem, DestinationWorkspace } from "../types";
import { StepHeading } from "./OriginStep";
import { SelectionSummaryCard } from "./SelectionSummaryCard";
import { RegisterInCoreLink } from "./RegisterInCoreLink";

interface DestinationStepProps {
  platforms: AccelerateCatalogItem["destinations"];
  descriptions: Partial<Record<CaralBrandName, string>>;
  platform: CaralBrandName | null;
  onPlatformChange: (brand: CaralBrandName) => void;
  workspaces: DestinationWorkspace[];
  workspaceId: string;
  onWorkspaceChange: (id: string) => void;
  lakehouse: string;
  onLakehouseChange: (value: string) => void;
}

/** Paso 2: plataforma destino + workspace y lakehouse del Core. */
export function DestinationStep({
  platforms,
  descriptions,
  platform,
  onPlatformChange,
  workspaces,
  workspaceId,
  onWorkspaceChange,
  lakehouse,
  onLakehouseChange,
}: DestinationStepProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.deploy;
  const tm = dict.accelerate.models;

  const selectedPlatform = platforms.find((p) => p.brand === platform);
  const workspace = workspaces.find((w) => w.id === workspaceId);

  return (
    <section className="flex w-full flex-col gap-6 rounded-lg bg-container p-5 font-poppins">
      <StepHeading
        title={t.destinationTitle}
        subtitle={t.destinationSubtitle}
      />

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {platforms.map((p) => {
          const selected = p.brand === platform;
          const caption = p.available
            ? descriptions[p.brand]
            : p.stage
              ? formatMessage(t.availableInStage, { stage: p.stage })
              : tm.comingSoon;
          return (
            // Tile de selección (radio visual): botón nativo porque Caral no ofrece una tarjeta seleccionable.
            <button
              key={p.brand}
              type="button"
              aria-pressed={selected}
              disabled={!p.available}
              onClick={() => onPlatformChange(p.brand)}
              className={`min-h-[140px] rounded-lg border text-left transition-colors ${
                selected
                  ? "border-success-main bg-success-light"
                  : p.available
                    ? "cursor-pointer border-neutral-500 hover:border-success-main"
                    : "cursor-not-allowed border-neutral-500 opacity-60"
              }`}
            >
              {/* El reset global de <button> anula el padding: va en un contenedor interno. */}
              <span className="flex h-full flex-col items-start gap-2 p-2.5">
                <span className="flex items-center gap-2">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    <span className={p.available ? "" : "grayscale"}>
                      <Brand name={p.brand} size={24} />
                    </span>
                  </span>
                  <span
                    className={`text-xl font-bold ${selected ? "text-success-hard" : "text-neutral-900"}`}
                  >
                    {p.name}
                  </span>
                </span>
                {caption && (
                  <span
                    className={`text-base ${selected ? "text-success-main" : "text-neutral-800"}`}
                  >
                    {caption}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selectedPlatform && (
        <div className="grid grid-cols-1 items-start gap-x-2.5 gap-y-3 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Select
              label={formatMessage(t.workspaceLabel, {
                platform: selectedPlatform.name,
              })}
              value={workspaceId}
              onValueChange={(v) => onWorkspaceChange(String(v))}
              options={workspaces.map((w) => ({
                value: w.id,
                label: w.id,
                brand: selectedPlatform.brand,
              }))}
            />
            {workspace && (
              <SelectionSummaryCard
                size="md"
                brand={selectedPlatform.brand}
                title={workspace.id}
                subtitle={`${workspace.name} · ${workspace.capacity}`}
              />
            )}
          </div>
          <Input
            label={t.lakehouseLabel}
            value={lakehouse}
            onChange={(e) => onLakehouseChange(e.target.value)}
            error={lakehouse.trim() ? undefined : t.lakehouseRequired}
          />
        </div>
      )}

      <RegisterInCoreLink label={t.missingDestination} />
    </section>
  );
}
