"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Tabs, Drawer } from 'caralstable';
import { CaralIcon, Brand } from '@/components/icons';
import { Input, Select } from '@/components/ui';
import { AccountCard, AccountData } from '@/components/optimize/accounts/AccountCard';
import { ConsolidatedHeroCard } from '@/components/optimize/accounts/ConsolidatedHeroCard';

import accountsRawData from '@/data/accounts.json';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  percentage: number;
}

export interface AccountWithHistory extends AccountData {
  historyStartYear?: number;
  historyEndYear?: number;
  yearsOfHistory?: number;
  services?: ServiceItem[];
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
}

const INITIAL_ACCOUNTS: AccountWithHistory[] = accountsRawData as AccountWithHistory[];

const FILTER_TABS = [
  { label: "Todas" },
  { label: "AWS" },
  { label: "Azure" },
  { label: "GCP" },
  { label: "Snowflake" },
];

const DRAWER_TABS = [
  { label: "Generales" },
  { label: "Exclusivas" },
];

const SUITE_CONNECTIONS = [
  {
    id: "suite-aws-prod",
    name: "AWS Production Core",
    provider: "AWS" as const,
    brand: "AWS" as const,
    accountNumber: "9482-1029-4481",
    type: "AWS IAM Role ARN",
    status: "Enabled",
    createdDay: "Abril 2025",
    color: "#FF9900",
    baseAmount: 3200,
    startYear: 2011,
  },
  {
    id: "suite-az-ea",
    name: "Azure EA Enterprise Main",
    provider: "Azure" as const,
    brand: "Azure" as const,
    accountNumber: "sub-88210-ea-prod",
    type: "Azure Service Principal",
    status: "Enabled",
    createdDay: "Febrero 2025",
    color: "#0089D6",
    baseAmount: 4100,
    startYear: 2011,
  },
  {
    id: "suite-gcp-bq",
    name: "GCP BigQuery Analytics Export",
    provider: "GCP" as const,
    brand: "GoogleStorage" as const,
    accountNumber: "crestone-gcp-prod-01",
    type: "Google Service Account",
    status: "Enabled",
    createdDay: "Marzo 2025",
    color: "#4285F4",
    baseAmount: 2900,
    startYear: 2014,
  },
  {
    id: "suite-snow-corp",
    name: "Snowflake DWH Corporate",
    provider: "Snowflake" as const,
    brand: "Snowflake" as const,
    accountNumber: "xy82710.east-us-2",
    type: "Snowflake Key-Pair Auth",
    status: "Enabled",
    createdDay: "Enero 2025",
    color: "#29B5E8",
    baseAmount: 3600,
    startYear: 2015,
  },
  {
    id: "suite-aws-dev",
    name: "AWS Dev & Staging Cluster",
    provider: "AWS" as const,
    brand: "AWS" as const,
    accountNumber: "3321-7788-0012",
    type: "AWS Access Keys",
    status: "Enabled",
    createdDay: "Mayo 2025",
    color: "#FF9900",
    baseAmount: 1100,
    startYear: 2016,
  },
  {
    id: "suite-az-sql",
    name: "Azure SQL Managed Warehouse",
    provider: "Azure" as const,
    brand: "Azure" as const,
    accountNumber: "sub-33019-sql-managed",
    type: "Azure Managed Identity",
    status: "Enabled",
    createdDay: "Junio 2025",
    color: "#0089D6",
    baseAmount: 2200,
    startYear: 2014,
  },
];

