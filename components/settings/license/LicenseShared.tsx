"use client";

import React, { ViewTransition } from "react";
import Link from "next/link";
import { CaralIcon } from "@/components/icons";
import { formatMessage } from "@/lib/format";
import { LicenseDict, LicenseQuota, QUOTA_LABEL_KEY } from "./licenseData";

/* ------------------------------------------------------------------ */
/* Migas: los niveles con href son enlaces; el último es la página actual */
/* ------------------------------------------------------------------ */

export interface LicenseCrumb {
  label: string;
  href?: string;
}

export function LicenseBreadcrumb({ items, ariaLabel }: { items: LicenseCrumb[]; ariaLabel: string }) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center gap-2 text-base">
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {!isFirst && <span className={isLast ? "text-neutral-800" : "text-info-main"}>/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                scroll={false}
                className="flex items-center gap-1.5 text-info-main hover:text-info-hard transition-colors"
              >
                {isFirst && <CaralIcon name="arrowLeft" size={20} />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span aria-current="page" className="text-neutral-800">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Tarjeta de uso de una cuota: valor, disponibles y barra de progreso  */
/* ------------------------------------------------------------------ */

interface QuotaUsageCardProps {
  quota: LicenseQuota;
  t: LicenseDict;
  /** Si se indica, la tarjeta navega a la página de detalle de la cuota. */
  href?: string;
  /** Fondo de la cabecera: `bg-neutral-100` en tarjetas, `bg-container` a todo el ancho. */
  surface?: "card" | "container";
  /** Nombre de view transition compartido entre páginas (animación de expansión). */
  transitionName?: string;
}

export function QuotaUsageCard({ quota, t, href, surface = "card", transitionName }: QuotaUsageCardProps) {
  const pct = quota.total > 0 ? Math.min(100, (quota.used / quota.total) * 100) : 0;

  const content = (
    <>
      <div
        className={`px-2.5 py-[15px] flex flex-col justify-center transition-colors ${
          surface === "card" ? "bg-neutral-100" : "bg-container"
        } ${href ? "group-hover:bg-neutral-500" : ""}`}
      >
        <p className="text-base text-neutral-800 truncate">{String(t[QUOTA_LABEL_KEY[quota.id]])}</p>
        <div className="flex items-center gap-2.5 min-w-0">
          <p className="font-poppins font-semibold text-3xl text-neutral-900 tracking-tight">{quota.used}</p>
          <p className="flex-1 min-w-0 text-base text-neutral-800 truncate">
            {formatMessage(t.ofAvailable, { total: quota.total })}
          </p>
          {href && (
            <span className="flex text-neutral-900 shrink-0 transition-transform group-hover:translate-x-0.5">
              <CaralIcon name="chevronRigth" size={24} />
            </span>
          )}
        </div>
      </div>
      <div className="h-2.5 w-full bg-info-100">
        <div className="h-full bg-info-main transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </>
  );

  const base = "flex flex-col rounded-lg overflow-hidden self-start min-w-0 w-full";
  const card = href ? (
    <Link
      href={href}
      scroll={false}
      title={t.openDetail}
      className={`${base} group outline-none focus-visible:ring-2 focus-visible:ring-info-main/40`}
    >
      {content}
    </Link>
  ) : (
    <div className={base}>{content}</div>
  );

  // Mismo `name` en la tarjeta del módulo y en la de la cuota: el navegador la morfea
  // (posición + tamaño) al navegar entre ambas páginas. Ver `.license-quota-morph` en globals.css.
  return transitionName ? (
    <ViewTransition name={transitionName} share="license-quota-morph" default="none">
      {card}
    </ViewTransition>
  ) : (
    card
  );
}

/** Nombre de transición compartido por el KPI de una cuota en todas sus vistas. */
export const quotaTransitionName = (moduleId: string, quotaId: string) => `license-quota-${moduleId}-${quotaId}`;
