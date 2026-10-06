"use client";

import React from 'react';
import { Button } from 'caralstable';
import { Brand, CaralBrandName, CaralIcon } from '@/components/icons';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  percentage: number;
}

export interface AccountData {
  id: string;
  name: string;
  provider: 'AWS' | 'Azure' | 'GCP' | 'Snowflake';
  brand: CaralBrandName;
  month: string;
  amount: number;
  percentage: number;
  color?: string;
  accountNumber?: string;
  status?: 'active' | 'warning' | 'synced';
  services?: ServiceItem[];
}

interface AccountCardProps {
  account: AccountData;
  onSelect?: (account: AccountData) => void;
}

export function AccountCard({ account, onSelect }: AccountCardProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (account.percentage / 100) * circumference;

  const providerColors: Record<string, string> = {
    AWS: '#FF9900',
    Azure: '#0089D6',
    GCP: '#4285F4',
    Snowflake: '#29B5E8',
  };

  const ringColor = account.color || providerColors[account.provider] || '#EF4444';

  return (
    <div className="bg-container rounded-[16px] p-5 shadow-xs hover:shadow-lg hover:border-neutral-400 dark:hover:border-neutral-700 transition-all flex flex-col justify-between gap-4 group">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h4
            className="text-base font-bold text-[var(--color-neutral-900)] dark:text-white truncate"
            title={account.name}
          >
            {account.name}
          </h4>
        </div>

        <Button
          isIconButton
          iconName="dots"
          variant="ghost"
          hasBorder
          className="shrink-0 text-neutral-600 dark:text-neutral-300"
          onClick={() => onSelect?.(account)}
        />
      </div>

      {/* Main Content (Ring + Amount) */}
      <div className="flex items-center justify-center gap-6 py-2">
        {/* Ring Gauge with Brand Logo inside */}
        <div className="relative w-[104px] h-[104px] shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="var(--color-neutral-200, #E2E8F0)"
              strokeWidth="7"
              className="dark:stroke-neutral-800"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Brand Icon */}
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <div className="p-2 rounded-full bg-neutral-100 shadow-2xs flex items-center justify-center">
              <Brand name={account.brand} size={32} />
            </div>
          </div>
        </div>

        {/* Amount & Period */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-neutral-800">
            {account.month}
          </span>
          <span className="text-2xl font-extrabold text-[var(--color-neutral-900)] dark:text-white tracking-tight">
            ${account.amount.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-neutral-800">
            <CaralIcon name="chartSimple" size={13} />
            <span>{account.percentage}% del total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
