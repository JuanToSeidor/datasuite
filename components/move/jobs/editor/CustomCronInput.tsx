"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomCronInputProps {
  setValue: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

const isValidCron = (expression: string) => expression.trim().split(" ").length === 5;

/** Input de expresión cron libre: válida si tiene exactamente 5 partes separadas por espacios. */
const CustomCronInput = ({ setValue, onValidation }: CustomCronInputProps) => {
  const { t } = useLanguage();
  const [cronExpression, setCronExpression] = useState("");
  const isValid = isValidCron(cronExpression);

  const handleChange = (value: string) => {
    setCronExpression(value);
    const valid = isValidCron(value);
    onValidation(valid);
    if (valid) setValue(value);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border! border-neutral-300 p-4 shadow-md">
      <p className="font-poppins text-sm text-neutral-800">
        {t("moveJobsEditor.editor.customCron.intro")}
        <a
          href="https://crontab.guru"
          target="_blank"
          rel="noopener noreferrer"
          className="text-info-main underline hover:opacity-80"
        >
          CronTab Guru
        </a>
        {t("moveJobsEditor.editor.customCron.outro")}
      </p>
      <Input
        type="text"
        placeholder={t("moveJobsEditor.editor.customCron.placeholder")}
        value={cronExpression}
        onChange={(e) => handleChange(e.currentTarget.value)}
        error={!isValid ? t("moveJobsEditor.editor.customCron.invalid") : undefined}
      />
      {isValid && (
        <p className="font-poppins text-sm font-medium text-success-main">{t("moveJobsEditor.editor.customCron.valid")}</p>
      )}
    </div>
  );
};

export default CustomCronInput;
