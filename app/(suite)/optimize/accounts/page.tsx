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

import suiteConnectionsData from '@/data/suiteConnections.json';

const SUITE_CONNECTIONS = suiteConnectionsData as Array<{
  id: string;
  name: string;
  provider: "AWS" | "Azure" | "GCP" | "Snowflake";
  brand: "AWS" | "Azure" | "GoogleStorage" | "Snowflake";
  accountNumber: string;
  type: string;
  status: string;
  createdDay: string;
  color: string;
  baseAmount: number;
  startYear: number;
}>;

import { useLanguage } from '@/contexts/LanguageContext';

export default function OptimizeAccountsPage() {
  const { dict } = useLanguage();
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
            className="text-neutral-800"
            title="Filtros avanzados"
          />
          <Button
            isIconButton
            iconName="sync"
            variant="ghost"
            hasBorder
            className="text-neutral-800"
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
          <div className="border-b border-neutral-500 pb-2">
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
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-800">
                  <CaralIcon name="search" size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar conexión de la suite..."
                  value={suiteSearch}
                  onChange={(e) => setSuiteSearch(e.target.value)}
                  className="w-full pl-8! pr-3 py-2 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main"
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
                        ? "border-info-main bg-info-light/20 shadow-xs"
                        : "border-neutral-500 bg-container hover:border-neutral-800"
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected
                            ? "bg-info-main border-info-main text-white"
                            : "border-neutral-500 bg-container"
                            }`}
                        >
                          {isSelected && <CaralIcon name="check" size={12} />}
                        </div>

                        <div className="p-1.5 rounded-lg bg-container shrink-0">
                          <Brand name={conn.brand} size={22} />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-neutral-900 truncate">
                            {conn.name}
                          </span>
                          <span className="text-[11px] text-neutral-800 truncate">
                            {conn.type} • ID: {conn.accountNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] font-bold text-success-hard bg-success-light border border-success-main/30 px-2 py-0.5 rounded-full">
                          {conn.status}
                        </span>
                        <span className="text-[10px] text-neutral-800 mt-1">
                          ~${conn.baseAmount.toLocaleString()}/mes
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions for Suite Tab */}
              <div className="flex flex-col gap-3 pt-3 border-t border-neutral-500 mt-1">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    type="button"
                    disabled={selectedSuiteConns.length === 0}
                    onClick={handleImportSuiteConnections}
                    className="flex items-center gap-2 bg-seidor-main text-white"
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
                    className="text-xs text-neutral-800 hover:text-info-main flex items-center gap-1 transition-colors"
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
                  <label className="text-xs font-bold text-neutral-800">
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
                        className="p-3 rounded-xl border border-neutral-500 hover:border-info-main cursor-pointer flex items-center gap-3 transition-all bg-container has-checked:border-info-main has-checked:bg-info-light/20"
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
                          <span className="text-xs font-bold text-neutral-900 truncate">
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
                    <label className="text-xs font-bold text-neutral-800">
                      2. Nombre descriptivo de la Cuenta
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="ej. AWS - Analytics Staging Cluster"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main"
                    />
                  </div>

                  <hr className="border-neutral-500" />
                  <h4 className="text-xs font-bold text-neutral-900"> Connection</h4>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-neutral-800">
                      Access Key ID
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      required
                      placeholder="ej. 8831-9920-1123 ó sub-prod-ea"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 font-mono placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-neutral-800">
                      Secret Access Key
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      required
                      placeholder="ej. 8831-9920-1123 ó sub-prod-ea"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 font-mono placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main"
                    />
                  </div>
                </div>


                {/* Bottom Actions */}
                <div className="flex flex-col gap-3 pt-3 border-t border-neutral-500">
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setIsConnectModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      type="submit"
                      className="flex items-center gap-2 bg-seidor-main text-white"
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
            <div className="bg-container border border-neutral-500 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-500">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-full bg-container shadow-2xs shrink-0 flex items-center justify-center">
                    <Brand name={selectedAccount.brand} size={30} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-neutral-900 truncate">
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
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-container border border-neutral-500 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-info-main cursor-pointer"
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
                <div className="p-3 rounded-xl bg-container border border-neutral-500 flex flex-col">
                  <span className="text-[11px] font-medium text-neutral-800">Total Facturado</span>
                  <span className="text-lg font-extrabold text-neutral-900 mt-0.5">
                    ${monthTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-info-light text-info-hard border border-info-main/30 flex flex-col">
                  <span className="text-[11px] font-medium text-info-hard">Compute</span>
                  <span className="text-lg font-extrabold text-info-hard mt-0.5">
                    ${(currentMonthData?.compute || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-success-light text-success-hard border border-success-main/30 flex flex-col">
                  <span className="text-[11px] font-medium text-success-hard">Storage</span>
                  <span className="text-lg font-extrabold text-success-hard mt-0.5">
                    ${(currentMonthData?.storage || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-warning-light text-warning-hard border border-warning-main/30 flex flex-col">
                  <span className="text-[11px] font-medium text-warning-hard">Database & Otros</span>
                  <span className="text-lg font-extrabold text-warning-hard mt-0.5">
                    ${((currentMonthData?.database || 0) + (currentMonthData?.other || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Detalle de Servicios Internos Table */}
              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
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
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-info-main"
                    />
                  </div>
                </div>

                {/* Table Container */}
                <div className="w-full overflow-y-auto flex-1 max-h-[340px] border border-neutral-500 rounded-xl bg-container shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-neutral-500 bg-neutral-500 font-bold text-neutral-900 text-xs uppercase tracking-wider">
                        <th className="py-2.5 px-3">Servicio Cloud</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3 text-right">Importe ($ USD)</th>
                        <th className="py-2.5 px-3 text-right w-36">% del Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-500 text-xs">
                      {filteredServices.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-neutral-800">
                            No se encontraron servicios que coincidan con "{serviceSearch}"
                          </td>
                        </tr>
                      ) : (
                        filteredServices.map((srv) => {
                          const categoryColorMap: Record<string, string> = {
                            compute: 'bg-info-light text-info-hard border-info-main/30',
                            storage: 'bg-success-light text-success-hard border-success-main/30',
                            database: 'bg-warning-light text-warning-hard border-warning-main/30',
                            other: 'bg-indigo-light text-indigo-hard border-indigo-main/30',
                          };
                          const badgeStyle = categoryColorMap[srv.category] || 'bg-container text-neutral-800 border-neutral-500';

                          return (
                            <tr
                              key={srv.id || srv.name}
                              className="hover:bg-neutral-500/20 transition-colors"
                            >
                              <td className="py-2 px-3 font-semibold text-neutral-900">
                                {srv.name}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                                  {srv.category}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">
                                ${srv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-neutral-500/30 h-1.5 rounded-full overflow-hidden">
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
              <div className="flex items-center justify-between pt-2 border-t border-neutral-500">
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
