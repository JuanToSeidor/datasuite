"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { suiteConfig } from '@/config/suite';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isWorkspacesView, setIsWorkspacesView] = useState(false);
  const [isLoadingModule, setIsLoadingModule] = useState(false);
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
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <div className="content-stretch flex items-stretch relative shrink-0 w-full flex-1 min-h-0">
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          isWorkspacesView={isWorkspacesView} 
          setIsWorkspacesView={handleSetWorkspacesView} 
        />
        <main className="content-stretch flex flex-[1_0_0] flex-col gap-[30px] items-start min-w-px overflow-y-auto p-[20px] relative h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
