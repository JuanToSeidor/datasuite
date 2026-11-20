"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LIVE_EXTRACTION_EVENT,
  LIVE_EXTRACTION_ID,
  clearLiveExtraction,
  extractionDetails,
  getLiveExtractionStart,
  useExtractionRun,
} from "@/components/preserve/extractions/extractionRun";
import {
  PRESERVE_ADMIN_DEPLOYED,
  PRESERVE_ADMIN_FIRST_DEPLOY,
  getBranchRedirect,
  suiteConfig,
} from "@/config/suite";
import { useBranchScenario, useWorkspace } from "@/contexts/WorkspaceContext";

const preserveBranch = suiteConfig.branches.find((b) => b.id === "preserve")!;

/** Pausa para que se vea la extracción completa antes de pasar a "desplegado". */
const DEPLOYED_TRANSITION_MS = 2500;

/**
 * Preserve cambia de pantallas según el escenario del workspace (rol + momento de uso).
 * - Si la ruta actual no corresponde al escenario (por URL directa o al cambiar de workspace),
 *   se redirige a la primera pantalla visible para ese escenario.
 * - Primer despliegue: cuando la primera extracción (en vivo) llega al 100 %, se pasa al
 *   momento "desplegado" cambiando al workspace que lo simula y se abre el Resumen.
 */
export default function PreserveLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isReady, workspaces, setSelectedWorkspaceId } = useWorkspace();
  const scenario = useBranchScenario(preserveBranch.id);
  const isFirstDeploy = scenario === PRESERVE_ADMIN_FIRST_DEPLOY;

  // La extracción en vivo se inicia desde el asistente (o al abrir su detalle): se sigue por evento.
  const [hasLiveStarted, setHasLiveStarted] = useState(false);
  useEffect(() => {
    const sync = () => setHasLiveStarted(Boolean(getLiveExtractionStart()));
    sync();
    window.addEventListener(LIVE_EXTRACTION_EVENT, sync);
    return () => window.removeEventListener(LIVE_EXTRACTION_EVENT, sync);
  }, []);

  const liveRun = useExtractionRun(
    isFirstDeploy && hasLiveStarted ? extractionDetails[LIVE_EXTRACTION_ID] : undefined,
  );
  const isLiveFinished = Boolean(liveRun && !liveRun.isRunning);

  useEffect(() => {
    if (!isLiveFinished) return;
    const timer = window.setTimeout(() => {
      // Staging vuelve a quedar en primer despliegue (sin extracciones) para repetir la demo.
      clearLiveExtraction();
      const deployed = workspaces.find((w) => w.scenarios?.preserve === PRESERVE_ADMIN_DEPLOYED);
      if (deployed) setSelectedWorkspaceId(deployed.id);
      router.replace(preserveBranch.href ?? "/preserve");
    }, DEPLOYED_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [isLiveFinished, workspaces, setSelectedWorkspaceId, router]);

  const redirectTo = isReady ? getBranchRedirect(preserveBranch, scenario, pathname) : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // Mientras se lee el workspace guardado o se redirige no se muestra la pantalla equivocada.
  if (!isReady || redirectTo) return null;
  return <>{children}</>;
}
