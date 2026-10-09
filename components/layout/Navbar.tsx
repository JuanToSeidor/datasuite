"use client";

import React, { useState, useEffect } from 'react';
import { CaralIcon, Brand, CrestoneLogo } from '@/components/icons';
import { suiteConfig } from '@/config/suite';
import { Button, Drawer, Tabs } from 'caralstable';
import { useNewsData } from '@/hooks/useNewsData';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserMenu } from './UserMenu';

export function Navbar({
  className,
  onToggleSidebar
}: {
  className?: string;
  onToggleSidebar?: () => void;
}) {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState(0);
  const { data: newsData, loading: newsLoading } = useNewsData();
  const pathname = usePathname();

  // Detectar si estamos dentro de un producto/hijo específico
  const currentBranch = suiteConfig.branches.find(
    (b) =>
      (b.href && (pathname === b.href || pathname.startsWith(`${b.href}/`))) ||
      pathname === `/${b.id}` ||
      pathname.startsWith(`/${b.id}/`)
  );

  const logoAccentColor = currentBranch?.color || "var(--color-info-main, #0191FF)";

  const NOTIF_TABS = [{ label: 'Notifications' }, { label: 'Version' }];

  return (
    <div className={`bg-container shadow-md content-stretch flex items-center justify-between overflow-visible px-[10px] py-[20px] relative w-full h-[84px] shrink-0 z-50 ${className || ''}`}>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
        <Button isIconButton iconName="menu" variant="ghost" hasBorder onClick={onToggleSidebar} />
        <Link
          href='/'
          className="content-stretch"
          title={currentBranch ? `Crestone ${currentBranch.title}` : suiteConfig.name}
        >
          <CrestoneLogo size={24} accentColor={logoAccentColor} />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href='/'
            className="font-semibold text-seidor-main-text dark:text-white text-xl tracking-tight whitespace-nowrap hover:opacity-90 flex items-center gap-1.5"
          >
            <span>{suiteConfig.name}</span>
            <span
              className={`font-light transition-colors duration-300 ${currentBranch ? 'font-light' : 'text-neutral-800 dark:text-neutral-300'
                }`}
              style={currentBranch ? { color: currentBranch.color } : undefined}
            >
              {currentBranch ? currentBranch.title : "Suite"}
            </span>
          </Link>
        </div>
      </div>
      <div className="content-stretch flex gap-[20px] items-center relative shrink-0">
        <div className="relative">
          <Button isIconButton iconName="bell" variant="light" className='bg-transparent hover:text-seidor-main' hasBorder onClick={() => setIsNotificationsOpen(true)} />

          <Drawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} title='Updates'>

            <div className="p-4 border-b border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-800)]">
              <Tabs activeIndex={activeNotifTab} onChange={(index) => setActiveNotifTab(index)} tabs={NOTIF_TABS} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeNotifTab === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-neutral-700)]">
                  <CaralIcon name="bell" size={48} />
                  <p>You don't have any new notifications.</p>
                </div>
              )}

              {activeNotifTab === 1 && (
                <div className="flex flex-col gap-6">
                  {newsLoading ? (
                    <p className="text-center text-[var(--color-neutral-500)] mt-10">Cargando novedades...</p>
                  ) : (
                    Object.values(newsData).sort((a: any, b: any) => b.version.localeCompare(a.version)).map((release: any) => (
                      <div key={release.version} className="flex flex-col gap-2 pb-6 border-b border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-800)] last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="bg-info-light text-info-main text-xs font-bold px-2 py-1 rounded">v{release.version}</span>
                          <span className="text-xs text-[var(--color-neutral-700)]">{release.date}</span>
                        </div>
                        <p className="text-sm text-[var(--color-neutral-900)]  mb-2">{release.description}</p>
                        <div className="mt-4">
                          <a
                            href={`https://crestone-help.seidoranalytics.com/docs/releasenotes/${release.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block"
                          >
                            <Button variant="light" className="w-full text-[var(--color-info-main)]! border border-[var(--color-info-main)] hover:bg-info-main! hover:text-white!">
                              See more
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Drawer>
        </div>
        <div className="relative">
          <Button isIconButton iconName="grid" variant="light" className='bg-transparent hover:text-seidor-main' hasBorder onClick={() => setIsLauncherOpen(true)} />

          <Drawer isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} title={suiteConfig.name} >


            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
              {suiteConfig.branches.map((branch) => (
                <a key={branch.id} href={branch.href || '#'} className="flex flex-col items-center gap-2 group decoration-transparent">
                  <div
                    className="w-[64px] h-[64px] rounded-[14px] flex items-center justify-center border border-white/5 shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: branch.color }}
                  >
                    <CaralIcon name={suiteConfig.icon} color='var(--color-neutral-100)' />
                  </div>
                  <span className="text-[var(--color-neutral-800)] group-hover:text-[var(--color-neutral-900)] text-[13px] font-medium text-center w-full truncate">
                    {branch.title}
                  </span>
                </a>
              ))}
            </div>

          </Drawer>
        </div>
        <div className="relative">
          <Button hasBorder variant="light" className='bg-transparent h-[44px] w-[44px] p-0' onClick={() => setIsChatOpen(true)}>
            <Brand name='Daiana' size={24} />
          </Button>

          <Drawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title='Hola, ¿en qué puedo ayudarle?'>

            <div className="flex flex-col h-full justify-center  gap-4">
              <div className="bg-[var(--color-neutral-full)] rounded-[16px] border border-white/10 p-4 flex flex-col gap-8 w-full">
                <span className="text-[var(--color-neutral-800)] text-sm">Enviar un mensaje a Daiana</span>
                <div className="flex justify-between items-center text-[var(--color-neutral-200)]! ">
                  <Button isIconButton iconName="plus" variant="ghost" />
                  <Button isIconButton iconName="plane" isPill variant="info" />
                </div>
              </div>

              <Button variant='light' className='w-full border border-neutral-500!'>
                Resumir los puntos principales de esta página.
              </Button>

              <Button variant='light' className='w-full border border-neutral-500!'>
                Crear un nuevo flujo de SAP a AWS.
              </Button>

              <Button variant='light' className='w-full border border-neutral-500!'>
                Crear un nuevo flujo de AWS a SAP.
              </Button>



            </div>

          </Drawer>
        </div>
        <UserMenu />
      </div>
    </div>
  );
}
