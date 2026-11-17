"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TExtractionNode } from "@/lib/move/jobs/types";
import FilterNodes from "./FilterNodes";

interface ExtractionNodesLibraryProps {
  extractionNodes: TExtractionNode[];
}

/** Librería de nodos de extracción: se arrastran al canvas (solo los habilitados). */
const ExtractionNodesLibrary = ({ extractionNodes }: ExtractionNodesLibraryProps) => {
  const { t } = useLanguage();
  const [filterName, setFilterName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeData: string) => {
    event.dataTransfer.setData("nodes/extraction", nodeData);
    event.dataTransfer.setData("nodes/type", "extraction");
    event.dataTransfer.effectAllowed = "move";
  };

  const filteredNodes = extractionNodes.filter((node) => node.name.toLowerCase().includes(filterName.toLowerCase()));

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-poppins text-sm font-semibold text-neutral-900">{t("moveJobsEditor.editor.library.title")}</p>

      <FilterNodes setFilterName={setFilterName} isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} />

      <div className="flex w-full flex-col gap-2.5 border-y! border-neutral-300 px-1.5 py-2.5">
        {filteredNodes.length > 0 ? (
          filteredNodes.map((extractionNode) => {
            const isEnabled = extractionNode.status === "enabled";
            return (
              <div
                key={extractionNode.extraction_node_id}
                className={`relative flex w-full items-center justify-center rounded-md bg-seidor-main p-2.5 text-white ${
                  isEnabled ? "cursor-grab opacity-100" : "cursor-not-allowed opacity-50"
                }`}
                draggable={isEnabled}
                onDragStart={(event) => onDragStart(event, JSON.stringify(extractionNode))}
              >
                <div className="absolute -left-[6px] h-3 w-3 rounded-full border! border-seidor-main bg-neutral-100" />
                <p className="text-center font-poppins text-sm text-white">{extractionNode.name}</p>
                <div className="absolute -right-[6px] h-3 w-3 rounded-full border! border-seidor-main bg-neutral-100" />
              </div>
            );
          })
        ) : (
          <p className="text-center font-poppins text-sm text-neutral-800">{t("moveJobsEditor.editor.library.empty")}</p>
        )}
      </div>
    </div>
  );
};

export default ExtractionNodesLibrary;
