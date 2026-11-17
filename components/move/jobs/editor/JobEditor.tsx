"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createUUID, useJobsStore } from "@/components/move/jobs/JobsStore";
import type { TExtractionNodesJobInput, TJobInput, TScheduleConfig, TWorkflowConfig } from "@/lib/move/jobs/types";
import PanelWorkflow from "./PanelWorkflow";
import { JobEditorSidebar, type JobEditorSection } from "./JobEditorSidebar";
import { EditorPreferencesProvider, useEditorPreferences } from "./EditorPreferences";
import { EditorAppearanceModal } from "./EditorAppearanceModal";
import Workflow from "./workflow/Workflow";
import { DEMO_PERMISSIONS_JOBS, type TPermissionsJob } from "./permissions";

/** A dónde volver si el job no existe o se elimina: el listado de jobs (como en datasync). */
const EXIT_ROUTE = "/move/jobs";

const errorMessage = (fallback: string) => (err: unknown) => (err instanceof Error && err.message) || fallback;
const ignore = () => undefined;

interface JobEditorProps {
  jobId: string;
  permissionsJobs?: TPermissionsJob;
}

/** Editor de un job de Move (port de datasync `move/jobs/[jobId]/edit/page.tsx`). */
export default function JobEditor(props: JobEditorProps) {
  return (
    <EditorPreferencesProvider>
      <JobEditorContent {...props} />
    </EditorPreferencesProvider>
  );
}

