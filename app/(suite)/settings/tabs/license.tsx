"use client";

import React, { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LicenseOverview,
  MODULE_LICENSES,
  ModuleLicenseDetail,
  QuotaDetail,
  licenseHref,
} from "@/components/settings/license";

/**
 * Licencias por módulo, en tres niveles enrutados por query para que el "atrás" del
 * navegador y las migas funcionen:
 *   ?tab=license                          → listado de módulos
 *   ?tab=license&module=<id>              → licencia del módulo
 *   ?tab=license&module=<id>&quota=<id>   → detalle de una cuota (nodos, orígenes, usuarios)
 */
export function LicenseTab({ afterCard }: { afterCard?: HTMLElement | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("module");
  const quotaId = searchParams.get("quota");

  const selected = moduleId ? MODULE_LICENSES.find((m) => m.id === moduleId) : undefined;
  const quota = selected && quotaId ? selected.quotas.find((q) => q.id === quotaId) : undefined;

  const openModule = useCallback(
    (id: string) => router.push(licenseHref(id), { scroll: false }),
    [router]
  );

  if (selected && quota) return <QuotaDetail module={selected} quota={quota} afterCard={afterCard} />;
  if (selected) return <ModuleLicenseDetail module={selected} />;
  return <LicenseOverview modules={MODULE_LICENSES} onOpenModule={openModule} />;
}
