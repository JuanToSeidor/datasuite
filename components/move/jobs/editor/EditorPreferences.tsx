"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/** Preferencias de apariencia del editor de jobs (por usuario, guardadas en este navegador). */
export type SidebarPosition = "left" | "right";
export type SidebarTheme = "simple" | "explanatory";
export type TriggerColor = "info" | "success" | "warning" | "danger" | "indigo" | "sakura";

export interface EditorPreferences {
  sidebarPosition: SidebarPosition;
  sidebarTheme: SidebarTheme;
  triggerColor: TriggerColor;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  sidebarPosition: "left",
  sidebarTheme: "explanatory",
  triggerColor: "info",
};

export const TRIGGER_COLORS: TriggerColor[] = ["info", "success", "warning", "danger", "indigo", "sakura"];

/**
 * Clases por color del nodo de inicio. Escritas completas (no interpoladas) para que Tailwind las genere.
 * `swatch`/`swatchSelected`: muestras del selector del modal.
 */
export const TRIGGER_COLOR_CLASSES: Record<
  TriggerColor,
  { solid: string; soft: string; border: string; swatch: string }
> = {
  info: { solid: "bg-info-main!", soft: "bg-info-main/20!", border: "border-info-main!", swatch: "bg-info-light!" },
  success: { solid: "bg-success-main!", soft: "bg-success-main/20!", border: "border-success-main!", swatch: "bg-success-light!" },
  warning: { solid: "bg-warning-main!", soft: "bg-warning-main/20!", border: "border-warning-main!", swatch: "bg-warning-light!" },
  danger: { solid: "bg-danger-main!", soft: "bg-danger-main/20!", border: "border-danger-main!", swatch: "bg-danger-light!" },
  indigo: { solid: "bg-indigo-main!", soft: "bg-indigo-main/20!", border: "border-indigo-main!", swatch: "bg-indigo-light!" },
  sakura: { solid: "bg-sakura-main!", soft: "bg-sakura-main/20!", border: "border-sakura-main!", swatch: "bg-sakura-light!" },
};

const STORAGE_KEY = "move_job_editor_prefs";

const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === "string" && (options as readonly string[]).includes(value);

function readStoredPreferences(): EditorPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EDITOR_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<Record<keyof EditorPreferences, unknown>>;
    return {
      sidebarPosition: isOneOf(parsed.sidebarPosition, ["left", "right"] as const)
        ? parsed.sidebarPosition
        : DEFAULT_EDITOR_PREFERENCES.sidebarPosition,
      sidebarTheme: isOneOf(parsed.sidebarTheme, ["simple", "explanatory"] as const)
        ? parsed.sidebarTheme
        : DEFAULT_EDITOR_PREFERENCES.sidebarTheme,
      triggerColor: isOneOf(parsed.triggerColor, TRIGGER_COLORS) ? parsed.triggerColor : DEFAULT_EDITOR_PREFERENCES.triggerColor,
    };
  } catch {
    return DEFAULT_EDITOR_PREFERENCES;
  }
}

interface EditorPreferencesContextValue {
  /** Preferencias efectivas: la vista previa si hay una, si no las guardadas. */
  preferences: EditorPreferences;
  savedPreferences: EditorPreferences;
  /** Guarda (y persiste) las preferencias. */
  setPreferences: (preferences: EditorPreferences) => void;
  /** Aplica una vista previa sin guardar; `null` vuelve a las guardadas. */
  setPreview: (preferences: EditorPreferences | null) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  savedPreferences: DEFAULT_EDITOR_PREFERENCES,
  setPreferences: () => undefined,
  setPreview: () => undefined,
});

export function EditorPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [savedPreferences, setPreferencesState] = useState<EditorPreferences>(DEFAULT_EDITOR_PREFERENCES);
  // Vista previa en vivo mientras el modal de apariencia está abierto (no se guarda).
  const [preview, setPreview] = useState<EditorPreferences | null>(null);
  const preferences = preview ?? savedPreferences;

  // Se lee después de montar para no desincronizar el render del servidor con el del cliente.
  useEffect(() => {
    setPreferencesState(readStoredPreferences()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const setPreferences = useCallback((next: EditorPreferences) => {
    setPreferencesState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Sin almacenamiento disponible (modo privado, etc.): la preferencia dura solo esta sesión.
    }
  }, []);

  return (
    <EditorPreferencesContext.Provider value={{ preferences, savedPreferences, setPreferences, setPreview }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export const useEditorPreferences = () => useContext(EditorPreferencesContext);
