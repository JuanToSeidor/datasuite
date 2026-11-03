"use client";

import React from "react";
import { Button } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ACTIVITY_META,
  TONE_DOT,
  describeActivity,
  formatActivityDate,
} from "../activity/activityMeta";
import type { AccelerateActivity } from "../types";

interface RecentActivityCardProps {
  items: AccelerateActivity[];
  onViewAll?: () => void;
}

export function RecentActivityCard({ items, onViewAll }: RecentActivityCardProps) {
  const { dict, language } = useLanguage();
  const t = dict.accelerate.overview;

  return (
    <section className="flex h-full flex-col gap-2 rounded-2xl bg-container p-4 font-poppins">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-neutral-900">{t.activityTitle}</h2>
        <Button
          variant="ghost"
          size="sm"
          iconName="presentationScreenChart"
          onClick={onViewAll}
          className="text-info-main!"
        >
          {t.viewAllActivity}
        </Button>
      </header>

      <ul className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 border-b border-neutral-500 py-3 last:border-b-0"
          >
            <span className={`mt-2 size-2.5 shrink-0 rounded-full ${TONE_DOT[ACTIVITY_META[item.type].tone]}`} />
            <div className="flex min-w-0 flex-col">
              <span className="text-base font-semibold text-neutral-900">{describeActivity(item, dict)}</span>
              <span className="text-xs text-neutral-800">{formatActivityDate(item.date, language)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
