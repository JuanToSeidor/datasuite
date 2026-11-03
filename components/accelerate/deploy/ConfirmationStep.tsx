"use client";

import React from "react";
import { CaralIcon, type Icons } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { TYPE_ICON } from "../detail/DestinationObjectsSection";
import type {
  AccelerateCatalogItem,
  DestinationObject,
  DestinationWorkspace,
  SapCompany,
  SapEnvironment,
  SapSource,
} from "../types";
import { StepHeading } from "./OriginStep";

interface ConfirmationStepProps {
  item: AccelerateCatalogItem;
  deploymentName: string;
  source: SapSource;
  companies: SapCompany[];
  regionName: (countryCode: string) => string;
  platformName: string;
  workspace?: DestinationWorkspace;
  lakehouse: string;
  deltaMinutes: number;
  masterDataDailyAt: string;
  servicePrincipal: string;
  objects: DestinationObject[];
  reports: string[];
  estimatedMinutes: number;
  /** Tablas desactualizadas aceptadas en la validación. */
  outdatedTables: string[];
}

const plural = (n: number, one: string, other: string) =>
  formatMessage(n === 1 ? one : other, { n });

/** Valor monoespaciado (nombres técnicos: lakehouse, service principal). */
const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[0.95em]">{children}</span>
);

/** Paso 4: resumen de todo lo elegido + lo que Accelerate va a crear. */
export function ConfirmationStep({
  item,
  deploymentName,
  source,
  companies,
  regionName,
  platformName,
  workspace,
  lakehouse,
  deltaMinutes,
  masterDataDailyAt,
  servicePrincipal,
  objects,
  reports,
  estimatedMinutes,
  outdatedTables,
}: ConfirmationStepProps) {
  const { dict, language } = useLanguage();
  const t = dict.accelerate.deploy;

  const envLabel: Record<SapEnvironment, string> = {
    production: t.envProduction,
    quality: t.envQuality,
    development: t.envDevelopment,
  };

  // "Service principal {sp} del Core": el nombre técnico va en monoespaciada.
  const [identityBefore, identityAfter = ""] = t.identity.split("{sp}");

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: t.summaryModel,
      value: [item.name, item.area, item.stats?.version.toLowerCase()]
        .filter(Boolean)
        .join(" · "),
    },
    { label: t.summaryName, value: deploymentName },
    {
      label: t.summaryOrigin,
      value: `${source.system} · ${envLabel[source.environment]}`,
    },
    {
      label: t.summaryCompanies,
      value: companies
        .map((c) => `${c.code} ${regionName(c.country)} (${c.currency})`)
        .join(" · "),
    },
    {
      label: t.summaryDestination,
      value: (
        <>
          {[platformName, workspace?.name].filter(Boolean).join(" · ")} ·{" "}
          <Mono>{lakehouse}</Mono>
        </>
      ),
    },
    {
      label: t.summaryRefresh,
      value: formatMessage(t.refreshPolicy, {
        minutes: deltaMinutes,
        time: masterDataDailyAt,
      }),
    },
    {
      label: t.summaryIdentity,
      value: (
        <>
          {identityBefore}
          <Mono>{servicePrincipal}</Mono>
          {identityAfter}
        </>
      ),
    },
  ];

  const count = (type: DestinationObject["type"]) =>
    objects.filter((o) => o.type === type).length;
  const deltaTables = count("deltaTable");
  const sqlViews = count("sqlView");
  const toCreate: { icon: Icons; label: string }[] = [
    ...(deltaTables
      ? [
          {
            icon: TYPE_ICON.deltaTable,
            label: plural(
              deltaTables,
              t.createDeltaTablesOne,
              t.createDeltaTablesOther,
            ),
          },
        ]
      : []),
    ...(sqlViews
      ? [
          {
            icon: TYPE_ICON.sqlView,
            label: plural(sqlViews, t.createSqlViewsOne, t.createSqlViewsOther),
          },
        ]
      : []),
    ...objects
      .filter((o) => o.type === "semanticModel")
      .map((o) => ({
        icon: TYPE_ICON.semanticModel,
        label: formatMessage(t.createSemanticModel, { name: o.name }),
      })),
    ...(reports.length
      ? [
          {
            icon: "presentationScreenChart" as Icons,
            label: plural(
              reports.length,
              t.createReportsOne,
              t.createReportsOther,
            ),
          },
        ]
      : []),
  ];

  const tablesList = new Intl.ListFormat(language, {
    type: "conjunction",
  }).format(outdatedTables);

  return (
    <section className="flex w-full flex-col gap-6 rounded-lg bg-container p-5 font-poppins">
      <StepHeading title={t.confirmTitle} subtitle={t.confirmSubtitle} />

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <dl className="grid grid-cols-[minmax(0,11rem)_1fr] gap-x-6 gap-y-3 rounded-xl border border-neutral-500 p-5">
          {rows.map((r) => (
            <React.Fragment key={r.label}>
              <dt className="text-base text-neutral-800">{r.label}</dt>
              <dd className="text-base font-semibold text-neutral-900">
                {r.value}
              </dd>
            </React.Fragment>
          ))}
        </dl>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-500 p-5">
            <h3 className="text-sm font-bold tracking-wider text-neutral-800 uppercase">
              {t.willCreate}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {toCreate.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center gap-2.5 text-base text-neutral-900"
                >
                  <span className="shrink-0 text-success-main">
                    <CaralIcon name={c.icon} size={20} color="currentColor" />
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
            <div className="h-px w-full bg-neutral-500" />
            <span className="flex items-center gap-2 text-sm text-neutral-800">
              <CaralIcon name="clock" size={18} color="currentColor" />
              {formatMessage(t.estimatedTime, { n: estimatedMinutes })}
            </span>
          </div>

          {outdatedTables.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-lg border-l-4 border-warning-main bg-warning-light px-4 py-2.5">
              <span className="shrink-0 text-warning-main">
                <CaralIcon
                  name="triangleExclamation"
                  size={22}
                  color="currentColor"
                />
              </span>
              <span className="text-sm text-neutral-900">
                {outdatedTables.length === 1
                  ? formatMessage(t.acceptedWarningOne, { tables: tablesList })
                  : formatMessage(t.acceptedWarningsOther, {
                      n: outdatedTables.length,
                      tables: tablesList,
                    })}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
