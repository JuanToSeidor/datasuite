"use client";

import React, { useState } from "react";
import { Toggle } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJob, TJobInput, TWorkflowConfig } from "@/lib/move/jobs/types";
import EditJobName from "./EditJobName";
import DisableJobModal from "./DisableJobModal";
import DeleteJobModal from "./DeleteJobModal";
import type { TPermissionsJob } from "./permissions";

interface ConfigWorkflowProps {
  job: TJob;
  handleUpdateJob: (jobId: string, data: TJobInput) => void;
  handleUpdateConfigWorkflow: (config: TWorkflowConfig) => void;
  handleDeleteJob: (jobId: string) => void;
  handleStatusJob: (jobId: string, status: "enable" | "disable") => void;
  permissionsJobs: TPermissionsJob;
}

/** Sección "Config" del editor: nombre del job, stopOnError, deshabilitar y eliminar. */
const ConfigWorkflow = ({
  job,
  handleUpdateJob,
  handleUpdateConfigWorkflow,
  handleDeleteJob,
  handleStatusJob,
  permissionsJobs,
}: ConfigWorkflowProps) => {
  const { t } = useLanguage();
  const [isStopOnError, setIsStopOnError] = useState(Boolean(job?.workflow_detail?.config?.stopOnError));

  return (
    <div className="flex flex-col gap-7">
      <EditJobName job={job} handleUpdateJob={handleUpdateJob} permissionsJobs={permissionsJobs} />

      <div className="flex items-center gap-2">
        <span className="shrink-0">
          <Toggle
            disabled={!permissionsJobs?.editJob}
            checked={isStopOnError}
            onChange={(status) => {
              setIsStopOnError(status);
              handleUpdateConfigWorkflow({ stopOnError: status });
            }}
          />
        </span>
        <span className="font-poppins text-sm font-medium text-neutral-800">{t("moveJobsEditor.editor.config.stopOnError")}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0">
          <DisableJobModal handleStatusJob={handleStatusJob} job={job} permissionsJobs={permissionsJobs} />
        </span>
        <span className="font-poppins text-sm font-medium text-neutral-800">{t("moveJobsEditor.editor.config.disabledJob")}</span>
      </div>

      {permissionsJobs?.deleteJob && (
        <div className="flex flex-col gap-2.5 border-t! border-neutral-300 pt-5">
          <div className="flex flex-col">
            <h3 className="font-poppins text-xl font-semibold tracking-tight text-seidor-main-text">
              {t("moveJobsEditor.editor.config.dangerZone")}
            </h3>
            <p className="font-poppins text-base text-neutral-800">{t("moveJobsEditor.editor.config.dangerZoneDesc")}</p>
          </div>
          <DeleteJobModal handleDeleteJob={handleDeleteJob} job={job} />
        </div>
      )}
    </div>
  );
};

export default ConfigWorkflow;
