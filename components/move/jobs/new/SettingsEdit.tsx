"use client";

import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { LIMIT_VALUES, NOT_LIMIT } from "./types";

interface SettingsEditProps {
  name: string;
  setName: (value: string) => void;
  limit: string;
  setLimit: (value: string) => void;
}

/** Paso 1: nombre del conjunto de nodos/jobs y límite de registros por ejecución. */
export default function SettingsEdit({ name, setName, limit, setLimit }: SettingsEditProps) {
  const { t } = useLanguage();

  const limitOptions = LIMIT_VALUES.map((value) => ({
    value,
    label:
      value === NOT_LIMIT
        ? t("moveJobsEditor.create.settings.notLimit")
        : Number(value).toLocaleString("es-ES"),
  }));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="border-b border-neutral-500 pb-3">
        <h2 className="font-poppins text-lg font-extrabold text-neutral-900">
          {t("moveJobsEditor.create.configureTitle")}
        </h2>
        <p className="text-sm text-neutral-800">{t("moveJobsEditor.create.configureSubtitle")}</p>
      </div>

      <div className="flex w-full items-center justify-between gap-5">
        <div className="flex w-6/12 flex-col gap-1">
          <h5 className="font-poppins text-sm font-bold text-neutral-900">
            {t("moveJobsEditor.create.settings.nameLabel")}
          </h5>
          <p className="text-xs text-neutral-800">{t("moveJobsEditor.create.settings.nameDesc")}</p>
        </div>
        <Input
          containerClassName="w-6/12"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder={t("moveJobsEditor.create.settings.namePlaceholder")}
        />
      </div>

      <div className="flex w-full items-center justify-between gap-5">
        <div className="flex w-6/12 flex-col gap-1">
          <h5 className="font-poppins text-sm font-bold text-neutral-900">
            {t("moveJobsEditor.create.settings.limitLabel")}
          </h5>
          <p className="text-xs text-neutral-800">{t("moveJobsEditor.create.settings.limitDesc")}</p>
        </div>
        <Select
          containerClassName="w-6/12"
          options={limitOptions}
          value={limit}
          placeholder={t("moveJobsEditor.create.settings.select")}
          onValueChange={(value) => setLimit(String(value))}
        />
      </div>
    </div>
  );
}
