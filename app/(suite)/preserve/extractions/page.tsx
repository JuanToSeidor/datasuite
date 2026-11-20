"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "caralstable";
import { ExtractionsTable } from "@/components/preserve/extractions";
import type { ExtractionRecord } from "@/components/preserve/extractions/ExtractionsTable";
import {
  LIVE_EXTRACTION_ID,
  extractionDetails,
  getLiveExtractionStart,
  useExtractionRun,
} from "@/components/preserve/extractions/extractionRun";
import { PRESERVE_ADMIN_FIRST_DEPLOY } from "@/config/suite";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranchScenario } from "@/contexts/WorkspaceContext";

/** "2026-11-19 10:05" (formato del listado). */
function formatStarted(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PreserveExtractionsPage() {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.preserve.extractions;
  const isFirstDeploy = useBranchScenario("preserve") === PRESERVE_ADMIN_FIRST_DEPLOY;

  // Primer despliegue: la lista está vacía hasta que se inicia la primera extracción.
  const [hasLiveStarted, setHasLiveStarted] = useState(false);
  useEffect(() => setHasLiveStarted(Boolean(getLiveExtractionStart())), []);

  const liveDetail = extractionDetails[LIVE_EXTRACTION_ID];
  const liveRun = useExtractionRun(isFirstDeploy && hasLiveStarted ? liveDetail : undefined);

  const firstDeployRows = useMemo<ExtractionRecord[]>(() => {
    if (!liveRun) return [];
    return [
      {
        id: LIVE_EXTRACTION_ID,
        owner: liveDetail.owner ?? "",
        archive: liveDetail.archive ?? "",
        scope: { type: "tables", count: liveRun.tables.length + liveRun.pendingTables.length },
        status: liveRun.isRunning ? "extracting" : "matches",
        progress: liveRun.progress,
        statusDetail: liveRun.isRunning ? { kind: "drift", count: 0 } : { kind: "matches" },
        started: formatStarted(liveRun.startedAt),
        durationMinutes: Math.floor(liveRun.elapsedSeconds / 60),
        running: liveRun.isRunning,
      },
    ];
  }, [liveRun, liveDetail]);

  const openExtraction = useCallback(
    (id: string) => router.push(`/preserve/extractions/${id}`),
    [router],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <Button variant="success" iconName="plus" onClick={() => router.push("/preserve/extractions/new")}>
          {t.newExtraction}
        </Button>
      </header>

      {/* La tabla ya trae su propio borde y fondo: va directa sobre el fondo, sin card ni padding. */}
      <ExtractionsTable onOpen={openExtraction} rows={isFirstDeploy ? firstDeployRows : undefined} />
    </div>
  );
}
