"use client";

import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJobTemplate } from "@/lib/move/jobs/types";
import { getTemplateNodeSourceName } from "./types";

/** Detalle de la plantilla elegida: tablas/extractores que incluye. */
export default function CardPackage({ template }: { template: TJobTemplate }) {
  const { t } = useLanguage();
  return (
    <div className="flex h-full w-4/12 flex-col gap-2.5 rounded-2xl border border-neutral-500 bg-container p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-poppins text-sm font-extrabold text-neutral-900">{template.name}</h4>
        <p className="text-xs text-neutral-800">
          {template.nodes.length}{" "}
          {template.mode === "table"
            ? t("moveJobsEditor.create.package.tables")
            : t("moveJobsEditor.create.package.extractors")}
        </p>
      </div>
      <div className="flex h-[400px] flex-col overflow-y-auto pe-4">
        {template.nodes.map((node) => (
          <div
            key={node.templateNodeId}
            className="flex items-center justify-between border-b border-neutral-500 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-info-main">
                <CaralIcon name="database" size={20} />
              </span>
              <p className="text-sm text-neutral-900">{getTemplateNodeSourceName(template, node)}</p>
            </div>
            <p className="text-xs text-neutral-800">{t("moveJobsEditor.create.package.allFields")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
