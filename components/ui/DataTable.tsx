"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Chip, Drawer } from 'caralstable';
import { CaralIcon, Icons } from '@/components/icons';
import { Input, Select } from '@/components/ui';

export type TextFilterOperator =
  | 'contains'
  | 'doesNotContain'
  | 'equals'
  | 'doesNotEqual'
  | 'empty'
  | 'notEmpty'
  | 'startsWith'
  | 'endsWith';

export type NumberFilterOperator =
  | 'equals'
  | 'doesNotEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'empty'
  | 'notEmpty';

export interface FilterOption<T = string> {
  id: T;
  label: string;
}

export const DEFAULT_TEXT_FILTER_OPTIONS: FilterOption<TextFilterOperator>[] = [
  { id: 'contains', label: 'Contains' },
  { id: 'doesNotContain', label: 'Does not contain' },
  { id: 'equals', label: 'Equals' },
  { id: 'doesNotEqual', label: 'Does not equal' },
  { id: 'empty', label: 'Empty' },
  { id: 'notEmpty', label: 'Not empty' },
  { id: 'startsWith', label: 'Starts with' },
  { id: 'endsWith', label: 'Ends with' },
];

export const DEFAULT_NUMBER_FILTER_OPTIONS: FilterOption<NumberFilterOperator>[] = [
  { id: 'equals', label: 'Equals (=)' },
  { id: 'doesNotEqual', label: 'Does not equal (!=)' },
  { id: 'greaterThan', label: 'Greater than (>)' },
  { id: 'greaterThanOrEqual', label: 'Greater than or equal (>=)' },
  { id: 'lessThan', label: 'Less than (<)' },
  { id: 'lessThanOrEqual', label: 'Less than or equal (<=)' },
  { id: 'between', label: 'Between (Rango)' },
  { id: 'empty', label: 'Empty (0)' },
  { id: 'notEmpty', label: 'Not empty (> 0)' },
];

export interface ColumnFilterState {
  active: boolean;
  operator: string;
  value: string;
  valueTo?: string;
  selectedValues?: string[];
}

export type ColumnFilterType = 'text' | 'number' | 'currency' | 'select' | 'none';

export interface DataTableColumn<T = any> {
  id: string;
  header: React.ReactNode | ((props: { column: DataTableColumn<T> }) => React.ReactNode);
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (props: { row: T; value: any; rowIndex: number }) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number; // Initial width in px
  minWidth?: number;
  resizable?: boolean;

  // Filter configuration
  filterable?: boolean; // Defaults to true if filterType !== 'none'
  filterType?: ColumnFilterType; // 'text' | 'number' | 'currency' | 'select' | 'none'
  filterLabel?: string; // Text for drawer tabs and filter badges
  filterOptions?: FilterOption<any>[]; // Custom operator list
  filterSelectOptions?: Array<{ label: string; value: string }>; // For select dropdown or quick chips in drawer
  customFilterFn?: (rowValue: any, filterState: ColumnFilterState, row: T) => boolean;

  // Header decoration
  headerColor?: string;
  headerSubtitle?: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;

  // Footer & Aggregation
  footer?: React.ReactNode | ((props: { data: T[]; filteredData: T[]; column: DataTableColumn<T> }) => React.ReactNode);
  footerClassName?: string;

  // CSV Export
  exportValue?: (row: T) => string | number;
  hideInExport?: boolean;
}

export interface DataTableLabels {
  searchPlaceholder?: string;
  emptyMessage?: string;
  exportFileName?: string;
  filterDrawerTitle?: string;
  filterDrawerDescription?: string;
  filterDrawerConditionLabel?: string;
  filterDrawerActiveBadgeLabel?: string;
  filterDrawerApplyLabel?: string;
  filterDrawerClearLabel?: string;
  filterDrawerClearAllLabel?: string;
  filterDrawerCloseLabel?: string;
  filterDrawerAvailableLabel?: string;
  activeFiltersLabel?: string;
  itemPlural?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor?: (row: T, index: number) => string;

  // Global search
  canSearch?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  searchColumns?: string[]; // IDs of columns to search on. Defaults to text columns
  customSearchFn?: (row: T, query: string) => boolean;

  // Column filtering & Drawer
  canFilterColumns?: boolean;
  columnFilters?: Record<string, ColumnFilterState>;
  onColumnFiltersChange?: (filters: Record<string, ColumnFilterState>) => void;
  isFilterDrawerOpen?: boolean;
  onFilterDrawerOpenChange?: (open: boolean) => void;

