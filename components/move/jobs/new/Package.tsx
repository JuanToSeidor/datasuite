"use client";

import { Brand, CaralIcon, type CaralBrandName } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJobPackage, TJobTemplate } from "@/lib/move/jobs/types";
import { getPackageTemplate } from "./types";

/** Logo del paquete según su tipo (en datasync eran SVG de /public). */
const BRAND_BY_PACKAGE_TYPE: Record<string, CaralBrandName> = {
  AWS: "AWS",
  snowflake: "Snowflake",
  azure: "Azure",
  google: "GoogleStorage",
  salesforce: "Saleforce",
  "SAP 4HANA": "SAP",
  SAPABAP: "SAP",
};

interface PackageProps {
  pack: TJobPackage;
  template: TJobTemplate | null;
  setTemplate: (value: TJobTemplate) => void;
}

/** Paquete de plantillas: grilla con las plantillas; las que no existen quedan atenuadas y no se pueden elegir. */
export default function Package({ pack, template, setTemplate }: PackageProps) {
  const { t } = useLanguage();
  const brand = BRAND_BY_PACKAGE_TYPE[pack.type];
  const modeLabel =
    pack.mode === "table" ? t("moveJobsEditor.create.package.tables") : t("moveJobsEditor.create.package.extractors");

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-500 bg-container">
      <div className="flex w-full items-center justify-between border-b border-neutral-500 bg-neutral-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center rounded-xl border border-neutral-500 bg-container p-1.5">
            {brand ? <Brand name={brand} size={32} /> : <CaralIcon name="noFound" size={32} />}
          </div>
          <h4 className="font-poppins text-sm font-extrabold text-neutral-900">
            {t("moveJobsEditor.create.package.packagesFor").replace("{mode}", modeLabel)}
          </h4>
        </div>
        <p className="text-xs text-neutral-800">
          {t("moveJobsEditor.create.package.templates").replace("{count}", String(pack.templates.length))}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 p-3">
        {pack.templates.map((templateName) => {
          const templateData = getPackageTemplate(pack, templateName);
          const isSelected = Boolean(templateData) && templateData?.name === template?.name;
          return (
            // Tarjeta seleccionable: un Button de Caral impondría su fondo, alto y alineación de texto.
            <button
              type="button"
              key={templateName}
              disabled={!templateData}
              aria-pressed={isSelected}
              onClick={() => {
                if (templateData) setTemplate(templateData);
              }}
              className={`flex items-center gap-2.5 rounded-xl border! p-3 text-left transition-colors ${
                !templateData
                  ? "cursor-not-allowed border-neutral-500 bg-container opacity-40"
                  : isSelected
                    ? "cursor-pointer border-info-main bg-info-light"
                    : "cursor-pointer border-neutral-500 bg-container hover:border-info-main"
              }`}
            >
              <span className="text-info-main">
                <CaralIcon name="bolt" size={20} />
              </span>
              <span className="font-poppins text-sm font-bold text-neutral-900">{templateName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
