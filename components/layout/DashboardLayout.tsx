"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AnalicePanel } from './AnalicePanel';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AnaliceContext } from '@/contexts/AnaliceContext';
import { SidePanelContext, type SidePanelOptions } from '@/contexts/SidePanelContext';
import { SidePanel, DEFAULT_SIDE_PANEL_WIDTH } from './SidePanel';
import { RolePreviewBanner } from './RolePreviewBanner';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

const IMMERSIVE_ROUTES = ['/move/jobs/editor'];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isWorkspacesView, setIsWorkspacesView] = useState(false);
  const [isAnaliceOpen, setIsAnaliceOpen] = useState(false);
  const [isAnaliceExpanded, setIsAnaliceExpanded] = useState(false);

  const closeAnalice = () => {
    setIsAnaliceOpen(false);
    setIsAnaliceExpanded(false);
  };
  const toggleAnalice = () => {
    if (isAnaliceOpen) {
      closeAnalice();
    } else {
      setIsAnaliceOpen(true);
    }
  };
  const pathname = usePathname();
  // Vistas a pantalla completa (editor de jobs): sin sidebar general, sin hamburguesa y sin padding;
  // la página trae su propio sidebar y barra de herramientas.
  const isImmersive = IMMERSIVE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // Panel lateral derecho controlado por las páginas (p. ej. resumen del nodo).
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState<React.ReactNode>(null);
  const [sidePanelWidth, setSidePanelWidth] = useState(DEFAULT_SIDE_PANEL_WIDTH);
  const openSidePanel = useCallback((content: React.ReactNode, options?: SidePanelOptions) => {
    setSidePanelContent(content);
    setSidePanelWidth(options?.width ?? DEFAULT_SIDE_PANEL_WIDTH);
    setIsSidePanelOpen(true);
  }, []);
  // El contenido se conserva al cerrar para que no desaparezca durante la animación.
  // Al cerrar, el panel vuelve a su ancho normal para la próxima apertura.
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(false);
  const closeSidePanel = useCallback(() => {
    setIsSidePanelOpen(false);
    setIsSidePanelExpanded(false);
  }, []);
  const toggleSidePanelExpand = useCallback(() => setIsSidePanelExpanded((prev) => !prev), []);

  // Al cambiar de ruta el panel se cierra y se vacía: pertenece a la página anterior.
  useEffect(() => {
    setIsSidePanelOpen(false);
    setIsSidePanelExpanded(false);
    setSidePanelContent(null);
  }, [pathname]);

  const handleToggleSidebar = () => {
    if (isWorkspacesView) {
      setIsWorkspacesView(false);
    } else {
      setIsSidebarExpanded(!isSidebarExpanded);
    }
  };

  const handleSetWorkspacesView = (val: boolean) => {
    setIsWorkspacesView(val);
    if (val) {
      setIsSidebarExpanded(true);
    }
  };

  return (
    <WorkspaceProvider>
    <AnaliceContext.Provider value={{ isAnaliceOpen, toggleAnalice }}>
    <SidePanelContext.Provider
      value={{ isSidePanelOpen, isSidePanelExpanded, openSidePanel, closeSidePanel, toggleSidePanelExpand }}
    >
    <div className="bg-[var(--color-neutral-full)] content-stretch flex flex-col items-stretch relative h-screen w-full overflow-hidden">
      <Navbar
        onToggleSidebar={isImmersive ? undefined : handleToggleSidebar}
        isAnaliceOpen={isAnaliceOpen}
        onToggleAnalice={toggleAnalice}
        showBranchNav={!isImmersive}
      />
      <RolePreviewBanner />
      <div className="content-stretch flex items-stretch relative shrink-0 w-full flex-1 min-h-0">
        {/* Contenedor que anima el ancho del sidebar y recorta su contenido:
            al expandir el panel Analice el sidebar se colapsa a 0 sin dejar residuos. */}
        <div
          className="flex shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-in-out"
          style={{
            // Se oculta con Analice expandido o con el panel lateral de la página abierto.
            width: isImmersive || (isAnaliceOpen && isAnaliceExpanded) || isSidePanelOpen
              ? 0
              : isSidebarExpanded
                ? (isWorkspacesView ? 480 : 240)
                : 84,
          }}
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            isWorkspacesView={isWorkspacesView}
            setIsWorkspacesView={handleSetWorkspacesView}
          />
        </div>
        <main className={`content-stretch flex flex-[1_0_0] flex-col gap-[30px] items-start min-w-px relative h-full transition-all duration-300 ease-in-out ${(isAnaliceOpen && isAnaliceExpanded) || (isSidePanelOpen && isSidePanelExpanded) ? 'p-0 overflow-hidden invisible' : isImmersive ? 'p-0 overflow-hidden' : 'p-[20px] overflow-y-auto'}`}>
          {children}
        </main>
        <SidePanel isOpen={isSidePanelOpen} isExpanded={isSidePanelExpanded} width={sidePanelWidth}>{sidePanelContent}</SidePanel>
        <AnalicePanel
          isOpen={isAnaliceOpen}
          isExpanded={isAnaliceExpanded}
          onToggleExpand={() => setIsAnaliceExpanded((prev) => !prev)}
          onClose={closeAnalice}
        />
      </div>
    </div>
    </SidePanelContext.Provider>
    </AnaliceContext.Provider>
    </WorkspaceProvider>
  );
}
