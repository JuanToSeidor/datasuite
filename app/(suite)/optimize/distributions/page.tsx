"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Tabs } from 'caralstable';
import { CaralIcon } from '@/components/icons';
import { Select } from '@/components/ui';
import driversRawData from '@/data/drivers.json';
import accountsRawData from '@/data/accounts.json';
import { DriverItem } from '@/components/optimize/drivers/DriverAllocationRow';
import { DistributionsTable } from '@/components/optimize/distributions';
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  percentage: number;
}

interface EnrichedAccount {
  id: string;
  name: string;
  provider: string;
  brand: string;
  accountNumber?: string;
  color?: string;
  history?: Array<{
    id: string;
    year: number;
    month: string;
    monthFull: string;
    monthIndex: number;
    label?: string;
    fullLabel?: string;
    amount: number;
    compute: number;
    storage: number;
    database: number;
    other: number;
    services?: ServiceItem[];
  }>;
  services?: ServiceItem[];
}

const DISTRIBUTION_TABS = [
  { label: "Clean" },
  { label: "Equaly" },
  { label: "Proportional" },
];

export default function OptimizeDistributionsPage() {
  const { dict } = useLanguage();
  const drivers: DriverItem[] = driversRawData as DriverItem[];
  const accounts: EnrichedAccount[] = accountsRawData as EnrichedAccount[];

  // 1. Account Selection (defaults to first account or 'all')
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || 'all');

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  // 2. Filtered Drivers based on Selected Account
  const availableDrivers = useMemo(() => {
    if (selectedAccountId === 'all') {
      return drivers;
    }
    const filtered = drivers.filter((d) =>
      d.accounts?.some((a) => a.id === selectedAccountId)
    );
    return filtered.length > 0 ? filtered : drivers;
  }, [drivers, selectedAccountId]);

  // 3. Driver Selection
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');

  const activeDriver = useMemo(() => {
    return (
      availableDrivers.find((d) => d.id === selectedDriverId) ||
      availableDrivers[0] ||
      drivers[0]
    );
  }, [availableDrivers, selectedDriverId, drivers]);

  // 4. Period Selection (defaults to latest month)
  const availableMonths = useMemo(() => {
    const refAccount = selectedAccount || accounts[0];
    if (!refAccount?.history || refAccount.history.length === 0) {
      return [{ id: '2025-12', label: 'Diciembre 2025', year: 2025, monthIndex: 11 }];
    }
    return [...refAccount.history]
      .reverse()
      .map((h) => ({
        id: `${h.year}-${h.monthIndex}`,
        label: h.fullLabel || `${h.monthFull} ${h.year}`,
        year: h.year,
        monthIndex: h.monthIndex,
      }));
  }, [selectedAccount, accounts]);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    availableMonths[0]?.id || '2025-11'
  );

  // 5. Distribution Type Selection ('clean' | 'equaly' | 'proportional') via Caral Tabs
  const [distributionTab, setDistributionTab] = useState<number>(2); // Default to Proportional
  const distributionType = useMemo<'clean' | 'equaly' | 'proportional'>(() => {
    if (distributionTab === 0) return 'clean';
    if (distributionTab === 1) return 'equaly';
    return 'proportional';
  }, [distributionTab]);

  // Selected period info
  const selectedPeriod = useMemo(() => {
    return (
      availableMonths.find((m) => m.id === selectedPeriodId) || availableMonths[0]
    );
  }, [availableMonths, selectedPeriodId]);

  // Accounts belonging to the active driver
  const driverAccounts = useMemo(() => {
    if (!activeDriver?.accounts || activeDriver.accounts.length === 0) return [];
    const accountIds = new Set(activeDriver.accounts.map((a) => a.id));
    return accounts.filter((acc) => accountIds.has(acc.id));
  }, [activeDriver, accounts]);

  // Aggregate services for the selected account(s) and period
  const aggregatedServices = useMemo(() => {
    if (!selectedPeriod) return [];

    const targetAccounts =
      selectedAccountId === 'all'
        ? (driverAccounts.length > 0 ? driverAccounts : accounts)
        : accounts.filter((a) => a.id === selectedAccountId);

    const serviceMap = new Map<string, { id: string; name: string; category: string; amount: number }>();

    targetAccounts.forEach((acc) => {
      const monthData = acc.history?.find(
        (h) => h.year === selectedPeriod.year && h.monthIndex === selectedPeriod.monthIndex
      );

      const servicesList = monthData?.services || acc.services || [];
      servicesList.forEach((srv) => {
        const existing = serviceMap.get(srv.name);
        if (existing) {
          existing.amount += srv.amount;
        } else {
          serviceMap.set(srv.name, {
            id: srv.id || srv.name,
            name: srv.name,
            category: srv.category || 'other',
            amount: srv.amount,
          });
        }
      });
    });

    const list = Array.from(serviceMap.values());
    const totalAmount = list.reduce((sum, s) => sum + s.amount, 0);

    return list
      .map((s) => ({
        ...s,
        percentage: totalAmount > 0 ? (s.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [driverAccounts, accounts, selectedAccountId, selectedPeriod]);

  // Dynamic Entities configured in the driver, adjusted for distributionType
  const entities = useMemo(() => {
    const rawEntities = activeDriver?.entities || [];
    if (rawEntities.length === 0) return [];

    if (distributionType === 'clean') {
      return rawEntities.map((ent) => ({
        ...ent,
        percentage: 0,
      }));
    }

    if (distributionType === 'equaly') {
      const equalPct = Number((100 / rawEntities.length).toFixed(2));
      return rawEntities.map((ent, idx) => ({
        ...ent,
        percentage: idx === rawEntities.length - 1 ? 100 - equalPct * (rawEntities.length - 1) : equalPct,
      }));
    }

    return rawEntities;
  }, [activeDriver, distributionType]);

  // Total amount for the filtered period/account
  const totalPeriodAmount = useMemo(() => {
    return aggregatedServices.reduce((sum, s) => sum + s.amount, 0);
  }, [aggregatedServices]);

  // Track manual allocations in parent state to reflect on KPI cards
  const [manualAllocations, setManualAllocations] = useState<Record<string, Record<string, number>>>({});

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 font-poppins">
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-seidor-main-text">
            <CaralIcon name="circles" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              Distributions
            </h1>
          </div>
          <p className="text-sm text-neutral-800 mt-0.5">
            Prorrateo y distribución de costos cloud desglosados por entidades según el driver activo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            iconName="newFile"
            isIconButton
            title="Load distributions from folder"
          />

          <Button
            variant="success"
            iconName="save"
            isIconButton
            title="Save the current distributions"
          />
        </div>
      </div>

      {/* Top Filters Panel */}
      <div className="bg-container border border-neutral-500 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full items-end gap-4">
          {/* 1. Cuenta Cloud Selector */}
          <Select
            label="1. Cuenta Cloud"
            iconName="cloud"
            value={selectedAccountId}
            onChange={(e) => {
              const newAccountId = e.target.value;
              setSelectedAccountId(newAccountId);
              const matchingDrivers =
                newAccountId === 'all'
                  ? drivers
                  : drivers.filter((d) => d.accounts?.some((a) => a.id === newAccountId));
              if (matchingDrivers.length > 0 && !matchingDrivers.some((d) => d.id === selectedDriverId)) {
                setSelectedDriverId(matchingDrivers[0].id);
              }
            }}
            containerClassName="w-full"
          >
            <option value="all" data-icon="globe">
              Todas las cuentas ({accounts.length})
            </option>
            {accounts.map((acc) => (
              <option
                key={acc.id}
                value={acc.id}
                data-brand={acc.brand || acc.provider}
              >
                {acc.name}
              </option>
            ))}
          </Select>

          {/* 2. Período / Mes Selector */}
          <Select
            label="2. Período / Mes"
            iconName="calendar"
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            containerClassName="w-full"
          >
            {availableMonths.map((m) => (
              <option key={m.id} value={m.id} data-icon="calendar">
                {m.label}
              </option>
            ))}
          </Select>

          {/* 3. Driver / Inductor de Consumo Selector */}
          <Select
            label="3. Driver / Inductor"
            iconName="bolt"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            containerClassName="w-full"
          >
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id} data-icon="bolt">
                {d.code} — {d.name} ({d.entities?.length || 0} ent.)
              </option>
            ))}
          </Select>

          {/* 4. Distribution Type Tabs */}
          <div className="flex flex-col gap-1 w-full">
            <span className="text-xs font-bold text-neutral-800 select-none">
              4. Distribution Type
            </span>
            <div className="w-full flex items-center pt-0.5">
              <Tabs
                activeIndex={distributionTab}
                onChange={(idx) => {
                  setDistributionTab(idx);
                  setManualAllocations({}); // Clear custom manual overrides when tab changes
                }}
                tabs={DISTRIBUTION_TABS}
              />
            </div>
          </div>
        </div>

        {/* Driver Summary Bar */}
        {activeDriver && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-800">Driver Activo:</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-100">
                {activeDriver.code}
              </span>
              <span className="text-xs font-bold text-neutral-900">
                {activeDriver.name}
              </span>
              <span className="text-xs text-neutral-800">
                ({activeDriver.entities?.length || 0} entidades configuradas)
              </span>
              {selectedAccount && (
                <span className="text-xs font-medium text-info-main ml-2 flex items-center gap-1">
                  <CaralIcon name="check" size={13} />
                  Cuenta: {selectedAccount.name}
                </span>
              )}
            </div>

            <Link
              href="/optimize/drivers"
              className="text-xs text-neutral-800 hover:text-info-main flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Ajustar porcentajes en módulo Drivers</span>
              <CaralIcon name="chevronRigth" size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* DISTRIBUTIONS MATRIX TABLE (REUSABLE COMPONENT)          */}
      {/* ========================================================= */}
      <DistributionsTable
        services={aggregatedServices}
        entities={entities}
        distributionType={distributionType}
        accountName={selectedAccount?.name || (selectedAccountId === 'all' ? 'Todas_las_Cuentas' : 'Cuenta')}
        periodLabel={selectedPeriod?.label || 'Periodo'}
        totalPeriodAmount={totalPeriodAmount}
        manualAllocations={manualAllocations}
        onManualAllocationsChange={setManualAllocations}
        // General Controls Options (can be toggled true/false):
        canEdit={true}
        canExpand={true}
        canExport={true}
        canReadjust={true}
        canFilterColumns={true}
        canSearch={true}
        canFilterErrors={true}
        className="shadow-xl"
      />

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Card */}
        <div className="p-5 rounded-2xl bg-container border border-neutral-500 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Total Facturado ({selectedPeriod?.label})
            </span>
            <div className="p-2 rounded-full bg-info-light text-info-main">
              <CaralIcon name="dolar" size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-neutral-900">
              ${totalPeriodAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-neutral-800 block mt-0.5">
              {aggregatedServices.length} servicios cloud facturados
            </span>
          </div>
        </div>

        {/* Dynamic Entities Summary Cards */}
        {entities.map((ent) => {
          const hasManual = Object.keys(manualAllocations).length > 0;
          const entAmount =
            hasManual
              ? aggregatedServices.reduce((sum, s) => {
                  const srvKey = s.id || s.name;
                  if (manualAllocations[srvKey]?.[ent.id] !== undefined) {
                    return sum + manualAllocations[srvKey][ent.id];
                  }
                  if (distributionType === 'clean') return sum;
                  return sum + (s.amount * ent.percentage) / 100;
                }, 0)
              : distributionType === 'clean'
                ? 0
                : (totalPeriodAmount * ent.percentage) / 100;

          const effectivePct =
            totalPeriodAmount > 0
              ? ((entAmount / totalPeriodAmount) * 100).toFixed(1)
              : ent.percentage;

          return (
            <div
              key={ent.id}
              className="p-5 rounded-2xl bg-container border border-neutral-500 shadow-xs flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ent.color && (
                    <span
                      style={{ backgroundColor: ent.color }}
                      className="size-3 rounded-full shrink-0 shadow-xs"
                    />
                  )}
                  <span className="text-xs font-bold text-neutral-900 truncate max-w-[150px]">
                    {ent.name}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-container text-neutral-800">
                  {hasManual ? `${effectivePct}%` : `${ent.percentage}%`}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-extrabold text-neutral-900">
                  ${entAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="w-full bg-neutral-500/30 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Number(effectivePct))}%`,
                      backgroundColor: ent.color || 'var(--color-info-main)',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
