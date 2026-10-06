"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button, Tabs, Chip, Drawer } from 'caralstable';
import { CaralIcon, Brand } from '@/components/icons';
import { Input, Select } from '@/components/ui';
import driversRawData from '@/data/drivers.json';
import accountsRawData from '@/data/accounts.json';
import { DriverItem } from '@/components/optimize/drivers/DriverAllocationRow';

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

type TextFilterOperator =
  | 'contains'
  | 'doesNotContain'
  | 'equals'
  | 'doesNotEqual'
  | 'empty'
  | 'notEmpty'
  | 'startsWith'
  | 'endsWith';

type CostFilterOperator =
  | 'equals'
  | 'doesNotEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'empty'
  | 'notEmpty';

const TEXT_FILTER_OPTIONS: { id: TextFilterOperator; label: string }[] = [
  { id: 'contains', label: 'Contains' },
  { id: 'doesNotContain', label: 'Does not contain' },
  { id: 'equals', label: 'Equals' },
  { id: 'doesNotEqual', label: 'Does not equal' },
  { id: 'empty', label: 'Empty' },
  { id: 'notEmpty', label: 'Not empty' },
  { id: 'startsWith', label: 'Starts with' },
  { id: 'endsWith', label: 'Ends with' },
];

const COST_FILTER_OPTIONS: { id: CostFilterOperator; label: string }[] = [
  { id: 'equals', label: 'Equals' },
  { id: 'doesNotEqual', label: 'Does not equal' },
  { id: 'greaterThan', label: 'Greater than (>)' },
  { id: 'greaterThanOrEqual', label: 'Greater than or equal (>=)' },
  { id: 'lessThan', label: 'Less than (<)' },
  { id: 'lessThanOrEqual', label: 'Less than or equal (<=)' },
  { id: 'between', label: 'Between (Rango)' },
  { id: 'empty', label: 'Empty ($0)' },
  { id: 'notEmpty', label: 'Not empty (> $0)' },
];

const FILTER_DRAWER_TABS = [
  { label: 'Servicio Cloud' },
  { label: 'Categoría' },
  { label: 'Costo Facturado' },
];

function evaluateTextFilter(value: string, operator: TextFilterOperator, filterVal: string): boolean {
  const target = (value || '').toLowerCase().trim();
  const query = (filterVal || '').toLowerCase().trim();

  switch (operator) {
    case 'contains':
      return target.includes(query);
    case 'doesNotContain':
      return !target.includes(query);
    case 'equals':
      return target === query;
    case 'doesNotEqual':
      return target !== query;
    case 'empty':
      return target === '';
    case 'notEmpty':
      return target !== '';
    case 'startsWith':
      return target.startsWith(query);
    case 'endsWith':
      return target.endsWith(query);
    default:
      return true;
  }
}

function evaluateCostFilter(
  amount: number,
  operator: CostFilterOperator,
  filterVal: string,
  filterValTo: string
): boolean {
  const numVal = parseFloat(filterVal);
  const numValTo = parseFloat(filterValTo);

  switch (operator) {
    case 'equals':
      return !isNaN(numVal) ? Math.abs(amount - numVal) < 0.001 : true;
    case 'doesNotEqual':
      return !isNaN(numVal) ? Math.abs(amount - numVal) >= 0.001 : true;
    case 'greaterThan':
      return !isNaN(numVal) ? amount > numVal : true;
    case 'greaterThanOrEqual':
      return !isNaN(numVal) ? amount >= numVal : true;
    case 'lessThan':
      return !isNaN(numVal) ? amount < numVal : true;
    case 'lessThanOrEqual':
      return !isNaN(numVal) ? amount <= numVal : true;
    case 'between': {
      const min = !isNaN(numVal) ? numVal : 0;
      const max = !isNaN(numValTo) ? numValTo : Infinity;
      return amount >= Math.min(min, max) && amount <= Math.max(min, max);
    }
    case 'empty':
      return amount === 0;
    case 'notEmpty':
      return amount > 0;
    default:
      return true;
  }
}

/**
 * Evalúa fórmulas simples en celdas de distribución:
 * - Porcentajes: "35%", "(35%)" -> calcula (srvAmount * 35) / 100
 * - Operaciones relativas sobre el valor actual: "+0.4", "(+ 0.4)", "- 2", "* 1.5", "/ 2", "+ 10%"
 * - Expresiones aritméticas completas: "50 + 20", "100 * 0.3", "50% + 10"
 * - Números directos: "4.7", "120.50"
 */
