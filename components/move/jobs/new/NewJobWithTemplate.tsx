"use client";

/**
 * Asistente "crear jobs desde plantilla" de Move, portado de datasync
 * (`app/(app)/move/jobs/new/page.tsx`): Configuración → Plantilla → Sincronización → Resumen.
 * Arma los nodos y jobs a partir de la plantilla y los crea con el store mock de jobs.
 */
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Steps } from "caralstable";
import { CURRENT_USER, CURRENT_WORKSPACE_ID, useJobsStore } from "@/components/move/jobs/JobsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJobTemplate } from "@/lib/move/jobs/types";
import Resume from "./Resume";
import SettingsEdit from "./SettingsEdit";
import Sync from "./Sync";
import TemplateSelect from "./TemplateSelect";
import {
  NOT_LIMIT,
  getTemplateNodeSourceName,
  type DestinationConfig,
  type JobSystem,
  type TemplateJobDraft,
  type TemplateNodeDraft,
} from "./types";

const LAST_STEP = 3;

export default function NewJobWithTemplate() {
  const { t } = useLanguage();
  const router = useRouter();
  const { createJobsWithTemplate, notify, notifyPromise } = useJobsStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(NOT_LIMIT);
  const [template, setTemplate] = useState<TJobTemplate | null>(null);
  const [selectedSystemSource, setSelectedSystemSource] = useState<JobSystem | null>(null);
  const [selectedSystemDestination, setSelectedSystemDestination] = useState<JobSystem | null>(null);
  const [destinationConfig, setDestinationConfig] = useState<DestinationConfig | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  // Evita el doble envío aunque el estado aún no se haya re-renderizado.
  const creatingRef = useRef(false);

  const isValid = () => {
    if (currentStep === 0) return name !== "" && limit !== "";
    if (currentStep === 1) return template !== null;
    if (currentStep === 2) {
      return selectedSystemDestination !== null && selectedSystemSource !== null && Boolean(destinationConfig?.type_file);
    }
    return true;
  };

  /** Igual que `formattedNodesTemplate` de datasync: un nodo por nodo de la plantilla. */
  const nodes = useMemo<TemplateNodeDraft[]>(() => {
    if (!template) return [];
    return template.nodes.map((node) => ({
      templateNodeId: node.templateNodeId,
      name: `${name} - TMP ${template.name} - ${getTemplateNodeSourceName(template, node)}`,
      origin: {
        name: selectedSystemSource?.name ?? "",
        type: selectedSystemSource?.type ?? template.type,
        brandName: selectedSystemSource?.brandName ?? "SAP",
      },
      destination: {
        name: selectedSystemDestination?.name ?? "",
        type: selectedSystemDestination?.type ?? "",
        brandName: selectedSystemDestination?.brandName ?? "",
      },
      transformation_config: {
        source: { ...node.source },
        destination: { ...destinationConfig },
        settings: { limit },
      },
      status: "enabled",
      is_deleted: false,
      created_by: CURRENT_USER,
      created_date: new Date(),
      modified_by: null,
      modified_date: null,
      workspace_id: CURRENT_WORKSPACE_ID,
      destination_id: selectedSystemDestination?.system_id,
      source_id: selectedSystemSource?.system_id,
    }));
  }, [template, name, limit, destinationConfig, selectedSystemSource, selectedSystemDestination]);

  /** Igual que `formattedJobsTemplate` de datasync: "{nombre} - TMP {plantilla} - #n". */
  const jobs = useMemo<TemplateJobDraft[]>(() => {
    if (!template) return [];
    return template.jobs.map((job, index) => ({
      workflow_detail: job.workflow_detail,
      name: `${name} - TMP ${template.name} - #${index + 1}`,
      status: "enabled",
      is_deleted: false,
      workspace_id: CURRENT_WORKSPACE_ID,
      created_by: CURRENT_USER,
      schedule_config: [],
    }));
  }, [template, name]);

  const handleCreateJobWithTemplate = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setIsCreatingJob(true);
    notify("info", t("moveJobsEditor.create.toast.creating"));
    try {
      const jobIds = await notifyPromise(createJobsWithTemplate({ nodes, jobs }), {
        success: t("moveJobsEditor.create.toast.created"),
        error: t("moveJobsEditor.create.toast.error"),
      });
      // La suite no tiene lista de jobs: se abre el editor del primer job creado.
      router.push(jobIds[0] ? `/move/jobs/editor/?id=${encodeURIComponent(jobIds[0])}` : "/move");
    } catch {
      creatingRef.current = false;
      setIsCreatingJob(false);
    }
  };

  const stepLabels = [
    t("moveJobsEditor.create.steps.settings"),
    t("moveJobsEditor.create.steps.template"),
    t("moveJobsEditor.create.steps.sync"),
    t("moveJobsEditor.create.steps.resume"),
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 rounded-[20px] bg-container p-5 font-poppins">
      <div className="overflow-x-auto overflow-y-hidden px-2.5 py-2">
        <Steps
          // Caral pinta los pasos pendientes con text-neutral-500 (ilegible en claro): se sube el contraste.
          className="w-full! min-w-[640px] [&_.text-neutral-500]:text-neutral-800!"
          steps={stepLabels.map((label, index) => ({
            label,
            status: index < currentStep ? "done" : index === currentStep ? "default" : "disabled",
          }))}
        />
      </div>

      {currentStep === 0 && <SettingsEdit name={name} setName={setName} limit={limit} setLimit={setLimit} />}
      {currentStep === 1 && <TemplateSelect template={template} setTemplate={setTemplate} />}
      {currentStep === 2 && (
        <Sync
          template={template}
          selectedSystemSource={selectedSystemSource}
          setSelectedSystemSource={setSelectedSystemSource}
          selectedSystemDestination={selectedSystemDestination}
          setSelectedSystemDestination={setSelectedSystemDestination}
          destinationConfig={destinationConfig}
          setDestinationConfig={setDestinationConfig}
        />
      )}
      {currentStep === LAST_STEP && <Resume nodes={nodes} jobs={jobs} />}

      <div className="flex items-center gap-2.5 self-end">
        {currentStep > 0 && (
          <Button variant="light" hasBorder disabled={isCreatingJob} onClick={() => setCurrentStep(currentStep - 1)}>
            {t("moveJobsEditor.common.back")}
          </Button>
        )}
        {currentStep === LAST_STEP ? (
          <Button
            variant="info"
            iconName="plus"
            onClick={handleCreateJobWithTemplate}
            disabled={isCreatingJob}
            isLoading={isCreatingJob}
          >
            {t("moveJobsEditor.create.createJobs")}
          </Button>
        ) : (
          <Button variant="info" disabled={!isValid()} onClick={() => setCurrentStep(currentStep + 1)}>
            {t("moveJobsEditor.common.next")}
          </Button>
        )}
      </div>
    </div>
  );
}
