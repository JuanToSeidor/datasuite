"use client";

import React from 'react';
import { Button } from 'caralstable';
import { AnaliceIcon } from '@/components/icons/AnaliceIcon';
import { useLanguage } from '@/contexts/LanguageContext';

export function AnalicePanel({
  isOpen,
  isExpanded,
  onToggleExpand,
  onClose
}: {
  isOpen: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  const { dict } = useLanguage();

  // Siempre es una columna de la fila (como el sidebar): solo cambia el ancho,
  // así la transición es continua y no salta al cambiar de posición.
  const widthClasses = !isOpen
    ? 'md:w-0 md:border-l-0 max-md:hidden'
    : isExpanded
      ? 'md:w-full max-md:fixed max-md:top-[84px] max-md:bottom-0 max-md:right-0 max-md:z-40 max-md:w-full'
      : 'md:w-[29%] max-md:fixed max-md:top-[84px] max-md:bottom-0 max-md:right-0 max-md:z-40 max-md:w-full';

  return (
    <aside
      aria-label={dict.navbar.analyze}
      aria-hidden={!isOpen}
      className={`bg-container border-l border-neutral-200 shadow-xl flex flex-col overflow-hidden shrink h-full transition-all duration-300 ease-in-out ${widthClasses}`}
    >
      <div className="flex flex-col h-full min-w-[280px]">
        <div className="bg-seidor-main flex items-center justify-between gap-3 px-5 h-[72px] shrink-0">
          <div className="flex items-center gap-3">
            <AnaliceIcon size={27} />
            <h2 className="text-neutral-100 font-poppins font-bold text-xl">{dict.navbar.analyze}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              isIconButton
              iconName="arrowsLeftRight"
              variant="ghost"
              onClick={onToggleExpand}
              className="text-neutral-100!"
            />
            <Button
              isIconButton
              iconName="x"
              variant="ghost"
              onClick={onClose}
              className="text-neutral-100!"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="bg-[var(--color-neutral-full)] rounded-[16px] border border-neutral-200 p-4 flex flex-col gap-8 w-full">
            <span className="text-neutral-800 text-sm">{dict.navbar.chatPlaceholder}</span>
            <div className="flex justify-between items-center">
              <Button isIconButton iconName="plus" variant="ghost" />
              <Button isIconButton iconName="plane" isPill variant="info" />
            </div>
          </div>

          <Button variant='light' className='w-full border border-neutral-500!'>
            {dict.navbar.promptSummarize}
          </Button>

          <Button variant='light' className='w-full border border-neutral-500!'>
            {dict.navbar.promptSapToAws}
          </Button>

          <Button variant='light' className='w-full border border-neutral-500!'>
            {dict.navbar.promptAwsToSap}
          </Button>
        </div>
      </div>
    </aside>
  );
}
