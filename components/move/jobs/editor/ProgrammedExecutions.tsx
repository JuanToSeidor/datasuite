"use client";

import React, { useState } from "react";
import cronstrue from "cronstrue/i18n";
import { Button, Modal, Toggle } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { cronToHumanReadable } from "@/lib/move/jobs/cron";
import type { TJob, TScheduleConfig } from "@/lib/move/jobs/types";

interface ProgrammedExecutionsProps {
  job: TJob;
  handleDeleteSchedule: (scheduleId: string) => void;
  handleStatusSchedule: (data: TScheduleConfig, status: string) => void;
}

/** Pestaña "Programados": lista los schedules con su detalle, borrado y pausa/reanudación. */
const ProgrammedExecutions = ({
  job,
  handleDeleteSchedule,
  handleStatusSchedule,
}: ProgrammedExecutionsProps) => {
  const { t, language } = useLanguage();
  const [idHovered, setIdHovered] = useState<string | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  // cronstrue/i18n trae es y pt_BR; el resto de los textos viene del diccionario
  const cronLocale = language === "pt" ? "pt_BR" : language;
  const cronText = (cron: string) => {
    try {
      return cronstrue.toString(cron, { locale: cronLocale });
    } catch {
      return cron;
    }
  };

  return (
    <div>
      {(job.schedule_config?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border! border-dashed border-neutral-300 p-5 text-center">
          <span className="flex text-neutral-800">
            <CaralIcon name="calendarTime" size={28} />
          </span>
          <p className="font-poppins text-sm text-neutral-800">{t("moveJobsEditor.editor.triggersPanel.emptyScheduled")}</p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2.5">
          {job.schedule_config?.map((schedule) => {
            // El cron se muestra tal cual fue configurado, junto con su zona horaria (time_zone_client).
            const scheduleCron = schedule.cron_expression;
            const scheduleTz = schedule.time_zone_client ?? "UTC";
            const cronReadable = cronToHumanReadable(scheduleCron, schedule.repeat);

            return (
              <div key={schedule.id} className="flex w-full flex-col gap-2.5 rounded-lg border! border-neutral-300 p-2.5">
                <div className="flex w-full items-center justify-between gap-2.5">
                  <div className="flex w-8/12 items-start gap-2.5">
                    <span
                      className="flex shrink-0 cursor-help text-seidor-main-text"
                      onMouseEnter={() => setIdHovered(schedule.id)}
                      onMouseLeave={() => setIdHovered("")}
                    >
                      <CaralIcon name="circleInfo" size={22} />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <p className="break-words font-poppins text-sm text-neutral-900">
                        {schedule.repeat === "custom-cron"
                          ? t("moveJobsEditor.editor.programmed.customCron")
                          : cronText(scheduleCron)}
                      </p>
                      <p className="font-poppins text-xs text-neutral-800">{scheduleTz}</p>
                    </div>
                  </div>

                  <div className="flex w-4/12 items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      isIconButton
                      iconName="trash"
                      aria-label={t("moveJobsEditor.common.delete")}
                      onClick={() => setScheduleToDelete(schedule.id)}
                    />
                    <Toggle
                      checked={schedule.status === "enabled"}
                      onChange={(status) =>
                        handleStatusSchedule(
                          { ...schedule, status: status ? "enabled" : "disabled" },
                          status ? "enabled" : "disabled"
                        )
                      }
                    />
                  </div>
                </div>
                {idHovered === schedule.id && (
                  <div className="flex flex-col gap-2.5 font-poppins text-sm text-neutral-900">
                    {schedule.repeat !== "instant" && schedule.repeat !== "once-month" ? (
                      <div className="flex flex-col">
                        {schedule.repeat !== "custom-cron" && (
                          <p className="font-semibold">{t("moveJobsEditor.editor.programmed.daysOfWeek")}</p>
                        )}
                        <p>{cronReadable.daysOfWeek}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className="font-semibold">{t("moveJobsEditor.editor.programmed.date")}</p>
                        <p>{cronReadable.date}</p>
                      </div>
                    )}
                    {schedule.repeat === "interval" ? (
                      <div className="flex flex-col">
                        <p className="font-semibold">{t("moveJobsEditor.editor.programmed.frequency")}</p>
                        <p>{cronReadable.interval}</p>
                      </div>
                    ) : schedule.repeat === "custom-cron" ? null : (
                      <div className="flex flex-col">
                        <p className="font-semibold">{t("moveJobsEditor.editor.programmed.time")}</p>
                        <p>{cronReadable.time}</p>
                      </div>
                    )}
                    {schedule.repeat === "custom-cron" && (
                      <div className="flex flex-col">
                        <p className="font-semibold">{t("moveJobsEditor.editor.programmed.frequencyCron")}</p>
                        <p>{cronText(scheduleCron)}</p>
                        <p className="font-semibold">{t("moveJobsEditor.editor.programmed.customCronLower")}</p>
                        <p>{scheduleCron}</p>
                        <p className="font-semibold">{t("moveJobsEditor.editor.programmed.timeZone")}</p>
                        <p>{scheduleTz}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={scheduleToDelete !== null}
        onClose={() => setScheduleToDelete(null)}
        title={t("moveJobsEditor.editor.programmed.deleteTitle")}
        iconName="trash"
        chipVariant="danger"
        actions="double"
        secondaryActionText={t("moveJobsEditor.common.cancel")}
        primaryActionText={t("moveJobsEditor.common.delete")}
        primaryActionVariant="danger"
        onPrimaryAction={() => {
          if (scheduleToDelete) handleDeleteSchedule(scheduleToDelete);
          setScheduleToDelete(null);
        }}
      />
    </div>
  );
};

export default ProgrammedExecutions;
