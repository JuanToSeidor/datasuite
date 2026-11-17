"use client";

import React from "react";
import { Modal } from "caralstable";
import { CaralIcon, type Icons } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTimeExecution } from "@/lib/move/jobs/utils";
import type { TExecution, TExecutionNode } from "@/lib/move/jobs/types";
import WidgetStatus from "../WidgetStatus";
import InfoBox from "../InfoBox";

interface CompletedExecutionProps {
  execution: TExecution;
  /** Se cierra el modal (en el editor, además, se descarta la ejecución activa y se desbloquea la edición). */
  onClose: () => void;
}

type TExecutionNodeWithAttachments = TExecutionNode & {
  execution_info: TExecutionNode["execution_info"] & {
    attachments?: { total?: number; successful?: number; failed?: number };
  };
};

const STATUS_ICON: Record<string, { name: Icons; className: string }> = {
  completed: { name: "check", className: "text-success-main" },
  failed: { name: "xCircle", className: "text-danger-main" },
  cancelled: { name: "xCircle", className: "text-danger-main" },
  warning: { name: "triangleExclamation", className: "text-warning-main" },
};

/** Resumen de una ejecución terminada (completada, con advertencias, fallida o cancelada). */
const CompletedExecution = ({ execution, onClose }: CompletedExecutionProps) => {
  const { t } = useLanguage();
  const status = execution?.status;

  const titleKey = { completed: "titleCompleted", warning: "titleWarning", failed: "titleFailed", cancelled: "titleCancelled" }[
    status as string
  ];
  const descKey = { completed: "descCompleted", warning: "descWarning", failed: "descFailed", cancelled: "descCancelled" }[
    status as string
  ];
  const title = titleKey ? t(`moveJobsEditor.workflow.completed.${titleKey}`) : "";
  const description = descKey ? t(`moveJobsEditor.workflow.completed.${descKey}`) : "";

  const timeStart = new Date(execution?.creation_date);
  const timeEnd = new Date(execution?.details?.time_end ?? execution?.creation_date);
  const elapsed = timeEnd.getTime() - timeStart.getTime();
  const timeExecution = formatTimeExecution(elapsed);
  const timeExecutionSeconds = elapsed / 1000;
  const nodes = Object.values(execution?.details?.nodes || {}) as TExecutionNodeWithAttachments[];

  const registers = nodes.reduce((acc, node) => acc + (node?.execution_info?.registers || 0), 0);
  const nodesFailedOrNoData = nodes.filter((node) => node.status === "failed" || node.status === "nodata");

  const attachmentsTotals = nodes.reduce(
    (acc, node) => {
      const att = node?.execution_info?.attachments;
      if (att) {
        acc.total += att.total || 0;
        acc.successful += att.successful || 0;
        acc.failed += att.failed || 0;
      }
      return acc;
    },
    { total: 0, successful: 0, failed: 0 }
  );
  const hasAttachments = attachmentsTotals.total > 0;
  const icon = STATUS_ICON[status] ?? STATUS_ICON.warning;
  const count = (key: string, value: number) => t(`moveJobsEditor.workflow.completed.${key}`).replace("{count}", String(value));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t("moveJobsEditor.workflow.completed.execution")}
      description={t("moveJobsEditor.workflow.completed.idLabel").replace("{id}", execution?.execution_id)}
      actions="single"
      primaryActionText={t("moveJobsEditor.common.close")}
      primaryActionVariant="info"
      onPrimaryAction={onClose}
      className="max-w-[500px]!"
    >
      <div className="flex max-h-[60vh] flex-col items-center gap-2 overflow-y-auto pe-2">
        <div className="self-end">
          <WidgetStatus status={status} />
        </div>
        <span className={`flex ${icon.className}`}>
          <CaralIcon name={icon.name} size={120} />
        </span>
        <h2 className="text-center font-poppins text-2xl font-bold text-neutral-900">{title}</h2>
        <p className="text-center font-poppins text-sm text-neutral-800">{description}</p>

        <div className="flex w-full flex-col gap-2.5">
          {nodesFailedOrNoData.map((node, index) => (
            <div key={node?.id ?? index} className="flex w-full flex-col gap-2.5 rounded-lg bg-neutral-500 p-2.5">
              <div className="flex w-full items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 font-poppins text-sm text-neutral-900">
                  <span className="flex text-seidor-main-text">
                    <CaralIcon name="cube" size={22} />
                  </span>
                  {node?.extraction_node_info?.name}
                </div>
                <WidgetStatus status={node?.status} />
              </div>
              {node?.error && (
                <p className="whitespace-pre-wrap break-words text-left font-poppins text-xs text-neutral-900">{node.error}</p>
              )}
            </div>
          ))}
        </div>

        <div className="w-full">
          <div className="flex w-full items-center border-b! border-neutral-300 py-2.5">
            <InfoBox text={t("moveJobsEditor.workflow.completed.timeStart")} value={timeStart.toLocaleString()} border />
            <InfoBox text={t("moveJobsEditor.workflow.completed.timeEnd")} value={timeEnd.toLocaleString()} />
          </div>
          <div className="flex w-full items-center border-b! border-neutral-300 py-2.5">
            <InfoBox
              text={t("moveJobsEditor.workflow.completed.avgPerNode")}
              value={count("seconds", nodes.length ? Math.floor(timeExecutionSeconds / nodes.length) : 0)}
              border
            />
            <InfoBox text={t("moveJobsEditor.workflow.completed.totalTime")} value={timeExecution} />
          </div>
          <div className="flex w-full items-center py-2.5">
            <InfoBox
              text={t("moveJobsEditor.workflow.completed.records")}
              value={count("rows", registers)}
              border={hasAttachments}
            />
            {hasAttachments && (
              <InfoBox
                text={t("moveJobsEditor.workflow.completed.totalAttachments")}
                value={count("files", attachmentsTotals.total)}
              />
            )}
          </div>
          {hasAttachments && attachmentsTotals.failed > 0 && (
            <div className="flex items-center border-b! border-neutral-300 p-2.5">
              <InfoBox
                text={t("moveJobsEditor.workflow.completed.successfulAttachments")}
                value={count("files", attachmentsTotals.successful)}
                border
              />
              <InfoBox
                text={t("moveJobsEditor.workflow.completed.failedAttachments")}
                value={count("files", attachmentsTotals.failed)}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CompletedExecution;