function JobEditorContent({ jobId, permissionsJobs = DEMO_PERMISSIONS_JOBS }: JobEditorProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const store = useJobsStore();
  const { extractionNodes, executions, notify, notifyPromise } = store;
  const jobData = store.getJob(jobId);

  /**
   * Ejecución "activa" del editor (en datasync: caché de `getExecutionActiveByJobId`). Arranca con la
   * ejecución en curso del job, si la hay; al cerrar el resumen de una ejecución terminada se descarta.
   */
  const [executionActiveId, setExecutionActiveId] = useState<string | null>(() => {
    const active = store.getActiveExecution(jobId);
    return active && (active.status === "initiated" || active.status === "running") ? active.execution_id : null;
  });
  const executionActive = useMemo(
    () => executions.find((execution) => execution.execution_id === executionActiveId) || null,
    [executions, executionActiveId]
  );

  const [isStartingJob, setIsStartingJob] = useState(false);
  // Arranca con el panel cerrado: el canvas ocupa todo el ancho (diseño "Jobs" en Figma).
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<JobEditorSection>("config");
  // Drawer de triggers externos: lo abren el rayo de la barra y la tarjeta "External Trigger".
  const [isTriggersOpen, setIsTriggersOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const { preferences } = useEditorPreferences();

  /** Ítem del sidebar: abre su sección; si ya está abierta, cierra el panel. */
  const handleSelectSection = (section: JobEditorSection) => {
    if (isPanelOpen && section === activeSection) {
      setIsPanelOpen(false);
      return;
    }
    setActiveSection(section);
    setIsPanelOpen(true);
  };
  const [isValidWorkflow, setIsValidWorkflow] = useState<boolean>(true);
  const [isEqualWorkflow, setIsEqualWorkflow] = useState(false);

  useEffect(() => {
    if (!jobData || jobData.is_deleted) router.push(EXIT_ROUTE);
  }, [jobData, router]);

  const handleAddSchedule = (cron: string, repeat: string) => {
    const data: TScheduleConfig = {
      id: createUUID(),
      cron_expression: cron,
      status: "enabled",
      repeat,
      time_zone_client: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    notifyPromise(store.addSchedule(jobId, data), {
      success: t("moveJobsEditor.editor.toast.scheduleAdded"),
      error: errorMessage(t("moveJobsEditor.editor.toast.scheduleAddError")),
    }).catch(ignore);
  };

  const handleRunJob = async (id: string) => {
    setIsStartingJob(true);
    try {
      const execution = await store.runJob(id);
      setExecutionActiveId(execution.execution_id);
      notify("success", t("moveJobsEditor.editor.toast.started"));
    } catch (error) {
      // datasync mostraba el mensaje del backend (`error.data.message`)
      notify("danger", errorMessage(String(error))(error));
    } finally {
      setIsStartingJob(false);
    }
  };

  const handleCancelExecution = async (executionId: string) => {
    try {
      await store.cancelExecution(executionId);
      notify("success", t("moveJobsEditor.editor.toast.canceled"));
    } catch {
      notify("danger", t("moveJobsEditor.editor.toast.cancelError"));
    }
  };

  const handleCloseCompletedExecution = useCallback(() => setExecutionActiveId(null), []);

  const handleUpdateJob = (id: string, data: TJobInput) => {
    notifyPromise(store.updateJob(id, data), {
      success: t("moveJobsEditor.editor.toast.jobUpdated"),
      error: t("moveJobsEditor.editor.toast.jobUpdateError"),
    }).catch(ignore);
  };

  const handleUpdateWorkflow = (data: TExtractionNodesJobInput) => {
    notifyPromise(store.updateWorkflow(data), {
      success: t("moveJobsEditor.editor.toast.workflowUpdated"),
      error: t("moveJobsEditor.editor.toast.workflowUpdateError"),
    }).catch(ignore);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    notifyPromise(store.deleteSchedule(jobId, scheduleId), {
      success: t("moveJobsEditor.editor.toast.scheduleDeleted"),
      error: t("moveJobsEditor.editor.toast.scheduleDeleteError"),
    }).catch(ignore);
  };

  const handleStatusSchedule = (data: TScheduleConfig, status: string) => {
    const disabling = status === "disabled";
    notifyPromise(store.updateSchedule(jobId, data), {
      success: disabling ? t("moveJobsEditor.editor.toast.scheduleStopped") : t("moveJobsEditor.editor.toast.scheduleResumed"),
      error: errorMessage(
        disabling ? t("moveJobsEditor.editor.toast.scheduleStopError") : t("moveJobsEditor.editor.toast.scheduleResumeError")
      ),
    }).catch(ignore);
  };

  const handleUpdateConfigWorkflow = (config: TWorkflowConfig) => {
    notifyPromise(store.updateConfigWorkflow(jobId, config), {
      success: t("moveJobsEditor.editor.toast.configUpdated"),
      error: t("moveJobsEditor.editor.toast.configUpdateError"),
    }).catch(ignore);
  };

  const handleDeleteJob = (id: string) => {
    notifyPromise(store.deleteJob(id), {
      success: () => {
        router.push(EXIT_ROUTE);
        return t("moveJobsEditor.editor.toast.jobDeleted");
      },
      error: t("moveJobsEditor.editor.toast.jobDeleteError"),
    }).catch(ignore);
  };

  const handleStatusJob = (id: string, action: "enable" | "disable") => {
    const disabling = action === "disable";
    notifyPromise(store.changeStatusJob(id, disabling ? "disabled" : "enabled"), {
      success: disabling ? t("moveJobsEditor.editor.toast.jobDisabled") : t("moveJobsEditor.editor.toast.jobEnabled"),
      error: disabling ? t("moveJobsEditor.editor.toast.jobDisableError") : t("moveJobsEditor.editor.toast.jobEnableError"),
    }).catch(ignore);
  };

  if (!jobData) return null;

  return (
    // Con la barra a la derecha se invierte el orden: canvas · panel · barra.
    <div className={`relative flex h-full min-h-0 w-full ${preferences.sidebarPosition === "right" ? "flex-row-reverse" : ""}`}>
      <JobEditorSidebar
        activeSection={activeSection}
        isPanelOpen={isPanelOpen}
        onSelect={handleSelectSection}
        onSettings={() => setIsAppearanceOpen(true)}
        theme={preferences.sidebarTheme}
      />

      {/* Se monta solo abierto para que el borrador arranque de las preferencias guardadas. */}
      {isAppearanceOpen && <EditorAppearanceModal isOpen onClose={() => setIsAppearanceOpen(false)} />}

      {isPanelOpen && (
        <PanelWorkflow
          section={activeSection}
          job={jobData}
          extractionNodes={extractionNodes}
          handleUpdateJob={handleUpdateJob}
          handleUpdateConfigWorkflow={handleUpdateConfigWorkflow}
          handleAddSchedule={handleAddSchedule}
          handleDeleteSchedule={handleDeleteSchedule}
          handleStatusSchedule={handleStatusSchedule}
          handleDeleteJob={handleDeleteJob}
          handleStatusJob={handleStatusJob}
          permissionsJobs={permissionsJobs}
          isEqualWorkflow={isEqualWorkflow}
          executionActive={executionActive}
          onOpenExternalTrigger={() => setIsTriggersOpen(true)}
        />
      )}

      <ReactFlowProvider>
        <Workflow
          key={jobData.job_id}
          handleUpdateWorkflow={handleUpdateWorkflow}
          handleUpdateJob={handleUpdateJob}
          handleRunJob={handleRunJob}
          isStartingJob={isStartingJob}
          job={jobData}
          extractionNodes={extractionNodes}
          setIsValidWorkflow={setIsValidWorkflow}
          isValidWorkflow={isValidWorkflow}
          setIsEqualWorkflow={setIsEqualWorkflow}
          isEqualWorkflow={isEqualWorkflow}
          permissionsJobs={permissionsJobs}
          executionActive={executionActive}
          handleCancelExecution={handleCancelExecution}
          handleCloseCompletedExecution={handleCloseCompletedExecution}
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen((open) => !open)}
          isTriggersOpen={isTriggersOpen}
          onTriggersOpenChange={setIsTriggersOpen}
        />
      </ReactFlowProvider>
    </div>
  );
}
