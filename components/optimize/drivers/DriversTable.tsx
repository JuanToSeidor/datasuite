"use client";

import React, { useState } from 'react';
import { Button } from 'caralstable';
import { Brand } from '@/components/icons';
import {
  DriverItem,
  DriverAllocationRow,
} from './DriverAllocationRow';
import { useLanguage } from '@/contexts/LanguageContext';

interface DriversTableProps {
  drivers: DriverItem[];
  onUpdateDriver?: (updated: DriverItem) => void;
}

export function DriversTable({ drivers, onUpdateDriver }: DriversTableProps) {
  const { dict } = useLanguage();
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const handleToggleExpand = (driverId: string) => {
    setExpandedDriverId((prev) => (prev === driverId ? null : driverId));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-container shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-500 font-bold text-neutral-900  text-xs uppercase tracking-wider">
              <th className="py-4 px-4 w-28">Código</th>
              <th className="py-4 px-4 min-w-[220px]">Driver / Centro de Costo</th>
              <th className="py-4 px-4 min-w-[240px]">Cuentas Asignadas</th>
              <th className="py-4 px-4 min-w-[280px]">Entidades & Prorrateo</th>
              <th className="py-4 px-4 w-20 text-center">Ajustes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {drivers.map((driver) => {
              const isExpanded = expandedDriverId === driver.id;

              const accountsList =
                driver.accounts && driver.accounts.length > 0
                  ? driver.accounts
                  : (driver.connections || []).map((c) => ({
                    id: c.id,
                    name: c.name,
                    brand: c.brand,
                    color: c.color,
                  }));

              const entitiesList =
                driver.entities && driver.entities.length > 0
                  ? driver.entities
                  : (driver.connections || []).map((c) => ({
                    id: c.id,
                    name: c.name,
                    percentage: c.percentage || 0,
                    color: c.color,
                  }));

              if (isExpanded) {
                return (
                  <tr key={driver.id} className="bg-container-50 animate-row-expand">
                    <td colSpan={5} className="p-4 sm:p-6">
                      <DriverAllocationRow
                        driver={driver}
                        onClose={() => setExpandedDriverId(null)}
                        onSave={(updated) => {
                          onUpdateDriver?.(updated);
                        }}
                      />
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={driver.id}
                  className="transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/30! border-b border-neutral-500"
                >
                  {/* Code */}
                  <td className="py-4 px-4 font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {driver.code}
                  </td>

                  {/* Driver Name & Subtitle */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        {driver.name}
                      </span>
                      {driver.description && (
                        <span className="text-xs text-neutral-800 truncate max-w-sm mt-0.5">
                          {driver.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigned Accounts */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {accountsList.map((acc) => (
                        <div
                          key={acc.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-500/20 text-xs font-medium text-neutral-900 dark:text-neutral-200 shadow-2xs"
                          title={acc.name}
                        >
                          <div className="bg-neutral-100 p-1 rounded-full">
                            <Brand name={acc.brand} size={15} />
                          </div>
                          <span className="truncate max-w-[120px]">
                            {acc.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Entities & Percentage Distribution */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {entitiesList.map((ent) => (
                        <div
                          key={ent.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-container text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-2xs"
                        >
                          {ent.color && (
                            <span
                              style={{ backgroundColor: ent.color }}
                              className="size-2 rounded-full shrink-0"
                            />
                          )}
                          <span className="truncate max-w-[130px]">
                            {ent.name}
                          </span>
                          <span className="text-[11px] font-bold text-info-hard bg-info-light px-1.5 py-0.2 rounded font-mono">
                            {ent.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Action Gear Button */}
                  <td className="py-4 px-4 text-center">
                    <Button
                      isIconButton
                      iconName="gear"
                      variant="ghost"
                      hasBorder
                      className="text-neutral-700 dark:text-neutral-300 hover:text-red-500 transition-all duration-300 ease-out hover:rotate-90 active:scale-90"
                      title="Configurar prorrateo y cuentas"
                      onClick={() => handleToggleExpand(driver.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
