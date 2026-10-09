import React from 'react';
import { CaralIcon } from '@/components/icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkspaceCardProps {
  title: string;
  description?: string;
  colorClass: string;
  bgColorClass: string;
  isExpanded: boolean;
  showColorBar?: boolean;
}

export function WorkspaceCard({
  title,
  description,
  colorClass,
  bgColorClass,
  isExpanded,
  showColorBar = false
}: WorkspaceCardProps) {
  const { dict } = useLanguage();
  const displayDescription = description || dict.sidebar.defaultWorkspace;
  return (
    <div className="bg-white dark:bg-[var(--color-neutral-800)] rounded-lg overflow-hidden flex flex-col shadow-sm cursor-pointer hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-neutral-700)] transition-colors mb-3">
      <div className="flex items-center p-3 gap-3">
        <div className="flex -space-x-2 shrink-0">
          <div className="size-6 rounded-full bg-[var(--color-neutral-900)] text-white flex items-center justify-center text-[10px] font-bold z-30">M</div>
          <div className={`size-6 rounded-full ${bgColorClass} text-white flex items-center justify-center text-[10px] font-bold z-20`}>L</div>
          <div className="size-6 rounded-full bg-success-main text-white flex items-center justify-center text-[10px] font-bold z-10">L</div>
          <div className="size-6 rounded-full bg-[var(--color-neutral-700)] text-white flex items-center justify-center text-[10px] font-bold z-0">+5</div>
        </div>
        {isExpanded && (
          <>
            <div className="flex-1 flex flex-col justify-center overflow-hidden border-l border-[var(--color-neutral-300)] pl-3 ml-1">
              <span className="font-bold text-sm text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] truncate">{title}</span>
              <span className="text-[10px] text-[var(--color-neutral-600)] truncate">{displayDescription}</span>
            </div>
            <CaralIcon name="arrowRight" size={16} />
          </>
        )}
      </div>
      {showColorBar && (
        <div className={`h-2 w-full ${bgColorClass}`} />
      )}
    </div>
  );
}
