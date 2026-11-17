"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { TJobTemplate } from "@/lib/move/jobs/types";
import CardPackage from "./CardPackage";
import Package from "./Package";
import { templatePackages } from "./types";

interface TemplateSelectProps {
  template: TJobTemplate | null;
  setTemplate: (value: TJobTemplate) => void;
}

/** Paso 2: paquetes de plantillas a la izquierda y detalle de la plantilla elegida a la derecha. */
export default function TemplateSelect({ template, setTemplate }: TemplateSelectProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <div className="border-b border-neutral-500 pb-3">
        <h4 className="font-poppins text-lg font-extrabold text-neutral-900">
          {t("moveJobsEditor.create.configureTitle")}
        </h4>
        <p className="text-sm text-neutral-800">{t("moveJobsEditor.create.configureSubtitle")}</p>
      </div>
      <div className="flex h-full w-full items-start justify-between gap-2">
        <div className="flex w-8/12 flex-col gap-5">
          {templatePackages.map((pack) => (
            <Package key={`${pack.type}-${pack.mode}`} pack={pack} template={template} setTemplate={setTemplate} />
          ))}
        </div>
        {template && <CardPackage template={template} />}
      </div>
    </div>
  );
}
