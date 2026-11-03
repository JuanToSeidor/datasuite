"use client";

import React from "react";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AccelerateModel } from "../types";

export function ModelStatusCell({ model }: { model: AccelerateModel }) {
  const { dict } = useLanguage();
  const t = dict.accelerate.overview;

  if (model.status === "deploying") {
    return (
      <div className="flex flex-col gap-1.5 text-warning-main" title={t.statusDeploying}>
        <div className="flex items-center gap-1.5">
          <CaralIcon name="planeDeparture" size={20} color="currentColor" />
          <span className="text-base font-semibold">{model.progress}%</span>
        </div>
        <div className="h-0.5 w-full max-w-24 rounded-full bg-neutral-500">
          <div
            className="h-0.5 rounded-full bg-warning-main transition-all"
            style={{ width: `${model.progress}%` }}
          />
        </div>
      </div>
    );
  }

  const isError = model.status === "error";
  return (
    <div className={`flex items-center gap-1.5 ${isError ? "text-danger-main" : "text-success-main"}`}>
      <CaralIcon name={isError ? "triangleExclamation" : "check"} size={20} color="currentColor" />
      <span className="text-base">{isError ? t.statusError : t.statusActive}</span>
    </div>
  );
}
