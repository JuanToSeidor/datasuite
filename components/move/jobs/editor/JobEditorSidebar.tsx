"use client";

import React from "react";
import { Button } from "caralstable";
import { CaralIcon, type Icons } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SidebarTheme } from "./EditorPreferences";

export type JobEditorSection = "config" | "triggers" | "nodes" | "export";

const SECTIONS: { id: JobEditorSection; icon: Icons; labelKey: string }[] = [
  { id: "config", icon: "wrench", labelKey: "moveJobsEditor.editor.panel.config" },
  { id: "triggers", icon: "play", labelKey: "moveJobsEditor.editor.panel.triggers" },
  { id: "nodes", icon: "cubeInCube", labelKey: "moveJobsEditor.editor.panel.nodes" },
  { id: "export", icon: "arrowUpToLine", labelKey: "moveJobsEditor.editor.panel.export" },
];

interface JobEditorSidebarProps {
  activeSection: JobEditorSection;
  isPanelOpen: boolean;
  onSelect: (section: JobEditorSection) => void;
  /** Botón "Configurar" al pie del sidebar (abre el modal de apariencia). */
  onSettings: () => void;
  /** "explanatory": tiles oscuros con icono y texto; "simple": barra clara solo con iconos. */
  theme: SidebarTheme;
}

/**
 * Sidebar exclusivo del editor de jobs (reemplaza al sidebar general de la suite).
 * Cada ítem abre su sección en el panel lateral; tocar el ítem activo con el panel abierto lo cierra.
 */
export function JobEditorSidebar({ activeSection, isPanelOpen, onSelect, onSettings, theme }: JobEditorSidebarProps) {
  const { t } = useLanguage();
  const isSimple = theme === "simple";

  return (
    <nav
      aria-label={t("moveJobsEditor.editor.panel.navLabel")}
      className={`flex shrink-0 flex-col gap-2.5 self-stretch overflow-y-auto p-2.5 ${isSimple ? "bg-container" : "bg-seidor-main"}`}
    >
      {SECTIONS.map(({ id, icon, labelKey }) => {
        const isOpen = activeSection === id && isPanelOpen;
        const label = t(labelKey);

        if (isSimple) {
          return (
            <Button
              key={id}
              variant="ghost"
              isIconButton
              iconName={icon}
              aria-pressed={isOpen}
              aria-label={label}
              title={label}
              onClick={() => onSelect(id)}
              className={`cursor-pointer ${isOpen ? "bg-info-100! text-info-main!" : "text-neutral-900 hover:bg-neutral-500/40"}`}
            />
          );
        }

        // Tema explicativo: tiles verticales de 68×68 (icono sobre texto) con <button> nativo,
        // porque el `Button` de Caral no puede componer ese armado.
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isOpen}
            onClick={() => onSelect(id)}
            className={`flex size-[68px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-md p-2.5 font-poppins text-sm font-medium text-neutral-100 transition-colors ${
              isOpen ? "bg-seidor-hard" : "hover:bg-seidor-hard/40"
            }`}
          >
            <CaralIcon name={icon} size={24} />
            <span className="leading-[14px]">{label}</span>
          </button>
        );
      })}

      <div className="mt-auto flex justify-center pt-2.5">
        <Button
          variant="info"
          isIconButton
          iconName="gear"
          className="cursor-pointer"
          title={t("moveJobsEditor.editor.panel.settings")}
          aria-label={t("moveJobsEditor.editor.panel.settings")}
          onClick={onSettings}
        />
      </div>
    </nav>
  );
}
