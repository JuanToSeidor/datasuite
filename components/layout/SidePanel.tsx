"use client";

import React from "react";

export const DEFAULT_SIDE_PANEL_WIDTH = 360;

// Columna derecha de alto completo, con la misma mecánica que AnalicePanel:
// siempre forma parte de la fila y solo anima su ancho al abrir/cerrar/expandir.
export function SidePanel({
  isOpen,
  isExpanded = false,
  width = DEFAULT_SIDE_PANEL_WIDTH,
  children,
}: {
  isOpen: boolean;
  isExpanded?: boolean;
  width?: number;
  children: React.ReactNode;
}) {
  const widthClasses = !isOpen
    ? "md:w-0 md:border-l-0 max-md:hidden"
    : isExpanded
      ? "md:w-full max-md:fixed max-md:top-[84px] max-md:bottom-0 max-md:right-0 max-md:z-40 max-md:w-full"
      : "md:w-[var(--side-panel-w)] max-md:fixed max-md:top-[84px] max-md:bottom-0 max-md:right-0 max-md:z-40 max-md:w-full";

  return (
    <aside
      aria-hidden={!isOpen}
      style={{ "--side-panel-w": `${width}px` } as React.CSSProperties}
      className={`bg-container border-l border-neutral-200 flex flex-col overflow-hidden h-full transition-all duration-300 ease-in-out ${
        isExpanded ? "shrink" : "shrink-0"
      } ${widthClasses}`}
    >
      <div className="flex h-full flex-col overflow-y-auto md:min-w-[var(--side-panel-w)]">{children}</div>
    </aside>
  );
}
