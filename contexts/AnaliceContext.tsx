"use client";

import { createContext, useContext } from "react";

interface AnaliceContextValue {
  isAnaliceOpen: boolean;
  toggleAnalice: () => void;
}

// Estado del panel Analice que vive en DashboardLayout. Permite que cualquier
// pantalla lo abra o cierre igual que el botón "Analice" del navbar.
export const AnaliceContext = createContext<AnaliceContextValue>({
  isAnaliceOpen: false,
  toggleAnalice: () => {},
});

export function useAnalice() {
  return useContext(AnaliceContext);
}
