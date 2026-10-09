"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DriverEntity } from './DriverAllocationRow';
import { CaralIcon } from '@/components/icons';
import { Button } from 'caralstable';
import { useLanguage } from '@/contexts/LanguageContext';

interface AllocationMultiSliderProps {
  entities: DriverEntity[];
  onChange: (updatedEntities: DriverEntity[]) => void;
  minPercentage?: number;
  step?: number;
  className?: string;
  onEditEntityName?: (id: string, newName: string) => void;
  onRemoveEntity?: (id: string) => void;
}

const COLOR_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald / Mint Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export function AllocationMultiSlider({
  entities,
  onChange,
  minPercentage = 2,
  step = 1,
  className = '',
  onEditEntityName,
  onRemoveEntity,
}: AllocationMultiSliderProps) {
  const { dict } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeHandleIdx, setActiveHandleIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [openColorPickerId, setOpenColorPickerId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close color popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenColorPickerId(null);
      }
    };
    if (openColorPickerId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openColorPickerId]);

  // Cumulative positions (boundaries): b[0] = 0, b[1] = p0, b[2] = p0 + p1, ..., b[N] = 100
  const boundaries = React.useMemo(() => {
    const arr = [0];
    let sum = 0;
    entities.forEach((ent) => {
      sum += ent.percentage;
      arr.push(sum);
    });
    return arr;
  }, [entities]);

  const handlePointerDown = (handleIdx: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHandleIdx(handleIdx);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (activeHandleIdx === null || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const rawPct = ((clientX - rect.left) / rect.width) * 100;

      // Handle at activeHandleIdx divides entities[activeHandleIdx - 1] and entities[activeHandleIdx]
      const leftBound = boundaries[activeHandleIdx - 1] + minPercentage;
      const rightBound = boundaries[activeHandleIdx + 1] - minPercentage;

      if (leftBound >= rightBound) return;

      let clampedPct = Math.max(leftBound, Math.min(rightBound, rawPct));

      if (step > 1) {
        clampedPct = Math.round(clampedPct / step) * step;
        clampedPct = Math.max(leftBound, Math.min(rightBound, clampedPct));
      } else {
        clampedPct = Math.round(clampedPct);
      }

      // Calculate new percentages for adjacent entities
      const newPctLeft = clampedPct - boundaries[activeHandleIdx - 1];
      const newPctRight = boundaries[activeHandleIdx + 1] - clampedPct;

      const updated = [...entities];
      updated[activeHandleIdx - 1] = {
        ...updated[activeHandleIdx - 1],
        percentage: newPctLeft,
      };
      updated[activeHandleIdx] = {
        ...updated[activeHandleIdx],
        percentage: newPctRight,
      };

      onChange(updated);
    },
    [activeHandleIdx, boundaries, entities, minPercentage, onChange, step]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (activeHandleIdx !== null) {
        try {
          if (e.target && 'releasePointerCapture' in e.target && 'pointerId' in e) {
            (e.target as HTMLElement).releasePointerCapture((e as PointerEvent).pointerId);
          }
        } catch (_) { }
        setActiveHandleIdx(null);
      }
    },
    [activeHandleIdx]
  );

  useEffect(() => {
    if (activeHandleIdx !== null) {
      const onMove = (e: PointerEvent) => handlePointerMove(e);
      const onUp = (e: PointerEvent) => handlePointerUp(e);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
    }
  }, [activeHandleIdx, handlePointerMove, handlePointerUp]);

  const handleSelectColor = (entityId: string, newColor: string) => {
    const updated = entities.map((e) =>
      e.id === entityId ? { ...e, color: newColor } : e
    );
    onChange(updated);
    setOpenColorPickerId(null);
  };

  const [draggedEntityIdx, setDraggedEntityIdx] = useState<number | null>(null);
  const [dragOverEntityIdx, setDragOverEntityIdx] = useState<number | null>(null);

  const handleEntityDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedEntityIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleEntityDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverEntityIdx !== idx) setDragOverEntityIdx(idx);
  };

  const handleEntityDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedEntityIdx === null || draggedEntityIdx === targetIdx) {
      setDraggedEntityIdx(null);
      setDragOverEntityIdx(null);
      return;
    }
    const updated = [...entities];
    const [movedItem] = updated.splice(draggedEntityIdx, 1);
    updated.splice(targetIdx, 0, movedItem);
    onChange(updated);
    setDraggedEntityIdx(null);
    setDragOverEntityIdx(null);
  };

  return (
    <div className={`w-full flex flex-col select-none pt-4 ${className}`}>
      {/* Top Floating Entity Pills */}
      <div className="relative w-full h-11 mb-2">
        {entities.map((ent, idx) => {
          const startPct = boundaries[idx];
          const widthPct = ent.percentage;
          const color = ent.color || COLOR_PALETTE[idx % COLOR_PALETTE.length];
          const isPickerOpen = openColorPickerId === ent.id;
          const isDragging = draggedEntityIdx === idx;
          const isDragOver = dragOverEntityIdx === idx;

          return (
            <div
              key={ent.id}
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`,
              }}
              className="absolute top-0 h-full flex items-center justify-center px-1 transition-all duration-75"
            >
              <div
                draggable
                onDragStart={(e) => handleEntityDragStart(e, idx)}
                onDragOver={(e) => handleEntityDragOver(e, idx)}
                onDrop={(e) => handleEntityDrop(e, idx)}
                onDragEnd={() => {
                  setDraggedEntityIdx(null);
                  setDragOverEntityIdx(null);
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`relative px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 max-w-full shadow-2xs bg-container ${
                  isDragging
                    ? 'opacity-40 border-dashed border-seidor-main scale-95'
                    : isDragOver
                    ? 'border-seidor-main ring-2 ring-seidor-main/40 shadow-lg scale-105 z-30'
                    : hoveredIdx === idx || isPickerOpen
                    ? 'border-neutral-500 shadow-md scale-105 z-30'
                    : 'border-neutral-500 z-10'
                }`}
              >
                {/* Horizontal Drag Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing text-neutral-800 hover:text-neutral-900 flex items-center shrink-0 transition-colors p-0.5"
                  title="Arrastrar para reordenar horizontalmente"
                >
                  <CaralIcon name="arrowsLeftRight" size={14} />
                </div>

                {/* Clickable Color Circle with Dropdown Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenColorPickerId(isPickerOpen ? null : ent.id);
                  }}
                  style={{ backgroundColor: color }}
                  className="size-3 rounded-full shrink-0 shadow-2xs hover:scale-130 transition-transform ring-2 ring-transparent hover:ring-seidor-main/40 cursor-pointer"
                  title="Cambiar color de la entidad"
                />

                {/* Color Picker Dropdown Popover (Positioned Above Pill) */}
                {isPickerOpen && (
                  <div
                    ref={popoverRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 bg-container rounded-xl border border-neutral-500 shadow-2xl z-50 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {COLOR_PALETTE.map((c) => {
                      const isSelected = color === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleSelectColor(ent.id, c)}
                          style={{ backgroundColor: c }}
                          className={`size-5 rounded-full transition-transform hover:scale-125 flex items-center justify-center ${isSelected ? 'ring-2 ring-neutral-900 scale-110' : ''
                            }`}
                          title={`Color ${c}`}
                        >
                          {isSelected && <span className="size-1.5 rounded-full bg-white drop-shadow-xs" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Entity Name (Editable) */}
                {onEditEntityName ? (
                  <input
                    type="text"
                    value={ent.name}
                    onChange={(e) => onEditEntityName(ent.id, e.target.value)}
                    className="text-xs font-bold text-neutral-900 bg-transparent outline-none truncate max-w-[130px]"
                    placeholder="Entidad..."
                  />
                ) : (
                  <span className="text-xs font-bold text-neutral-900 truncate max-w-[130px]">
                    {ent.name}
                  </span>
                )}

                {/* Optional Remove Button */}
                {onRemoveEntity && entities.length > 1 && (
                  <Button
                    variant='ghost'
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveEntity(ent.id);
                    }}
                    iconName='trash'
                    hasBorder
                    size='sm'
                    className='text-neutral-800! hover:text-neutral-900! transition-colors'
                    title='Elimiar entidad' />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Multi-Segment Slider Track */}
      <div
        ref={trackRef}
        className="relative w-full h-7 rounded-full bg-neutral-500 flex items-center"
      >
        {/* Segments */}
        {entities.map((ent, idx) => {
          const startPct = boundaries[idx];
          const widthPct = ent.percentage;

          return (
            <div
              key={ent.id}
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`,
              }}
              className="absolute top-0 h-full flex items-center justify-center transition-all duration-75 px-3 overflow-hidden"
            >
              {/* Segment background bar */}
              <div className="absolute inset-0 bg-neutral-500/80 rounded-full border border-neutral-500 shadow-inner" />

              {/* Percentage label inside segment */}
              <span className="relative z-1 text-xs font-semibold text-neutral-800 select-none font-mono">
                {ent.percentage}%
              </span>
            </div>
          );
        })}

        {/* Start boundary knob (0%) */}
        <div
          style={{ left: '0%' }}
          className="absolute -translate-x-1/2 size-4.5 rounded-full bg-seidor-main ring-2 ring-container shadow-md z-10 pointer-events-none"
        />

        {/* Draggable Internal Handles between segments */}
        {entities.slice(0, -1).map((_, idx) => {
          const handleIdx = idx + 1;
          const posPct = boundaries[handleIdx];
          const isDragging = activeHandleIdx === handleIdx;

          return (
            <div
              key={`handle-${handleIdx}`}
              style={{ left: `${posPct}%` }}
              onPointerDown={(e) => handlePointerDown(handleIdx, e)}
              className={`absolute -translate-x-1/2 size-5 rounded-full bg-seidor-main ring-2 ring-container shadow-md cursor-ew-resize z-30 transition-transform flex items-center justify-center hover:scale-125 active:scale-135 ${isDragging ? 'scale-130 ring-4 ring-seidor-main/40 shadow-lg' : ''
                }`}
              title={`Arrastrar para ajustar (${entities[idx].name} / ${entities[idx + 1].name})`}
            >
              <div className="size-1.5 rounded-full bg-white" />
            </div>
          );
        })}

        {/* End boundary knob (100%) */}
        <div
          style={{ left: '100%' }}
          className="absolute -translate-x-1/2 size-4.5 rounded-full bg-seidor-main ring-2 ring-container shadow-md z-10 pointer-events-none"
        />
      </div>
    </div>
  );
}
