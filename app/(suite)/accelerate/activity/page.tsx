"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Input } from "@/components/ui";
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_META,
  TONE_BADGE,
  describeActivity,
  inCategory,
  type ActivityCategory,
} from "@/components/accelerate/activity/activityMeta";
import type { AccelerateActivity } from "@/components/accelerate/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import activityData from "@/data/accelerate/activity.json";

const activity = (activityData as AccelerateActivity[])
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));

const CATEGORIES = Object.keys(ACTIVITY_CATEGORIES) as ActivityCategory[];
const PAGE_SIZE = 12;

/** Texto plano buscable de un evento (tabla, modelo, tablero, usuario). */
const searchableText = (item: AccelerateActivity, description: string) =>
  [
    description,
    "table" in item ? item.table : "",
    "user" in item ? item.user : "",
  ]
    .join(" ")
    .toLowerCase();

/** Destino del botón de acción de cada evento, si tiene. */
function actionFor(item: AccelerateActivity): "models" | "dashboards" | null {
  if (item.type.startsWith("deploy")) return "models";
  if (item.type === "dashboardPublished") return "dashboards";
  return null;
}

export default function AccelerateActivityPage() {
  const router = useRouter();
  const { dict, language } = useLanguage();
  const t = dict.accelerate.activity;
  const to = dict.accelerate.overview;

  const [category, setCategory] = useState<ActivityCategory>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const described = useMemo(
    () =>
      activity.map((item) => ({ item, text: describeActivity(item, dict) })),
    [dict],
  );

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? described.filter(({ item, text }) =>
          searchableText(item, text).includes(q),
        )
      : described;
  }, [described, query]);

  const filtered = searched.filter(({ item }) => inCategory(item, category));
  const shown = filtered.slice(0, visible);

  const tabLabel: Record<ActivityCategory, string> = {
    all: t.tabAll,
    deploys: t.tabDeploys,
    loads: t.tabLoads,
    dashboards: t.tabDashboards,
    alerts: t.tabAlerts,
  };

  // Agrupa por día: "jueves, 16 de octubre de 2026".
  const dayFormat = new Intl.DateTimeFormat(language, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormat = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const groups = shown.reduce<{ day: string; entries: typeof shown }[]>(
    (acc, entry) => {
      const day = entry.item.date.slice(0, 10);
      const last = acc[acc.length - 1];
      if (last?.day === day) last.entries.push(entry);
      else acc.push({ day, entries: [entry] });
      return acc;
    },
    [],
  );

  const resetPaging = () => setVisible(PAGE_SIZE);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      <header className="flex flex-col gap-3 rounded-2xl bg-container px-4 py-3">
        <nav
          aria-label={t.breadcrumb}
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <Link
            href="/accelerate"
            className="flex items-center gap-1.5 text-info-main transition-colors hover:text-info-hard"
          >
            <CaralIcon name="arrowLeft" size={18} color="currentColor" />
            {to.title}
          </Link>
          <span className="text-neutral-800">/</span>
          <span aria-current="page" className="font-semibold text-neutral-900">
            {t.title}
          </span>
        </nav>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-fit max-w-full overflow-x-auto">
          <Tabs
            tabs={CATEGORIES.map((c) => ({
              label: formatMessage(tabLabel[c], {
                n: searched.filter(({ item }) => inCategory(item, c)).length,
              }),
            }))}
            activeIndex={CATEGORIES.indexOf(category)}
            onChange={(idx) => {
              setCategory(CATEGORIES[idx]);
              resetPaging();
            }}
          />
        </div>
        <div className="ml-auto w-96 max-w-full">
          <Input
            iconName="search"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPaging();
            }}
            aria-label={t.searchPlaceholder}
          />
        </div>
      </div>

      <section className="flex flex-col gap-5 rounded-2xl bg-container p-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="text-neutral-800">
              <CaralIcon name="search" size={32} color="currentColor" />
            </span>
            <h2 className="text-lg font-bold text-neutral-900">
              {t.emptyTitle}
            </h2>
            <p className="text-sm text-neutral-800">{t.emptyText}</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.day} className="flex flex-col">
              <h2 className="pb-1 text-sm font-semibold text-neutral-800 first-letter:uppercase">
                {dayFormat.format(new Date(`${group.day}T00:00`))}
              </h2>
              <ol className="flex flex-col">
                {group.entries.map(({ item, text }, i) => {
                  const meta = ACTIVITY_META[item.type];
                  const action = actionFor(item);
                  const isLast = i === group.entries.length - 1;
                  return (
                    <li key={item.id} className="flex gap-3">
                      {/* Línea de tiempo: ícono + conector vertical */}
                      <div className="flex flex-col items-center">
                        <span
                          className={`mt-2.5 flex size-9 shrink-0 items-center justify-center rounded-full ${TONE_BADGE[meta.tone]}`}
                        >
                          <CaralIcon
                            name={meta.icon}
                            size={18}
                            color="currentColor"
                          />
                        </span>
                        {!isLast && (
                          <span className="w-0.5 flex-1 bg-neutral-500" />
                        )}
                      </div>
                      <div
                        className={`flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 py-3 ${isLast ? "" : "border-b border-neutral-500"}`}
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="text-base font-semibold text-neutral-900">
                            {text}
                          </span>
                          <span className="text-xs text-neutral-800 tabular-nums">
                            {timeFormat.format(new Date(item.date))}
                          </span>
                        </div>
                        {action && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                action === "models"
                                  ? "/accelerate/models?tab=deployed"
                                  : "/accelerate/dashboards",
                              )
                            }
                          >
                            <span className="flex items-center gap-1 font-normal text-info-main">
                              {action === "models"
                                ? t.viewModels
                                : t.viewDashboards}
                              <CaralIcon
                                name="chevronRigth"
                                size={16}
                                color="currentColor"
                              />
                            </span>
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))
        )}

        {filtered.length > 0 && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-500 pt-3">
            <span className="text-sm text-neutral-800">
              {formatMessage(t.showing, {
                shown: shown.length,
                total: filtered.length,
              })}
            </span>
            {shown.length < filtered.length && (
              <Button
                variant="light"
                hasBorder
                size="sm"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                {t.loadMore}
              </Button>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}
