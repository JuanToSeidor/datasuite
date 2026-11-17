"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TExtractionNode } from "@/lib/move/jobs/types";
import ExtractionNodesLibrary from "./ExtractionNodesLibrary";
import ControlNodesLibrary from "./ControlNodesLibrary";

interface EditWorkflowProps {
  extractionNodes: TExtractionNode[];
}

/** Pestaña "Nodos": librerías arrastrables al canvas. */
const EditWorkflow = ({ extractionNodes }: EditWorkflowProps) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-2.5">
      <ControlNodesLibrary />
      <ExtractionNodesLibrary extractionNodes={extractionNodes} />
    </div>
  );
};

export default EditWorkflow;