  // Error / Mismatch row filter chip
  canFilterErrors?: boolean;
  rowErrorPredicate?: (row: T) => boolean;
  onlyErrors?: boolean;
  onOnlyErrorsChange?: (onlyErrors: boolean) => void;
  errorBadgeLabel?: string | ((count: number) => string);
  customErrorChip?: React.ReactNode;

  // Export CSV
  canExport?: boolean;
  exportFileName?: string;
  exportStatus?: 'default' | 'success' | 'warning' | 'danger';
  onExportConfirm?: (proceed: () => void) => void;

  // Layout & Resizing
  canExpand?: boolean;
  canReadjust?: boolean;
  stickyHeader?: boolean;
  labels?: DataTableLabels;
  className?: string;

  // Title & Header details in toolbar
  title?: React.ReactNode;
  description?: React.ReactNode;
  iconName?: Icons;

  // Custom toolbar slots
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
}

export function evaluateAgnosticTextFilter(value: any, operator: string, filterVal: string): boolean {
  const target = String(value ?? '').toLowerCase().trim();
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

export function evaluateAgnosticNumberFilter(
  value: any,
  operator: string,
  filterVal: string,
  filterValTo: string = ''
): boolean {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? '0'));
  const numVal = parseFloat(filterVal);
  const numValTo = parseFloat(filterValTo);

  switch (operator) {
    case 'equals':
      return !isNaN(numVal) ? Math.abs(num - numVal) < 0.0001 : true;
    case 'doesNotEqual':
      return !isNaN(numVal) ? Math.abs(num - numVal) >= 0.0001 : true;
    case 'greaterThan':
      return !isNaN(numVal) ? num > numVal : true;
    case 'greaterThanOrEqual':
      return !isNaN(numVal) ? num >= numVal : true;
    case 'lessThan':
      return !isNaN(numVal) ? num < numVal : true;
    case 'lessThanOrEqual':
      return !isNaN(numVal) ? num <= numVal : true;
    case 'between': {
      const min = !isNaN(numVal) ? numVal : 0;
      const max = !isNaN(numValTo) ? numValTo : Infinity;
      return num >= Math.min(min, max) && num <= Math.max(min, max);
    }
    case 'empty':
      return num === 0;
    case 'notEmpty':
      return num > 0;
    default:
      return true;
  }
}

