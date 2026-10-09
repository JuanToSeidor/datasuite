"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Button, Drawer, Tabs } from 'caralstable';
import { Brand, CaralBrandName, CaralIcon } from '@/components/icons';
import { AllocationMultiSlider } from './AllocationMultiSlider';
import accountsRawData from '@/data/accounts.json';
import { useLanguage } from '@/contexts/LanguageContext';

export interface DriverAccount {
  id: string;
  name: string;
  brand: CaralBrandName;
  provider?: string;
  color?: string;
}

export interface DriverEntity {
  id: string;
  name: string;
  percentage: number;
  color?: string;
}

export interface DriverConnection extends DriverAccount {
  percentage?: number;
}

export interface DriverItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  accounts: DriverAccount[];
  entities: DriverEntity[];
  connections?: DriverConnection[];
}

interface DriverAllocationRowProps {
  driver: DriverItem;
  onClose: () => void;
  onSave?: (updatedDriver: DriverItem) => void;
}

const ENTITY_DEFAULT_COLORS = [
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#14B8A6',
];

const STEP_OPTIONS = [1, 5, 10, 20];

const DRAWER_FILTER_TABS = [
  { label: 'Todas' },
  { label: 'AWS' },
  { label: 'Azure' },
  { label: 'GCP' },
  { label: 'Snowflake' },
];

