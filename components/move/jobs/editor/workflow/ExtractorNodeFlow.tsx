"use client";

import React from "react";
import { Handle, Position, useStore, type NodeProps, type ReactFlowState } from "@xyflow/react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TNodeWorkflow } from "@/lib/move/jobs/types";
import { useExecutionActive } from "./ExecutionContext";

const styleHandleLeft: React.CSSProperties = {
  background: "var(--color-neutral-100)",
  border: "1px solid var(--color-neutral-800)",
  padding: "9px",
  left: "-9px",
  zIndex: 10,
};

const styleHandleRight: React.CSSProperties = {
  background: "var(--color-neutral-100)",
  border: "1px solid var(--color-neutral-800)",
  padding: "9px",
  right: "-9px",
};

/** Barra de progreso del nodo según su estado en la ejecución activa. */
const PROGRESS_CLASS: Record<string, string> = {
  running: "w-1/2 rounded-l-md bg-seidor-hard",
  completed: "w-full rounded-md bg-success-main",
  failed: "w-full rounded-md bg-danger-main",
  nodata: "w-full rounded-md border! border-seidor-main bg-neutral-100",
  skipped: "w-full rounded-md bg-warning-main",
  cancelled: "w-full rounded-md bg-warning-main",
  pending: "w-full bg-transparent",
};

/** Nodo de extracción del workflow: una sola conexión de entrada, muestra validez, variables y estado de ejecución. */
const ExtractorNodeFlow = ({ id, data }: NodeProps<TNodeWorkflow>) => {
  const { t } = useLanguage();
  const executionActive = useExecutionActive();

  // Solo se permite una conexión entrante por nodo (igual que en datasync).
  const isHandleConnectable = useStore((s: ReactFlowState) => !s.edges.some((edge) => edge.target === id));

  const nodeDetails = executionActive?.details?.nodes?.[id];
  const variables = (data?.variables as string[] | undefined) ?? [];
  const hasMissingVariables = variables.length > 0;
  const hasExecution = Boolean(executionActive?.status);

  const baseBg = !data.isValid
    ? hasExecution
      ? "bg-danger-main/40"
      : "bg-danger-main"
    : hasMissingVariables
      ? hasExecution
        ? "bg-neutral-800/40"
        : "bg-neutral-800"
      : hasExecution
        ? "bg-seidor-main/40"
        : "bg-seidor-main";

  return (
    <>
      <Handle id="a" style={styleHandleLeft} isConnectable={isHandleConnectable} type="target" position={Position.Left} />

      <div
        className={`relative flex min-w-[200px] max-w-[400px] items-center justify-center rounded-md p-2 px-4 text-white ${baseBg} ${
          data.error ? "border-2! border-danger-main" : ""
        }`}
      >
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
            nodeDetails?.status ? (PROGRESS_CLASS[nodeDetails.status] ?? "") : ""
          }`}
        />
        <p
          className={`z-10 text-center font-poppins text-sm ${
            nodeDetails?.status === "nodata" ? "text-seidor-main" : "text-white"
          }`}
        >
          {hasMissingVariables && (
            <span className="mr-1 text-danger-main" title={t("moveJobsEditor.workflow.extractorNode.missingVariables")}>
              @
            </span>
          )}
          {data.label}
        </p>
      </div>

      <Handle id="b" style={styleHandleRight} type="source" position={Position.Right} />
    </>
  );
};

export default ExtractorNodeFlow;
