"use client";

import React from "react";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { assetPath } from "@/lib/assetPath";
import { formatMessage } from "@/lib/format";
import { BrandPill } from "../BrandPill";
import type { AccelerateDashboard, AccelerateDashboardStatus } from "../types";

const STATUS_VARIANT: Record<AccelerateDashboardStatus, "warning" | "info" | "danger"> = {
  active: "warning",
  refreshing: "info",
  error: "danger",
};

/** Iniciales del responsable: "Marta López" -> "ML". */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/** "hace 42 min", "hace 1 hora", "hace 2 días" en el idioma activo. */
function timeAgo(minutes: number, language: string) {
  if (minutes < 60) {
    return new Intl.RelativeTimeFormat(language, { style: "short" }).format(-minutes, "minute");
  }
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  return minutes < 60 * 24
    ? rtf.format(-Math.round(minutes / 60), "hour")
    : rtf.format(-Math.round(minutes / (60 * 24)), "day");
}

interface DashboardCardProps {
  dashboard: AccelerateDashboard;
}

/** Tarjeta de un tablero entregado: portada, responsable, estado y acceso a la plataforma. */
export function DashboardCard({ dashboard }: DashboardCardProps) {
  const { dict, language } = useLanguage();
  const t = dict.accelerate.dashboards;

  const statusLabel = {
    active: t.statusActive,
    refreshing: t.statusRefreshing,
    error: t.statusError,
  }[dashboard.status];

  const asOf = new Date(dashboard.dataAsOf);
  const date = new Intl.DateTimeFormat(language, { day: "2-digit", month: "2-digit" }).format(asOf);

  const open = () => window.open(dashboard.url, "_blank", "noopener,noreferrer");

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-container font-poppins shadow-md transition-shadow hover:shadow-xl">
      <div className="h-[200px] w-full overflow-hidden bg-neutral-500">
        {/* eslint-disable-next-line @next/next/no-img-element -- export estático: imágenes sin optimizar */}
        <img
          src={assetPath(`/dashboards/${dashboard.cover}`)}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-neutral-100"
          >
            {initials(dashboard.owner)}
          </span>
          <span className="truncate text-sm text-neutral-800">{dashboard.owner}</span>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-neutral-900">{dashboard.title}</h2>
          <p className="text-sm text-neutral-800">{dashboard.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* El Chip de Caral no tiene tamaño "sm": se reduce para igualar la píldora de plataforma. */}
          <span className="inline-flex" style={{ zoom: 0.75 }}>
            <Chip
              variant={STATUS_VARIANT[dashboard.status]}
              label={statusLabel.toLocaleUpperCase(language)}
              hasBorder
            />
          </span>
          <BrandPill brand={dashboard.platform.brand} label={dashboard.platform.name} size="sm" />
        </div>

        <div className="mt-auto h-px w-full bg-neutral-500" />

        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-800">
            <span className="shrink-0">
              <CaralIcon name="clock" size={20} color="currentColor" />
            </span>
            <span className="truncate">
              {formatMessage(t.dataAsOf, {
                date,
                hour: asOf.getHours(),
                ago: timeAgo(dashboard.updatedMinutesAgo, language),
              })}
            </span>
          </span>
          <Button
            variant="warning"
            size="sm"
            onClick={open}
            aria-label={formatMessage(t.openIn, { title: dashboard.title, platform: dashboard.platform.name })}
          >
            {t.open}
          </Button>
        </div>
      </div>
    </article>
  );
}
