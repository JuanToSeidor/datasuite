"use client";

import React, { useEffect, useState } from 'react';
import { CaralIcon } from '@/components/icons';
import { Button } from 'caralstable';
import { WorkspaceCard } from './WorkspaceCard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { suiteConfig, SidebarSection } from '@/config/suite';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function Sidebar({
  className,
  isExpanded = false,
  isWorkspacesView = false,
  setIsWorkspacesView
}: {
  className?: string;
  isExpanded?: boolean;
  isWorkspacesView?: boolean;
  setIsWorkspacesView?: (val: boolean) => void;
}) {
  const { isDark: isDarkMode, toggleDark: toggleTheme } = useTheme();
  const { dict, t } = useLanguage();
  const [isGearMenuOpen, setIsGearMenuOpen] = useState(false);
  const pathname = usePathname();

  // Encontrar si la ruta actual pertenece a uno de los hijos (branches)
  const currentBranch = suiteConfig.branches.find(
    (b) =>
      (b.href && (pathname === b.href || pathname.startsWith(`${b.href}/`))) ||
      pathname === `/${b.id}` ||
      pathname.startsWith(`/${b.id}/`)
  );

  // Helper to translate default sidebar labels dynamically
  const getSectionTitle = (title?: string) => {
    if (!title) return "";
    if (title.toLowerCase() === "explore") return dict.sidebar.explore;
    if (title.toLowerCase() === "manage") return dict.sidebar.manage;
    return title;
  };

  const getItemLabel = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return dict.sidebar.home;
      case "connections":
        return dict.sidebar.connections;
      case "monitor":
        return dict.sidebar.monitor;
      case "dashboard":
        return dict.sidebar.dashboard;
      case "docs":
        return dict.sidebar.docs;
      case "settings":
        return dict.sidebar.settings;
      default:
        return label;
    }
  };

  // Seleccionar las secciones correspondientes: las del hijo activo o las globales por defecto
  const sectionsToRender: SidebarSection[] =
    currentBranch?.sidebarSections && currentBranch.sidebarSections.length > 0
      ? currentBranch.sidebarSections
      : suiteConfig.defaultSidebarSections;

  return (
    <div
      className={`bg-container-50 content-stretch flex flex-col justify-between gap-[10px] items-start px-[20px] py-[20px] relative self-stretch shrink-0 h-full transition-all duration-300 ease-in-out ${isExpanded ? (isWorkspacesView ? 'w-[480px]' : 'w-[240px]') : 'w-[84px]'
        } ${className || ''}`}
    >
      {isWorkspacesView ? (
        <div className="flex flex-col h-full w-full justify-between overflow-hidden pb-4">
          <div className="w-full flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
            <div
              className="flex items-center gap-2 mb-6 px-1 cursor-pointer"
              onClick={() => setIsWorkspacesView?.(false)}
            >
              <Button
                isIconButton
                iconName="chevronLeft"
                variant="ghost"
                className="pointer-events-none text-neutral-800!"
              />
              {isExpanded && <span className="text-neutral-800 text-sm font-medium">{dict.common.back}</span>}
            </div>

            <div className="flex flex-col w-full mb-6">
              {isExpanded && (
                <p className="text-xs font-semibold text-neutral-800 mb-3 px-1">
                  {dict.sidebar.defaultWorkspace}
                </p>
              )}
              <WorkspaceCard
                title="Innovation Crew"
                colorClass="text-info-main"
                bgColorClass="bg-info-main"
                isExpanded={isExpanded}
              />
            </div>

            <div className="flex flex-col w-full">
              {isExpanded && (
                <p className="text-xs font-semibold text-neutral-800 mb-3 px-1">
                  {dict.sidebar.workspaces}
                </p>
              )}

              <WorkspaceCard
                title="Innovation Crew"
                colorClass="text-info-main"
                bgColorClass="bg-info-main"
                isExpanded={isExpanded}
                showColorBar
              />

              <WorkspaceCard
                title="People Crew"
                colorClass="text-[#f97316]"
                bgColorClass="bg-[#f97316]"
                isExpanded={isExpanded}
                showColorBar
              />

              <WorkspaceCard
                title="Juan Crew"
                colorClass="text-[#ef4444]"
                bgColorClass="bg-[#ef4444]"
                isExpanded={isExpanded}
                showColorBar
              />
            </div>
          </div>

          <div className="w-full pt-2 mt-auto">
            <div
              className={`w-full flex items-center justify-center border-2 border-dashed border-[var(--color-neutral-400)] rounded-lg py-3 cursor-pointer hover:bg-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)] transition-colors ${!isExpanded ? 'px-0' : ''
                }`}
            >
              <div className="flex items-center justify-center text-neutral-800">
                <span className="text-xl leading-none mr-2">+</span>
                {isExpanded && <span className="font-semibold text-sm">{dict.common.add} {dict.sidebar.workspaces.toLowerCase()}</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full flex-1 overflow-y-auto  pr-1 custom-scrollbar">
            {/* Header especial si estamos dentro de un hijo / branch */}
            {currentBranch && (
              <div className="mb-4 pb-3 border-b border-neutral-500">
                <Link href="/" className="w-full block mb-2">
                  <Button
                    isIconButton={!isExpanded}
                    iconName="house"
                    variant="ghost"
                    className={
                      isExpanded
                        ? "w-full !justify-start gap-2 px-2 text-xs font-medium text-neutral-800 hover:text-info-main"
                        : "w-full"
                    }
                  >
                    {isExpanded && <>{suiteConfig.name}</>}
                  </Button>
                </Link>


              </div>
            )}

            {/* Renderizado de secciones dinámicas */}
            {sectionsToRender.map((section, sectionIdx) => (
              <div
                key={section.sectionTitle || sectionIdx}
                className={`content-stretch flex flex-col gap-[8px] items-start relative w-full ${sectionIdx > 0 ? 'pt-[16px]' : 'pt-[4px]'
                  }`}
              >
                {section.sectionTitle && (
                  <p
                    className={`text-xs font-semibold text-neutral-800 px-2 transition-all ${!isExpanded ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100 mb-1'
                      }`}
                  >
                    {getSectionTitle(section.sectionTitle)}
                  </p>
                )}

                {section.items.map((item) => {
                  const isExact = pathname === item.href;
                  const isSubRoute = item.href !== '/' && pathname.startsWith(item.href + '/');
                  const hasMoreSpecificMatch =
                    isSubRoute &&
                    sectionsToRender.some((sec) =>
                      sec.items.some(
                        (otherItem) =>
                          otherItem.href !== item.href &&
                          (pathname === otherItem.href || pathname.startsWith(otherItem.href + '/'))
                      )
                    );
                  const isActive = isExact || (isSubRoute && !hasMoreSpecificMatch);
                  const label = getItemLabel(item.label);

                  if (item.external) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full block"
                      >
                        <Button
                          isIconButton={!isExpanded}
                          iconName={item.iconName}
                          variant="ghost"
                          className={isExpanded ? "w-full !justify-start gap-3 px-4" : "w-full"}
                        >
                          {isExpanded && label}
                        </Button>
                      </a>
                    );
                  }

                  return (
                    <Link key={item.label} href={item.href} className="w-full block">
                      <Button
                        isIconButton={!isExpanded}
                        iconName={item.iconName}
                        variant={isActive && !currentBranch ? "default" : "ghost"}
                        style={
                          isActive && currentBranch?.color
                            ? {
                              background: `${currentBranch.color}`,
                              color: '#ffffff',
                            }
                            : undefined
                        }
                        className={
                          isExpanded
                            ? `w-full !justify-start gap-3 px-4 ${isActive ? 'text-white!' : ''}`
                            : isActive
                              ? 'text-white!'
                              : ''
                        }
                      >
                        {isExpanded && label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Menú inferior: Herramientas + Workspace Switcher */}
          <div className="content-stretch flex flex-col gap-[20px] items-center justify-center relative shrink-0 w-full pt-4 pb-2">
            {isExpanded ? (
              <div className="grid gap-[10px] w-full grid-cols-4 transition-all">
                <Button isIconButton iconName="key" variant="ghost" className="w-full" />
                <Button isIconButton iconName="dolar" variant="ghost" className="w-full" />
                <Button isIconButton iconName="code" variant="ghost" className="w-full" />
                <Button
                  isIconButton
                  iconName={isDarkMode ? "sunMoon" : "sunBright"}
                  variant="ghost"
                  hasBorder
                  className="w-full"
                  onClick={toggleTheme}
                />
              </div>
            ) : (
              <div className="relative w-full">
                <Button
                  isIconButton
                  iconName="gear"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsGearMenuOpen(!isGearMenuOpen)}
                />
                {isGearMenuOpen && (
                  <div className="absolute left-[calc(100%+10px)] bottom-0 bg-[var(--color-neutral-full)] border border-[var(--color-neutral-400)] rounded-lg p-[10px] grid grid-cols-2 gap-[10px] z-[100] shadow-xl w-[120px]">
                    <Button isIconButton iconName="key" variant="ghost" className="w-full" />
                    <Button isIconButton iconName="dolar" variant="ghost" className="w-full" />
                    <Button isIconButton iconName="code" variant="ghost" className="w-full" />
                    <Button
                      isIconButton
                      iconName={isDarkMode ? "sunMoon" : "sunBright"}
                      variant="ghost"
                      hasBorder
                      className="w-full"
                      onClick={toggleTheme}
                    />
                  </div>
                )}
              </div>
            )}

            <Button
              variant="success"
              isIconButton={!isExpanded}
              iconName={!isExpanded ? "users" : undefined}
              className={
                isExpanded
                  ? "w-full !justify-between px-4 flex items-center font-normal! text-sm"
                  : "w-full"
              }
              onClick={() => setIsWorkspacesView?.(true)}
            >
              {isExpanded && (
                <>
                  <span className="truncate">Workspace name</span>
                  <CaralIcon name="chevronRigth" size={16} />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
