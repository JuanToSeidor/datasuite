"use client";

import React, { useEffect, useState } from "react";
import { ConfirmationModal } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJobsStore } from "@/components/move/jobs/JobsStore";

interface ConfirmDeleteNodeProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  handleDeleteWorkflow: (id: string | null) => void;
  selectedNodeId: string | null;
}

/** Confirmación para quitar un nodo del workflow (el cambio queda pendiente hasta guardar). */
const ConfirmDeleteNode = ({ isOpen, setIsOpen, handleDeleteWorkflow, selectedNodeId }: ConfirmDeleteNodeProps) => {
  const { t } = useLanguage();
  const { notify } = useJobsStore();
  // Barra superior que se llena al abrir (en datasync era una franja roja animada).
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => setProgress(100), 100);
    return () => {
      clearTimeout(timer);
      setProgress(0);
    };
  }, [isOpen]);

  const handleDeleteNode = () => {
    try {
      handleDeleteWorkflow(selectedNodeId);
      setIsOpen(false);
    } catch {
      notify("danger", t("moveJobsEditor.workflow.confirmDelete.error"));
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      status="error"
      progress={progress}
      title={t("moveJobsEditor.workflow.confirmDelete.sure")}
      description={t("moveJobsEditor.workflow.confirmDelete.desc")}
      cancelText={t("moveJobsEditor.common.cancel")}
      confirmText={t("moveJobsEditor.common.delete")}
      onConfirm={handleDeleteNode}
    />
  );
};

export default ConfirmDeleteNode;
