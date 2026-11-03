"use client";

import React from "react";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActiveDataCardProps {
  activeFlows: number;
  recordsToday: string;
  pausedFlows: number;
  onOpenMove: () => void;
  /** Alertas a mostrar al pie de la card (p.ej. flujos pausados). */
  children?: React.ReactNode;
}

function Stat({ value, label, tone = "default" }: { value: React.ReactNode; label: string; tone?: "default" | "warning" }) {
  const isWarning = tone === "warning";
  return (
    <div className={`flex flex-col rounded-2xl px-2.5 py-2 ${isWarning ? "bg-warning-light" : ""}`}>
      <span className="flex items-center gap-1 text-2xl font-bold text-warning-main">
        {isWarning && <CaralIcon name="triangleExclamation" size={22} color="currentColor" />}
        {value}
      </span>
      <span className={`text-xs ${isWarning ? "text-warning-main" : "text-neutral-900"}`}>{label}</span>
    </div>
  );
}

export function ActiveDataCard({ activeFlows, recordsToday, pausedFlows, onOpenMove, children }: ActiveDataCardProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.overview;

  return (
    <section className="flex h-full flex-col gap-4 rounded-2xl bg-container p-4 font-poppins">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-neutral-900">{t.activeDataTitle}</h2>
        <Button variant="ghost" size="sm" iconName="newFile" onClick={onOpenMove} className="text-info-main!">
          {t.openInMove}
        </Button>
      </header>

      <div className="flex flex-col">
        <h3 className="text-base font-bold text-seidor-main-text">{t.moveFeedsTitle}</h3>
        <p className="text-sm text-neutral-800">{t.moveFeedsDescription}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat value={activeFlows} label={t.activeFlows} />
        <Stat value={recordsToday} label={t.recordsToday} />
        <Stat value={pausedFlows} label={t.pausedFlows} tone="warning" />
      </div>

      {children}
    </section>
  );
}
