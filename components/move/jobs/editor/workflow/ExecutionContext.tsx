"use client";

import { createContext, useContext } from "react";
import type { TExecution } from "@/lib/move/jobs/types";

/**
 * Ejecución activa del job que se está editando. En datasync cada nodo del canvas la leía de la
 * caché de RTK Query (`getExecutionActiveByJobId`); aquí la página la publica por contexto.
 */
export const ExecutionActiveContext = createContext<TExecution | null>(null);

export const useExecutionActive = () => useContext(ExecutionActiveContext);
