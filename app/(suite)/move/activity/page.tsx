"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "caralstable";
import type { MoveOverviewData } from "@/components/move/overview/types";
import {
  buildTodayExecutions,
  MonitorCalendar,
  MonitorHistory,
  MonitorLogs,
  MonitorPerformance,
} from "@/components/move/monitor";
import { parseDayKey, useTodayKey } from "@/components/move/overview/schedule";
import { useLanguage } from "@/contexts/LanguageContext";
import overviewData from "@/data/move/overview.json";

const destinationPreview = (overviewData as MoveOverviewData).destinationPreview;

const TAB_IDS = ["performance", "calendar", "history", "logs"] as const;

function MonitorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();
  const t = dict.move.monitor;

  const activeIndex = Math.max(0, TAB_IDS.indexOf(searchParams.get("tab") as (typeof TAB_IDS)[number]));
  const goToTab = (idx: number) => router.push(`/move/activity?tab=${TAB_IDS[idx]}`, { scroll: false });

  // Las ejecuciones se fechan hoy: en el prerender estático `todayKey` es null
  // (no se fija la fecha del build) y se construyen ya en cliente.
  const todayKey = useTodayKey();
  const today = useMemo(() => (todayKey ? parseDayKey(todayKey) : null), [todayKey]);
  const executions = useMemo(() => (today ? buildTodayExecutions(today) : null), [today]);

  const tabs = (
    <div className="self-start">
      <Tabs
        tabs={[{ label: t.tabPerformance }, { label: t.tabCalendar }, { label: t.tabHistory }, { label: t.tabLogs }]}
        activeIndex={activeIndex}
        onChange={goToTab}
      />
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2.5 pb-10 font-poppins">
      {activeIndex === 0 ? (
        executions && (
          <MonitorPerformance
            executions={executions}
            destinationPreview={destinationPreview}
            header={tabs}
            onOpenCalendar={() => goToTab(1)}
          />
        )
      ) : activeIndex === 1 ? (
        <>
          <div className="rounded-lg bg-container p-2.5">{tabs}</div>
          {executions && today && <MonitorCalendar executions={executions} today={today} />}
        </>
      ) : activeIndex === 2 ? (
        <MonitorHistory header={tabs} />
      ) : (
        today && <MonitorLogs header={tabs} today={today} />
      )}
    </div>
  );
}

export default function MoveMonitorPage() {
  const { dict } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 font-poppins text-neutral-800">{dict.common.loading}</div>}>
      <MonitorContent />
    </Suspense>
  );
}
