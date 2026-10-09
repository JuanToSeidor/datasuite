"use client";

import React, { useState, useRef } from 'react';
import { Button, Drawer, Tabs } from 'caralstable';
import { Brand, CaralBrandName, CaralIcon } from '@/components/icons';
import { DriverItem, DriverAccount, DriverEntity } from './DriverAllocationRow';
import { AllocationMultiSlider } from './AllocationMultiSlider';
import accountsRawData from '@/data/accounts.json';

interface NewDriverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (driver: DriverItem) => void;
}

const AVAILABLE_ACCOUNTS: DriverAccount[] = (accountsRawData as any[]).map((acc) => ({
  id: acc.id,
  name: acc.name,
  brand: acc.brand as CaralBrandName,
  provider: acc.provider,
  color: acc.color,
}));

const PROVIDER_TABS = [
  { label: "Todas" },
  { label: "AWS" },
  { label: "Azure" },
  { label: "GCP" },
  { label: "Snowflake" },
];

const ENTITY_PALETTE = [
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

export function NewDriverDrawer({ isOpen, onClose, onCreate }: NewDriverDrawerProps) {
  // Nivel 1: Información General
  const [name, setName] = useState("");
  const [code, setCode] = useState(`DRV-0${Math.floor(Math.random() * 90 + 10)}`);
  const [description, setDescription] = useState("");

  // Nivel 2: Cuentas Asignadas
  const [searchAccount, setSearchAccount] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([
    "acc-aws-01",
    "acc-azure-01",
  ]);

  // Nivel 3: Entidades y Repartición Porcentual
  const [entities, setEntities] = useState<DriverEntity[]>([
    { id: "ent-init-1", name: "Products", percentage: 50, color: "#EF4444" },
    { id: "ent-init-2", name: "IT & DevOps", percentage: 30, color: "#3B82F6" },
    { id: "ent-init-3", name: "Preventas", percentage: 20, color: "#10B981" },
  ]);
  const [newEntityInput, setNewEntityInput] = useState("");
  const [step, setStep] = useState<number>(10);
  const [isStepDropdownOpen, setIsStepDropdownOpen] = useState(false);

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (ids: string[]) => {
    setSelectedAccountIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAllFiltered = (ids: string[]) => {
    setSelectedAccountIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const selectedProviderLabel = PROVIDER_TABS[activeTab]?.label || "Todas";

  const filteredAccounts = AVAILABLE_ACCOUNTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchAccount.toLowerCase()) ||
      (c.provider && c.provider.toLowerCase().includes(searchAccount.toLowerCase())) ||
      c.id.toLowerCase().includes(searchAccount.toLowerCase());
    const matchesProvider =
      selectedProviderLabel === "Todas" ||
      (c.provider && c.provider.toLowerCase() === selectedProviderLabel.toLowerCase());
    return matchesSearch && matchesProvider;
  });

  // Manejo de Entidades y Manejadores de Prorrateo
  const handleAddCustomEntity = () => {
    if (!newEntityInput.trim()) return;
    const color = ENTITY_PALETTE[entities.length % ENTITY_PALETTE.length];
    const newEnt: DriverEntity = {
      id: `ent-${Date.now()}`,
      name: newEntityInput.trim(),
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
    setNewEntityInput("");
  };

  const handleRemoveEntity = (idToRemove: string) => {
    if (entities.length <= 1) return;
    const updated = entities.filter((e) => e.id !== idToRemove);
    const base = Math.floor(100 / updated.length);
    const remainder = 100 % updated.length;
    const balanced = updated.map((e, idx) => ({
      ...e,
      percentage: idx === 0 ? base + remainder : base,
    }));
    setEntities(balanced);
  };

  const handleUpdateEntityName = (id: string, newName: string) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name: newName } : e))
    );
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
  };

  const handleApplyPreset = (presetName: 'regions' | 'departments') => {
    if (presetName === 'regions') {
      setEntities([
        { id: `ent-reg-1`, name: "Norte", percentage: 40, color: "#EF4444" },
        { id: `ent-reg-2`, name: "Sur", percentage: 35, color: "#3B82F6" },
        { id: `ent-reg-3`, name: "Este", percentage: 25, color: "#10B981" },
      ]);
    } else {
      setEntities([
        { id: `ent-dep-1`, name: "Products", percentage: 50, color: "#8B5CF6" },
        { id: `ent-dep-2`, name: "IT", percentage: 30, color: "#F59E0B" },
        { id: `ent-dep-3`, name: "Preventas", percentage: 20, color: "#06B6D4" },
      ]);
    }
  };


  const totalPercentage = entities.reduce((acc, e) => acc + e.percentage, 0);

  const handleResetForm = () => {
    setName("");
    setCode(`DRV-0${Math.floor(Math.random() * 90 + 10)}`);
    setDescription("");
    setSearchAccount("");
    setActiveTab(0);
    setSelectedAccountIds(["acc-aws-01", "acc-azure-01"]);
    setEntities([
      { id: "ent-init-1", name: "Products", percentage: 50, color: "#EF4444" },
      { id: "ent-init-2", name: "IT & DevOps", percentage: 30, color: "#3B82F6" },
      { id: "ent-init-3", name: "Preventas", percentage: 20, color: "#10B981" },
    ]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedAccountIds.length === 0 || entities.length === 0 || totalPercentage !== 100) {
      return;
    }

    const assignedAccounts: DriverAccount[] = selectedAccountIds.map((accId) => {
      const match = AVAILABLE_ACCOUNTS.find((c) => c.id === accId) || {
        id: accId,
        name: accId,
        brand: 'CloudCosting' as CaralBrandName,
        color: '#8B5CF6'
      };
      return {
        id: match.id,
        name: match.name,
        brand: match.brand,
        provider: match.provider,
        color: match.color,
      };
    });

    const newDriver: DriverItem = {
      id: `drv-${Date.now()}`,
      code: code.trim() || `DRV-0${Math.floor(Math.random() * 90 + 10)}`,
      name: name.trim(),
      description: description.trim() || undefined,
      accounts: assignedAccounts,
      entities,
    };

    onCreate(newDriver);
    handleResetForm();
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Driver de Conexiones"
      size="md"
    >
      <form onSubmit={handleCreate} className="flex flex-col h-full justify-between gap-6 pb-4 pt-2">
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Information Card */}
          <div className="p-3.5 rounded-xl bg-container border border-neutral-500 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-info-light text-info-main shrink-0 mt-0.5">
              <CaralIcon name="bolt" size={18} />
            </div>
            <div className="text-xs text-neutral-800">
              <span className="font-semibold block text-neutral-900 mb-0.5">
                Configuración del Driver
              </span>
              Asocia las cuentas cloud fuente y define las entidades de destino con sus manejadores interactivos de porcentaje.
            </div>
          </div>

          {/* NIVEL 1: Información General */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                1. Información General
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-800">
                  Código *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="DRV-01"
                  required
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-container border border-neutral-500 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-800">
                  Nombre del Driver *
                </label>
                <input
                  type="text"
                  placeholder="ej. Centro de Costos Corporativo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-800">
                Descripción <span className="text-neutral-800 font-normal">(Opcional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Indica el propósito del driver o área responsable..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main resize-none"
              />
            </div>
          </div>

          {/* NIVEL 2: Cuentas Asignadas */}
          <div className="space-y-3 pt-3 border-t border-neutral-500">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  2. Cuentas Asignadas ({selectedAccountIds.length})
                </span>
                <p className="text-[11px] text-neutral-800">
                  Cuentas cloud cuyo costo total se agrupará en este driver.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleSelectAllFiltered(filteredAccounts.map((c) => c.id))}
                  className="text-[11px] text-info-main hover:text-info-hard font-semibold"
                >
                  Seleccionar visibles
                </Button>
                <span className="text-neutral-500">|</span>
                <Button
                  variant="ghost"
                  onClick={() => handleDeselectAllFiltered(filteredAccounts.map((c) => c.id))}
                  className="text-[11px] text-neutral-800 hover:text-neutral-900"
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-800">
                  <CaralIcon name="search" size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar cuenta por nombre o proveedor..."
                  value={searchAccount}
                  onChange={(e) => setSearchAccount(e.target.value)}
                  className="w-full pl-8! pr-3 py-2 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-info-main"
                />
              </div>

              {/* Provider Caral Tabs */}
              <div className="w-full overflow-x-auto">
                <Tabs
                  activeIndex={activeTab}
                  onChange={(idx) => setActiveTab(idx)}
                  tabs={PROVIDER_TABS}
                />
              </div>
            </div>

            {/* Connections / Accounts Cards List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {filteredAccounts.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-800">
                  No se encontraron cuentas para "{searchAccount}"
                </div>
              ) : (
                filteredAccounts.map((conn) => {
                  const isSelected = selectedAccountIds.includes(conn.id);
                  return (
                    <div
                      key={conn.id}
                      onClick={() => toggleAccount(conn.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                        isSelected
                          ? "border-info-main bg-info-light/20 text-neutral-900"
                          : "border-neutral-500 bg-container text-neutral-800 hover:border-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1 rounded-lg bg-container border border-neutral-500 shrink-0">
                          <Brand name={conn.brand} size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{conn.name}</p>
                          <p className="text-[10px] text-neutral-800">{conn.provider} &bull; {conn.id}</p>
                        </div>
                      </div>

                      <div className={`size-4.5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-info-main border-info-main text-white"
                          : "border-neutral-500 bg-transparent"
                      }`}>
                        {isSelected && <CaralIcon name="check" size={12} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* NIVEL 3: Entidades y Repartición Porcentual con Manejadores */}
          <div className="space-y-3 pt-3 border-t border-neutral-500">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    3. Entidades & Prorrateo Porcentual
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      totalPercentage === 100
                        ? 'bg-success-light text-success-hard border border-success-main/30'
                        : 'bg-danger-light text-danger-hard border border-danger-main/30'
                    }`}
                  >
                    Total: {totalPercentage}% {totalPercentage !== 100 ? '(Debe ser 100%)' : '✓'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-800 mt-0.5">
                  Usa los manejadores (+/-) y el selector de paso para calibrar la partición del 100%.
                </p>
              </div>

              {/* Controles de Paso y Plantillas */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Step Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    hasBorder
                    onClick={() => setIsStepDropdownOpen((prev) => !prev)}
                    className="px-2 py-1 text-[11px] font-mono font-semibold flex items-center gap-1 text-neutral-800 border-neutral-500"
                  >
                    <span>Paso: &plusmn;{step}%</span>
                    <CaralIcon name="chevronDown" size={10} />
                  </Button>
                  {isStepDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-24 bg-container rounded-lg border border-neutral-500 shadow-lg py-1 z-30">
                      {STEP_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setStep(opt);
                            setIsStepDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1 text-xs font-mono transition-colors ${
                            step === opt
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
                  onClick={() => handleApplyPreset('regions')}
                  className="px-2 py-1 text-[11px] rounded-md text-neutral-800 border-neutral-500"
                  title="Ejemplo: Norte, Sur, Este"
                >
                  Regiones
                </Button>
                <Button
                  variant="ghost"
                  hasBorder
                  onClick={() => handleApplyPreset('departments')}
                  className="px-2 py-1 text-[11px] rounded-md text-neutral-800 border-neutral-500"
                  title="Ejemplo: Products, IT, Preventas"
                >
                  Sectores
                </Button>
                <Button
                  variant="ghost"
                  hasBorder
                  onClick={handleDistributeEqually}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md border border-neutral-500 text-neutral-800"
                >
                  Equitativo
                </Button>
              </div>
            </div>

            {/* Input to Add Custom Entity */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe una entidad (ej. Norte, Preventas, Marketing)..."
                value={newEntityInput}
                onChange={(e) => setNewEntityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomEntity();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-info-main"
              />
              <Button
                variant="info"
                disabled={!newEntityInput.trim()}
                onClick={handleAddCustomEntity}
                className="text-xs py-2 px-3.5 flex items-center gap-1.5 shrink-0"
              >
                <CaralIcon name="plus" size={14} />
                <span>Agregar</span>
              </Button>
            </div>

            {/* Slider Horizontal Multirango con Manejadores Arrastrables y Selector de Color */}
            <div className="py-2 px-1">
              <AllocationMultiSlider
                entities={entities}
                onChange={(updated) => setEntities(updated)}
                onEditEntityName={handleUpdateEntityName}
                onRemoveEntity={handleRemoveEntity}
                step={step}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-500 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="ghost"
            hasBorder
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            variant="default"
            type="submit"
            disabled={
              !name.trim() ||
              selectedAccountIds.length === 0 ||
              entities.length === 0 ||
              totalPercentage !== 100
            }
            className="bg-seidor-main text-white shadow-sm font-semibold"
          >
            Crear Driver ({selectedAccountIds.length} cuentas &bull; {entities.length} entidades)
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
