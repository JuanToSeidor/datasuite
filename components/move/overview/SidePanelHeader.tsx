"use client";

import React from "react";
import { Button } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidePanel } from "@/contexts/SidePanelContext";

/** Encabezado de los paneles laterales del resumen de Move: título + expandir + cerrar. */
export function SidePanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const { dict } = useLanguage();
  const t = dict.move.overview.nodePanel;
  const { isSidePanelExpanded, toggleSidePanelExpand } = useSidePanel();

  return (
    <header className="flex items-center justify-between gap-3 bg-neutral-500 px-4 py-3">
      <h2 className="min-w-0 truncate text-xl font-bold text-neutral-900">{title}</h2>
      <div className="flex shrink-0 items-center gap-2">
        {/* Expandir a toda la pantalla (mismo control que el panel Analyze). */}
        <Button
          isIconButton
          iconName="arrowsLeftRight"
          variant="ghost"
          title={isSidePanelExpanded ? t.collapse : t.expand}
          aria-pressed={isSidePanelExpanded}
          onClick={toggleSidePanelExpand}
        />
        <Button isIconButton iconName="x" variant="ghost" title={dict.common.close} onClick={onClose} />
      </div>
    </header>
  );
}
