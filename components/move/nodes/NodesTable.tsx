"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "caralstable";
import { DataTableColumn } from "@/components/ui";
import { MoveListView } from "@/components/move/shared/MoveListView";
import { useLanguage } from "@/contexts/LanguageContext";
import nodesData from "@/data/move/nodes.json";
import { NodeCard } from "./NodeCard";
import { EndpointLogo, makeNodeDateFormatter, MoveNode, MoveNodeEndpoint, MoveNodeStatus } from "./nodeShared";

export type { MoveNode, MoveNodeEndpoint, MoveNodeStatus } from "./nodeShared";
export { EndpointLogo } from "./nodeShared";

const mockNodes = nodesData as MoveNode[];

const STATUS_DOT_CLASS: Record<MoveNodeStatus, string> = {
  enabled: "bg-success-main",
  drafted: "bg-warning-main",
  stop: "bg-danger-main",
};



function matchesNodeSearch(node: MoveNode, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    node.name,
    node.origin.name,
    node.origin.type,
    node.destination.name,
    node.destination.type,
    node.createdBy,
  ].some((v) => v.toLowerCase().includes(q));
}

function EndpointCell({ endpoint }: { endpoint: MoveNodeEndpoint }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="shrink-0 flex">
        <EndpointLogo brandName={endpoint.brandName} size={24} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-neutral-900 text-sm truncate" title={endpoint.name}>
          {endpoint.name}
        </span>
        <span className="text-neutral-800 text-xs font-medium truncate">{endpoint.type}</span>
      </div>
    </div>
  );
}

export function NodesTable() {
  const { dict, language } = useLanguage();
  const t = dict.move.nodes;
  const formatDate = useMemo(() => makeNodeDateFormatter(language), [language]);


  const statusLabel = (status: MoveNodeStatus) =>
    status === "enabled" ? t.statusEnabled : status === "drafted" ? t.statusDrafted : t.statusStop;

  const columns = useMemo<DataTableColumn<MoveNode>[]>(() => [
    // 0. Estado (punto de color)
    {
      id: "status",
      accessorKey: "status",
      header: "",
      filterable: false,
      align: "center",
      width: 47,
      minWidth: 47,
      resizable: false,
      cell: ({ value }) => {
        const status = value as MoveNodeStatus;
        return (
          <div className="flex items-center justify-center">
            <span
              role="img"
              aria-label={statusLabel(status)}
              title={statusLabel(status)}
              className={`size-3 rounded-full ${STATUS_DOT_CLASS[status]}`}
            />
          </div>
        );
      },
    },
    {
      id: "name",
      accessorKey: "name",
      header: t.colName,
      filterLabel: t.colName,
      filterType: "text",
      width: 240,
      minWidth: 180,
      cell: ({ value }) => (
        <span className="text-neutral-900 text-sm truncate" title={String(value)}>
          {String(value)}
        </span>
      ),
      footer: ({ filteredData }) => (
        <span className="text-neutral-900 font-normal">
          {dict.common.total}: {filteredData.length} {t.totalNodes}
        </span>
      ),
    },
    {
      id: "origin",
      accessorFn: (row) => row.origin.name,
      header: t.colOrigin,
      filterLabel: t.colOrigin,
      filterType: "text",
      width: 230,
      minWidth: 180,
      cell: ({ row }) => <EndpointCell endpoint={row.origin} />,
    },
    {
      id: "destination",
      accessorFn: (row) => row.destination.name,
      header: t.colDestination,
      filterLabel: t.colDestination,
      filterType: "text",
      width: 230,
      minWidth: 180,
      cell: ({ row }) => <EndpointCell endpoint={row.destination} />,
    },
    {
      id: "createdBy",
      accessorKey: "createdBy",
      header: t.colCreatedBy,
      filterLabel: t.colCreatedBy,
      filterType: "text",
      width: 180,
      minWidth: 140,
      cell: ({ row, value }) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-6 rounded-full bg-seidor-main text-white flex items-center justify-center text-[10px] font-bold shrink-0 select-none">
            {row.avatarText || "SA"}
          </div>
          <span className="text-neutral-900 text-sm truncate" title={String(value)}>
            {String(value)}
          </span>
        </div>
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: t.colCreatedAt,
      filterLabel: t.colCreatedAt,
      filterType: "text",
      width: 140,
      minWidth: 120,
      exportValue: (row) => formatDate(row.createdAt),
      cell: ({ value }) => (
        <span className="text-neutral-900 text-sm whitespace-nowrap">{formatDate(String(value))}</span>
      ),
    },
    {
      id: "lastUsedAt",
      accessorKey: "lastUsedAt",
      header: t.colLastUsed,
      filterLabel: t.colLastUsed,
      filterType: "text",
      width: 140,
      minWidth: 120,
      exportValue: (row) => (row.lastUsedAt ? formatDate(row.lastUsedAt) : t.neverUsed),
      cell: ({ value }) =>
        value ? (
          <span className="text-neutral-900 text-sm whitespace-nowrap">{formatDate(String(value))}</span>
        ) : (
          <span className="text-neutral-800 text-sm italic">{t.neverUsed}</span>
        ),
    },
    // Última columna: editar nodo
    {
      id: "actions",
      header: t.colActions,
      align: "center",
      width: 118,
      minWidth: 90,
      filterable: false,
      hideInExport: true,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Link href={`/move/nodes/${row.id}`} title={t.editNode}>
            <Button
              variant="ghost"
              isIconButton
              iconName="edit"
              className="text-neutral-900 hover:bg-neutral-500/30 cursor-pointer p-1.5 rounded-lg transition-colors"
              title={t.editNode}
            />
          </Link>
        </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, dict, formatDate]);

  const addNodeButton = (
    <Link href="/move/nodes/new">
      <Button variant="info" iconName="plus" className="cursor-pointer">
        {t.addNode}
      </Button>
    </Link>
  );

  return (
    <MoveListView<MoveNode>
      title={t.title}
      description={t.description}
      iconName="cube"
      data={mockNodes}
      columns={columns}
      keyExtractor={(row) => row.id}
      searchPlaceholder={t.searchPlaceholder}
      matchesSearch={matchesNodeSearch}
      renderCard={(node) => <NodeCard node={node} formatDate={formatDate} />}
      primaryAction={addNodeButton}
      labels={{ switchToGrid: t.switchToGrid, switchToList: t.switchToList, noResults: dict.common.noResults }}
    />
  );
}
