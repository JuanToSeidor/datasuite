"use client";

import { Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInitials, type TemplateJobDraft, type TemplateNodeDraft } from "./types";

interface CardJobViewProps {
  job: TemplateJobDraft;
  nodes: TemplateNodeDraft[];
}

/** Tarjeta de solo lectura de un job del resumen: nombre, nodos que incluye y quién lo crea. */
export default function CardJobView({ job, nodes }: CardJobViewProps) {
  const { t } = useLanguage();
  const ids = new Set<string>();
  job.workflow_detail.forEach((group) => group.forEach((node) => ids.add(node.templateNodeId)));
  const jobNodes = nodes.filter((node) => ids.has(node.templateNodeId));

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-500 bg-container p-5 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-info-main bg-info-light text-info-main">
          <CaralIcon name="network" size={18} />
        </div>
        <span className="truncate text-sm font-bold text-neutral-900" title={job.name}>
          {job.name}
        </span>
      </div>

      <div className="border-t border-neutral-500 pt-4">
        {jobNodes.length > 0 ? (
          <div className="flex max-h-[200px] flex-wrap gap-1.5 overflow-y-auto">
            {jobNodes.map((node, index) => (
              <span key={`extractionNode-${node.name}-${index}`} className="max-w-full truncate" title={node.name}>
                <Chip variant="info" label={node.name} hasBorder />
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-neutral-800">{t("moveJobsEditor.create.summary.noLinkedNodes")}</span>
        )}
      </div>

      <div className="flex items-center gap-2.5 border-t border-neutral-500 pt-4">
        <div className="flex size-7 shrink-0 select-none items-center justify-center rounded-full bg-warning-main text-[10px] font-bold text-neutral-100 shadow-sm">
          {getInitials(job.created_by)}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-semibold text-neutral-900" title={job.created_by}>
            {job.created_by}
          </span>
          <span className="font-mono text-[10px] text-neutral-800">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
