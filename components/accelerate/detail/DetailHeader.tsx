"use client";

import React from "react";
import Link from "next/link";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandPill } from "../BrandPill";
import type { CatalogStatus } from "../models/CatalogStatusBadge";
import type { AccelerateCatalogItem } from "../types";

interface DetailHeaderProps {
  item: AccelerateCatalogItem;
  status: CatalogStatus;
  onViewDashboards: () => void;
  onDeploy: () => void;
}

export function DetailHeader({
  item,
  status,
  onViewDashboards,
  onDeploy,
}: DetailHeaderProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.detail;
  const tm = dict.accelerate.models;
  const isAvailable = item.availability === "available";

  const statusChip =
    status === "contracted" ? (
      <Chip
        variant="success"
        hasBorder
        iconName="badgeSync"
        label={tm.contracted}
      />
    ) : status === "unavailable" ? (
      <Chip variant="danger" hasBorder iconName="x" label={tm.unavailable} />
    ) : (
      <Chip variant="outlight" iconName="clock" label={tm.comingSoon} />
    );

  return (
    <header className="flex flex-col gap-3 rounded-2xl bg-container px-4 py-3 font-poppins">
      {/* Breadcrumb: volver al catálogo */}
      <nav
        aria-label={t.breadcrumb}
        className="flex items-center gap-2 text-sm"
      >
        <Link
          href="/accelerate/models?tab=catalog"
          className="flex items-center gap-1.5 text-info-main transition-colors hover:text-info-hard"
        >
          <CaralIcon name="arrowLeft" size={18} color="currentColor" />
          {tm.title}
        </Link>
        <span className="text-neutral-800">/</span>
        <span aria-current="page" className="text-neutral-800">
          {item.code}
        </span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={`flex size-18 shrink-0 items-center justify-center rounded-xl text-4xl font-bold text-neutral-100 ${
              isAvailable ? "bg-warning-main" : "bg-neutral-500"
            }`}
          >
            {item.code}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-3xl font-bold text-seidor-main-text">
              {item.name} · {item.area}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {statusChip}
              {item.stats && (
                <Chip variant="outlight" label={item.stats.version} />
              )}
              {item.destinations
                .filter((d) => d.available)
                .map((d) => (
                  <BrandPill key={d.brand} brand={d.brand} label={d.name} />
                ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="light" hasBorder onClick={onViewDashboards}>
            {t.viewDashboards}
          </Button>
          {isAvailable && (
            <Button
              variant="warning"
              iconName="planeDeparture"
              disabled={status !== "contracted"}
              title={status !== "contracted" ? tm.unavailable : undefined}
              onClick={onDeploy}
            >
              {t.deployModel}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
