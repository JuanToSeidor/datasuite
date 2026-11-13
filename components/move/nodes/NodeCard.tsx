"use client";

import Link from "next/link";
import { Button, Chip, Timeline } from "caralstable";
import { CaralIcon, Icons } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { EndpointLogo, MoveNode, MoveNodeEndpoint, MoveNodeStatus } from "./nodeShared";

const STATUS_CHIP: Record<MoveNodeStatus, { variant: "success" | "warning" | "danger"; icon: Icons }> = {
  enabled: { variant: "success", icon: "check" as Icons },
  drafted: { variant: "warning", icon: "edit" as Icons },
  stop: { variant: "danger", icon: "x" as Icons },
};

interface NodeCardProps {
  node: MoveNode;
  formatDate: (value: string) => string;
}

/** Paso del timeline origen → destino (Timeline de Caral) con logo + nombre/tipo. */
function EndpointRow({
  endpoint,
  position,
  productionLabel,
}: {
  endpoint: MoveNodeEndpoint;
  position: "start" | "end";
  productionLabel: string;
}) {
  return (
    <Timeline
      variant="info"
      hideTopLine={position === "start"}
      hideBottomLine={position === "end"}
      className="w-full"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex items-center justify-center p-2.5 rounded-full bg-neutral-100 shrink-0">
          <EndpointLogo brandName={endpoint.brandName} size={30} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="text-lg font-semibold text-neutral-900 font-poppins leading-7 truncate"
            title={endpoint.name}
          >
            {endpoint.name}
          </span>
          <span className="text-sm font-medium text-neutral-800 truncate">{endpoint.type}</span>
        </div>
        {endpoint.isProduction && (
          <div
            className="flex items-center justify-center p-2.5 rounded-[10px] bg-info-light border border-info-hard text-info-main shrink-0"
            title={productionLabel}
          >
            <CaralIcon name={"badgeSync" as Icons} size={30} />
          </div>
        )}
      </div>
    </Timeline>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col min-w-0 px-2.5 py-1.5">
      <span className="text-sm font-medium text-neutral-800 truncate">{label}</span>
      <span className="text-base text-neutral-900 truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

export function NodeCard({ node, formatDate }: NodeCardProps) {
  const { dict } = useLanguage();
  const t = dict.move.nodes;
  const status = STATUS_CHIP[node.status];
  const statusLabel =
    node.status === "enabled" ? t.statusEnabled : node.status === "drafted" ? t.statusDrafted : t.statusStop;

  return (
    <article className="flex flex-col gap-2.5 bg-container rounded-lg border border-neutral-500 overflow-hidden font-poppins transition-colors hover:border-neutral-800">
      {/* Header: nombre + estado */}
      <header className="flex items-center gap-2.5 px-2.5 pt-5 pb-2.5 border-b border-neutral-500">
        <h4
          className="flex-1 min-w-0 text-lg font-semibold text-seidor-main-text leading-7 truncate"
          title={node.name}
        >
          {node.name}
        </h4>
        <Chip variant={status.variant} label={statusLabel} iconName={status.icon} hasBorder />
      </header>

      {/* Origen → Destino */}
      <div className="flex flex-col p-2.5 border-b border-neutral-500">
        <EndpointRow endpoint={node.origin} position="start" productionLabel={t.productionSource} />
        <EndpointRow endpoint={node.destination} position="end" productionLabel={t.productionSource} />
      </div>

      {/* Metadatos */}
      <div className="grid grid-cols-3 gap-x-2.5 gap-y-1">
        <MetaItem label={t.cardAuthor} value={node.createdBy} />
        <MetaItem label={t.cardCreated} value={formatDate(node.createdAt)} />
        <MetaItem
          label={t.cardLastLoad}
          value={node.lastUsedAt ? formatDate(node.lastUsedAt) : t.neverUsed}
        />
      </div>

      {/* Footer */}
      <footer className="flex justify-end p-2.5 border-t border-neutral-500">
        <Link href={`/move/nodes/${node.id}`}>
          <Button variant="info" className="cursor-pointer" title={t.editNode}>
            {dict.common.edit}
          </Button>
        </Link>
      </footer>
    </article>
  );
}
