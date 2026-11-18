"use client";

import React, { useEffect, useRef } from "react";
import { useSidePanel } from "@/contexts/SidePanelContext";
import { JOB_NODE_PANEL_WIDTH, JobNodePanel } from "./JobNodePanel";
import type { DestinationPreview, JobNodeRun } from "./types";

/**
 * Muestra en el panel lateral derecho el detalle del nodo seleccionado de un job
 * (lo usan la tarjeta del job en ejecución y la línea de tiempo del Monitor).
 * - Se vuelve a pasar el contenido en cada cambio del nodo para ver el avance en vivo.
 * - Si el panel se cierra (X, cambio de ruta...), se limpia la selección.
 */
export function useJobNodePanel({
  nodes,
  nextRunAt,
  destinationPreview,
  selectedNodeId,
  onSelectedNodeChange,
}: {
  nodes: JobNodeRun[];
  nextRunAt: string;
  destinationPreview: DestinationPreview;
  selectedNodeId: string | null;
  onSelectedNodeChange: (nodeId: string | null) => void;
}) {
  const { isSidePanelOpen, openSidePanel, closeSidePanel } = useSidePanel();
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;

  // `key` por nodo: al cambiar de nodo el panel se reinicia (pestaña Detalles).
  useEffect(() => {
    if (!selectedNode) return;
    openSidePanel(
      <JobNodePanel
        key={selectedNode.id}
        node={selectedNode}
        nextRunAt={nextRunAt}
        preview={destinationPreview}
        onClose={closeSidePanel}
      />,
      { width: JOB_NODE_PANEL_WIDTH }
    );
  }, [selectedNode, nextRunAt, destinationPreview, openSidePanel, closeSidePanel]);

  const wasPanelOpen = useRef(false);
  useEffect(() => {
    if (wasPanelOpen.current && !isSidePanelOpen && selectedNodeId !== null) onSelectedNodeChange(null);
    wasPanelOpen.current = isSidePanelOpen;
  }, [isSidePanelOpen, selectedNodeId, onSelectedNodeChange]);
}
