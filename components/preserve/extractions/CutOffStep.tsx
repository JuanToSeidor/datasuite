"use client";

import React, { useMemo, useState } from "react";
import type { CaralBrandName } from "@/components/icons";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import destinationData from "@/data/preserve/extractionDestination.json";
import { AlertCard } from "./AlertCard";

interface DestinationOption {
  id: string;
  label: string;
  brand: string;
}

export interface ExtractionDestinationData {
  defaultCutOff: string;
  defaultDestination: string;
  destinations: DestinationOption[];
}

export const extractionDestinations = destinationData as ExtractionDestinationData;

interface CutOffStepProps {
  cutOff: string;
  onCutOffChange: (value: string) => void;
  destinationId: string;
  onDestinationChange: (id: string) => void;
}

/** Paso 2 · Cut-off and destination: fecha de corte y destino del archivo. */
export function CutOffStep({
  cutOff,
  onCutOffChange,
  destinationId,
  onDestinationChange,
}: CutOffStepProps) {
  const { dict } = useLanguage();
  const t = dict.preserve.extraction;

  const [showSameNameAlert, setShowSameNameAlert] = useState(true);

  const destinationOptions = useMemo(
    () =>
      extractionDestinations.destinations.map((d) => ({
        value: d.id,
        label: d.label,
        brand: d.brand as CaralBrandName,
      })),
    [],
  );

  return (
    <section className="flex w-full flex-col gap-4 rounded-lg bg-container p-5 font-poppins">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-neutral-900">{t.cutOffTitle}</h2>
        <p className="text-sm text-neutral-800">{t.cutOffSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          type="datetime-local"
          label={t.cutOffLabel}
          iconName="calendar"
          value={cutOff}
          onChange={(e) => onCutOffChange(e.target.value)}
        />
        <Select
          label={t.destinationLabel}
          options={destinationOptions}
          value={destinationId}
          onValueChange={(v) => onDestinationChange(String(v))}
        />

        {showSameNameAlert && (
          <>
            <div aria-hidden className="hidden md:block" />
            <AlertCard
              tone="info"
              iconName="circleInfo"
              title={t.sameNameTitle}
              text={t.sameNameText}
              closeLabel={t.close}
              onDismiss={() => setShowSameNameAlert(false)}
            />
          </>
        )}
      </div>

      <p className="text-sm text-info-main">{t.dialectNote}</p>
    </section>
  );
}
