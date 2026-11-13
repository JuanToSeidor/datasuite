"use client";

import { Button } from "caralstable";
import { Brand, CaralIcon, CaralBrandName } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidePanel } from "@/contexts/SidePanelContext";
import newNodeData from "@/data/move/newNode.json";

interface SummaryEndpoint {
  name: string;
  type: string;
  brandName: string;
}

const summary = newNodeData.summary;

function EndpointCard({ endpoint }: { endpoint: SummaryEndpoint }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg bg-neutral-500/40 p-2.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-container">
        <Brand name={endpoint.brandName as CaralBrandName} size={22} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-neutral-900">{endpoint.name}</span>
        <span className="truncate text-xs text-neutral-800">{endpoint.type}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-neutral-800">{label}</span>
      <span className="text-sm text-neutral-900">{value}</span>
    </div>
  );
}

export function NodeSummaryPanel() {
  const { dict } = useLanguage();
  const t = dict.move.newNode;
  const { closeSidePanel } = useSidePanel();

  return (
    <div className="flex flex-col gap-4 p-5 font-poppins">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{t.summaryTitle}</h2>
          <p className="text-xs font-medium text-neutral-800">{summary.object}</p>
        </div>
        <Button isIconButton iconName="x" variant="ghost" title={dict.common.close} onClick={closeSidePanel} />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <EndpointCard endpoint={summary.origin} />
        <CaralIcon name="arrowDown" size={20} />
        <EndpointCard endpoint={summary.destination} />
      </div>

      <div className="flex flex-col gap-3">
        <DetailRow label={t.summaryObject} value={summary.object} />
        <DetailRow label={t.summaryExtraction} value={summary.extraction} />
        <DetailRow label={t.summaryTracking} value={summary.tracking} />
        <DetailRow label={t.summaryDestination} value={t.summaryPending} />
        <DetailRow label={t.summaryExecution} value={t.summaryPending} />
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-info-100 p-5">
        <h3 className="text-base font-semibold text-info-main">{t.helpTitle}</h3>
        <p className="text-xs font-medium text-neutral-800">{t.helpText}</p>
      </div>
    </div>
  );
}
