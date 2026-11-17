"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { CaralIcon } from "@/components/icons";
import { useExecutionActive } from "./ExecutionContext";
import { TRIGGER_COLOR_CLASSES, useEditorPreferences } from "../EditorPreferences";

const styleHandle: React.CSSProperties = {
  background: "var(--color-neutral-800)",
  border: "2px solid var(--color-neutral-100)",
  padding: "8px",
  right: "-9px",
};

/** Nodo de control que marca el inicio del flujo. Se "llena" mientras la ejecución arranca/corre. */
const StartNodeFlow = () => {
  const executionActive = useExecutionActive();
  const status = executionActive?.status;
  const isRunning = status === "running" || status === "initiated";
  // Color elegido en "Personalizar apariencia" (por defecto info).
  const color = TRIGGER_COLOR_CLASSES[useEditorPreferences().preferences.triggerColor];

  const fillClass = !executionActive
    ? "w-0 rounded-md bg-transparent"
    : status === "running"
      ? `w-full rounded-md ${color.solid}`
      : status === "initiated"
        ? `w-1/2 rounded-l-md ${color.solid}`
        : "w-0";

  return (
    <>
      <div
        className={`relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-md border! ${color.border} p-2 ${isRunning ? color.soft : color.solid}`}
      >
        <div className={`absolute left-0 top-0 h-full transition-all duration-1000 ${fillClass}`} />
        <span className="z-20 flex text-white">
          <CaralIcon name="play" size={30} />
        </span>
      </div>
      <Handle id="b" style={styleHandle} type="source" position={Position.Right} />
    </>
  );
};

export default StartNodeFlow;