export function DataTable<T = any>({
  data,
  columns,
  keyExtractor,

  // Search
  canSearch = true,
  searchPlaceholder,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  searchColumns,
  customSearchFn,

  // Column Filters
  canFilterColumns = true,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange,
  isFilterDrawerOpen: externalIsDrawerOpen,
  onFilterDrawerOpenChange,

  // Error Filter
  canFilterErrors = true,
  rowErrorPredicate,
  onlyErrors: externalOnlyErrors,
  onOnlyErrorsChange,
  errorBadgeLabel,
  customErrorChip,

  // Export
  canExport = true,
  exportFileName,
  exportStatus = 'default',
  onExportConfirm,

  // Layout & Resizing
  canExpand = true,
  canReadjust = true,
  stickyHeader = true,
  labels,
  className = '',

  // Title & Subtitle in header
  title,
  description,
  iconName,

  // Toolbar slots
  toolbarLeft,
  toolbarRight,
}: DataTableProps<T>) {
  // 1. Resolved Labels
  const resolvedLabels = useMemo(() => {
    const itemPlural = labels?.itemPlural ?? 'registros';
    return {
      searchPlaceholder: labels?.searchPlaceholder ?? searchPlaceholder ?? `Buscar ${itemPlural}...`,
      emptyMessage: labels?.emptyMessage ?? `No se encontraron ${itemPlural} para los filtros aplicados.`,
      exportFileName: labels?.exportFileName ?? exportFileName ?? 'export_datos',
      filterDrawerTitle: labels?.filterDrawerTitle ?? 'Filtros de Tabla',
      filterDrawerDescription:
        labels?.filterDrawerDescription ??
        `Selecciona una columna, el operador de coincidencia y el valor para filtrar los ${itemPlural}.`,
      filterDrawerConditionLabel: labels?.filterDrawerConditionLabel ?? 'Condición de coincidencia',
      filterDrawerActiveBadgeLabel: labels?.filterDrawerActiveBadgeLabel ?? 'Filtro Activo',
      filterDrawerApplyLabel: labels?.filterDrawerApplyLabel ?? 'Aplicar Filtro',
      filterDrawerClearLabel: labels?.filterDrawerClearLabel ?? 'Limpiar',
      filterDrawerClearAllLabel: labels?.filterDrawerClearAllLabel ?? 'Limpiar todos',
      filterDrawerCloseLabel: labels?.filterDrawerCloseLabel ?? 'Cerrar',
      filterDrawerAvailableLabel: labels?.filterDrawerAvailableLabel ?? 'Disponibles:',
      activeFiltersLabel: labels?.activeFiltersLabel ?? 'Filtros activos:',
      itemPlural,
    };
  }, [labels, searchPlaceholder, exportFileName]);

  // 2. Filterable Columns
  const filterableColumns = useMemo(() => {
    return columns.filter((col) => {
      if (col.filterable === false) return false;
      if (col.filterType === 'none') return false;
      return true;
    });
  }, [columns]);

  // 3. Search State
  const [internalSearch, setInternalSearch] = useState<string>('');
  const activeSearch = externalSearchQuery !== undefined ? externalSearchQuery : internalSearch;
  const updateSearch = (val: string) => {
    if (onSearchQueryChange) onSearchQueryChange(val);
    if (externalSearchQuery === undefined) setInternalSearch(val);
  };

  // 4. Column Filters State
  const [internalFilters, setInternalFilters] = useState<Record<string, ColumnFilterState>>({});
  const activeFilters = externalColumnFilters !== undefined ? externalColumnFilters : internalFilters;
  const updateColumnFilter = (colId: string, filter: ColumnFilterState) => {
    const next = { ...activeFilters, [colId]: filter };
    if (onColumnFiltersChange) onColumnFiltersChange(next);
    if (externalColumnFilters === undefined) setInternalFilters(next);
  };

  const clearAllFilters = () => {
    const next: Record<string, ColumnFilterState> = {};
    Object.keys(activeFilters).forEach((k) => {
      next[k] = { active: false, operator: 'contains', value: '' };
    });
    if (onColumnFiltersChange) onColumnFiltersChange(next);
    if (externalColumnFilters === undefined) setInternalFilters(next);
  };

  // 5. Error Filter State
  const [internalOnlyErrors, setInternalOnlyErrors] = useState<boolean>(false);
  const activeOnlyErrors = externalOnlyErrors !== undefined ? externalOnlyErrors : internalOnlyErrors;
  const setOnlyErrors = (val: boolean) => {
    if (onOnlyErrorsChange) onOnlyErrorsChange(val);
    if (externalOnlyErrors === undefined) setInternalOnlyErrors(val);
  };

  const mismatchCount = useMemo(() => {
    if (!rowErrorPredicate) return 0;
    return data.filter(rowErrorPredicate).length;
  }, [data, rowErrorPredicate]);

  // 6. Filter Drawer State
  const [internalIsDrawerOpen, setInternalIsDrawerOpen] = useState<boolean>(false);
  const isDrawerOpen = externalIsDrawerOpen !== undefined ? externalIsDrawerOpen : internalIsDrawerOpen;
  const setDrawerOpen = (open: boolean) => {
    if (onFilterDrawerOpenChange) onFilterDrawerOpenChange(open);
    if (externalIsDrawerOpen === undefined) setInternalIsDrawerOpen(open);
  };

  const [drawerTabIndex, setDrawerTabIndex] = useState<number>(0);
  const activeFilterCol = filterableColumns[drawerTabIndex] || filterableColumns[0];

  const isSelectFilter =
    activeFilterCol?.filterType === 'select' ||
    (!!activeFilterCol?.filterSelectOptions && activeFilterCol.filterSelectOptions.length > 0);

  const availableSelectOptions = useMemo(() => {
    if (!activeFilterCol) return [];
    if (activeFilterCol.filterSelectOptions && activeFilterCol.filterSelectOptions.length > 0) {
      return activeFilterCol.filterSelectOptions;
    }
    if (activeFilterCol.filterType === 'select') {
      const set = new Set<string>();
      data.forEach((row) => {
        const val = getCellValue(row, activeFilterCol);
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          set.add(String(val));
        }
      });
      return Array.from(set).map((v) => ({ label: v, value: v }));
    }
    return [];
  }, [activeFilterCol, data]);

  // Draft filter state for the active tab in drawer
  const [draftOp, setDraftOp] = useState<string>('contains');
  const [draftVal, setDraftVal] = useState<string>('');
  const [draftValTo, setDraftValTo] = useState<string>('');
  const [draftSelectedValues, setDraftSelectedValues] = useState<string[]>([]);

  useEffect(() => {
    if (!activeFilterCol) return;
    const current = activeFilters[activeFilterCol.id];
    const defaultOp =
      activeFilterCol.filterType === 'number' || activeFilterCol.filterType === 'currency'
        ? 'greaterThanOrEqual'
        : 'contains';

    setDraftOp(current?.operator || defaultOp);
    setDraftVal(current?.value || '');
    setDraftValTo(current?.valueTo || '');
    setDraftSelectedValues(current?.selectedValues || []);
  }, [activeFilterCol, isDrawerOpen, activeFilters]);

  // 7. Column Widths & Resizing
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [activeResizingCol, setActiveResizingCol] = useState<string | null>(null);
  const resizingRef = useRef<{ colKey: string; startX: number; startWidth: number } | null>(null);

  const getColWidth = (col: DataTableColumn<T>): number => {
    return columnWidths[col.id] ?? col.width ?? 160;
  };

  const handleStartResize = (colId: string, currentWidth: number, e: React.MouseEvent) => {
    if (!canReadjust) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveResizingCol(colId);
    resizingRef.current = { colKey: colId, startX: e.clientX, startWidth: currentWidth };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const { colKey, startX, startWidth } = resizingRef.current;
      const deltaX = moveEvent.clientX - startX;
      const minW = columns.find((c) => c.id === colKey)?.minWidth ?? 70;
      const newWidth = Math.max(minW, startWidth + deltaX);
      setColumnWidths((prev) => ({ ...prev, [colKey]: newWidth }));
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

  // 8. Fullscreen Maximize State
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    if (!canExpand && isMaximized) setIsMaximized(false);
  }, [canExpand, isMaximized]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) setIsMaximized(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  useEffect(() => {
    if (isMaximized) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMaximized]);

  // 9. Helper to extract cell value
  const getCellValue = (row: T, col: DataTableColumn<T>) => {
    if (col.accessorFn) return col.accessorFn(row);
    if (col.accessorKey) return row[col.accessorKey];
    return undefined;
  };

  // 10. Filter and Search Data Calculation
  const filteredData = useMemo(() => {
    let result = data;

    // A. Global Search
    if (canSearch && activeSearch.trim()) {
      const q = activeSearch.trim().toLowerCase();
      if (customSearchFn) {
        result = result.filter((row) => customSearchFn(row, q));
      } else {
        const targetCols =
          searchColumns && searchColumns.length > 0
            ? columns.filter((c) => searchColumns.includes(c.id))
            : columns.filter((c) => c.filterType !== 'number' && c.filterType !== 'currency');

        result = result.filter((row) => {
          return targetCols.some((col) => {
            const val = getCellValue(row, col);
            return String(val ?? '').toLowerCase().includes(q);
          });
        });
      }
    }

    // B. Error Filter
    if (canFilterErrors && activeOnlyErrors && rowErrorPredicate) {
      result = result.filter(rowErrorPredicate);
    }

    // C. Column Filters
    if (canFilterColumns) {
      filterableColumns.forEach((col) => {
        const filterState = activeFilters[col.id];
        if (!filterState || !filterState.active) return;

        if (col.customFilterFn) {
          result = result.filter((row) => {
            const val = getCellValue(row, col);
            return col.customFilterFn!(val, filterState, row);
          });
          return;
        }

        // Multi-select chip filter matching
        if (filterState.selectedValues && filterState.selectedValues.length > 0) {
          result = result.filter((row) => {
            const val = getCellValue(row, col);
            return filterState.selectedValues!.some(
              (sel) => String(sel).toLowerCase() === String(val ?? '').toLowerCase()
            );
          });
          return;
        }

        const isNum = col.filterType === 'number' || col.filterType === 'currency';
        if (isNum) {
          result = result.filter((row) => {
            const val = getCellValue(row, col);
            return evaluateAgnosticNumberFilter(val, filterState.operator, filterState.value, filterState.valueTo);
          });
        } else {
          result = result.filter((row) => {
            const val = getCellValue(row, col);
            return evaluateAgnosticTextFilter(val, filterState.operator, filterState.value);
          });
        }
      });
    }

    return result;
  }, [
    data,
    columns,
    filterableColumns,
    canSearch,
    activeSearch,
    customSearchFn,
    searchColumns,
    canFilterErrors,
    activeOnlyErrors,
    rowErrorPredicate,
    canFilterColumns,
    activeFilters,
  ]);

  // 11. Active filters count & list for toolbar
  const activeFiltersList = useMemo(() => {
    return filterableColumns
      .map((col) => ({
        col,
        filter: activeFilters[col.id],
      }))
      .filter((item) => item.filter && item.filter.active);
  }, [filterableColumns, activeFilters]);

  // 12. Dynamic CSV Export
  const handleExportCSV = () => {
    const exportColumns = columns.filter((col) => !col.hideInExport);
    const headers = exportColumns.map((col) => {
      if (typeof col.header === 'string') return col.header;
      if (col.filterLabel) return col.filterLabel;
      return col.id;
    });

    const escapeCSV = (val: string | number) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = filteredData.map((row) => {
      return exportColumns
        .map((col) => {
          if (col.exportValue) return escapeCSV(col.exportValue(row));
          const val = getCellValue(row, col);
          return escapeCSV(typeof val === 'number' ? val.toFixed(2) : String(val ?? ''));
        })
        .join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', `${resolvedLabels.exportFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportClick = () => {
    if (onExportConfirm) {
      onExportConfirm(handleExportCSV);
      return;
    }

    if (exportStatus === 'danger') {
      const proceed = window.confirm('Los datos están sin completar. ¿Desea descargar de todas formas?');
      if (proceed) handleExportCSV();
      return;
    }

    if (exportStatus === 'warning') {
      const proceed = window.confirm('Hay registros con advertencias o desajustes. ¿Desea descargar de todas formas?');
      if (proceed) handleExportCSV();
      return;
    }

    handleExportCSV();
  };

  // Has footers?
  const hasFooters = useMemo(() => columns.some((col) => !!col.footer), [columns]);

  return (
    <>
      {/* Maximize Backdrop */}
      {isMaximized && (
        <div
          onClick={() => setIsMaximized(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] transition-opacity duration-300"
        />
      )}

      {/* Main Container */}
      <div
        className={`w-full overflow-x-auto rounded-2xl border border-neutral-500 bg-container transition-all duration-300 ${isMaximized
            ? 'fixed inset-2 sm:inset-4 z-[9999] p-2 sm:p-4 overflow-auto shadow-2xl flex flex-col'
            : ''
          } ${className}`}
      >
        {/* Header Toolbar */}
        <div
          className={`w-full ${stickyHeader ? 'sticky top-0 z-20' : ''
            } bg-container p-3.5 border-b border-neutral-500 flex flex-wrap items-center justify-between gap-3 shrink-0`}
        >
          {/* Left Toolbar Side */}
          <div className="flex items-center gap-3 flex-wrap">
            {title && (
              <div className="flex flex-col pr-1">
                <div className="flex items-center gap-2">
                  {iconName && <CaralIcon name={iconName} size={18} />}
                  {typeof title === 'string' ? (
                    <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                      {title}
                    </h3>
                  ) : (
                    title
                  )}
                </div>
                {description && (
                  <p className="text-[11px] sm:text-xs text-neutral-800 font-normal mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            )}

            {toolbarLeft}

            {/* Error Mismatch Chip */}
            {canFilterErrors && rowErrorPredicate && (
              <>
                {customErrorChip ? (
                  customErrorChip
                ) : mismatchCount > 0 ? (
                  <div
                    onClick={() => setOnlyErrors(!activeOnlyErrors)}
                    className="cursor-pointer transition-transform active:scale-95 select-none"
                    title={
                      activeOnlyErrors
                        ? `Clic para ver todos los ${resolvedLabels.itemPlural}`
                        : `Clic para mostrar solo los ${mismatchCount} con error`
                    }
                  >
                    <Chip
                      hasBorder
                      iconName={activeOnlyErrors ? 'filter' : 'triangleExclamation'}
                      label={
                        typeof errorBadgeLabel === 'function'
                          ? errorBadgeLabel(mismatchCount)
                          : errorBadgeLabel ||
                          (activeOnlyErrors
                            ? `Filtrando: ${mismatchCount} con error`
                            : `${mismatchCount} con error`)
                      }
                      status="none"
                      variant="warning"
                    />
                  </div>
                ) : (
                  <Chip
                    hasBorder
                    iconName="check"
                    label={`Sin errores (0)`}
                    status="none"
                    variant="success"
                  />
                )}
              </>
            )}
          </div>

          {/* Right Toolbar Side */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Global Search */}
            {canSearch && (
              <div className="w-56 sm:w-64">
                <Input
                  iconName="search"
                  value={activeSearch}
                  onChange={(e) => updateSearch(e.target.value)}
                  placeholder={resolvedLabels.searchPlaceholder}
                  className="w-full"
                />
              </div>
            )}

            {/* Column Filters Drawer Trigger */}
            {canFilterColumns && filterableColumns.length > 0 && (
              <Button
                variant={activeFiltersList.length > 0 ? 'info' : 'light'}
                iconName="filter"
                isIconButton
                onClick={() => setDrawerOpen(true)}
                title={
                  activeFiltersList.length > 0
                    ? `Filtros activos (${activeFiltersList.length})`
                    : resolvedLabels.filterDrawerTitle
                }
              />
            )}

            {/* Export CSV */}
            {canExport && (
              <Button
                variant={exportStatus === 'warning' ? 'warning' : 'light'}
                iconName="fileDown"
                isIconButton
                onClick={handleExportClick}
                title="Exportar a CSV"
              />
            )}

            {/* Fullscreen Expand */}
            {canExpand && (
              <Button
                variant="light"
                iconName={isMaximized ? 'arrowsMinimize' : 'arrowsMaximize'}
                isIconButton
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? 'Restaurar tamaño (Esc)' : 'Expandir a pantalla completa'}
              />
            )}

            {/* Custom Toolbar Right Actions (Furthest Right) */}
            {toolbarRight}
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFiltersList.length > 0 && (
          <div className="w-full bg-container/80 px-4 py-2 border-b border-neutral-500 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-800 font-semibold">{resolvedLabels.activeFiltersLabel}</span>
              {activeFiltersList.map(({ col, filter }) => {
                const headerLabel =
                  col.filterLabel || (typeof col.header === 'string' ? col.header : col.id);
                return (
                  <span
                    key={col.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-container text-neutral-900 border border-neutral-500 font-medium text-[11px]"
                  >
                    <span className="font-bold text-seidor-main">{headerLabel}:</span>
                    <span className="text-neutral-800 font-mono">
                      {filter.selectedValues && filter.selectedValues.length > 0
                        ? filter.selectedValues.join(', ')
                        : `${filter.operator} ${filter.value}${filter.valueTo ? ` y ${filter.valueTo}` : ''}`}
                    </span>
                    <Button
                      variant="ghost"
                      isIconButton
                      iconName="x"
                      onClick={() =>
                        updateColumnFilter(col.id, {
                          active: false,
                          operator: filter.operator,
                          value: '',
                          valueTo: '',
                          selectedValues: [],
                        })
                      }
                      className="hover:text-danger-main! ml-1 cursor-pointer"
                      title={`Quitar filtro de ${headerLabel}`}
                    />
                  </span>
                );
              })}
            </div>

            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="text-xs text-info-main hover:text-danger-main font-semibold transition-colors cursor-pointer"
            >
              {resolvedLabels.filterDrawerClearAllLabel}
            </Button>
          </div>
        )}

        {/* Agnostic Table */}
        <table className="w-full text-left border-separate border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-neutral-500 font-bold text-neutral-900 text-xs uppercase tracking-wider">
              {columns.map((col, idx) => {
                const width = getColWidth(col);
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';
                const isFilterActive = !!activeFilters[col.id]?.active;
                const canFilterThisCol =
                  canFilterColumns && col.filterable !== false && col.filterType !== 'none';

                return (
                  <th
                    key={col.id}
                    style={{ width: `${width}px`, minWidth: `${col.minWidth ?? 70}px` }}
                    className={`py-4 px-4 relative select-none border-b border-neutral-500 ${alignClass} ${col.headerClassName || ''
                      }`}
                  >
                    <div
                      className={`flex items-center ${col.align === 'right'
                          ? 'justify-end'
                          : col.align === 'center'
                            ? 'justify-center'
                            : 'justify-between'
                        } gap-1.5 overflow-hidden pr-1`}
                    >
                      {/* Left color dot if any */}
                      {col.headerColor && (
                        <span
                          style={{ backgroundColor: col.headerColor }}
                          className="size-2 rounded-full shrink-0 shadow-xs"
                        />
                      )}

                      {/* Header Content */}
                      <div className="truncate flex items-center gap-1">
                        {typeof col.header === 'function' ? (
                          col.header({ column: col })
                        ) : (
                          <span className="truncate block" title={String(col.header)}>
                            {col.header}
                          </span>
                        )}
                        {col.headerSubtitle && (
                          <span className="text-[11px] font-mono text-neutral-800 font-bold shrink-0">
                            {col.headerSubtitle}
                          </span>
                        )}
                      </div>

                      {/* Filter Icon button */}
                      {canFilterThisCol && (
                        <Button
                          variant="ghost"
                          isIconButton
                          iconName="filter"
                          onClick={() => {
                            const tabIdx = filterableColumns.findIndex((c) => c.id === col.id);
                            if (tabIdx >= 0) setDrawerTabIndex(tabIdx);
                            setDrawerOpen(true);
                          }}
                          className={`p-1 rounded transition-colors hover:bg-neutral-500/50 shrink-0 ${isFilterActive
                              ? 'text-seidor-main font-bold'
                              : 'text-neutral-800 hover:text-neutral-900'
                            }`}
                          title={`Filtrar por ${col.filterLabel || col.id}`}
                        />
                      )}
                    </div>

                    {/* Resizer */}
                    {canReadjust && col.resizable !== false && (
                      <div
                        onMouseDown={(e) => handleStartResize(col.id, width, e)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setColumnWidths((prev) => {
                            const next = { ...prev };
                            delete next[col.id];
                            return next;
                          });
                        }}
                        title="Arrastrar para redimensionar (doble clic para restaurar)"
                        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-10 flex items-center justify-center group/resizer"
                      >
                        <div
                          className={`w-[2px] h-3/5 rounded-full transition-all duration-150 ${activeResizingCol === col.id
                              ? 'bg-info-main w-[3px] shadow-xs'
                              : 'bg-neutral-300 w-[1px] group-hover/resizer:bg-info-main group-hover/resizer:w-[1px]'
                            }`}
                        />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="text-xs">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-neutral-800 border-b border-neutral-500"
                >
                  {resolvedLabels.emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => {
                const rowKey = keyExtractor ? keyExtractor(row, rowIndex) : String(rowIndex);

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-neutral-500/20 transition-colors border-b border-neutral-500 font-poppins"
                  >
                    {columns.map((col) => {
                      const value = getCellValue(row, col);
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                            ? 'text-center'
                            : 'text-left';

                      return (
                        <td
                          key={col.id}
                          className={`py-3.5 px-4 ${alignClass} ${col.cellClassName || ''}`}
                        >
                          {col.cell ? (
                            col.cell({ row, value, rowIndex })
                          ) : (
                            <span className="truncate block">{String(value ?? '')}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer Row */}
          {hasFooters && filteredData.length > 0 && (
            <tfoot>
              <tr className="bg-neutral-500/40 border-t-2 border-neutral-500 font-bold text-xs">
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                  let content: React.ReactNode = null;
                  if (typeof col.footer === 'function') {
                    content = col.footer({ data, filteredData, column: col });
                  } else if (col.footer !== undefined) {
                    content = col.footer;
                  }

                  return (
                    <td
                      key={col.id}
                      className={`py-3.5 px-4 ${alignClass} ${col.footerClassName || ''}`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Agnostic Filter Drawer */}
      {canFilterColumns && filterableColumns.length > 0 && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={resolvedLabels.filterDrawerTitle}
        >
          <div className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins text-neutral-900 p-1">
            <div className="flex-1 space-y-6">
              {resolvedLabels.filterDrawerDescription && (
                <p className="text-xs text-neutral-800">
                  {resolvedLabels.filterDrawerDescription}
                </p>
              )}

              {/* Column to filter Selector */}
              <Select
                label="Columna a filtrar"
                iconName="circleBars"
                value={activeFilterCol?.id || filterableColumns[0]?.id}
                onValueChange={(val) => {
                  const idx = filterableColumns.findIndex((c) => c.id === String(val));
                  if (idx >= 0) setDrawerTabIndex(idx);
                }}
                options={filterableColumns.map((col) => {
                  const label =
                    col.filterLabel || (typeof col.header === 'string' ? col.header : col.id);
                  const isFiltered = activeFilters[col.id]?.active;
                  return {
                    value: col.id,
                    label: isFiltered ? `${label} (Filtro Activo)` : label,
                    iconName: isFiltered ? 'check' : undefined,
                  };
                })}
                placeholder="Selecciona una columna..."
                detail="Elige la columna sobre la cual deseas aplicar la condición de filtro."
              />

              {/* Active column filter form */}
              {activeFilterCol && (
                <div className="flex flex-col gap-4">
                  {/* Filter Active status badge */}
                  {activeFilters[activeFilterCol.id]?.active && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-info-light/40 border border-info-main/30">
                      <div className="flex items-center gap-2 text-xs font-semibold text-info-hard">
                        <CaralIcon name="filter" size={16} />
                        <span>{resolvedLabels.filterDrawerActiveBadgeLabel}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-neutral-900 truncate max-w-[200px]">
                        {activeFilters[activeFilterCol.id]?.selectedValues &&
                          activeFilters[activeFilterCol.id]!.selectedValues!.length > 0
                          ? activeFilters[activeFilterCol.id]!.selectedValues!.join(', ')
                          : `${activeFilters[activeFilterCol.id]?.operator} ${activeFilters[activeFilterCol.id]?.value}`}
                      </span>
                    </div>
                  )}

                  {/* 1. If Column is of type Select or has Predefined Options (Chips Multi-select) */}
                  {isSelectFilter ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-800">
                          Filtrar por una o varias opciones:
                        </label>
                        <span className="text-[11px] font-mono text-neutral-800 font-semibold">
                          {draftSelectedValues.length} de {availableSelectOptions.length} seleccionadas
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {availableSelectOptions.map((opt) => {
                          const isSelected = draftSelectedValues.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setDraftSelectedValues((prev) =>
                                  isSelected
                                    ? prev.filter((v) => v !== opt.value)
                                    : [...prev, opt.value]
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${isSelected
                                  ? 'bg-info-light text-info-hard border-info-main shadow-xs ring-1 ring-info-main/30'
                                  : 'bg-container text-neutral-800 border-neutral-500 hover:border-neutral-800 hover:bg-neutral-500/10'
                                }`}
                            >
                              {isSelected && <CaralIcon name="check" size={13} />}
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setDraftSelectedValues(availableSelectOptions.map((o) => o.value))
                          }
                          className="text-xs text-info-main hover:underline font-semibold cursor-pointer"
                        >
                          Seleccionar todas
                        </button>
                        <span className="text-neutral-500 text-xs">|</span>
                        <button
                          type="button"
                          onClick={() => setDraftSelectedValues([])}
                          className="text-xs text-neutral-800 hover:text-danger-main hover:underline font-medium cursor-pointer"
                        >
                          Limpiar selección
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 2. Text or Number Filter Form (Operator Select + Input) */
                    <div className="flex flex-col gap-4">
                      {/* Operator Selector */}
                      <Select
                        label={resolvedLabels.filterDrawerConditionLabel}
                        iconName="filter"
                        value={draftOp}
                        onValueChange={(val) => setDraftOp(String(val))}
                        options={(
                          activeFilterCol.filterOptions ||
                          (activeFilterCol.filterType === 'number' || activeFilterCol.filterType === 'currency'
                            ? DEFAULT_NUMBER_FILTER_OPTIONS
                            : DEFAULT_TEXT_FILTER_OPTIONS)
                        ).map((op) => ({
                          value: op.id,
                          label: op.label,
                        }))}
                        placeholder="Selecciona una condición..."
                      />

                      {/* Value Input */}
                      {!['empty', 'notEmpty'].includes(draftOp) && (
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-neutral-800">
                              {draftOp === 'between' ? 'Valor Mínimo' : 'Valor a buscar'}
                            </label>
                            <Input
                              type={
                                activeFilterCol.filterType === 'number' || activeFilterCol.filterType === 'currency'
                                  ? 'number'
                                  : 'text'
                              }
                              value={draftVal}
                              onChange={(e) => setDraftVal(e.target.value)}
                              placeholder="Escribe el valor..."
                              className="w-full"
                            />
                          </div>

                          {draftOp === 'between' && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-neutral-800">Valor Máximo</label>
                              <Input
                                type="number"
                                value={draftValTo}
                                onChange={(e) => setDraftValTo(e.target.value)}
                                placeholder="Valor máximo..."
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="w-full flex items-center justify-between gap-3 pt-4 border-t border-neutral-400">
              <Button
                variant="light"
                onClick={() => {
                  if (activeFilterCol) {
                    updateColumnFilter(activeFilterCol.id, {
                      active: false,
                      operator: 'contains',
                      value: '',
                      valueTo: '',
                      selectedValues: [],
                    });
                  }
                  setDraftVal('');
                  setDraftValTo('');
                  setDraftSelectedValues([]);
                }}
              >
                {resolvedLabels.filterDrawerClearLabel}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                  {resolvedLabels.filterDrawerCloseLabel}
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (activeFilterCol) {
                      if (isSelectFilter) {
                        const isActive = draftSelectedValues.length > 0;
                        updateColumnFilter(activeFilterCol.id, {
                          active: isActive,
                          operator: 'in',
                          value: draftSelectedValues.join(', '),
                          selectedValues: draftSelectedValues,
                        });
                      } else {
                        const isActive =
                          ['empty', 'notEmpty'].includes(draftOp) || draftVal.trim().length > 0;
                        updateColumnFilter(activeFilterCol.id, {
                          active: isActive,
                          operator: draftOp,
                          value: draftVal,
                          valueTo: draftValTo,
                          selectedValues: undefined,
                        });
                      }
                    }
                    setDrawerOpen(false);
                  }}
                  className="text-neutral-100!"
                >
                  {resolvedLabels.filterDrawerApplyLabel}
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
