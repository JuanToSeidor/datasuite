"use client";

import React, { useState } from "react";
import { Button } from "caralstable";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJobsStore } from "@/components/move/jobs/JobsStore";
import type { TJob } from "@/lib/move/jobs/types";

/**
 * Pestaña "Exportar": descarga el job como JSON. En datasync el backend armaba el archivo
 * (`POST jobs/{id}/export/`); aquí se arma en el cliente con el job y sus nodos de extracción.
 */
const ExportWorkflow = ({ job }: { job: TJob }) => {
  const { t } = useLanguage();
  const { extractionNodes, notify } = useJobsStore();
  const [fileName, setFileName] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const usedIds = new Set(job.workflow_detail.nodes.map((n) => n.data?.extractionNodeId).filter(Boolean));
      const payload = {
        ...job,
        extraction_nodes: extractionNodes.filter((n) => usedIds.has(n.extraction_node_id)),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName || "export"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      notify("danger", String(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-1">
        <p className="font-poppins text-xs text-neutral-800">{t("moveJobsEditor.editor.export.desc")}</p>
        <Input
          containerClassName="mt-2"
          label={t("moveJobsEditor.editor.export.name")}
          placeholder={t("moveJobsEditor.editor.export.placeholder")}
          value={fileName}
          onChange={(e) => setFileName(e.currentTarget.value)}
        />
        <p className="font-poppins text-xs text-neutral-800">{t("moveJobsEditor.editor.export.path")}</p>
      </div>
      <div className="flex justify-end">
        <Button variant="default" iconName="fileDown" className="mt-3" isLoading={isExporting} disabled={isExporting} onClick={handleExport}>
          {t("moveJobsEditor.editor.export.button")}
        </Button>
      </div>
    </div>
  );
};

export default ExportWorkflow;