function evaluateFormula(rawInput: string, currentAmount: number, srvAmount: number): number {
  if (!rawInput || !rawInput.trim()) return 0;
  let text = rawInput.trim().replace(/[()$]/g, '').trim();

  // Caso 1: Solo porcentaje directo, ej: "35%" o "35.5%"
  if (/^\s*([0-9]+(\.[0-9]+)?)\s*%\s*$/.test(text)) {
    const match = text.match(/([0-9]+(\.[0-9]+)?)/);
    if (match) {
      const pct = parseFloat(match[1]);
      return (srvAmount * pct) / 100;
    }
  }

  // Caso 2: Operador relativo al valor actual, ej: "+ 0.4", "+0.4", "- 2", "* 1.5", "/ 2", "+ 10%"
  const relativeMatch = text.match(/^([+\-*/])\s*([0-9]+(\.[0-9]+)?)\s*(%)?$/);
  if (relativeMatch) {
    const op = relativeMatch[1];
    let operand = parseFloat(relativeMatch[2]);
    const isPct = !!relativeMatch[4];
    if (isPct) {
      operand = (srvAmount * operand) / 100;
    }

    switch (op) {
      case '+': return currentAmount + operand;
      case '-': return Math.max(0, currentAmount - operand);
      case '*': return currentAmount * operand;
      case '/': return operand !== 0 ? currentAmount / operand : currentAmount;
    }
  }

  // Caso 3: Reemplazar porcentajes embebidos por su valor en USD
  text = text.replace(/([0-9]+(\.[0-9]+)?)\s*%/g, (_, p) => {
    return ((srvAmount * parseFloat(p)) / 100).toString();
  });

  // Sanitizar para permitir solo dígitos, operadores y espacios
  if (!/^[0-9+\-*/.\s]+$/.test(text)) {
    const fallback = parseFloat(text);
    return isNaN(fallback) ? currentAmount : Math.max(0, fallback);
  }

  try {
    const result = new Function(`return (${text})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.max(0, result);
    }
  } catch {
    const fallback = parseFloat(text);
    return isNaN(fallback) ? currentAmount : Math.max(0, fallback);
  }

  return currentAmount;
}

interface EditableEntityCellProps {
  srvKey: string;
  entId: string;
  amount: number;
  srvAmount: number;
  onChange: (srvKey: string, entId: string, value: number) => void;
}

function EditableEntityCell({ srvKey, entId, amount, srvAmount, onChange }: EditableEntityCellProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(amount.toFixed(2));

  useEffect(() => {
    if (!isFocused) {
      setInputValue(amount.toFixed(2));
    }
  }, [amount, isFocused]);

  const commitValue = () => {
    const computed = evaluateFormula(inputValue, amount, srvAmount);
    const rounded = Number(computed.toFixed(2));
    onChange(srvKey, entId, rounded);
    setInputValue(rounded.toFixed(2));
    setIsFocused(false);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <span className="text-neutral-700 text-xs select-none">$</span>
      <input
        type="text"
        value={isFocused ? inputValue : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        onFocus={(e) => {
          setIsFocused(true);
          setInputValue(amount.toFixed(2));
          e.target.select();
        }}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitValue();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === 'Escape') {
            setInputValue(amount.toFixed(2));
            setIsFocused(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
        title="Ingresa valor o fórmula: 35%, +0.4, -2, *1.5, /2, 50+20"
        placeholder="0.00"
        className="w-24 px-2 py-1 text-right text-xs font-mono font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-container text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main hover:border-neutral-400 transition-all shadow-2xs"
      />
    </div>
  );
}

export default function OptimizeDistributionsPage() {
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
    // If no driver is explicitly assigned, return all drivers as fallback
    return filtered.length > 0 ? filtered : drivers;
  }, [drivers, selectedAccountId]);

  // 3. Driver Selection
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');

  // Keep activeDriver aligned with availableDrivers
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

  // 6. Manual inline editing state
  const [isManualEditing, setIsManualEditing] = useState<boolean>(false);

  // 7. Service Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 8. Fullscreen / Maximize state
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // Escuchar la tecla Escape para restaurar el tamaño cuando esté maximizado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  // Bloquear scroll de fondo cuando esté maximizado
  useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMaximized]);

  // 8. Column resizing state and logic
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [activeResizingCol, setActiveResizingCol] = useState<string | null>(null);
  const resizingRef = useRef<{
    colKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const getColWidth = (key: string, defaultWidth: number) => {
    return columnWidths[key] ?? defaultWidth;
  };

  const handleStartResize = (colKey: string, currentWidth: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveResizingCol(colKey);
    resizingRef.current = {
      colKey,
      startX: e.clientX,
      startWidth: currentWidth,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const { colKey, startX, startWidth } = resizingRef.current;
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(75, startWidth + deltaX);
      setColumnWidths((prev) => ({
        ...prev,
        [colKey]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      setActiveResizingCol(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderResizer = (colKey: string, defaultWidth: number) => {
    const currentWidth = getColWidth(colKey, defaultWidth);
    const isResizing = activeResizingCol === colKey;

    return (
      <div
        onMouseDown={(e) => handleStartResize(colKey, currentWidth, e)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setColumnWidths((prev) => {
            const next = { ...prev };
            delete next[colKey];
            return next;
          });
        }}
        title="Arrastrar para redimensionar (doble clic para restaurar)"
        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-30 flex items-center justify-center group/resizer"
      >
        <div
          className={`w-[2px] h-3/5 rounded-full transition-all duration-150 ${isResizing
            ? 'bg-info-main w-[3px] shadow-xs'
            : 'bg-neutral-400/70 dark:bg-neutral-600 group-hover/resizer:bg-info-main group-hover/resizer:w-[3px]'
            }`}
        />
      </div>
    );
  };

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

  // 9. Manual allocations state: { [serviceKey]: { [entityId]: amount } }
  const [manualAllocations, setManualAllocations] = useState<Record<string, Record<string, number>>>({});

  // Helper to get the allocated amount for a specific entity and service
  const getEntityAmount = (srv: ServiceItem, ent: { id: string; percentage: number }) => {
    const srvKey = srv.id || srv.name;
    if (manualAllocations[srvKey]?.[ent.id] !== undefined) {
      return manualAllocations[srvKey][ent.id];
    }
    if (distributionType === 'clean') {
      return 0;
    }
    return (srv.amount * ent.percentage) / 100;
  };

  const handleManualAmountChange = (srvKey: string, entId: string, value: number) => {
    setManualAllocations((prev) => ({
      ...prev,
      [srvKey]: {
        ...(prev[srvKey] || {}),
        [entId]: Math.max(0, value),
      },
    }));
  };

  // Helper to get total allocated for a service row
  const getRowTotal = (srv: ServiceItem) => {
    const srvKey = srv.id || srv.name;
    if (Object.keys(manualAllocations[srvKey] || {}).length > 0) {
      return entities.reduce((sum, ent) => sum + getEntityAmount(srv, ent), 0);
    }
    if (distributionType === 'clean') return 0;
    return srv.amount;
  };

  // 10. Filter only errors state
  const [showOnlyErrors, setShowOnlyErrors] = useState<boolean>(false);

  // 11. Column Drawer Filters
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [filterDrawerTab, setFilterDrawerTab] = useState<number>(0);

  // Service Filter State
  const [serviceFilterOp, setServiceFilterOp] = useState<TextFilterOperator>('contains');
  const [serviceFilterVal, setServiceFilterVal] = useState<string>('');
  const [isServiceFilterActive, setIsServiceFilterActive] = useState<boolean>(false);

  // Category Filter State
  const [categoryFilterOp, setCategoryFilterOp] = useState<TextFilterOperator>('contains');
  const [categoryFilterVal, setCategoryFilterVal] = useState<string>('');
  const [isCategoryFilterActive, setIsCategoryFilterActive] = useState<boolean>(false);

  // Cost Filter State
  const [costFilterOp, setCostFilterOp] = useState<CostFilterOperator>('greaterThanOrEqual');
  const [costFilterVal, setCostFilterVal] = useState<string>('');
  const [costFilterValTo, setCostFilterValTo] = useState<string>('');
  const [isCostFilterActive, setIsCostFilterActive] = useState<boolean>(false);

  const activeFiltersCount =
    (isServiceFilterActive ? 1 : 0) +
    (isCategoryFilterActive ? 1 : 0) +
    (isCostFilterActive ? 1 : 0);

  const clearAllFilters = () => {
    setIsServiceFilterActive(false);
    setServiceFilterVal('');
    setServiceFilterOp('contains');

    setIsCategoryFilterActive(false);
    setCategoryFilterVal('');
    setCategoryFilterOp('contains');

    setIsCostFilterActive(false);
    setCostFilterVal('');
    setCostFilterValTo('');
    setCostFilterOp('greaterThanOrEqual');
  };

  // Unique categories list for suggestions
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(aggregatedServices.map((s) => s.category).filter(Boolean)));
    return cats.sort();
  }, [aggregatedServices]);

  // Count of services with mismatch in current dataset
  const mismatchCount = useMemo(() => {
    return aggregatedServices.filter((s) => Math.abs(getRowTotal(s) - s.amount) >= 0.01).length;
  }, [aggregatedServices, getRowTotal]);

  // Filtered by user search, error toggle, and advanced column filters
  const filteredServices = useMemo(() => {
    let list = aggregatedServices;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    if (showOnlyErrors) {
      list = list.filter((s) => Math.abs(getRowTotal(s) - s.amount) >= 0.01);
    }
    if (isServiceFilterActive) {
      list = list.filter((s) => evaluateTextFilter(s.name, serviceFilterOp, serviceFilterVal));
    }
    if (isCategoryFilterActive) {
      list = list.filter((s) => evaluateTextFilter(s.category, categoryFilterOp, categoryFilterVal));
    }
    if (isCostFilterActive) {
      list = list.filter((s) => evaluateCostFilter(s.amount, costFilterOp, costFilterVal, costFilterValTo));
    }
    return list;
  }, [
    aggregatedServices,
    searchQuery,
    showOnlyErrors,
    getRowTotal,
    isServiceFilterActive,
    serviceFilterOp,
    serviceFilterVal,
    isCategoryFilterActive,
    categoryFilterOp,
    categoryFilterVal,
    isCostFilterActive,
    costFilterOp,
    costFilterVal,
    costFilterValTo,
  ]);

  // Total amount for the filtered period/account
  const totalPeriodAmount = useMemo(() => {
    return aggregatedServices.reduce((sum, s) => sum + s.amount, 0);
  }, [aggregatedServices]);

  // Export table content to CSV
  const handleExportCSV = () => {
    // 1. Headers
    const headers = [
      'Servicio Cloud',
      'Categoría',
      'Costo Facturado ($)',
      ...entities.map((ent) => `${ent.name} (${ent.percentage}%) ($)`),
      'Total Prorrateado ($)',
    ];

    // Helper to format CSV cells
    const escapeCSV = (val: string | number) => {
      const stringVal = String(val ?? '');
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    // 2. Data rows
    const rows = filteredServices.map((srv) => {
      const entityValues = entities.map((ent) => {
        const entityAmount = getEntityAmount(srv, ent);
        return entityAmount.toFixed(2);
      });
      const rowTotal = getRowTotal(srv);
      return [
        escapeCSV(srv.name),
        escapeCSV(srv.category),
        srv.amount.toFixed(2),
        ...entityValues,
        rowTotal.toFixed(2),
      ].join(',');
    });

    // 3. Totals row
    if (filteredServices.length > 0) {
      const totalEntityValues = entities.map((ent) => {
        const totalEntAmount = filteredServices.reduce((sum, s) => sum + getEntityAmount(s, ent), 0);
        return totalEntAmount.toFixed(2);
      });
      const totalProrated = filteredServices.reduce((sum, s) => sum + getRowTotal(s), 0);
      const totalsRow = [
        escapeCSV('TOTAL'),
        '',
        totalPeriodAmount.toFixed(2),
        ...totalEntityValues,
        totalProrated.toFixed(2),
      ].join(',');
      rows.push(totalsRow);
    }

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const cleanAccountName = (selectedAccount?.name || (selectedAccountId === 'all' ? 'Todas_las_Cuentas' : 'Cuenta'))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanPeriod = (selectedPeriod?.label || 'Periodo')
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    link.href = url;
    link.setAttribute('download', `distribuciones_${cleanAccountName}_${cleanPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export status computation
  const totalProratedAll = useMemo(() => {
    return filteredServices.reduce((sum, s) => sum + getRowTotal(s), 0);
  }, [filteredServices, getRowTotal]);

  const exportStatus = useMemo((): 'danger' | 'warning' | 'success' => {
    const isCleanZero =
      (distributionType === 'clean' && Object.keys(manualAllocations).length === 0) ||
      totalProratedAll === 0;
    if (isCleanZero) return 'danger';
    if (mismatchCount > 0 || Math.abs(totalProratedAll - totalPeriodAmount) >= 0.01) return 'warning';
    return 'success';
  }, [distributionType, manualAllocations, totalProratedAll, mismatchCount, totalPeriodAmount]);

  const handleExportClick = () => {
    if (exportStatus === 'danger') {
      const confirmExport = window.confirm(
        'Los datos están sin completar. ¿Quiere descargar de todas formas?'
      );
      if (confirmExport) {
        handleExportCSV();
      }
      return;
    }

    if (exportStatus === 'warning') {
      const confirmExport = window.confirm(
        'Los datos prorrateados aún presentan errores. ¿Desea descargar de todas formas?'
      );
      if (confirmExport) {
        handleExportCSV();
      }
      return;
    }

    // Success -> va directo a la descarga
    handleExportCSV();
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-seidor-main-text">
            <CaralIcon name="circles" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">
              Distributions
            </h1>
          </div>
          <p className="text-sm text-neutral-800 mt-0.5">
            Prorrateo y distribución de costos cloud desglosados por entidades según el driver activo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant='ghost'
            iconName='newFile'
            isIconButton
            title='Load distributions from folder'
          />

          <Button
            variant='success'
            iconName='save'
            isIconButton
            title='Save the current distributions'
          />

        </div>
      </div>

      {/* Top Filters Panel */}
      <div className="bg-container border border-neutral-300 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full items-end gap-4">
          {/* 1. Cuenta Cloud Selector */}
          <Select
            label="1. Cuenta Cloud"
            iconName="cloud"
            value={selectedAccountId}
            onChange={(e) => {
              const newAccountId = e.target.value;
              setSelectedAccountId(newAccountId);
              // Find matching drivers for the selected account
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

          {/* 3. Driver / Inductor de Consumo Selector (Filtered by Account) */}
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
                  setManualAllocations({}); // Clear custom manual overrides when applying a preset tab
                }}
                tabs={DISTRIBUTION_TABS}
              />
            </div>
          </div>
        </div>

        {/* Driver Summary Bar */}
        {activeDriver && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-300 dark:border-neutral-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-800">Driver Activo:</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-100">
                {activeDriver.code}
              </span>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
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



      {/* Backdrop cuando está maximizado */}
      {isMaximized && (
        <div
          onClick={() => setIsMaximized(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] transition-opacity duration-300"
        />
      )}

      {/* Main Distributions Matrix Table */}
      <div
        className={`w-full overflow-x-auto rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-container shadow-xl transition-all duration-300 ${isMaximized
          ? 'fixed inset-2 sm:inset-4 z-[9999] p-2 sm:p-4 overflow-auto shadow-2xl flex flex-col'
          : ''
          }`}
      >
        <div className="w-full sticky top-0 z-10 bg-container p-3.5 border-b border-neutral-300 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-end gap-2 flex-wrap">
            {distributionType === 'clean' && !isManualEditing ? (
              <Chip
                hasBorder
                iconName="circleInfo"
                label="Valores en 0 (Clean)"
                status="none"
                variant="info"
              />
            ) : mismatchCount > 0 ? (
              <div
                onClick={() => setShowOnlyErrors(!showOnlyErrors)}
                className="cursor-pointer transition-transform active:scale-95 select-none"
                title={showOnlyErrors ? "Clic para ver todos los servicios" : `Clic para filtrar y mostrar solo los ${mismatchCount} servicios con error`}
              >
                <Chip
                  hasBorder
                  iconName={showOnlyErrors ? "filter" : "triangleExclamation"}
                  label={showOnlyErrors ? `Filtrando: ${mismatchCount} con error (Ver todos)` : `${mismatchCount} con error (Clic para filtrar)`}
                  status="none"
                  variant="warning"
                />
              </div>
            ) : (
              <Chip
                hasBorder
                iconName="check"
                label="Everything's fine"
                status="none"
                variant="success"
              />
            )}
            <span className="text-xs font-medium text-neutral-900">
              ({filteredServices.length} servicios{showOnlyErrors ? ` con error de ${aggregatedServices.length}` : ''})
            </span>

          </div>
          {/* Search Box & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              iconName="search"
              placeholder="Filtrar por servicio o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              containerClassName="w-64"
            />


            <Button
              variant='light'
              iconName='arrowsLeftRight'
              title='Restaurar anchos de columnas'
              className='bg-container! text-neutral-900!'
              onClick={() => setColumnWidths({})}
              disabled={Object.keys(columnWidths).length === 0}
            />

            <Button
              variant={isManualEditing ? 'default' : 'light'}
              iconName='edit'
              title={isManualEditing ? 'Finalizar edición manual' : 'Editar manualmente'}
              onClick={() => setIsManualEditing(!isManualEditing)}
              className={isManualEditing ? 'bg-seidor-main text-white' : 'bg-container! text-neutral-900!'}
            />

            <Button
              variant={isMaximized ? 'default' : 'light'}
              iconName={isMaximized ? 'arrowsMinimize' : 'arrowsMaximize'}
              title={isMaximized ? 'Restaurar tamaño (Esc)' : 'Ampliar a pantalla completa'}
              onClick={() => setIsMaximized(!isMaximized)}
              className={isMaximized ? 'bg-seidor-main text-white' : 'bg-container! text-neutral-900!'}
            />

            <Button
              variant={exportStatus}
              iconName='arrowDownToLine'
              onClick={handleExportClick}
              className={
                exportStatus === 'success'
                  ? 'hover:text-success-hard!'
                  : exportStatus === 'warning'
                  ? 'hover:text-warning-hard!'
                  : 'hover:text-danger-hard!'
              }
              title={
                exportStatus === 'danger'
                  ? 'Los datos están sin completar. Clic para confirmar descarga'
                  : exportStatus === 'warning'
                  ? 'Los datos prorrateados aún presentan errores. Clic para confirmar descarga'
                  : 'Descargar tabla en formato CSV'
              }
            >
              Export
            </Button>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {activeFiltersCount > 0 && (
          <div className="w-full bg-container px-4 py-2 border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-900 font-semibold flex items-center gap-1">
                <CaralIcon name="filter" size={13} />
                Filtros activos:
              </span>

              {isServiceFilterActive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                  <span>
                    Servicio: <strong>{TEXT_FILTER_OPTIONS.find((o) => o.id === serviceFilterOp)?.label}</strong>{' '}
                    {['empty', 'notEmpty'].includes(serviceFilterOp) ? '' : `"${serviceFilterVal}"`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsServiceFilterActive(false)}
                    className="hover:text-red-500 ml-1 font-bold cursor-pointer"
                    title="Quitar filtro de servicio"
                  >
                    ×
                  </button>
                </span>
              )}

              {isCategoryFilterActive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-info-main/20 dark:bg-info-main/20 text-info-main dark:text-info-main border border-info-main dark:border-info-main font-medium">
                  <span>
                    Categoría: <strong>{TEXT_FILTER_OPTIONS.find((o) => o.id === categoryFilterOp)?.label}</strong>{' '}
                    {['empty', 'notEmpty'].includes(categoryFilterOp) ? '' : `"${categoryFilterVal}"`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCategoryFilterActive(false)}
                    className="hover:text-red-500 ml-1 font-bold cursor-pointer"
                    title="Quitar filtro de categoría"
                  >
                    ×
                  </button>
                </span>
              )}

              {isCostFilterActive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                  <span>
                    Costo:{' '}
                    <strong>{COST_FILTER_OPTIONS.find((o) => o.id === costFilterOp)?.label}</strong>{' '}
                    {costFilterOp === 'between'
                      ? `$${costFilterVal || '0'} - $${costFilterValTo || '∞'}`
                      : ['empty', 'notEmpty'].includes(costFilterOp)
                        ? ''
                        : `$${costFilterVal}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCostFilterActive(false)}
                    className="hover:text-red-500 ml-1 font-bold cursor-pointer"
                    title="Quitar filtro de costo"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-info-main hover:text-red-500  font-semibold transition-colors cursor-pointer"
            >
              Limpiar todos
            </button>
          </div>
        )}

        <table className="w-full text-left border-separate border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-neutral-500 font-bold text-neutral-900 text-xs uppercase tracking-wider">
              {/* Servicio Cloud */}
              <th
                style={{ width: `${getColWidth('service', 260)}px`, minWidth: `${getColWidth('service', 260)}px` }}
                className="py-4 px-4 relative select-none border-b border-neutral-300 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between gap-1 overflow-hidden pr-1">
                  <span className="truncate block" title="Servicio Cloud">Servicio Cloud</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDrawerTab(0);
                      setIsFilterDrawerOpen(true);
                    }}
                    className={`p-1 rounded transition-colors hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 shrink-0 ${isServiceFilterActive
                      ? 'text-seidor-main font-bold'
                      : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    title="Filtrar por Servicio Cloud"
                  >
                    <CaralIcon name="filter" size={13} />
                  </button>
                </div>
                {renderResizer('service', 260)}
              </th>

              {/* Categoría */}
              <th
                style={{ width: `${getColWidth('category', 130)}px`, minWidth: `${getColWidth('category', 130)}px` }}
                className="py-4 px-4 relative select-none border-b border-neutral-300 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between gap-1 overflow-hidden pr-1">
                  <span className="truncate block" title="Categoría">Categoría</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDrawerTab(1);
                      setIsFilterDrawerOpen(true);
                    }}
                    className={`p-1 rounded transition-colors hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 shrink-0 ${isCategoryFilterActive
                      ? 'text-seidor-main font-bold'
                      : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    title="Filtrar por Categoría"
                  >
                    <CaralIcon name="filter" size={13} />
                  </button>
                </div>
                {renderResizer('category', 130)}
              </th>

              {/* Costo Facturado */}
              <th
                style={{ width: `${getColWidth('billedCost', 160)}px`, minWidth: `${getColWidth('billedCost', 160)}px` }}
                className="py-4 px-4 text-right relative select-none border-b border-neutral-300 dark:border-neutral-800"
              >
                <div className="flex items-center justify-end gap-1.5 overflow-hidden pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDrawerTab(2);
                      setIsFilterDrawerOpen(true);
                    }}
                    className={`p-1 rounded transition-colors hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 shrink-0 ${isCostFilterActive
                      ? 'text-seidor-main font-bold'
                      : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    title="Filtrar por Costo Facturado"
                  >
                    <CaralIcon name="filter" size={13} />
                  </button>
                  <span className="truncate block" title="Costo Facturado">Costo Facturado</span>
                </div>
                {renderResizer('billedCost', 160)}
              </th>

              {/* Dynamic Entity Columns based on the Driver */}
              {entities.map((ent) => {
                const colKey = `ent_${ent.id}`;
                return (
                  <th
                    key={ent.id}
                    style={{ width: `${getColWidth(colKey, 150)}px`, minWidth: `${getColWidth(colKey, 150)}px` }}
                    className="py-4 px-4 text-right relative select-none border-b border-neutral-300 dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-end gap-1.5 overflow-hidden pr-1">
                      {ent.color && (
                        <span
                          style={{ backgroundColor: ent.color }}
                          className="size-2 rounded-full shrink-0"
                        />
                      )}
                      <span className="truncate" title={ent.name}>{ent.name}</span>
                      <span className="text-[11px] font-mono text-neutral-800 font-bold shrink-0">
                        ({ent.percentage}%)
                      </span>
                    </div>
                    {renderResizer(colKey, 150)}
                  </th>
                );
              })}

              {/* Total Prorrateado */}
              <th
                style={{ width: `${getColWidth('total', 160)}px`, minWidth: `${getColWidth('total', 160)}px` }}
                className="py-4 px-4 text-right relative select-none border-b border-neutral-300 dark:border-neutral-800"
              >
                <span className="truncate block" title="Total Prorrateado">Total Prorrateado</span>
              </th>
            </tr>
          </thead>

          <tbody className="text-xs">
            {filteredServices.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + entities.length}
                  className="py-12 text-center text-neutral-800 border-b border-neutral-200 dark:border-neutral-800"
                >
                  No se encontraron servicios para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredServices.map((srv) => {
                const srvKey = srv.id || srv.name;
                const rowTotal = getRowTotal(srv);
                const isRowMismatch = Math.abs(rowTotal - srv.amount) >= 0.01;
                const categoryColorMap: Record<string, string> = {
                  compute: 'bg-blue-100 text-blue-800 border-blue-200',
                  storage: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  database: 'bg-amber-100 text-amber-800 border-amber-200',
                  other: 'bg-info-main/20 dark:bg-info-main/20 text-info-main dark:text-info-main border border-info-main dark:border-info-main',
                };
                const badgeStyle =
                  categoryColorMap[srv.category] || 'bg-neutral-100 text-neutral-800 border-neutral-200';

                return (
                  <tr
                    key={srvKey}
                    className={`transition-colors ${isRowMismatch
                      ? 'bg-warning-light dark:bg-amber-950/30 hover:bg-warning-light/80 dark:hover:bg-amber-950/40'
                      : 'hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30'
                      }`}
                  >
                    {/* Service Name */}
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white truncate border-b border-neutral-200 dark:border-neutral-800" title={srv.name}>
                      {srv.name}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4 truncate border-b border-neutral-200 dark:border-neutral-800">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border truncate ${badgeStyle}`}
                      >
                        {srv.category}
                      </span>
                    </td>

                    {/* Service Base Cost */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900 dark:text-white truncate border-b border-neutral-200 dark:border-neutral-800">
                      ${srv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Prorated Entity Columns */}
                    {entities.map((ent) => {
                      const entityAmount = getEntityAmount(srv, ent);

                      return (
                        <td
                          key={ent.id}
                          className="py-2.5 px-3 text-right font-mono text-neutral-900 dark:text-white font-medium border-b border-neutral-200 dark:border-neutral-800"
                        >
                          {isManualEditing ? (
                            <EditableEntityCell
                              srvKey={srvKey}
                              entId={ent.id}
                              amount={entityAmount}
                              srvAmount={srv.amount}
                              onChange={handleManualAmountChange}
                            />
                          ) : (
                            <span className="truncate block">
                              ${entityAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Control (Sum of entities) */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold border-b border-neutral-200 dark:border-neutral-800">
                      {isManualEditing || Object.keys(manualAllocations[srvKey] || {}).length > 0 || distributionType === 'clean' ? (
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-xs ${Math.abs(rowTotal - srv.amount) < 0.01
                              ? 'text-success-main font-extrabold'
                              : 'text-amber-500 font-extrabold'
                              }`}
                          >
                            ${rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {Math.abs(rowTotal - srv.amount) >= 0.01 && (
                            <span className="text-[10px] text-amber-500/90 font-sans font-medium">
                              {rowTotal > srv.amount
                                ? `+$${(rowTotal - srv.amount).toFixed(2)}`
                                : `-$${(srv.amount - rowTotal).toFixed(2)}`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-info-main">
                          ${rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Consolidated Totals Footer */}
          {filteredServices.length > 0 && (
            <tfoot>
              <tr className="bg-neutral-100 dark:bg-neutral-800/80 font-bold text-xs">
                <td className="py-4 px-4 text-neutral-900 dark:text-white uppercase tracking-wider truncate border-t-2 border-neutral-300 dark:border-neutral-800">
                  Total General ({filteredServices.length} servicios)
                </td>
                <td className="py-4 px-4 truncate border-t-2 border-neutral-300 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-800">
                    {isManualEditing || Object.keys(manualAllocations).length > 0
                      ? 'Manual'
                      : distributionType === 'clean'
                        ? 'Clean (0%)'
                        : distributionType === 'equaly'
                          ? 'Equaly'
                          : '100% Asignado'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-mono text-sm font-extrabold text-neutral-900 dark:text-white truncate border-t-2 border-neutral-300 dark:border-neutral-800">
                  ${totalPeriodAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                {entities.map((ent) => {
                  const totalEntAmount = filteredServices.reduce((sum, s) => sum + getEntityAmount(s, ent), 0);
                  return (
                    <td
                      key={ent.id}
                      className="py-4 px-4 text-right font-mono text-sm font-extrabold truncate border-t-2 border-neutral-300 dark:border-neutral-800"
                      style={{ color: ent.color || undefined }}
                    >
                      ${totalEntAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  );
                })}
                <td className="py-4 px-4 text-right font-mono text-sm font-extrabold truncate border-t-2 border-neutral-300 dark:border-neutral-800">
                  {(() => {
                    const totalProratedAll = filteredServices.reduce((sum, s) => sum + getRowTotal(s), 0);
                    const isTotalMatched = Math.abs(totalProratedAll - totalPeriodAmount) < 0.01;
                    const diff = totalProratedAll - totalPeriodAmount;
                    return (
                      <div className="flex flex-col items-end">
                        <span className={isTotalMatched ? 'text-success-main' : 'text-amber-500'}>
                          ${totalProratedAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {!isTotalMatched && (
                          <span className="text-[10px] text-amber-500/90 font-sans font-medium">
                            {diff > 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Card */}
        <div className="p-5 rounded-2xl bg-container border border-neutral-300 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Total Facturado ({selectedPeriod?.label})
            </span>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-950/40 text-info-main">
              <CaralIcon name="dolar" size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              ${totalPeriodAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-neutral-800 block mt-0.5">
              {aggregatedServices.length} servicios cloud facturados
            </span>
          </div>
        </div>

        {/* Dynamic Entities Summary Cards */}
        {entities.map((ent) => {
          const hasManual = isManualEditing || Object.keys(manualAllocations).length > 0;
          const entAmount =
            hasManual
              ? filteredServices.reduce((sum, s) => sum + getEntityAmount(s, ent), 0)
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
              className="p-5 rounded-2xl bg-container border border-neutral-300 dark:border-neutral-800 shadow-xs flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ent.color && (
                    <span
                      style={{ backgroundColor: ent.color }}
                      className="size-3 rounded-full shrink-0 shadow-xs"
                    />
                  )}
                  <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[150px]">
                    {ent.name}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {hasManual ? `${effectivePct}%` : `${ent.percentage}%`}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  ${entAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {/* Progress bar representing entity ratio */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden mt-2">
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

      {/* Advanced Filters Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filtros de Tabla"
        size="md"
      >
        <div className="flex flex-col h-full justify-between gap-5 p-1">
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <p className="text-xs text-neutral-800 dark:text-neutral-300">
              Selecciona una columna, el operador de coincidencia y el valor a buscar para filtrar los servicios.
            </p>

            {/* Column Selector Tabs */}
            <div className="w-full">
              <Tabs
                tabs={FILTER_DRAWER_TABS}
                activeIndex={filterDrawerTab}
                onChange={(idx) => setFilterDrawerTab(idx)}
              />
            </div>

            {/* TAB 0: SERVICIO CLOUD */}
            {filterDrawerTab === 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Condición de coincidencia
                  </label>
                  {isServiceFilterActive && (
                    <span className="text-[11px] font-semibold text-seidor-main bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      Filtro Activo
                    </span>
                  )}
                </div>

                {/* Radio list matching user screenshot */}
                <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-container divide-y divide-neutral-200 dark:divide-neutral-800 shadow-2xs">
                  {TEXT_FILTER_OPTIONS.map((opt) => {
                    const isSelected = serviceFilterOp === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setServiceFilterOp(opt.id)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${isSelected
                          ? 'bg-info-main/20 dark:bg-info-main/20 text-neutral-900  font-semibold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                          }`}
                      >
                        {/* Radio circle indicator */}
                        <div
                          className={`size-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                            ? 'border-info-main bg-container'
                            : 'border-neutral-400 dark:border-neutral-500'
                            }`}
                        >
                          {isSelected && (
                            <span className="size-2 rounded-full bg-info-main shrink-0" />
                          )}
                        </div>
                        <span className="text-xs">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Value Input */}
                {!['empty', 'notEmpty'].includes(serviceFilterOp) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Texto del servicio a filtrar
                    </label>
                    <Input
                      placeholder="Ej: AWS Lambda, CloudWatch, RDS..."
                      value={serviceFilterVal}
                      onChange={(e) => setServiceFilterVal(e.target.value)}
                      containerClassName="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="default"
                    className="bg-seidor-main text-white flex-1"
                    onClick={() => {
                      setIsServiceFilterActive(true);
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    Aplicar Filtro
                  </Button>
                  {isServiceFilterActive && (
                    <Button
                      variant="light"
                      onClick={() => {
                        setIsServiceFilterActive(false);
                        setServiceFilterVal('');
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: CATEGORÍA */}
            {filterDrawerTab === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Condición de coincidencia
                  </label>
                  {isCategoryFilterActive && (
                    <span className="text-[11px] font-semibold text-seidor-main bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      Filtro Activo
                    </span>
                  )}
                </div>

                {/* Radio list matching user screenshot */}
                <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-container divide-y divide-neutral-200 dark:divide-neutral-800 shadow-2xs">
                  {TEXT_FILTER_OPTIONS.map((opt) => {
                    const isSelected = categoryFilterOp === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setCategoryFilterOp(opt.id)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${isSelected
                          ? 'bg-info-main/20 dark:bg-info-main/20 text-neutral-900 font-semibold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                          }`}
                      >
                        <div
                          className={`size-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                            ? 'border-info-main bg-container dark:bg-container'
                            : 'border-neutral-400 dark:border-neutral-500'
                            }`}
                        >
                          {isSelected && (
                            <span className="size-2 rounded-full bg-info-main shrink-0" />
                          )}
                        </div>
                        <span className="text-xs">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Value Input and Quick Category Tags */}
                {!['empty', 'notEmpty'].includes(categoryFilterOp) && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Categoría a filtrar
                    </label>
                    <Input
                      placeholder="Ej: compute, storage, database, networking..."
                      value={categoryFilterVal}
                      onChange={(e) => setCategoryFilterVal(e.target.value)}
                      containerClassName="w-full"
                    />

                    {/* Quick Selection Tags */}
                    {availableCategories.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="text-[11px] text-neutral-500">Disponibles:</span>
                        {availableCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategoryFilterVal(cat);
                              setCategoryFilterOp('equals');
                            }}
                            className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${categoryFilterVal.toLowerCase() === cat.toLowerCase()
                              ? 'bg-info-main text-white border-info-main font-semibold'
                              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="default"
                    className="bg-seidor-main text-white flex-1"
                    onClick={() => {
                      setIsCategoryFilterActive(true);
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    Aplicar Filtro
                  </Button>
                  {isCategoryFilterActive && (
                    <Button
                      variant="light"
                      onClick={() => {
                        setIsCategoryFilterActive(false);
                        setCategoryFilterVal('');
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: COSTO FACTURADO */}
            {filterDrawerTab === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Condición de comparación
                  </label>
                  {isCostFilterActive && (
                    <span className="text-[11px] font-semibold text-seidor-main bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      Filtro Activo
                    </span>
                  )}
                </div>

                {/* Radio list for numeric cost */}
                <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-container divide-y divide-neutral-200 dark:divide-neutral-800 shadow-2xs">
                  {COST_FILTER_OPTIONS.map((opt) => {
                    const isSelected = costFilterOp === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setCostFilterOp(opt.id)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${isSelected
                          ? 'bg-info-main/20 dark:bg-info-main/20 text-info-main dark:text-info-main font-semibold'
                          : 'hover:bg-container dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                          }`}
                      >
                        <div
                          className={`size-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                            ? 'border-info-main bg-container'
                            : 'border-neutral-400 dark:border-neutral-500'
                            }`}
                        >
                          {isSelected && (
                            <span className="size-2 rounded-full bg-info-main shrink-0" />
                          )}
                        </div>
                        <span className="text-xs">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Value Input for Cost */}
                {costFilterOp === 'between' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Monto Mínimo ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={costFilterVal}
                        onChange={(e) => setCostFilterVal(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Monto Máximo ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        value={costFilterValTo}
                        onChange={(e) => setCostFilterValTo(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>
                ) : !['empty', 'notEmpty'].includes(costFilterOp) ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Monto ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={costFilterVal}
                      onChange={(e) => setCostFilterVal(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                ) : null}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="default"
                    className="bg-seidor-main text-white flex-1"
                    onClick={() => {
                      setIsCostFilterActive(true);
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    Aplicar Filtro
                  </Button>
                  {isCostFilterActive && (
                    <Button
                      variant="light"
                      onClick={() => {
                        setIsCostFilterActive(false);
                        setCostFilterVal('');
                        setCostFilterValTo('');
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-300 dark:border-neutral-800">
            <Button
              variant="light"
              onClick={clearAllFilters}
              disabled={activeFiltersCount === 0}
            >
              Limpiar todos
            </Button>
            <Button
              variant="default"
              className="bg-neutral-800 text-white hover:bg-neutral-900"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
