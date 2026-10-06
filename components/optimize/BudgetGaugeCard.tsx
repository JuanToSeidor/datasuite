"use client";

import React from 'react';
import { Button } from 'caralstable';
import { CaralIcon } from '@/components/icons';

interface BudgetGaugeCardProps {
  currentSpend?: number;
  budgetLimit?: number;
}

export function BudgetGaugeCard({
  currentSpend = 2700,
  budgetLimit = 3000,
}: BudgetGaugeCardProps) {
  const percentage = Math.min(100, Math.round((currentSpend / budgetLimit) * 100));

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75; // 270 degrees arc
  const progressLength = (percentage / 100) * totalArc;

  const statusInfo =
    percentage >= 90
      ? { label: `Crítico (${percentage}%)`, bg: "bg-red-50 dark:bg-red-950/40 text-red-500", stroke: "#EF4444" }
      : percentage >= 75
        ? { label: `Advertencia (${percentage}%)`, bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-500", stroke: "#F59E0B" }
        : percentage >= 50
          ? { label: `Normal (${percentage}%)`, bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-500", stroke: "#3B82F6" }
          : { label: `Óptimo (${percentage}%)`, bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500", stroke: "#10B981" };

  return (
    <div className="w-full h-full bg-container rounded-[16px] p-6 shadow-xs flex flex-col justify-between gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[var(--color-neutral-900)] dark:text-white">
            Notifications
          </h3>
        </div>

        <Button
          variant="ghost"
          size="sm"
          hasBorder
          isDropdown
          className="text-xs font-semibold border border-neutral-800"
        >
          Administrar
        </Button>
      </div>

      {/* Radial Chart Display */}
      <div className="flex flex-col items-center justify-center relative py-2">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <svg className="w-full h-full rotate-[135deg]" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--color-neutral-200, #E2E8F0)"
              strokeWidth="12"
              strokeDasharray={`${totalArc} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="dark:stroke-neutral-800"
            />
            {/* Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={statusInfo.stroke}
              strokeWidth="12"
              strokeDasharray={`${progressLength} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                opacity: percentage > 0 ? 1 : 0,
              }}
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-[var(--color-neutral-900)] dark:text-white">
              {percentage}%
            </span>
            <span className="text-xs font-medium text-neutral-500">
              ${currentSpend.toLocaleString()} / ${budgetLimit.toLocaleString()}
            </span>
            <span className={`mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusInfo.bg}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Thresholds Information Breakdown */}
      <div className="w-full flex flex-col gap-3 pt-3 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)]">
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 font-medium mb-2">
            <div className='text-info-main'>
              <CaralIcon name="circleInfo" size={16} />
            </div>
            <span>Information</span>
          </div>
          <span className="text-neutral-800 cursor-pointer hover:opacity-75 ">
            <CaralIcon name="gear" size={16} />
          </span>
        </div>

        {/* 4 Columns Milestone Cards */}
        <div className="grid grid-cols-4 rounded-xl  overflow-hidden">
          <div className="p-2 bg-info-light">
            <span className="text-xs font-medium block">Threshold</span>
            <span className="text-sm font-bold">$3,000</span>

          </div>

          <div className="p-2 bg-success-light text-success-hard">
            <span className="text-xs font-medium block">Info</span>
            <span className="text-sm font-bold">$1,500</span>

          </div>

          <div className="p-2 bg-warning-main text-neutral-100">
            <span className="text-xs font-medium block">Warning</span>
            <span className="text-sm font-bold">$2,250</span>

          </div>

          <div className="p-2 bg-danger-main text-neutral-100">
            <span className="text-xs font-medium block">Critical</span>
            <span className="text-sm font-bold">$2,700</span>

          </div>
        </div>
      </div>
    </div>
  );
}
