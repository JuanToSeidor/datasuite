"use client";

import React, { useMemo, useState } from 'react';
import { Chip, Button, Drawer } from 'caralstable';
import { CaralIcon } from '@/components/icons';
import { DataTable, DataTableColumn, FormulaCell } from '@/components/ui';
import { useLanguage } from '@/contexts/LanguageContext';

export interface DistributionsTableEntity {
  id: string;
  name: string;
  percentage: number;
  color?: string;
}

export interface DistributionsTableService {
  id: string;
  name: string;
  category: string;
  amount: number;
  percentage?: number;
  [key: string]: any;
}

export interface DistributionsTableLabels {
  serviceColumn?: string;
  categoryColumn?: string;
  costColumn?: string;
  totalColumn?: string;
  actionsColumn?: string;
  totalFooter?: string;
  itemPlural?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  exportFileName?: string;
  filterDrawerTitle?: string;
  filterDrawerDescription?: string;
}

export interface DistributionsTableProps {
  services: DistributionsTableService[];
  entities: DistributionsTableEntity[];
  distributionType?: 'clean' | 'equaly' | 'proportional';
  accountName?: string;
  periodLabel?: string;
  totalPeriodAmount?: number;
  currencySymbol?: string;

  // Custom Columns override (if caller wants to pass fully custom column definitions)
  columns?: DataTableColumn<DistributionsTableService>[];

  // Customizable Column & UI Labels
  labels?: DistributionsTableLabels;
  serviceColumnLabel?: string;
  categoryColumnLabel?: string;
  costColumnLabel?: string;
  totalColumnLabel?: string;
  actionsColumnLabel?: string;
  totalFooterLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;

  // Manual allocations state
  manualAllocations?: Record<string, Record<string, number>>;
  onManualAllocationsChange?: (allocations: Record<string, Record<string, number>>) => void;

  // Feature Toggles
  canEdit?: boolean;
  editInRaw?: boolean; // true: inline formula cells, false: drawer actions
  canExpand?: boolean;
  canExport?: boolean;
  canReadjust?: boolean;
  canFilterColumns?: boolean;
  canSearch?: boolean;
  canFilterErrors?: boolean;

  className?: string;
}

