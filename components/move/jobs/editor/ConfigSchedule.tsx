"use client";

import React, { useEffect, useState } from "react";
import { Button } from "caralstable";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCron } from "@/lib/move/jobs/cron";
import type { TJob } from "@/lib/move/jobs/types";
import ConfigScheduleBox from "./ConfigScheduleBox";

interface ConfigScheduleProps {
  job: TJob;
  handleAddSchedule: (cron: string, repeat: string) => void;
  /** Se llama después de agregar la programación (p. ej. para pasar a la pestaña "Programados"). */
  onScheduled?: () => void;
  isEqualWorkflow: boolean;
  /** "regular": intervalos predefinidos; "cron": expresión cron libre. */
  mode: "regular" | "cron";
}

/** Formulario para programar una ejecución del job (máximo 10 programaciones). */
const ConfigSchedule = ({ handleAddSchedule, onScheduled, job, isEqualWorkflow, mode }: ConfigScheduleProps) => {
  const { t } = useLanguage();
  const [repeat, setRepeat] = useState<string>(mode === "cron" ? "custom-cron" : "");
  const [time, setTime] = useState<string>("");
  const [timeInterval, setTimeInterval] = useState<string>("");
  const [dayMonth, setDayMonth] = useState<Date | undefined>(undefined);
  const [dayWeek, setDayWeek] = useState<number[]>([]);
  const [customCron, setCustomCron] = useState<string>("");
  const [isCustomCronValid, setIsCustomCronValid] = useState<boolean>(false);
  const [cron, setCron] = useState<string>("* * * * *");
  const [frequency, setFrequency] = useState<string>("");
  const isLimitReached = (job.schedule_config?.length ?? 0) >= 10;

  const cronFormatted = repeat === "custom-cron" ? customCron : cron;

  /* eslint-disable react-hooks/set-state-in-effect -- mismo flujo de estados derivados que en datasync */
  useEffect(() => {
    if (repeat === "interval") {
      setCron(getCron(timeInterval, dayMonth, dayWeek, repeat));
    } else if (repeat !== "custom-cron") {
      setCron(getCron(time, dayMonth, dayWeek, repeat));
    }
  }, [time, dayMonth, dayWeek, timeInterval, repeat]);

  useEffect(() => {
    if (repeat === "interval") {
      setDayMonth(undefined);
      setDayWeek([]);
      setTimeInterval("");
      setFrequency("");
    } else if (repeat === "instant") {
      setDayMonth(new Date());
      setDayWeek([]);
      setFrequency("");
    } else if (repeat !== "custom-cron") {
      setDayMonth(undefined);
      setDayWeek([]);
      setFrequency("");
    }
  }, [repeat]);

  useEffect(() => {
    if (frequency === "1") setTimeInterval("*/1:0");
    else if (frequency === "6") setTimeInterval("*/6:0");
    else if (frequency === "12") setTimeInterval("*/12:0");
    else setTimeInterval("");
  }, [frequency]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isWorkflowValid =
    job.workflow_detail?.nodes.filter((node) => node?.type === "startNodeFlow").length === 1 &&
    job.workflow_detail?.nodes.filter((node) => node?.type === "extractorNodeFlow").length >= 1;

  const isDisabled =
    !repeat || (repeat === "custom-cron" && !isCustomCronValid) || isLimitReached || !isEqualWorkflow || !isWorkflowValid;

  return (
    <div className="relative flex flex-col gap-4 pb-2.5">
      <div className="flex flex-col gap-2">
        <p className="font-poppins text-xs text-neutral-800">
          {t("moveJobsEditor.editor.schedule.timeZoneNote")} {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
        {mode === "regular" && <ConfigScheduleBox type="repeat" setValue={setRepeat} excludeRepeat={["custom-cron"]} />}
        {repeat && (
          <div>
            {(() => {
              switch (repeat) {
                case "custom-cron":
                  return (
                    <ConfigScheduleBox
                      type="custom-cron"
                      setValue={(value: string) => setCustomCron(value)}
                      customCron={customCron}
                      onValidation={setIsCustomCronValid}
                    />
                  );
                case "interval":
                  return (
                    <>
                      <ConfigScheduleBox type="dayWeek" setValue={setDayWeek} dayWeek={dayWeek} />
                      <ConfigScheduleBox type="frequency" setValue={setFrequency} />
                    </>
                  );
                case "once-day":
                case "once-month":
                case "instant":
                  return (
                    <>
                      <ConfigScheduleBox
                        type={repeat === "once-day" ? "dayWeek" : "dayMonth"}
                        setValue={repeat === "once-day" ? setDayWeek : setDayMonth}
                        dayWeek={dayWeek}
                        dayMonth={dayMonth}
                      />
                      <ConfigScheduleBox type="time" setValue={setTime} time={time} />
                    </>
                  );
                default:
                  return null;
              }
            })()}
          </div>
        )}
      </div>

      <div className="flex w-full items-center gap-2.5">
        <Button
          variant="info"
          className="w-full"
          disabled={isDisabled}
          onClick={() => {
            if ((!customCron && repeat === "custom-cron") || isLimitReached || !isEqualWorkflow || !isWorkflowValid) {
              return;
            }
            handleAddSchedule(cronFormatted, repeat);
            onScheduled?.();
          }}
        >
          {t("moveJobsEditor.editor.schedule.scheduleJob")}
        </Button>
      </div>
    </div>
  );
};

export default ConfigSchedule;
