"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import workspacesData from "@/data/workspaces.json";

/**
 * Workspace activo de la suite, compartido entre el Sidebar (que lo cambia) y los módulos
 * (que lo leen). En esta demo el workspace también simula el rol y el momento de uso de
 * cada módulo mediante `scenarios` (p. ej. `scenarios.preserve`), sin tocar el sistema de roles.
 */
export type Workspace = (typeof workspacesData.workspaces)[number] & {
  /** Escenario simulado por módulo (id del branch → escenario). */
  scenarios?: Record<string, string>;
};

const STORAGE_KEY = "suite_workspace";
const workspaces = workspacesData.workspaces as Workspace[];

interface WorkspaceContextValue {
  workspaces: Workspace[];
  selectedWorkspace: Workspace;
  setSelectedWorkspaceId: (id: string) => void;
  /** false hasta leer el workspace guardado: evita redirecciones con el valor por defecto. */
  isReady: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string>(workspaces[0]?.id ?? "default");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && workspaces.some((w) => w.id === saved)) setSelectedId(saved);
    } catch {
      /* sin storage: se queda el workspace por defecto */
    }
    setIsReady(true);
  }, []);

  const setSelectedWorkspaceId = useCallback((id: string) => {
    setSelectedId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces,
      selectedWorkspace: workspaces.find((w) => w.id === selectedId) ?? workspaces[0],
      setSelectedWorkspaceId,
      isReady,
    }),
    [selectedId, setSelectedWorkspaceId, isReady],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace debe usarse dentro de <WorkspaceProvider>");
  return ctx;
}

/** Escenario simulado del módulo `branchId` según el workspace activo (undefined si no define uno). */
export function useBranchScenario(branchId: string): string | undefined {
  return useWorkspace().selectedWorkspace.scenarios?.[branchId];
}
