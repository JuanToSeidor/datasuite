"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJobsStore } from "@/components/move/jobs/JobsStore";
import { countJobsByName } from "@/lib/move/jobs/utils";
import type { TJob, TJobInput } from "@/lib/move/jobs/types";
import type { TPermissionsJob } from "./permissions";

interface EditJobNameProps {
  job: TJob;
  handleUpdateJob: (jobId: string, data: TJobInput) => void;
  permissionsJobs: TPermissionsJob;
}

/** Edición del nombre del job; si ya existe otro con el mismo nombre base, al salir agrega el sufijo " (n)". */
const EditJobName = ({ job, handleUpdateJob, permissionsJobs }: EditJobNameProps) => {
  const { t } = useLanguage();
  const { jobs } = useJobsStore();
  const [name, setName] = useState<string>(job?.name || "");
  const numberOfJobsWithSameName = countJobsByName(jobs, name, job.job_id);

  return (
    <div className="flex flex-col gap-y-1.5">
      <Input
        id="job-name"
        label={t("moveJobsEditor.editor.jobName")}
        disabled={!permissionsJobs?.editJob}
        maxLength={50}
        value={name}
        placeholder={name}
        onChange={(e) => setName(e.currentTarget.value)}
        onBlur={() => {
          const nameJob = numberOfJobsWithSameName > 0 ? `${name} (${numberOfJobsWithSameName + 1})` : name;
          setName(nameJob);
          handleUpdateJob(job.job_id, { name: nameJob });
        }}
      />
      {numberOfJobsWithSameName > 0 && (
        <p className="font-poppins text-sm text-danger-main">{t("moveJobsEditor.editor.duplicateName")}</p>
      )}
    </div>
  );
};

export default EditJobName;