export default function OptimizeAccountsPage() {
  const [accounts, setAccounts] = useState<AccountWithHistory[]>(INITIAL_ACCOUNTS);
  const [activeTab, setActiveTab] = useState(0);
  const [drawerTab, setDrawerTab] = useState(0);
  const [selectedSuiteConns, setSelectedSuiteConns] = useState<string[]>([]);
  const [suiteSearch, setSuiteSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountWithHistory | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Toggle selection for Suite Connections
  const toggleSuiteConn = (id: string) => {
    setSelectedSuiteConns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Import selected Suite Connections into Accounts
  const handleImportSuiteConnections = () => {
    if (selectedSuiteConns.length === 0) return;

    const newAccountsToImport: AccountWithHistory[] = selectedSuiteConns
      .map((connId) => {
        const match = SUITE_CONNECTIONS.find((c) => c.id === connId);
        if (!match) return null;

        return {
          id: `acc-${match.provider.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: match.name,
          provider: match.provider,
          brand: match.brand,
          accountNumber: match.accountNumber,
          month: "Diciembre 2025",
          amount: match.baseAmount,
          percentage: 4,
          color: match.color,
          status: "active" as const,
          historyStartYear: match.startYear,
          historyEndYear: 2025,
          yearsOfHistory: 2025 - match.startYear + 1,
        };
      })
      .filter(Boolean) as AccountWithHistory[];

    setAccounts((prev) => [...newAccountsToImport, ...prev]);
    setSelectedSuiteConns([]);
    setIsConnectModalOpen(false);
  };

  // Consolidated statistics across all accounts
  const totalSpend = accounts.reduce((sum, acc) => sum + acc.amount, 0);
  const priorMonthSpend = accounts.reduce((sum, acc) => {
    if (acc.history && acc.history.length >= 2) {
      return sum + acc.history[acc.history.length - 2].amount;
    }
    return sum + Math.round(acc.amount * 0.95);
  }, 0);

  // Filter accounts by tab and search
  const selectedProvider = FILTER_TABS[activeTab].label;
  const filteredAccounts = accounts.filter((acc) => {
    const matchesTab = selectedProvider === "Todas" || acc.provider === selectedProvider;
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.accountNumber && acc.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const filteredSuiteConnections = SUITE_CONNECTIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(suiteSearch.toLowerCase()) ||
      c.provider.toLowerCase().includes(suiteSearch.toLowerCase()) ||
      c.type.toLowerCase().includes(suiteSearch.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(suiteSearch.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header (Figma Frame 58) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2 text-seidor-main-text">
            <CaralIcon name='link' size={28} />
            <h1 className="text-3xl font-extrabold  tracking-tight">
              Accounts
            </h1>
          </div>
          <p className="text-sm text-neutral-800 mt-1">
            Gestión y seguimiento de consumo de suscripciones y cuentas cloud conectadas.
          </p>
        </div>

        {/* Action Buttons (Figma Frame 59) */}
        <div className="flex items-center gap-2.5">
          <Button
            isIconButton
            iconName="filter"
            variant="ghost"
            hasBorder
            className="text-neutral-600 dark:text-neutral-300"
            title="Filtros avanzados"
          />
          <Button
            isIconButton
            iconName="sync"
            variant="ghost"
            hasBorder
            className="text-neutral-600 dark:text-neutral-300"
            title="Sincronizar cuentas"
          />
          <Button
            variant="info"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 shadow-xs hover:shadow-md transition-all"
            onClick={() => setIsConnectModalOpen(true)}
          >
            <CaralIcon name="plus" size={18} />
            <span>Conectar Cuenta</span>
          </Button>
        </div>
      </div>

      {/* Top Consolidated Hero Card (Figma Frame 60) */}
      <section className="w-full">
        <ConsolidatedHeroCard
          mainTitle="Consolidado Total Cloud"
          month="Diciembre 2025"
          currentSpend={totalSpend}
          currentYtd={Math.round(totalSpend * 10.8)}
          priorMonthCost={priorMonthSpend}
          activeServicesCount={accounts.length}
          consolidatedForecast={Math.round(totalSpend * 1.04)}
        />
      </section>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Provider Tabs */}
        <Tabs
          activeIndex={activeTab}
          onChange={(idx) => setActiveTab(idx)}
          tabs={FILTER_TABS}
        />

        {/* Search Field */}
        <Input
          iconName="search"
          placeholder="Buscar por nombre o proveedor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          containerClassName="min-w-[260px]"
        />
      </div>

      {/* Accounts Grid (Figma Frames 61-65: 3 columns layout) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {filteredAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onSelect={(acc) => setSelectedAccount(acc as AccountWithHistory)}
          />
        ))}


      </section>

      {/* Quick Connect Account Caral Drawer */}
      <Drawer
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Conectar Cuenta Cloud"
        size="md"
      >
        <div className="flex flex-col gap-5 p-1">
          {/* Top Switcher Tabs (Suite vs Exclusivas) */}
          <div className="border-b border-neutral-300 dark:border-neutral-800 pb-2">
            <Tabs
              activeIndex={drawerTab}
              onChange={(idx) => setDrawerTab(idx)}
              tabs={DRAWER_TABS}
            />
          </div>

          {/* Tab 0: Credenciales de la Suite */}
          {drawerTab === 0 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div>
                <p className="text-xs text-neutral-800">
                  Selecciona conexiones ya configuradas en <strong>Crestone Suite (/connections)</strong> para sincronizar sus costos en Optimize.
                </p>
              </div>

              {/* Search Suite Connections */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-500">
                  <CaralIcon name="search" size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar conexión de la suite..."
                  value={suiteSearch}
                  onChange={(e) => setSuiteSearch(e.target.value)}
                  className="w-full pl-8! pr-3 py-2 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Suite Connections List */}
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredSuiteConnections.map((conn) => {
                  const isSelected = selectedSuiteConns.includes(conn.id);
                  return (
                    <div
                      key={conn.id}
                      onClick={() => toggleSuiteConn(conn.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${isSelected
                        ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 shadow-xs"
                        : "border-neutral-300 dark:border-neutral-700 bg-container hover:border-neutral-400"
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected
                            ? "bg-red-500 border-red-500 text-white"
                            : "border-neutral-400 bg-white dark:bg-neutral-800"
                            }`}
                        >
                          {isSelected && <CaralIcon name="check" size={12} />}
                        </div>

                        <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0">
                          <Brand name={conn.brand} size={22} />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {conn.name}
                          </span>
                          <span className="text-[11px] text-neutral-800 truncate">
                            {conn.type} • ID: {conn.accountNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          {conn.status}
                        </span>
                        <span className="text-[10px] text-neutral-500 mt-1">
                          ~${conn.baseAmount.toLocaleString()}/mes
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions for Suite Tab */}
              <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 mt-1">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    type="button"
                    disabled={selectedSuiteConns.length === 0}
                    onClick={handleImportSuiteConnections}
                    className="flex items-center gap-2"
                  >
                    <CaralIcon name="check" size={16} />
                    <span>
                      Importar {selectedSuiteConns.length > 0 ? `(${selectedSuiteConns.length})` : ""} a Optimize
                    </span>
                  </Button>
                </div>

                <div className="flex items-center justify-center pt-2">
                  <Link
                    href="/connections/new"
                    className="text-xs text-neutral-800 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <span>¿Crear una nueva conexión en Crestone Suite?</span>
                    <CaralIcon name="chevronRigth" size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Exclusivas (Custom Form) */}
          {drawerTab === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <p className="text-xs text-neutral-800">
                Configura una cuenta cloud exclusiva únicamente para este módulo de Optimize.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const provider = (formData.get("provider") as 'AWS' | 'Azure' | 'GCP' | 'Snowflake') || 'AWS';
                  const name = (formData.get("name") as string) || "Nueva Cuenta Cloud";
                  const accountNumber = (formData.get("accountNumber") as string) || "acc-temp-01";
                  const startYear = Number(formData.get("startYear")) || 2018;
                  const baseAmount = Number(formData.get("baseAmount")) || 2400;

                  const brandMap: Record<string, any> = {
                    AWS: "AWS",
                    Azure: "Azure",
                    GCP: "GoogleStorage",
                    Snowflake: "Snowflake",
                  };

                  const colorMap: Record<string, string> = {
                    AWS: "#FF9900",
                    Azure: "#0089D6",
                    GCP: "#4285F4",
                    Snowflake: "#29B5E8",
                  };

                  const newAcc: AccountWithHistory = {
                    id: `acc-${provider.toLowerCase()}-${Date.now()}`,
                    name,
                    provider,
                    brand: brandMap[provider],
                    accountNumber,
                    month: "Diciembre 2025",
                    amount: baseAmount,
                    percentage: 4,
                    color: colorMap[provider],
                    status: "active",
                    historyStartYear: startYear,
                    historyEndYear: 2025,
                    yearsOfHistory: 2025 - startYear + 1,
                  };

                  setAccounts((prev) => [newAcc, ...prev]);
                  setIsConnectModalOpen(false);
                }}
                className="flex flex-col gap-5"
              >
                {/* Step 1: Cloud Provider */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    1. Proveedor de Nube
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "AWS", name: "Amazon AWS", brand: "AWS" as const, desc: "Cost & Usage Reports" },
                      { id: "Azure", name: "Microsoft Azure", brand: "Azure" as const, desc: "Cost Management" },
                      { id: "GCP", name: "Google Cloud", brand: "GoogleStorage" as const, desc: "BigQuery Export" },
                      { id: "Snowflake", name: "Snowflake DWH", brand: "Snowflake" as const, desc: "Account Usage" },
                    ].map((prov) => (
                      <label
                        key={prov.id}
                        className="p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-red-500 cursor-pointer flex items-center gap-3 transition-all bg-container has-checked:border-red-500 has-checked:bg-red-50/20 dark:has-checked:bg-red-950/20"
                      >
                        <input
                          type="radio"
                          name="provider"
                          value={prov.id}
                          defaultChecked={prov.id === "AWS"}
                          className="sr-only"
                        />
                        <Brand name={prov.brand} size={24} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {prov.name}
                          </span>
                          <span className="text-[10px] text-neutral-800 truncate">
                            {prov.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 2: Account Name & Number */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      2. Nombre descriptivo de la Cuenta
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="ej. AWS - Analytics Staging Cluster"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                  </div>

                  <hr />
                  <h4> Connection</h4>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Access Key ID
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      required
                      placeholder="ej. 8831-9920-1123 ó sub-prod-ea"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Secret Access Key
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      required
                      placeholder="ej. 8831-9920-1123 ó sub-prod-ea"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                  </div>
                </div>


                {/* Bottom Actions */}
                <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setIsConnectModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="danger"
                      type="submit"
                      className="flex items-center gap-2"
                    >
                      <CaralIcon name="check" size={16} />
                      <span>Conectar Cuenta Exclusiva</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </Drawer>

      {/* Account Details Modal with Detailed Services Breakdown Table */}
      {selectedAccount && (() => {
        const historyList = selectedAccount.history || [];
        const effectiveIndex = selectedMonthIndex !== null && selectedMonthIndex >= 0 && selectedMonthIndex < historyList.length
          ? selectedMonthIndex
          : (historyList.length > 0 ? historyList.length - 1 : 0);

        const currentMonthData = historyList[effectiveIndex];
        const currentServices: ServiceItem[] = currentMonthData?.services || selectedAccount.services || [];
        const filteredServices = currentServices.filter((s) =>
          s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
          s.category.toLowerCase().includes(serviceSearch.toLowerCase())
        );

        const monthTotal = currentMonthData?.amount || selectedAccount.amount;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-container border border-neutral-300 dark:border-neutral-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-300 dark:border-neutral-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-full bg-neutral-100 shadow-2xs shrink-0 flex items-center justify-center">
                    <Brand name={selectedAccount.brand} size={30} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                        {selectedAccount.name}
                      </h3>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-100">
                        {selectedAccount.accountNumber}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-800">
                      {selectedAccount.provider} • {selectedAccount.yearsOfHistory || 10} años de histórico disponible
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Selector de Mes del Histórico */}
                  {historyList.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-800">Mes:</span>
                      <select
                        value={effectiveIndex}
                        onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-info-main cursor-pointer"
                      >
                        {historyList.map((h, idx) => (
                          <option key={h.id || idx} value={idx}>
                            {h.fullLabel || `${h.monthFull} ${h.year}`} (${h.amount.toLocaleString()} USD)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    isIconButton
                    iconName="x"
                    variant="ghost"
                    hasBorder
                    onClick={() => {
                      setSelectedAccount(null);
                      setSelectedMonthIndex(null);
                      setServiceSearch('');
                    }}
                  />
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex flex-col">
                  <span className="text-[11px] font-medium text-neutral-800">Total Facturado</span>
                  <span className="text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    ${monthTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex flex-col">
                  <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">Compute</span>
                  <span className="text-lg font-extrabold text-blue-900 dark:text-blue-200 mt-0.5">
                    ${(currentMonthData?.compute || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col">
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Storage</span>
                  <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">
                    ${(currentMonthData?.storage || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col">
                  <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Database & Otros</span>
                  <span className="text-lg font-extrabold text-amber-900 dark:text-amber-200 mt-0.5">
                    ${((currentMonthData?.database || 0) + (currentMonthData?.other || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Detalle de Servicios Internos Table */}
              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Desglose de Servicios Internos ({filteredServices.length})
                    </h4>
                    <p className="text-[11px] text-neutral-800">
                      Cargos discriminados por concepto y consumo para el período seleccionado.
                    </p>
                  </div>

                  {/* Search Filter for services */}
                  <div className="relative min-w-[240px]">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-800">
                      <CaralIcon name="search" size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar servicio (ej. CloudTrail, Glue)..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-info-main"
                    />
                  </div>
                </div>

                {/* Table Container */}
                <div className="w-full overflow-y-auto flex-1 max-h-[340px] border border-neutral-300 dark:border-neutral-800 rounded-xl bg-container shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-neutral-300 bg-neutral-500 font-bold text-neutral-900 text-xs uppercase tracking-wider">
                        <th className="py-2.5 px-3">Servicio Cloud</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3 text-right">Importe ($ USD)</th>
                        <th className="py-2.5 px-3 text-right w-36">% del Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                      {filteredServices.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-neutral-800">
                            No se encontraron servicios que coincidan con "{serviceSearch}"
                          </td>
                        </tr>
                      ) : (
                        filteredServices.map((srv) => {
                          const categoryColorMap: Record<string, string> = {
                            compute: 'bg-blue-100 text-blue-800 border-blue-200',
                            storage: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                            database: 'bg-amber-100 text-amber-800 border-amber-200',
                            other: 'bg-purple-100 text-purple-800 border-purple-200',
                          };
                          const badgeStyle = categoryColorMap[srv.category] || 'bg-neutral-100 text-neutral-800 border-neutral-200';

                          return (
                            <tr
                              key={srv.id || srv.name}
                              className="hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30 transition-colors"
                            >
                              <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-white">
                                {srv.name}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                                  {srv.category}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                                ${srv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-info-main rounded-full"
                                      style={{ width: `${Math.min(100, srv.percentage)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono font-bold text-[11px] text-neutral-800 min-w-[36px]">
                                    {srv.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-300 dark:border-neutral-800">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedAccount(null);
                    setSelectedMonthIndex(null);
                    setServiceSearch('');
                  }}
                >
                  Cerrar
                </Button>
                <Link href="/optimize">
                  <Button variant="info" size="sm">
                    Ver en Dashboard General
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
