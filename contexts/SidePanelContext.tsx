"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface SidePanelOptions {
  /** Ancho del panel en escritorio (px). Por defecto 360. */
  width?: number;
}

interface SidePanelContextValue {
  isSidePanelOpen: boolean;
  /** Panel a pantalla completa (como el panel Analyze expandido). */
  isSidePanelExpanded: boolean;
  openSidePanel: (content: ReactNode, options?: SidePanelOptions) => void;
  closeSidePanel: () => void;
  toggleSidePanelExpand: () => void;
}

// Panel lateral derecho de alto completo que vive en DashboardLayout (igual que
// el panel Analice). Cada página decide qué contenido mostrar en él.
export const SidePanelContext = createContext<SidePanelContextValue>({
  isSidePanelOpen: false,
  isSidePanelExpanded: false,
  openSidePanel: () => {},
  closeSidePanel: () => {},
  toggleSidePanelExpand: () => {},
});

export function useSidePanel() {
  return useContext(SidePanelContext);
}
