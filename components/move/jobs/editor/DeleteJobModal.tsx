"use client";

import React, { useState } from "react";
import { Button, Modal } from "caralstable";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJob } from "@/lib/move/jobs/types";
import { LOCKED_PRIMARY_CLASS } from "./DisableJobModal";

interface DeleteJobModalProps {
  job: TJob;
  handleDeleteJob: (jobId: string) => void;
}

/** Botón "Eliminar" + modal que pide escribir el nombre del job para borrarlo definitivamente. */
const DeleteJobModal = ({ job, handleDeleteJob }: DeleteJobModalProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState("");
  const isConfirmed = key === job.name;

  const close = () => {
    setIsOpen(false);
    setKey("");
  };

  return (
    <>
      <Button variant="danger" size="sm" iconName="trash" className="w-fit" onClick={() => setIsOpen(true)}>
        {t("moveJobsEditor.common.delete")}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={t("moveJobsEditor.deleteJob.title")}
        iconName="trash"
        chipVariant="danger"
        actions="double"
        secondaryActionText={t("moveJobsEditor.common.cancel")}
        primaryActionText={t("moveJobsEditor.deleteJob.confirm")}
        primaryActionVariant="danger"
        className={isConfirmed ? "" : LOCKED_PRIMARY_CLASS}
        onPrimaryAction={() => {
          if (!isConfirmed) return;
          handleDeleteJob(job.job_id);
          close();
        }}
      >
        <div className="flex flex-col gap-4 font-poppins text-sm text-neutral-900">
          <p>
            <span className="block font-semibold">{t("moveJobsEditor.deleteJob.sure")}</span>
            {t("moveJobsEditor.deleteJob.p1")}
            <span className="font-semibold">{t("moveJobsEditor.deleteJob.cannot")}</span>
            {t("moveJobsEditor.deleteJob.p2")}
            <span className="font-semibold text-info-main">{job.name}</span>{" "}
            {t("moveJobsEditor.deleteJob.p3")}
          </p>
          <Input
            label={t("moveJobsEditor.deleteJob.confirmLabel")}
            value={key}
            onChange={(e) => setKey(e.currentTarget.value)}
            placeholder={t("moveJobsEditor.deleteJob.confirmPlaceholder").replace("{name}", job.name)}
          />
        </div>
      </Modal>
    </>
  );
};

export default DeleteJobModal;
