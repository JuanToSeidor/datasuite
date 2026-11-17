"use client";

import { useMemo } from "react";
import { Chip } from "caralstable";
import { NodeCard } from "@/components/move/nodes/NodeCard";
import { makeNodeDateFormatter, type MoveNode } from "@/components/move/nodes/nodeShared";
import { useLanguage } from "@/contexts/LanguageContext";
import CardJobView from "./CardJobView";
import { getInitials, type TemplateJobDraft, type TemplateNodeDraft } from "./types";

interface ResumeProps {
  nodes: TemplateNodeDraft[];
  jobs: TemplateJobDraft[];
}

/** Paso 4: vista previa de los nodos y jobs que se van a crear (tarjetas de solo lectura). */
export default function Resume({ nodes, jobs }: ResumeProps) {
  const { t, language } = useLanguage();
  const formatDate = useMemo(() => makeNodeDateFormatter(language), [language]);

  const previewNodes = useMemo<MoveNode[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return nodes.map((node) => ({
      id: `template-node-${node.templateNodeId}`,
      name: node.name,
      status: "enabled",
      origin: node.origin,
      destination: node.destination,
      createdBy: node.created_by,
      avatarText: getInitials(node.created_by),
      createdAt: today,
      lastUsedAt: null,
    }));
  }, [nodes]);

  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-neutral-500 pb-3">
        <h2 className="font-poppins text-lg font-extrabold text-neutral-900">
          {t("moveJobsEditor.import.match.title")}
        </h2>
        <p className="text-sm text-neutral-800">{t("moveJobsEditor.import.match.subtitle")}</p>
      </div>

      <div className="flex h-full flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-poppins text-base font-bold text-neutral-900">{t("moveJobsEditor.common.nodes")}</h4>
          <Chip
            variant="info"
            label={t("moveJobsEditor.create.summary.nodesCreated").replace("{count}", String(nodes.length))}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {previewNodes.map((node) => (
            <NodeCard key={node.id} node={node} formatDate={formatDate} readOnly />
          ))}
        </div>
      </div>

      <div className="flex h-full flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-poppins text-base font-bold text-neutral-900">
            {t("moveJobsEditor.create.summary.jobs")}
          </h4>
          <Chip
            variant="info"
            label={t("moveJobsEditor.create.summary.jobsCreated").replace("{count}", String(jobs.length))}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {jobs.map((job, index) => (
            <CardJobView key={`job-${index}`} nodes={nodes} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
