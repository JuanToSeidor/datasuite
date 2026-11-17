"use client";

import React, { useState } from "react";
import { Modal, Toggle } from "caralstable";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJob } from "@/lib/move/jobs/types";
import type { TPermissionsJob } from "./permissions";

interface DisableJobModalProps {
  job: TJob;
  handleStatusJob: (jobId: string, status: "enable" | "disable") => void;
  permissionsJobs: TPermissionsJob;
}

/**
 * Clases para el Modal de Caral cuando la confirmación no es válida: atenúa y bloquea el botón principal
 * (el último del footer), ya que `Modal` no expone `disabled` para su acción primaria.
 */
export const LOCKED_PRIMARY_CLASS =
  "[&>div:last-child>button:last-child]:pointer-events-none [&>div:last-child>button:last-child]:opacity-50";

/** Toggle "Job deshabilitado" + modal que pide escribir el nombre del job para deshabilitarlo/habilitarlo. */
const DisableJobModal = ({ job, handleStatusJob, permissionsJobs }: DisableJobModalProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState("");
  const isEnabled = job.status === "enabled";
  const isConfirmed = key === job.name;

  const close = () => {
    setIsOpen(false);
    setKey("");
  };

  return (
    <>
      <Toggle
        disabled={!permissionsJobs?.editJob}
        checked={job?.status !== "enabled"}
        onChange={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={isEnabled ? t("moveJobsEditor.disableJob.disableTitle") : t("moveJobsEditor.disableJob.enableTitle")}
        iconName={isEnabled ? "lock" : "lockOpen"}
        chipVariant="warning"
        actions="double"
        secondaryActionText={t("moveJobsEditor.common.cancel")}
        primaryActionText={
          isEnabled ? t("moveJobsEditor.disableJob.confirmDisable") : t("moveJobsEditor.disableJob.confirmEnable")
        }
        primaryActionVariant="danger"
        className={isConfirmed ? "" : LOCKED_PRIMARY_CLASS}
        onPrimaryAction={() => {
          if (!isConfirmed) return;
          handleStatusJob(job.job_id, isEnabled ? "disable" : "enable");
          close();
        }}
      >
        <div className="flex flex-col gap-4 font-poppins text-sm text-neutral-900">
          <div>
            <span className="block font-semibold">{t("moveJobsEditor.disableJob.sure")}</span>
            <p>
              {t("moveJobsEditor.disableJob.p1")}
              <span className="font-semibold">{t("moveJobsEditor.disableJob.can")}</span>
              {isEnabled ? t("moveJobsEditor.disableJob.disableP2") : t("moveJobsEditor.disableJob.enableP2")}
              <span className="font-semibold text-info-main"> {job.name}</span>
              {isEnabled ? t("moveJobsEditor.disableJob.disableP3") : t("moveJobsEditor.disableJob.enableP3")}
            </p>
          </div>
          <Input
            label={t("moveJobsEditor.disableJob.confirmLabel")}
            value={key}
            onChange={(e) => setKey(e.currentTarget.value)}
            placeholder={t("moveJobsEditor.disableJob.confirmPlaceholder").replace("{name}", job.name)}
          />
        </div>
      </Modal>
    </>
  );
};

export default DisableJobModal;
