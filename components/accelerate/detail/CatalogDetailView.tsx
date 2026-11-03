"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import catalogData from "@/data/accelerate/catalog.json";
import catalogDetailsData from "@/data/accelerate/catalogDetails.json";
import type { CatalogStatus } from "../models/CatalogStatusBadge";
import type { AccelerateCatalogDetail, AccelerateCatalogItem } from "../types";
import { DetailHeader } from "./DetailHeader";
import { FunctionalDescriptionCard, ModelSheetCard } from "./OverviewCards";
import { SourceTablesSection } from "./SourceTablesSection";
import { DestinationObjectsSection } from "./DestinationObjectsSection";

const catalog = catalogData as AccelerateCatalogItem[];
const catalogDetails = catalogDetailsData as Record<string, AccelerateCatalogDetail>;

/** Pantalla "Ver detalle" de un ACT-IN del catálogo. */
export function CatalogDetailView({ catalogId }: { catalogId: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.accelerate.detail;

  const item = catalog.find((c) => c.id === catalogId);
  const detail = catalogDetails[catalogId];

  const goToMove = useCallback(() => router.push("/move"), [router]);

  if (!item || !detail) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-container p-10 text-center font-poppins">
        <p className="text-base text-neutral-900">{t.notFound}</p>
        <Button variant="light" hasBorder iconName="arrowLeft" onClick={() => router.push("/accelerate/models")}>
          {t.backToCatalog}
        </Button>
      </div>
    );
  }

  const status: CatalogStatus =
    item.availability !== "available" ? "comingSoon" : item.contracted ? "contracted" : "unavailable";
  const canDeploy = status === "contracted";
  const deploy = () => router.push(`/accelerate/models/${catalogId}/deploy`);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      <DetailHeader
        item={item}
        status={status}
        onViewDashboards={() => router.push("/accelerate/dashboards")}
        onDeploy={deploy}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <FunctionalDescriptionCard detail={detail} />
        </div>
        <ModelSheetCard detail={detail} />
      </div>

      {detail.sourceTables && <SourceTablesSection sourceTables={detail.sourceTables} onOpenMove={goToMove} />}

      {detail.destinationObjects && <DestinationObjectsSection destinationObjects={detail.destinationObjects} />}

      {canDeploy && (
        <div className="flex justify-end">
          <Button variant="warning" iconName="planeDeparture" onClick={deploy}>
            {t.deployModel}
          </Button>
        </div>
      )}
    </div>
  );
}
