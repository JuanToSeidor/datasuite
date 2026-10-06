"use client";

import React, { useState, useMemo } from 'react';
import { Button } from 'caralstable';
import { Brand, CaralIcon } from '@/components/icons';
import { DriverItem } from '@/components/optimize/drivers/DriverAllocationRow';
import accountsRawData from '@/data/accounts.json';

interface ConsumedService {
  rank: string;
  name: string;
  category: string;
  brand: any;
  amount: number;
  percentage: number;
  trend: string;
  isIncrease: boolean;
}

export interface TopServicesCardProps {
  driver?: DriverItem | null;
}

export function TopServicesCard({ driver = null }: TopServicesCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Mes actual");

  const services: ConsumedService[] = useMemo(() => {
    if (driver) {
      const accountsList =
        driver.accounts && driver.accounts.length > 0
          ? driver.accounts
          : (driver.connections || []).map((c) => ({
            id: c.id,
            name: c.name,
            brand: c.brand,
            color: c.color,
          }));

      // Calculate total spend of assigned accounts
      let totalDriverSpend = 0;
      let prevTotalDriverSpend = 0;

      accountsList.forEach((accItem) => {
        const acc = (accountsRawData as any[]).find((a) => a.id === accItem.id);
        const latest = acc?.history ? acc.history[acc.history.length - 1] : null;
        const prev = acc?.history && acc.history.length > 1 ? acc.history[acc.history.length - 2] : null;
        if (latest) totalDriverSpend += latest.amount;
        if (prev) prevTotalDriverSpend += prev.amount;
      });

      const entitiesList =
        driver.entities && driver.entities.length > 0
          ? driver.entities
          : (driver.connections || []).map((c) => ({
            id: c.id,
            name: c.name,
            percentage: c.percentage || 0,
            color: c.color,
          }));

      // Calculate consumption for each entity
      const calculated = entitiesList.map((ent) => {
        const allocatedAmount = totalDriverSpend * (ent.percentage / 100);
        const prevAllocated = prevTotalDriverSpend * (ent.percentage / 100);
        const diff = prevAllocated > 0 ? ((allocatedAmount - prevAllocated) / prevAllocated) * 100 : 0;

        return {
          id: ent.id,
          name: ent.name,
          category: `Entidad &bull; ${ent.percentage}% del Driver`,
          brand: 'CloudCosting',
          amount: allocatedAmount,
          trend: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
          isIncrease: diff >= 0,
        };
      });

      // Ordenar de mayor a menor
      calculated.sort((a, b) => b.amount - a.amount);
      const totalTop = calculated.reduce((acc, curr) => acc + curr.amount, 0) || 1;

      return calculated.slice(0, 3).map((item, idx) => ({
        rank: `#${idx + 1}`,
        name: item.name,
        category: item.category,
        brand: item.brand,
        amount: item.amount,
        percentage: Math.round((item.amount / totalTop) * 100),
        trend: item.trend,
        isIncrease: item.isIncrease,
      }));
    }

    // Consolidado por defecto (Top 3 cuentas globales)
    const topAccounts = [...(accountsRawData as any[])]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const totalTop = topAccounts.reduce((acc, curr) => acc + curr.amount, 0) || 1;

    return topAccounts.map((acc, idx) => ({
      rank: `#${idx + 1}`,
      name: acc.name,
      category: `${acc.provider} / Infraestructura`,
      brand: acc.brand,
      amount: acc.amount,
      percentage: Math.round((acc.amount / totalTop) * 100),
      trend: idx === 1 ? "-2.4%" : "+8.7%",
      isIncrease: idx !== 1,
    }));
  }, [driver]);

  const totalTopAmount = services.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full h-full bg-container rounded-[16px] p-6 shadow-xs flex flex-col justify-between gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CaralIcon name="circles" size={20} color="var(--color-danger-main)" />
          <h3 className="text-lg font-bold text-[var(--color-neutral-900)] dark:text-white">
            Top 3 most consumed service
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-800)] dark:text-neutral-200">
            {selectedPeriod}
          </div>
          <Button isIconButton iconName="dots" variant="ghost" hasBorder />
        </div>
      </div>

      {/* Services List */}
      <div className="flex flex-col gap-4">
        {services.map((service) => (
          <div
            key={service.rank}
            className="flex flex-col gap-2 p-3.5 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Rank & Brand Logo */}
              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-neutral-800 w-7">
                  {service.rank}
                </span>

                <div className="p-2 rounded-full bg-neutral-100 shrink-0 flex items-center justify-center shadow-xs">
                  <Brand name={service.brand} size={22} />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-neutral-900 truncate">
                    {service.name}
                  </span>
                  <span className="text-xs text-neutral-800 truncate">
                    {service.category}
                  </span>
                </div>
              </div>

              {/* Amount and Trend */}
              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-neutral-900 block">
                  ${service.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-[11px] font-semibold ${service.isIncrease ? "text-red-500" : "text-emerald-500"
                    }`}
                >
                  {service.trend}
                </span>
              </div>
            </div>

            {/* Proportion Progress Bar */}
            <div className="w-full bg-neutral-500 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-info-main rounded-full transition-all duration-500"
                style={{ width: `${service.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-neutral-500 flex items-center justify-between text-xs text-neutral-800">
        <span>Total Top 3: <strong className="text-neutral-900">${totalTopAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-info-main! hover:underline">
          Ver todas las cuentas
          <CaralIcon name="chevronRigth" size={16} />
        </Button>
      </div>
    </div>
  );
}