export function DriverAllocationRow({
  driver,
  onClose,
  onSave,
}: DriverAllocationRowProps) {
  const { dict } = useLanguage();
  // Normalize initial accounts and entities (handling legacy data if any)
  const initialAccounts: DriverAccount[] = useMemo(() => {
    if (driver.accounts && driver.accounts.length > 0) return driver.accounts;
    if (driver.connections && driver.connections.length > 0) {
      return driver.connections.map((c) => ({
        id: c.id,
        name: c.name,
        brand: c.brand,
        color: c.color,
      }));
    }
    return [];
  }, [driver]);

  const initialEntities: DriverEntity[] = useMemo(() => {
    if (driver.entities && driver.entities.length > 0) return driver.entities;
    return [
      { id: `ent-${Date.now()}-1`, name: 'Products', percentage: 50, color: '#EF4444' },
      { id: `ent-${Date.now()}-2`, name: 'IT', percentage: 30, color: '#3B82F6' },
      { id: `ent-${Date.now()}-3`, name: 'Preventas', percentage: 20, color: '#10B981' },
    ];
  }, [driver]);

  const [accounts, setAccounts] = useState<DriverAccount[]>(initialAccounts);
  const [entities, setEntities] = useState<DriverEntity[]>(initialEntities);
  const [savedSnapshot, setSavedSnapshot] = useState<{
    accounts: DriverAccount[];
    entities: DriverEntity[];
  }>({
    accounts: initialAccounts,
    entities: initialEntities,
  });
  const [newEntityName, setNewEntityName] = useState('');
  const [isAddingEntity, setIsAddingEntity] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [step, setStep] = useState<number>(10);
  const [isStepDropdownOpen, setIsStepDropdownOpen] = useState<boolean>(false);

  // Drawer state for adding accounts
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState<boolean>(false);
  const [accountSearch, setAccountSearch] = useState<string>('');
  const [activeDrawerTab, setActiveDrawerTab] = useState<number>(0);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const totalPercentage = entities.reduce((acc, e) => acc + e.percentage, 0);

  // Filter accounts not in this driver
  const existingAccountIds = useMemo(() => new Set(accounts.map((a) => a.id)), [accounts]);

  const availableAccounts = useMemo(() => {
    return (accountsRawData as any[]).filter((acc) => !existingAccountIds.has(acc.id));
  }, [existingAccountIds]);

  const selectedProviderLabel = DRAWER_FILTER_TABS[activeDrawerTab]?.label || 'Todas';

  const filteredAvailableAccounts = useMemo(() => {
    return availableAccounts.filter((acc) => {
      const matchesSearch =
        acc.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
        acc.accountNumber?.toLowerCase().includes(accountSearch.toLowerCase()) ||
        acc.provider?.toLowerCase().includes(accountSearch.toLowerCase());
      const matchesProvider =
        selectedProviderLabel === 'Todas' ||
        acc.provider?.toLowerCase() === selectedProviderLabel.toLowerCase();
      return matchesSearch && matchesProvider;
    });
  }, [availableAccounts, accountSearch, selectedProviderLabel]);

  // Handle adding accounts
  const handleAddSelectedAccounts = () => {
    if (selectedAccountIds.length === 0) return;
    const accountsToAdd: DriverAccount[] = (accountsRawData as any[])
      .filter((acc) => selectedAccountIds.includes(acc.id))
      .map((acc) => ({
        id: acc.id,
        name: acc.name,
        brand: acc.brand as CaralBrandName,
        provider: acc.provider,
        color: acc.color,
      }));

    setAccounts((prev) => [...prev, ...accountsToAdd]);
    setSelectedAccountIds([]);
    setIsAddDrawerOpen(false);
    setIsSaved(false);
  };

  const handleRemoveAccount = (idToRemove: string) => {
    if (accounts.length <= 1) return;
    setAccounts((prev) => prev.filter((a) => a.id !== idToRemove));
    setIsSaved(false);
  };

  // Entity Management
  const handleAddEntity = () => {
    if (!newEntityName.trim()) return;
    const color = ENTITY_DEFAULT_COLORS[entities.length % ENTITY_DEFAULT_COLORS.length];
    const newEnt: DriverEntity = {
      id: `ent-${Date.now()}`,
      name: newEntityName.trim(),
      percentage: 0,
      color,
    };
    const updated = [...entities, newEnt];
    const base = Math.floor(100 / updated.length);
    const remainder = 100 % updated.length;
    const balanced = updated.map((e, idx) => ({
      ...e,
      percentage: idx === 0 ? base + remainder : base,
    }));
    setEntities(balanced);
    setNewEntityName('');
    setIsAddingEntity(false);
    setIsSaved(false);
  };

  const handleRemoveEntity = (idxToRemove: number) => {
    if (entities.length <= 1) return;
    const updated = entities.filter((_, i) => i !== idxToRemove);
    const base = Math.floor(100 / updated.length);
    const remainder = 100 % updated.length;
    const balanced = updated.map((e, idx) => ({
      ...e,
      percentage: idx === 0 ? base + remainder : base,
    }));
    setEntities(balanced);
    setIsSaved(false);
  };

  const handleDistributeEqually = () => {
    if (entities.length === 0) return;
    const base = Math.floor(100 / entities.length);
    const remainder = 100 % entities.length;
    setEntities((prev) =>
      prev.map((e, idx) => ({
        ...e,
        percentage: idx === 0 ? base + remainder : base,
      }))
    );
    setIsSaved(false);
  };

  const handleStepPercentage = (idx: number, delta: number) => {
    const effectiveDelta = delta * step;
    setEntities((prev) => {
      const current = prev[idx];
      const targetPct = Math.max(0, Math.min(100, current.percentage + effectiveDelta));
      const actualDelta = targetPct - current.percentage;
      if (actualDelta === 0) return prev;

      const otherCount = prev.length - 1;
      if (otherCount === 0) {
        return [{ ...current, percentage: 100 }];
      }

      const updated = [...prev];
      updated[idx] = { ...current, percentage: targetPct };

      let remainingToAdjust = -actualDelta;
      const otherIndices = prev.map((_, i) => i).filter((i) => i !== idx);

      for (let i = 0; i < otherIndices.length; i++) {
        const oIdx = otherIndices[i];
        const isLast = i === otherIndices.length - 1;
        const take = isLast
          ? remainingToAdjust
          : Math.round(remainingToAdjust / (otherIndices.length - i));

        const newOtherPct = Math.max(0, updated[oIdx].percentage + take);
        remainingToAdjust -= (newOtherPct - updated[oIdx].percentage);
        updated[oIdx] = { ...updated[oIdx], percentage: newOtherPct };
      }

      const sum = updated.reduce((acc, item) => acc + item.percentage, 0);
      if (sum !== 100 && otherIndices.length > 0) {
        const diff = 100 - sum;
        updated[otherIndices[0]].percentage = Math.max(0, updated[otherIndices[0]].percentage + diff);
      }

      return updated;
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave?.({
      ...driver,
      accounts,
      entities,
    });
    setSavedSnapshot({
      accounts,
      entities,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetToSaved = () => {
    setAccounts(savedSnapshot.accounts);
    setEntities(savedSnapshot.entities);
    setIsAddingEntity(false);
    setNewEntityName('');
    setIsSaved(false);
  };


  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-container border border-neutral-500 overflow-hidden shadow-sm animate-in fade-in-50 duration-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-2 bg-neutral-500 ">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-100">
                {driver.code}
              </span>
              <h3 className="text-base font-bold text-neutral-900">
                {driver.name}
              </h3>
            </div>
            <p className="text-xs text-neutral-800 mt-0.5">
              Configuración de cuentas cloud asociadas y partición porcentual por entidades (sectores/unidades).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="success"
            onClick={handleSave}
            iconName='save'
            size='sm'
            className="hover:text-success-hard!"
          >
            <span>{isSaved ? 'Guardado' : 'Guardar Cambios'}</span>
          </Button>

          <Button variant="ghost" size='sm' iconName='x' isIconButton hasBorder onClick={onClose} />
        </div>
      </div>

      <div className="px-6 pb-4">
        {/* Cuentas relacionadas */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-neutral-500 mb-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-container border border-neutral-500 shadow-2xs group"
            >
              <div className="p-1 bg-container rounded-full">
                <Brand name={acc.brand} size={16} />
              </div>
              <span className="text-xs font-medium text-neutral-900 truncate max-w-[200px]">
                {acc.name}
              </span>
              {accounts.length > 1 && (
                <Button
                  variant="ghost"
                  isIconButton
                  iconName="x"
                  size="sm"
                  onClick={() => handleRemoveAccount(acc.id)}
                  className="text-neutral-800 hover:text-danger-main! transition-colors p-0.5"
                  title="Quitar cuenta del driver"
                />
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            hasBorder
            className="text-xs py-1 px-2.5 flex items-center gap-1.5 hover:border-info-main hover:text-info-main"
            onClick={() => setIsAddDrawerOpen(true)}
          >
            <CaralIcon name="plus" size={14} />
            <span>Asignar Cuentas</span>
          </Button>
        </div>

        {/* SECTION 2: Entidades y Prorrateo Porcentual */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Step Selection Dropdown */}
            <div className='flex gap-2 items-center'>
              <div className="relative">
                <Button
                  variant="ghost"
                  hasBorder
                  onClick={() => setIsStepDropdownOpen((prev) => !prev)}
                  className="px-2.5 py-1 text-xs font-mono font-semibold flex items-center gap-1.5 text-neutral-800 border-neutral-500"
                >
                  <span>Paso: &plusmn;{step}%</span>
                  <CaralIcon name="chevronDown" size={12} />
                </Button>
                {isStepDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-28 bg-container rounded-lg border border-neutral-500 shadow-lg py-1 z-30">
                    {STEP_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setStep(opt);
                          setIsStepDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${step === opt
                          ? 'bg-seidor-main text-white font-bold'
                          : 'hover:bg-neutral-500/20 text-neutral-800'
                          }`}
                      >
                        &plusmn;{opt}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                hasBorder
                size='sm'
                onClick={handleDistributeEqually}
              >
                Repartir Equitativo
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                iconName='refreshPresentation'
                isIconButton
                size='sm'
                variant='ghost'
                onClick={handleResetToSaved}
                title="Restaurar a la última versión guardada"
              />

              <Button
                variant="info"
                size='sm'
                onClick={() => setIsAddingEntity(true)}
              >
                <CaralIcon name="plus" size={14} />
                <span>Nueva Entidad</span>
              </Button>
            </div>
          </div>

          {/* New Entity Input Inline */}
          {isAddingEntity && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-info-light text-info-hard border border-info-main/30 animate-in fade-in">
              <input
                type="text"
                placeholder="Nombre de la nueva entidad (ej. Región Norte, Marketing, Preventas)..."
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddEntity();
                }}
                autoFocus
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-info-main"
              />
              <Button variant="info" className="text-xs py-1.5 px-3" onClick={handleAddEntity}>
                Agregar
              </Button>
              <Button
                variant="ghost"
                className="text-xs py-1.5 px-3"
                onClick={() => {
                  setIsAddingEntity(false);
                  setNewEntityName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Slider Horizontal Multirango con Manejadores Arrastrables y Selector de Color */}
          <div className="py-2 px-4">
            <AllocationMultiSlider
              entities={entities}
              onChange={(updated) => {
                setEntities(updated);
                setIsSaved(false);
              }}
              onEditEntityName={(id, newName) => {
                setEntities((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, name: newName } : e))
                );
                setIsSaved(false);
              }}
              onRemoveEntity={(id) => {
                const updated = entities.filter((e) => e.id !== id);
                if (updated.length === 0) return;
                const base = Math.floor(100 / updated.length);
                const remainder = 100 % updated.length;
                const balanced = updated.map((e, idx) => ({
                  ...e,
                  percentage: idx === 0 ? base + remainder : base,
                }));
                setEntities(balanced);
                setIsSaved(false);
              }}
              step={step}
            />
          </div>
        </div>
      </div>

      {/* Caral Drawer: Agregar Cuentas Disponibles al Driver */}
      <Drawer
        isOpen={isAddDrawerOpen}
        onClose={() => {
          setIsAddDrawerOpen(false);
          setSelectedAccountIds([]);
          setAccountSearch('');
          setActiveDrawerTab(0);
        }}
        title={`Asignar Cuentas a ${driver.code}`}
        size="md"
      >
        <div className="flex flex-col gap-4 p-1">
          <div>
            <p className="text-xs text-neutral-800">
              Selecciona las cuentas cloud disponibles que deseas vincular a <strong>{driver.name}</strong>.
            </p>
          </div>

          {/* Search & Provider Tabs */}
          <div className="flex flex-col gap-2.5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-800">
                <CaralIcon name="search" size={14} />
              </div>
              <input
                type="text"
                placeholder="Buscar cuenta por nombre, número o proveedor..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full pl-8! pr-3 py-1.5 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-info-main"
              />
            </div>

            <div className="w-full overflow-x-auto">
              <Tabs
                activeIndex={activeDrawerTab}
                onChange={(idx) => setActiveDrawerTab(idx)}
                tabs={DRAWER_FILTER_TABS}
              />
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredAvailableAccounts.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-800">
                No hay cuentas disponibles que coincidan con la búsqueda.
              </div>
            ) : (
              filteredAvailableAccounts.map((acc) => {
                const isSelected = selectedAccountIds.includes(acc.id);
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccountIds((prev) =>
                        prev.includes(acc.id)
                          ? prev.filter((id) => id !== acc.id)
                          : [...prev, acc.id]
                      );
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${isSelected
                      ? 'border-info-main bg-info-light/20 text-neutral-900'
                      : 'border-neutral-500 bg-container text-neutral-800 hover:border-neutral-800'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-container border border-neutral-500 shrink-0">
                        <Brand name={acc.brand} size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{acc.name}</p>
                        <p className="text-[10px] text-neutral-800">
                          {acc.provider} &bull; {acc.accountNumber || acc.id}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`size-4.5 rounded-md border flex items-center justify-center transition-colors ${isSelected
                        ? 'bg-info-main border-info-main text-white'
                        : 'border-neutral-500 bg-transparent'
                        }`}
                    >
                      {isSelected && <CaralIcon name="check" size={12} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-neutral-500 flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-800">
              {selectedAccountIds.length} cuenta{selectedAccountIds.length === 1 ? '' : 's'} seleccionada{selectedAccountIds.length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                hasBorder
                onClick={() => {
                  setIsAddDrawerOpen(false);
                  setSelectedAccountIds([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                disabled={selectedAccountIds.length === 0}
                onClick={handleAddSelectedAccounts}
                className="bg-seidor-main text-white shadow-sm font-semibold"
              >
                Vincular Cuentas {selectedAccountIds.length > 0 ? `(${selectedAccountIds.length})` : ''}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
