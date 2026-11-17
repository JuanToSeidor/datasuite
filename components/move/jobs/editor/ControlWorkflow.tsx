"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Drawer, Tabs } from "caralstable";
import { CaralIcon, type Icons } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJob, TScheduleConfig } from "@/lib/move/jobs/types";
import ConfigSchedule from "./ConfigSchedule";
import ProgrammedExecutions from "./ProgrammedExecutions";
import type { TPermissionsJob } from "./permissions";

type TriggerType = "regular" | "cron" | "external";

const TRIGGER_TYPES: { id: TriggerType; icon: Icons; key: string }[] = [
  { id: "regular", icon: "clock", key: "regular" },
  { id: "cron", icon: "calendarTime", key: "crontab" },
  { id: "external", icon: "bolt", key: "external" },
];

interface ControlWorkflowProps {
  job: TJob;
  handleAddSchedule: (cron: string, repeat: string) => void;
  handleStatusSchedule: (data: TScheduleConfig, status: string) => void;
  handleDeleteSchedule: (scheduleId: string) => void;
  permissionsJobs: TPermissionsJob;
  isEqualWorkflow: boolean;
  /** Abre el drawer de triggers externos (el mismo del botón con rayo de la barra). */
  onOpenExternalTrigger: () => void;
}

/** Icono del tipo de trigger: cuadro verde con borde, como en el diseño. */
function TriggerIcon({ icon }: { icon: Icons }) {
  return (
    <span className="flex shrink-0 items-center rounded-md border-2! border-success-main bg-success-light p-2.5 text-success-main">
      <CaralIcon name={icon} size={30} />
    </span>
  );
}

/**
 * Sección "Triggers" del editor. Pestaña "Nuevo": elegir el tipo de trigger (regular, crontab o externo);
 * pestaña "Programados": las programaciones del job.
 */
const ControlWorkflow = ({
  job,
  handleAddSchedule,
  handleStatusSchedule,
  handleDeleteSchedule,
  permissionsJobs,
  isEqualWorkflow,
  onOpenExternalTrigger,
}: ControlWorkflowProps) => {
  const { t } = useLanguage();
  const [tabIndex, setTabIndex] = useState(0);
  const [selected, setSelected] = useState<Exclude<TriggerType, "external"> | null>(null);

  const canSchedule = Boolean(permissionsJobs?.scheduleExecution);
  const canRun = Boolean(permissionsJobs?.runJob);
  const types = TRIGGER_TYPES.filter((type) => (type.id === "external" ? canRun : canSchedule));
  const selectedType = TRIGGER_TYPES.find((type) => type.id === selected);

  const handleSelect = (type: TriggerType) => {
    if (type === "external") onOpenExternalTrigger();
    else setSelected(type);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Tabs
        className="w-fit"
        tabs={[
          { label: t("moveJobsEditor.editor.triggersPanel.tabNew") },
          {
            label: `${t("moveJobsEditor.editor.triggersPanel.tabScheduled")} (${job.schedule_config?.length ?? 0})`,
          },
        ]}
        activeIndex={tabIndex}
        onChange={setTabIndex}
      />

      {tabIndex === 1 && (
        <ProgrammedExecutions
          job={job}
          handleDeleteSchedule={handleDeleteSchedule}
          handleStatusSchedule={handleStatusSchedule}
        />
      )}

      {tabIndex === 0 && (
        <div className="flex flex-col gap-2! pt-1">
          {/*
            Tarjetas seleccionables con <button> nativo: el `Button` de Caral no admite el armado
            icono + título + descripción en varias líneas que pide el diseño.
          */}
          {types.map(({ id, icon, key }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2.5! text-left transition-colors hover:bg-neutral-500/40"
            >
              <TriggerIcon icon={icon} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 font-poppins">
                <span className="text-base leading-6 font-semibold text-neutral-900">
                  {t(`moveJobsEditor.editor.triggersPanel.${key}.title`)}
                </span>
                <span className="text-xs leading-4 font-medium text-neutral-800">
                  {t(`moveJobsEditor.editor.triggersPanel.${key}.desc`)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/*
        Formulario del trigger en un drawer a la derecha. Va al body con un portal para no quedar
        dentro del panel (overflow) ni del contexto de apilamiento del canvas.
      */}
      {selectedType &&
        selected &&
        typeof document !== "undefined" &&
        createPortal(
          <Drawer
            isOpen
            onClose={() => setSelected(null)}
            title={t(`moveJobsEditor.editor.triggersPanel.${selectedType.key}.title`)}
            size="md"
          >
            <div className="flex flex-col gap-4 font-poppins">
              <div className="flex items-center gap-2.5">
                <TriggerIcon icon={selectedType.icon} />
                <p className="text-sm text-neutral-800">
                  {t(`moveJobsEditor.editor.triggersPanel.${selectedType.key}.desc`)}
                </p>
              </div>
              <div className="h-px w-full bg-neutral-500" />
              <ConfigSchedule
                key={selected}
                mode={selected}
                job={job}
                handleAddSchedule={handleAddSchedule}
                isEqualWorkflow={isEqualWorkflow}
                onScheduled={() => {
                  setSelected(null);
                  setTabIndex(1);
                }}
              />
            </div>
          </Drawer>,
          document.body
        )}
    </div>
  );
};

export default ControlWorkflow;
