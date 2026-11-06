import React from "react";
import { Chip } from "caralstable";
import { CardFooterLink, OverviewCard } from "./OverviewCard";

interface Row {
  label: string;
  value: React.ReactNode;
}

interface ExtractionCardProps {
  title: string;
  reference: string;
  matdoc: string;
  chip: { variant: "danger" | "warning"; label: string; iconName: "triangleExclamation" | "circleInfo" };
  rows: Row[];
  footerLabel: string;
}

/** Card de extracción/verificación: referencia, chip de estado y pares etiqueta-valor. */
export function ExtractionCard({ title, reference, matdoc, chip, rows, footerLabel }: ExtractionCardProps) {
  return (
    <OverviewCard title={title} footer={<CardFooterLink label={footerLabel} />}>
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold text-neutral-900">
          {reference} · MATDOC: {matdoc}
        </span>
        <Chip variant={chip.variant} label={chip.label} iconName={chip.iconName} hasBorder />
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map((row) => (
          <React.Fragment key={row.label}>
            <dt className="text-neutral-800">{row.label}</dt>
            <dd className="text-neutral-900">{row.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </OverviewCard>
  );
}
