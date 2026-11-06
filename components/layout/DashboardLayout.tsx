"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AnalicePanel } from './AnalicePanel';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { suiteConfig } from '@/config/suite';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isWorkspacesView, setIsWorkspacesView] = useState(false);
  const [isLoadingModule, setIsLoadingModule] = useState(false);
  const [isAnaliceOpen, setIsAnaliceOpen] = useState(false);
  const [isAnaliceExpanded, setIsAnaliceExpanded] = useState(false);

  const closeAnalice = () => {
    setIsAnaliceOpen(false);
    setIsAnaliceExpanded(false);
  };
  const pathname = usePathname();
  const prevBranchRef = useRef<string | null>(null);

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

  useEffect(() => {
    const branchSegment = pathname?.split('/')[1];
    const isBranch = suiteConfig.branches.some((b) => b.id === branchSegment);

    if (isBranch && branchSegment !== prevBranchRef.current) {
      setIsLoadingModule(true);
      const timer = setTimeout(() => {
        setIsLoadingModule(false);
      }, 2000);
      prevBranchRef.current = branchSegment;
      return () => clearTimeout(timer);
    } else if (!isBranch) {
      prevBranchRef.current = null;
      setIsLoadingModule(false);
    }
  }, [pathname]);

  return (
    <div className="bg-[var(--color-neutral-full)] content-stretch flex flex-col items-stretch relative h-screen w-full overflow-hidden">
      {isLoadingModule && <LoadingScreen fullScreen={true} />}
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        isAnaliceOpen={isAnaliceOpen}
        onToggleAnalice={() => {
          if (isAnaliceOpen) {
            closeAnalice();
          } else {
            setIsAnaliceOpen(true);
          }
        }}
      />
      <div className="content-stretch flex items-stretch relative shrink-0 w-full flex-1 min-h-0">
        {/* Contenedor que anima el ancho del sidebar y recorta su contenido:
            al expandir el panel Analice el sidebar se colapsa a 0 sin dejar residuos. */}
        <div
          className="flex shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-in-out"
          style={{
            width: isAnaliceOpen && isAnaliceExpanded
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
        <main className={`content-stretch flex flex-[1_0_0] flex-col gap-[30px] items-start min-w-px relative h-full transition-all duration-300 ease-in-out ${isAnaliceOpen && isAnaliceExpanded ? 'p-0 overflow-hidden' : 'p-[20px] overflow-y-auto'}`}>
          {children}
        </main>
        <AnalicePanel
          isOpen={isAnaliceOpen}
          isExpanded={isAnaliceExpanded}
          onToggleExpand={() => setIsAnaliceExpanded((prev) => !prev)}
          onClose={closeAnalice}
        />
      </div>
    </div>
  );
}
