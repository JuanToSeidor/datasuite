"use client";

import React, { useEffect, useRef, useState } from "react";
import { CaralIcon } from "@/components/icons";
import { Checkbox, Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import CustomCronInput from "./CustomCronInput";

type ConfigScheduleBoxType =
  | "repeat"
  | "frequency"
  | "time"
  | "dayWeek"
  | "dayMonth"
  | "frequency-time"
  | "custom-cron";

interface ConfigScheduleBoxProps {
  type: ConfigScheduleBoxType;
  // Cada tipo setea un estado distinto del padre (string, number[] o Date), igual que en datasync.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (value: any) => void;
  dayMonth?: Date;
  dayWeek?: number[];
  time?: string;
  customCron?: string;
  onValidation?: (isValid: boolean) => void;
  /** Opciones de "repeat" a ocultar (el trigger regular no ofrece cron personalizado). */
  excludeRepeat?: string[];
}

const toInputDate = (date?: Date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";

/** Multi-selección de días de la semana (en datasync: Select de shadcn con checkboxes dentro). */
function DayWeekSelect({
  dayWeek,
  daysWeek,
  placeholder,
  onChange,
}: {
  dayWeek: number[];
  daysWeek: string[];
  placeholder: string;
  onChange: (days: number[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedDays = dayWeek.map((d) => daysWeek[d - 1]).join(", ");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full font-poppins">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((v) => !v);
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border! border-neutral-500 bg-container px-3 py-2 text-sm text-neutral-900"
      >
        <span className="truncate">{selectedDays || placeholder}</span>
        <span
          className="flex text-neutral-800 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <CaralIcon name="chevronDown" size={14} />
        </span>
      </div>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-2xl border! border-neutral-300 bg-container shadow-xl">
          {daysWeek.map((day, index) => {
            const dayNumber = index + 1;
            const checked = dayWeek.includes(dayNumber);
            return (
              <label
                key={day}
                className={`flex cursor-pointer items-center gap-2.5 p-2.5 text-sm text-neutral-900 hover:bg-neutral-500/40 ${
                  index === daysWeek.length - 1 ? "" : "border-b! border-neutral-300"
                }`}
              >
                <Checkbox
                  variant="info"
                  checked={checked}
                  ariaLabel={day}
                  onChange={(isChecked) =>
                    onChange(isChecked ? [...dayWeek, dayNumber] : dayWeek.filter((d) => d !== dayNumber))
                  }
                />
                <span>{day}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Cada uno de los campos del formulario de programación (repetición, días, fecha, hora, frecuencia o cron). */
const ConfigScheduleBox = ({ type, setValue, dayMonth, dayWeek, time, onValidation, excludeRepeat }: ConfigScheduleBoxProps) => {
  const { t } = useLanguage();
  const daysWeek = [
    t("moveJobsEditor.editor.scheduleBox.days.monday"),
    t("moveJobsEditor.editor.scheduleBox.days.tuesday"),
    t("moveJobsEditor.editor.scheduleBox.days.wednesday"),
    t("moveJobsEditor.editor.scheduleBox.days.thursday"),
    t("moveJobsEditor.editor.scheduleBox.days.friday"),
    t("moveJobsEditor.editor.scheduleBox.days.saturday"),
    t("moveJobsEditor.editor.scheduleBox.days.sunday"),
  ];

  const getLabel = () => {
    switch (type) {
      case "dayWeek":
        return t("moveJobsEditor.editor.scheduleBox.dayWeek");
      case "dayMonth":
        return t("moveJobsEditor.editor.scheduleBox.dayMonth");
      case "repeat":
        return t("moveJobsEditor.editor.scheduleBox.repeat");
      case "frequency-time":
        return t("moveJobsEditor.editor.scheduleBox.frequencyTime");
      case "frequency":
        return t("moveJobsEditor.editor.scheduleBox.frequency");
      case "time":
        return t("moveJobsEditor.editor.scheduleBox.time");
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col gap-1 pt-1">
      {type !== "custom-cron" && (
        <p className="font-poppins text-sm font-semibold text-neutral-900">{getLabel()}</p>
      )}

      {type === "repeat" && (
        <Select
          placeholder={t("moveJobsEditor.editor.scheduleBox.select")}
          onValueChange={(value) => setValue(String(value))}
          options={[
            { value: "instant", label: t("moveJobsEditor.editor.scheduleBox.instant") },
            { value: "once-day", label: t("moveJobsEditor.editor.scheduleBox.onceDay") },
            { value: "once-month", label: t("moveJobsEditor.editor.scheduleBox.onceMonth") },
            { value: "interval", label: t("moveJobsEditor.editor.scheduleBox.interval") },
            { value: "custom-cron", label: t("moveJobsEditor.editor.scheduleBox.customCron") },
          ].filter((option) => !excludeRepeat?.includes(option.value))}
        />
      )}

      {type === "dayWeek" && (
        <DayWeekSelect
          dayWeek={dayWeek ?? []}
          daysWeek={daysWeek}
          placeholder={t("moveJobsEditor.editor.scheduleBox.dayOfWeekPlaceholder")}
          onChange={setValue}
        />
      )}

      {type === "dayMonth" && (
        <Input
          type="date"
          iconName="calendar"
          aria-label={t("moveJobsEditor.editor.scheduleBox.pickDate")}
          value={toInputDate(dayMonth)}
          onChange={(e) => {
            const [y, m, d] = e.currentTarget.value.split("-").map(Number);
            setValue(y && m && d ? new Date(y, m - 1, d) : undefined);
          }}
        />
      )}

      {type === "frequency" && (
        <Select
          placeholder={t("moveJobsEditor.editor.scheduleBox.select")}
          onValueChange={(value) => setValue(String(value))}
          options={[
            { value: "1", label: t("moveJobsEditor.editor.scheduleBox.hourly") },
            { value: "6", label: t("moveJobsEditor.editor.scheduleBox.every6") },
            { value: "12", label: t("moveJobsEditor.editor.scheduleBox.every12") },
            { value: "specify", label: t("moveJobsEditor.editor.scheduleBox.specified") },
          ]}
        />
      )}

      {type === "frequency-time" && (
        <Input
          type="time"
          onChange={(e) => {
            const value = e.currentTarget.value;
            const intValue = parseInt(value, 10) > 12 ? 12 : parseInt(value, 10);
            setValue(`*/${intValue}:0`);
          }}
        />
      )}

      {type === "time" && (
        <Input type="time" defaultValue={time} onChange={(e) => setValue(e.currentTarget.value)} />
      )}

      {type === "custom-cron" && onValidation && <CustomCronInput setValue={setValue} onValidation={onValidation} />}
    </div>
  );
};

export default ConfigScheduleBox;
