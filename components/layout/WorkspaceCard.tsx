import React from 'react';
import { CaralIcon, Icons } from '@/components/icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkspaceCardProps {
  title: string;
  description?: string;
  colorClass?: string;
  bgColorClass?: string;
  color?: string;
  iconName?: Icons;
  isExpanded: boolean;
  showColorBar?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function WorkspaceCard({
  title,
  description,
  colorClass,
  bgColorClass,
  color,
  iconName,
  isExpanded,
  showColorBar = false,
  isSelected = false,
  onClick
}: WorkspaceCardProps) {
  const { dict } = useLanguage();
  const displayDescription = description || dict.sidebar.defaultWorkspace;
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[var(--color-neutral-800)] rounded-lg overflow-hidden flex flex-col shadow-sm cursor-pointer hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-neutral-700)] transition-all mb-3 ${
        isSelected ? 'ring-2 ring-offset-1 ring-info-main' : ''
      }`}
    >
      <div className="flex items-center p-3 gap-3">
        {iconName ? (
          <div
            className="size-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ backgroundColor: color || 'var(--color-info-main)' }}
          >
            <CaralIcon name={iconName} size={18} />
          </div>
        ) : (
          <div className="flex -space-x-2 shrink-0">
            <div className="size-6 rounded-full bg-[var(--color-neutral-900)] text-white flex items-center justify-center text-[10px] font-bold z-30">M</div>
            <div className={`size-6 rounded-full ${bgColorClass || 'bg-info-main'} text-white flex items-center justify-center text-[10px] font-bold z-20`}>L</div>
            <div className="size-6 rounded-full bg-success-main text-white flex items-center justify-center text-[10px] font-bold z-10">L</div>
            <div className="size-6 rounded-full bg-[var(--color-neutral-700)] text-white flex items-center justify-center text-[10px] font-bold z-0">+5</div>
          </div>
        )}
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
        <div
          className={`h-2 w-full ${bgColorClass || ''}`}
          style={color ? { backgroundColor: color } : undefined}
        />
      )}
    </div>
  );
}
