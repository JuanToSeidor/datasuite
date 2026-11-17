"use client";

import React from "react";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

/** Nodos de control (por ahora solo el nodo de inicio), arrastrables al canvas. */
const ControlNodesLibrary = () => {
  const { t } = useLanguage();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("nodes/control", JSON.stringify({ type: "start" }));
    event.dataTransfer.setData("nodes/type", "control");
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-poppins text-sm font-semibold text-neutral-900">{t("moveJobsEditor.editor.controlNodes")}</p>
      <div className="flex w-full items-center border-y! border-neutral-300 px-1.5 py-2.5">
        <div
          className="relative flex h-16 w-16 cursor-grab items-center justify-center rounded-md border! border-dashed border-info-main bg-container p-2 text-info-main"
          draggable
          onDragStart={onDragStart}
        >
          <div className="absolute -right-[6px] h-3 w-3 rounded-full border! border-info-main bg-container" />
          <CaralIcon name="play" size={30} />
        </div>
      </div>
    </div>
  );
};

export default ControlNodesLibrary;
