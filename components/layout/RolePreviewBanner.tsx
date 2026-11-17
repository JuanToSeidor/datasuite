"use client";

import React, { useEffect, useState } from "react";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { assetPath } from "@/lib/assetPath";

/** Parámetro de URL con el que Settings > Roles abre la previsualización. */
export const ROLE_PREVIEW_PARAM = "previewRole";
// sessionStorage es por pestaña: el modo solo vive en la pestaña abierta para previsualizar.
const STORAGE_KEY = "suite_preview_role";

/** URL del inicio en modo previsualizador para un rol (respeta el basePath del deploy). */
export function getRolePreviewUrl(roleName: string): string {
  return assetPath(`/?${ROLE_PREVIEW_PARAM}=${encodeURIComponent(roleName)}`);
}

function readStoredRole(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function RolePreviewBanner() {
  const { dict } = useLanguage();
  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    // Se lee de la URL una sola vez y se guarda en la pestaña para que persista al navegar.
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get(ROLE_PREVIEW_PARAM);
    if (fromUrl) {
      try {
        sessionStorage.setItem(STORAGE_KEY, fromUrl);
      } catch {
        /* sin storage: el banner vive solo en esta carga */
      }
      url.searchParams.delete(ROLE_PREVIEW_PARAM);
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
    setRoleName(fromUrl || readStoredRole());
  }, []);

  if (!roleName) return null;

  const exitPreview = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setRoleName(null);
    // La pestaña se abrió desde Roles: se intenta cerrar; si el navegador no lo permite, solo se oculta el banner.
    window.close();
  };

  return (
    <div className="flex items-center justify-between gap-2.5 p-2.5 w-full shrink-0 bg-info-100 border-b-4! border-info-main! font-poppins">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex shrink-0 text-info-main">
          <CaralIcon name="screenView" size={27} />
        </span>
        <p className="font-semibold text-lg text-neutral-900 whitespace-nowrap">{dict.rolePreview.title}</p>
        <p className="text-base text-neutral-900 truncate">
          {dict.rolePreview.message} <span className="text-info-main">{roleName}</span>
        </p>
      </div>
      <Button
        isIconButton
        variant="ghost"
        iconName="x"
        className="text-neutral-900 shrink-0"
        title={dict.rolePreview.exit}
        onClick={exitPreview}
      />
    </div>
  );
}