export function DistributionsTable({
  services,
  entities,
  distributionType = 'proportional',
  accountName = 'Cuenta',
  periodLabel = 'Periodo',
  totalPeriodAmount: customTotalPeriodAmount,
  currencySymbol = '$',

  columns: customColumns,
  labels,
  serviceColumnLabel,
  categoryColumnLabel,
  costColumnLabel,
  totalColumnLabel,
  actionsColumnLabel,
  totalFooterLabel,
  searchPlaceholder,
  emptyMessage,

  manualAllocations: externalManualAllocations,
  onManualAllocationsChange,

  canEdit = true,
  editInRaw = true,
  canExpand = true,
  canExport = true,
  canReadjust = true,
  canFilterColumns = true,
  canSearch = true,
  canFilterErrors = true,

  className = '',
}: DistributionsTableProps) {
  const { dict } = useLanguage();
  // 1. Manual allocations state
  const [internalManualAllocations, setInternalManualAllocations] = useState<
    Record<string, Record<string, number>>
  >({});
  const activeManualAllocations = externalManualAllocations ?? internalManualAllocations;

  const handleManualAmountChange = (srvKey: string, entId: string, value: number) => {
    const updated = {
      ...activeManualAllocations,
      [srvKey]: {
        ...(activeManualAllocations[srvKey] || {}),
        [entId]: Math.max(0, value),
      },
    };
    if (onManualAllocationsChange) {
      onManualAllocationsChange(updated);
    } else {
      setInternalManualAllocations(updated);
    }
  };

  // 2. Helper to get allocated amount for an entity
  const getEntityAmount = (srv: DistributionsTableService, ent: DistributionsTableEntity) => {
    const srvKey = srv.id || srv.name;
    if (activeManualAllocations[srvKey]?.[ent.id] !== undefined) {
      return activeManualAllocations[srvKey][ent.id];
    }
    if (distributionType === 'clean') {
      return 0;
    }
    return (srv.amount * ent.percentage) / 100;
  };

  // 3. Helper to get total allocated for a row
  const getRowTotal = (srv: DistributionsTableService) => {
    const srvKey = srv.id || srv.name;
    if (Object.keys(activeManualAllocations[srvKey] || {}).length > 0) {
      return entities.reduce((sum, ent) => sum + getEntityAmount(srv, ent), 0);
    }
    if (distributionType === 'clean') return 0;
    return srv.amount;
  };

  // 4. Edit row drawer state (for editInRaw === false)
  const [editingRow, setEditingRow] = useState<DistributionsTableService | null>(null);
  const [draftAllocations, setDraftAllocations] = useState<Record<string, number>>({});

  const openEditDrawer = (srv: DistributionsTableService) => {
    const srvKey = srv.id || srv.name;
    const currentAlloc: Record<string, number> = {};
    entities.forEach((ent) => {
      currentAlloc[ent.id] = getEntityAmount(srv, ent);
    });
    setDraftAllocations(currentAlloc);
    setEditingRow(srv);
  };

  const closeEditDrawer = () => {
    setEditingRow(null);
  };

  const saveEditDrawer = () => {
    if (!editingRow) return;
    const srvKey = editingRow.id || editingRow.name;
    const updated = {
      ...activeManualAllocations,
      [srvKey]: draftAllocations,
    };
    if (onManualAllocationsChange) {
      onManualAllocationsChange(updated);
    } else {
      setInternalManualAllocations(updated);
    }
    closeEditDrawer();
  };

  // 5. Total Base Amount
  const totalBase = useMemo(() => {
    return customTotalPeriodAmount ?? services.reduce((sum, s) => sum + s.amount, 0);
  }, [customTotalPeriodAmount, services]);

  // 6. Category distinct values for quick filter
  const categoryOptions = useMemo(() => {
    const distinct = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
    return distinct.map((cat) => ({ label: cat, value: cat }));
  }, [services]);

  // 7. Dynamic Columns Definition
  const generatedColumns = useMemo<DataTableColumn<DistributionsTableService>[]>(() => {
    if (customColumns) return customColumns;

    const serviceTitle = serviceColumnLabel ?? labels?.serviceColumn ?? 'Servicio Cloud';
    const categoryTitle = categoryColumnLabel ?? labels?.categoryColumn ?? 'Categoría';
    const costTitle = costColumnLabel ?? labels?.costColumn ?? 'Costo Facturado';
    const totalTitle = totalColumnLabel ?? labels?.totalColumn ?? 'Total Prorrateado';
    const actionsTitle = actionsColumnLabel ?? labels?.actionsColumn ?? 'Acciones';
    const totalFooterText = totalFooterLabel ?? labels?.totalFooter ?? 'Total General';

    const cols: DataTableColumn<DistributionsTableService>[] = [
      // 1. Service / Main Name Column
      {
        id: 'name',
        accessorKey: 'name',
        header: serviceTitle,
        filterLabel: serviceTitle,
        filterType: 'text',
        width: 260,
        minWidth: 160,
        cell: ({ value }) => (
          <span className="font-semibold text-neutral-900 block truncate" title={String(value)}>
            {String(value)}
          </span>
        ),
        footer: () => <span className="font-bold text-neutral-900">{totalFooterText}</span>,
      },

      // 2. Category Column
      {
        id: 'category',
        accessorKey: 'category',
        header: categoryTitle,
        filterLabel: categoryTitle,
        filterType: 'text',
        filterSelectOptions: categoryOptions,
        width: 140,
        minWidth: 100,
        cell: ({ value }) => {
          const cat = String(value || '');
          const categoryColorMap: Record<string, string> = {
            compute: 'bg-info-light text-info-hard border-info-main/30',
            storage: 'bg-success-light text-success-hard border-success-main/30',
            database: 'bg-warning-light text-warning-hard border-warning-main/30',
            other: 'bg-indigo-light text-indigo-hard border-indigo-main/30',
          };
          const badgeStyle =
            categoryColorMap[cat.toLowerCase()] ||
            'bg-container text-neutral-800 border-neutral-500';

          return (
            <span
              className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border capitalize ${badgeStyle}`}
            >
              {cat || 'General'}
            </span>
          );
        },
      },

      // 3. Base Amount / Cost Column
      {
        id: 'amount',
        accessorKey: 'amount',
        header: costTitle,
        filterLabel: costTitle,
        filterType: 'currency',
        align: 'right',
        width: 160,
        minWidth: 110,
        cell: ({ value }) => (
          <span className="font-mono text-xs font-semibold text-neutral-900">
            {currencySymbol}
            {Number(value || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
        footer: ({ filteredData }) => {
          const sum = filteredData.reduce((acc, s) => acc + (s.amount || 0), 0);
          return (
            <span className="font-mono text-xs font-bold text-neutral-900">
              {currencySymbol}
              {sum.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      },

      // 4. Dynamic Entity Columns
      ...entities.map((ent) => {
        const colId = `entity_${ent.id}`;
        return {
          id: colId,
          header: ent.name,
          headerColor: ent.color,
          headerSubtitle: `(${ent.percentage}%)`,
          filterLabel: ent.name,
          filterType: 'currency' as const,
          align: 'right' as const,
          width: 150,
          minWidth: 120,
          accessorFn: (row: DistributionsTableService) => getEntityAmount(row, ent),
          exportValue: (row: DistributionsTableService) => getEntityAmount(row, ent).toFixed(2),
          cell: ({ row }: { row: DistributionsTableService }) => {
            const srvKey = row.id || row.name;
            const currentAmount = getEntityAmount(row, ent);

            if (canEdit && editInRaw) {
              return (
                <FormulaCell
                  value={currentAmount}
                  baseAmount={row.amount}
                  currencySymbol={currencySymbol}
                  onChange={(val) => handleManualAmountChange(srvKey, ent.id, val)}
                />
              );
            }

            return (
              <span className="font-mono text-xs font-semibold text-neutral-900">
                {currencySymbol}
                {currentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            );
          },
          footer: ({ filteredData }: { filteredData: DistributionsTableService[] }) => {
            const sum = filteredData.reduce((acc, s) => acc + getEntityAmount(s, ent), 0);
            return (
              <span className="font-mono text-xs font-bold text-neutral-900">
                {currencySymbol}
                {sum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            );
          },
        };
      }),

      // 5. Total Prorated / Calculated Column
      {
        id: 'total',
        header: totalTitle,
        filterLabel: totalTitle,
        filterType: 'currency',
        align: 'right',
        width: 160,
        minWidth: 120,
        accessorFn: (row) => getRowTotal(row),
        exportValue: (row) => getRowTotal(row).toFixed(2),
        cell: ({ row }) => {
          const rowTotal = getRowTotal(row);
          const isMismatch = Math.abs(rowTotal - row.amount) >= 0.01;

          return (
            <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-bold">
              <span className={isMismatch ? 'text-warning-hard' : 'text-neutral-900'}>
                {currencySymbol}
                {rowTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {isMismatch && (
                <span
                  title={`Desajuste: ${(rowTotal - row.amount) > 0 ? '+' : ''}${(rowTotal - row.amount).toFixed(2)}`}
                  className="text-warning-main shrink-0"
                >
                  <CaralIcon name="triangleExclamation" size={14} />
                </span>
              )}
            </div>
          );
        },
        footer: ({ filteredData }) => {
          const sum = filteredData.reduce((acc, s) => acc + getRowTotal(s), 0);
          return (
            <span className="font-mono text-xs font-bold text-neutral-900">
              {currencySymbol}
              {sum.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      },
    ];

    // 6. Actions Column if drawer edit mode
    if (canEdit && !editInRaw) {
      cols.push({
        id: 'actions',
        header: actionsTitle,
        filterType: 'none',
        align: 'center',
        width: 90,
        minWidth: 70,
        resizable: false,
        hideInExport: true,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            isIconButton
            iconName="edit"
            onClick={() => openEditDrawer(row)}
            title="Ajustar distribución"
          />
        ),
      });
    }

    return cols;
  }, [
    customColumns,
    entities,
    categoryOptions,
    currencySymbol,
    canEdit,
    editInRaw,
    serviceColumnLabel,
    categoryColumnLabel,
    costColumnLabel,
    totalColumnLabel,
    actionsColumnLabel,
    totalFooterLabel,
    labels,
    activeManualAllocations,
    distributionType,
  ]);

  // Mismatch error predicate
  const rowErrorPredicate = (row: DistributionsTableService) => {
    return Math.abs(getRowTotal(row) - row.amount) >= 0.01;
  };

  const cleanAccount = accountName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanPeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const exportFileName = `${labels?.exportFileName ?? 'distribuciones'}_${cleanAccount}_${cleanPeriod}`;

  return (
    <>
      <DataTable<DistributionsTableService>
        data={services}
        columns={generatedColumns}
        keyExtractor={(row, index) => row.id || row.name || String(index)}
        canSearch={canSearch}
        searchPlaceholder={searchPlaceholder ?? labels?.searchPlaceholder}
        canFilterColumns={canFilterColumns}
        canFilterErrors={canFilterErrors}
        rowErrorPredicate={rowErrorPredicate}
        customErrorChip={
          distributionType === 'clean' && Object.keys(activeManualAllocations).length === 0 ? (
            <Chip
              hasBorder
              iconName="circleInfo"
              label="Valores en 0 (Clean)"
              status="none"
              variant="info"
            />
          ) : undefined
        }
        canExport={canExport}
        exportFileName={exportFileName}
        canExpand={canExpand}
        canReadjust={canReadjust}
        labels={{
          emptyMessage: emptyMessage ?? labels?.emptyMessage,
          filterDrawerTitle: labels?.filterDrawerTitle,
          filterDrawerDescription: labels?.filterDrawerDescription,
          itemPlural: labels?.itemPlural ?? 'servicios',
        }}
        className={className}
      />

      {/* Edit Drawer for editInRaw = false */}
      {editingRow && (
        <Drawer
          isOpen={true}
          onClose={closeEditDrawer}
          title="Ajustar Distribución"
        >
          <div className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins text-xs p-1">
            <div className="flex-1 space-y-4">
              <p className="text-xs text-neutral-800">
                Edita la asignación manual para: {editingRow.name}
              </p>
              <div className="p-3 bg-neutral-500/20 rounded-xl flex items-center justify-between font-semibold">
                <span>Monto Base:</span>
                <span className="font-mono text-sm font-bold">
                  {currencySymbol}
                  {editingRow.amount.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {entities.map((ent) => (
                  <div
                    key={ent.id}
                    className="flex items-center justify-between p-2.5 bg-container rounded-xl border border-neutral-500"
                  >
                    <div className="flex items-center gap-2">
                      {ent.color && (
                        <span
                          style={{ backgroundColor: ent.color }}
                          className="size-2.5 rounded-full"
                        />
                      )}
                      <span className="font-semibold text-neutral-900">{ent.name}</span>
                    </div>
                    <FormulaCell
                      value={draftAllocations[ent.id] ?? 0}
                      baseAmount={editingRow.amount}
                      currencySymbol={currencySymbol}
                      onChange={(val) =>
                        setDraftAllocations((prev) => ({
                          ...prev,
                          [ent.id]: val,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-400">
              <Button variant="ghost" onClick={closeEditDrawer}>
                Cancelar
              </Button>
              <Button variant="default" onClick={saveEditDrawer} className="text-neutral-100!">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
