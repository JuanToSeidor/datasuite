"use client";

import React, { useState, useMemo } from 'react';
import { Button } from 'caralstable';
import { CaralIcon, Brand } from '@/components/icons';
import { CostEvolutionChart } from '@/components/optimize/CostEvolutionChart';
import { BudgetGaugeCard } from '@/components/optimize/BudgetGaugeCard';
import { TopServicesCard } from '@/components/optimize/TopServicesCard';
import driversRawData from '@/data/drivers.json';
import accountsRawData from '@/data/accounts.json';
import { DriverItem } from '@/components/optimize/drivers/DriverAllocationRow';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OptimizeDashboardPage() {
  const { dict } = useLanguage();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");

  const drivers: DriverItem[] = driversRawData as DriverItem[];
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || null;

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const { currentSpend, budgetLimit } = useMemo(() => {
    if (selectedDriver) {
      const accountsList =
        selectedDriver.accounts && selectedDriver.accounts.length > 0
          ? selectedDriver.accounts
          : (selectedDriver.connections || []).map((c) => ({
            id: c.id,
            name: c.name,
            brand: c.brand,
            color: c.color,
          }));

      let spend = 0;
      accountsList.forEach((accItem) => {
        const acc = (accountsRawData as any[]).find((a) => a.id === accItem.id);
        if (acc && acc.history && acc.history.length > 0) {
          const latest = acc.history[acc.history.length - 1];
          spend += latest.amount;
        }
      });
      const roundedSpend = Math.round(spend);
      return {
        currentSpend: roundedSpend,
        budgetLimit: Math.round(roundedSpend * 1.08),
      };
    }

    // Consolidado total
    let totalSpend = 0;
    (accountsRawData as any[]).forEach((acc) => {
      if (acc.history && acc.history.length > 0) {
        const latest = acc.history[acc.history.length - 1];
        totalSpend += latest.amount;
      }
    });
    const roundedSpend = Math.round(totalSpend);
    return {
      currentSpend: roundedSpend,
      budgetLimit: Math.round(roundedSpend * 1.08),
    };
  }, [selectedDriver]);

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      {/* Top Page Header (Matching Figma Frame 58) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-3xl font-extrabold text-seidor-main-text tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-800 mt-1">
            Monitoreo y optimización de costos cloud en tiempo real por inductores de consumo.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Driver Selector Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              hasBorder
              isDropdown
              className="flex items-center gap-2 text-sm font-semibold px-3.5 py-2 border border-neutral-500 bg-container"
              onClick={() => setIsDriverDropdownOpen((prev) => !prev)}
            >
              {selectedDriver ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-info-hard bg-info-light px-1.5 py-0.5 rounded">
                    {selectedDriver.code}
                  </span>
                  <span className="truncate max-w-[200px] text-neutral-900">
                    {selectedDriver.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CaralIcon name="filter" size={16} />
                  <span className="text-neutral-900">Todos los Drivers</span>
                </div>
              )}
            </Button>

            {isDriverDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDriverDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-container border border-neutral-500 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
                  {/* Search driver */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-800">
                      <CaralIcon name="search" size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar driver..."
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-neutral-500 border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-seidor-main"
                    />
                  </div>

                  {/* Options List */}
                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-0.5">
                    {/* All Drivers option */}
                    <Button
                      variant={selectedDriverId === null ? "default" : "ghost"}
                      onClick={() => {
                        setSelectedDriverId(null);
                        setIsDriverDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${selectedDriverId === null
                        ? "bg-seidor-light text-seidor-main font-bold border border-seidor-main/30"
                        : "text-neutral-800 hover:bg-neutral-500/20"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <CaralIcon name="filter" size={14} />
                        <span>Todos los Drivers (Consolidado)</span>
                      </div>
                      {selectedDriverId === null && <CaralIcon name="check" size={14} />}
                    </Button>

                    <div className="h-px bg-neutral-500 my-1" />

                    {/* Individual Drivers */}
                    {filteredDrivers.map((driver) => {
                      const isSelected = selectedDriverId === driver.id;
                      return (
                        <Button
                          key={driver.id}
                          variant={isSelected ? "default" : "ghost"}
                          onClick={() => {
                            setSelectedDriverId(driver.id);
                            setIsDriverDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl text-left transition-colors flex items-center justify-between gap-2 ${isSelected
                            ? "bg-seidor-light text-seidor-main border border-seidor-main/30"
                            : "hover:bg-neutral-500/20 text-neutral-900"
                            }`}
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-info-hard bg-info-light px-1.5 py-0.5 rounded shrink-0">
                                {driver.code}
                              </span>
                              <span className="text-xs font-bold text-neutral-900 truncate">
                                {driver.name}
                              </span>
                            </div>

                            {/* Assigned Accounts Brands */}
                            <div className="flex items-center gap-1.5 pl-0.5">
                              {(driver.accounts || driver.connections || []).map((c) => (
                                <div
                                  key={c.id}
                                  className="inline-flex items-center gap-0.5 text-[10px] text-neutral-800"
                                  title={c.name}
                                >
                                  <Brand name={c.brand} size={12} />
                                </div>
                              ))}
                              {driver.entities && driver.entities.length > 0 && (
                                <span className="text-[10px] text-neutral-800">
                                  &bull; {driver.entities.length} entidades ({driver.entities.map(e => e.name).join(', ')})
                                </span>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="shrink-0 text-seidor-main">
                              <CaralIcon name="check" size={14} />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <Button
            variant="info"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 shadow-sm hover:shadow-md transition-all"
          >
            <CaralIcon name="fileDown" size={18} />
            <span>Exportar Reporte</span>
          </Button>
        </div>
      </div>

      {/* Main Section 1: Cost Evolution Chart (Full Width) */}
      <section className="w-full">
        <CostEvolutionChart driver={selectedDriver} />
      </section>

      {/* Main Section 2: Split Grid (Notifications & Budget Gauges vs Top 3 Services) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="w-full">
          <BudgetGaugeCard currentSpend={currentSpend} budgetLimit={budgetLimit} />
        </div>
        <div className="w-full">
          <TopServicesCard driver={selectedDriver} />
        </div>
      </section>
    </div>
  );
}
