"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type {
  TExecution,
  TExtractionNode,
  TJob,
  TJobInput,
  TScheduleConfig,
  TWorkflowConfig,
} from "@/lib/move/jobs/types";
import ConfigWorkflow from "./ConfigWorkflow";
import EditWorkflow from "./EditWorkflow";
import ControlWorkflow from "./ControlWorkflow";
import ExportWorkflow from "./ExportWorkflow";
import type { JobEditorSection } from "./JobEditorSidebar";
import type { TPermissionsJob } from "./permissions";
import { useEditorPreferences } from "./EditorPreferences";

interface PanelWorkflowProps {
  section: JobEditorSection;
  job: TJob;
  extractionNodes: TExtractionNode[];
  handleUpdateJob: (jobId: string, data: TJobInput) => void;
  handleUpdateConfigWorkflow: (config: TWorkflowConfig) => void;
  handleAddSchedule: (cron: string, repeat: string) => void;
  handleStatusSchedule: (data: TScheduleConfig, status: string) => void;
  handleDeleteSchedule: (scheduleId: string) => void;
  handleDeleteJob: (jobId: string) => void;
  handleStatusJob: (jobId: string, status: "enable" | "disable") => void;
  permissionsJobs: TPermissionsJob;
  isEqualWorkflow: boolean;
  executionActive: TExecution | null;
  onOpenExternalTrigger: () => void;
}

const SECTION_TITLE_KEY: Record<JobEditorSection, string> = {
  config: "moveJobsEditor.editor.controlPanelTitle",
  triggers: "moveJobsEditor.editor.panel.triggersTitle",
  nodes: "moveJobsEditor.editor.editPanelTitle",
  export: "moveJobsEditor.editor.export.title",
};

/** Panel lateral del editor con la sección elegida en el sidebar del job. Se bloquea mientras corre una ejecución. */
const PanelWorkflow = ({
  section,
  job,
  extractionNodes,
  handleUpdateJob,
  handleUpdateConfigWorkflow,
  handleAddSchedule,
  handleDeleteSchedule,
  handleStatusSchedule,
  handleStatusJob,
  handleDeleteJob,
  permissionsJobs,
  isEqualWorkflow,
  executionActive,
  onOpenExternalTrigger,
}: PanelWorkflowProps) => {
  const { t } = useLanguage();
  const { preferences } = useEditorPreferences();
  const isRunning = executionActive?.status === "running" || executionActive?.status === "initiated";

  return (
    <aside
      className={`relative flex w-[363px] shrink-0 flex-col gap-2.5 self-stretch overflow-y-auto p-2.5 transition-opacity ${
        preferences.sidebarTheme === "simple" ? "bg-container-50" : "bg-container"
      } ${
        isRunning ? "opacity-20" : "opacity-100"
      }`}
      aria-busy={isRunning}
    >
      {isRunning && <div className="absolute inset-0 z-20 cursor-not-allowed bg-transparent" />}

      <div className="flex min-h-[46px] items-center">
        <h2 className="font-poppins text-xl font-semibold tracking-tight text-seidor-main-text">
          {t(SECTION_TITLE_KEY[section])}
        </h2>
      </div>
      <div className="h-px w-full shrink-0 bg-neutral-500" />

      <div className="flex flex-col pt-1">
        {section === "config" && (
          <ConfigWorkflow
            job={job}
            handleUpdateJob={handleUpdateJob}
            handleUpdateConfigWorkflow={handleUpdateConfigWorkflow}
            handleDeleteJob={handleDeleteJob}
            handleStatusJob={handleStatusJob}
            permissionsJobs={permissionsJobs}
          />
        )}
        {section === "triggers" && (
          <ControlWorkflow
            job={job}
            handleAddSchedule={handleAddSchedule}
            handleDeleteSchedule={handleDeleteSchedule}
            handleStatusSchedule={handleStatusSchedule}
            permissionsJobs={permissionsJobs}
            isEqualWorkflow={isEqualWorkflow}
            onOpenExternalTrigger={onOpenExternalTrigger}
          />
        )}
        {section === "nodes" && <EditWorkflow extractionNodes={extractionNodes} />}
        {section === "export" && <ExportWorkflow job={job} />}
      </div>
    </aside>
  );
};

export default PanelWorkflow;
