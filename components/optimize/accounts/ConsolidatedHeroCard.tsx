"use client";

import React from 'react';
import { Brand, CaralIcon } from '@/components/icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConsolidatedHeroProps {
  mainTitle?: string;
  month?: string;
  currentSpend?: number;
  currentYtd?: number;
  priorMonthCost?: number;
  activeServicesCount?: number;
  consolidatedForecast?: number;
}

export function ConsolidatedHeroCard({
  mainTitle = "AWS -Cloud operations",
  month = "Diciembre 2025",
  currentSpend = 133,
  currentYtd = 18,
  priorMonthCost = 148,
  activeServicesCount = 5,
  consolidatedForecast = 150,
}: ConsolidatedHeroProps) {
  const { dict } = useLanguage();
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  // 75% arc for hero visual
  const arcLength = circumference * 0.75;

  return (
    <div className="w-full bg-container border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-800)] rounded-[16px] p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Left Highlight Section (Col 1-5) */}
      <div className="lg:col-span-4 flex flex-col justify-between gap-4 pr-0 lg:pr-6 pb-6 lg:pb-0">
        <h3 className="text-xl font-bold text-[var(--color-neutral-900)] dark:text-white truncate">
          {mainTitle}
        </h3>

        <div className="flex items-center justify-start gap-6 py-1">
          {/* Ring Gauge with CloudCosting icon */}
          <div className="relative w-[114px] h-[114px] shrink-0 flex items-center justify-center">
            <svg className="w-full h-full rotate-[135deg]" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke="var(--color-neutral-200, #E2E8F0)"
                strokeWidth="8"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="dark:stroke-neutral-800"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke="var(--color-info-main)"
                strokeWidth="8"
                strokeDasharray={`${arcLength * 0.85} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-2.5 rounded-full  text-amber-500 shadow-2xs flex items-center justify-center">
                <Brand name="CloudCosting" size={36} />
              </div>
            </div>
          </div>

          {/* Amount & Month */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-neutral-800">
              {month}
            </span>
            <span className="text-3xl font-extrabold text-[var(--color-neutral-900)] dark:text-white tracking-tight">
              ${currentSpend.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CaralIcon name="circleInfo" size={13} />
              Operación activa
            </span>
          </div>
        </div>
      </div>

      {/* Right 2x2 Metrics Grid (Col 5-12) */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Metric 1: Current YTD */}
        <div className="p-4 justify-between">
          <div className="flex items-center justify-between text-neutral-800 text-xs font-medium">
            <span>Current YTD</span>
            <CaralIcon name="calendar" size={15} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[var(--color-neutral-900)] dark:text-white">
              ${currentYtd.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-500">-12% vs año anterior</span>
          </div>
        </div>

        {/* Metric 2: Prior month total cost */}
        <div className="p-4 justify-between">
          <div className="flex items-center justify-between text-neutral-800 text-xs font-medium">
            <span>Prior month total cost :</span>
            <CaralIcon name="historyChart" size={15} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[var(--color-neutral-900)] dark:text-white">
              $ {priorMonthCost.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-neutral-400">Nov 2025</span>
          </div>
        </div>

        {/* Metric 3: Total active services */}
        <div className="p-4 justify-between">
          <div className="flex items-center justify-between text-neutral-800 text-xs font-medium">
            <span>Total number of active services</span>
            <CaralIcon name="cube" size={15} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[var(--color-neutral-900)] dark:text-white">
              {activeServicesCount}
            </span>
            <span className="text-xs font-semibold text-info-main">Multi-Cloud</span>
          </div>
        </div>

        {/* Metric 4: Consolidated total forecast */}
        <div className="p-4 justify-between">
          <div className="flex items-center justify-between text-neutral-800 text-xs font-medium">
            <span>Consolidated total forecast:</span>
            <CaralIcon name="chartSimple" size={15} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[var(--color-neutral-900)] dark:text-white">
              ${consolidatedForecast.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-amber-500">Cierre estimado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
