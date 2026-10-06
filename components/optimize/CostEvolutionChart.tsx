"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from 'caralstable';
import { CaralIcon, Brand } from '@/components/icons';
import accountsRawData from '@/data/accounts.json';
import { DriverItem } from '@/components/optimize/drivers/DriverAllocationRow';

export interface MonthlyCostData {
  id: string;
  year: number;
  month: string;
  monthFull: string;
  monthIndex: number;
  label: string;
  fullLabel: string;
  compute: number;
  storage: number;
  database: number;
  other: number;
  total: number;
  budget: number;
}

export type Granularity = 'monthly' | 'quarterly' | 'semestral' | 'annual';

export interface ChartBarPoint {
  id: string;
  label: string;
  fullLabel: string;
  year: number;
  isYearStart: boolean;
  compute: number;
  storage: number;
  database: number;
  other: number;
  total: number;
  budget: number;
  granularity: Granularity;
}

const monthsMeta = [
  { short: 'Jan', full: 'Enero' },
  { short: 'Feb', full: 'Febrero' },
  { short: 'Mar', full: 'Marzo' },
  { short: 'Apr', full: 'Abril' },
  { short: 'May', full: 'Mayo' },
  { short: 'Jun', full: 'Junio' },
  { short: 'Jul', full: 'Julio' },
  { short: 'Aug', full: 'Agosto' },
  { short: 'Sep', full: 'Septiembre' },
  { short: 'Oct', full: 'Octubre' },
  { short: 'Nov', full: 'Noviembre' },
  { short: 'Dec', full: 'Diciembre' },
];

const MIN_WINDOW_SIZE = 4; // mínimo 4 meses visibles

type ActiveCategory = 'all' | 'compute' | 'storage' | 'database' | 'other';

export interface CostEvolutionChartProps {
  driver?: DriverItem | null;
}

export function CostEvolutionChart({ driver = null }: CostEvolutionChartProps) {
  // Construir mapa de cuentas para acceso indexado rápido O(1)
  const accountsMap = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      provider: string;
      brand: any;
      historyMap: Map<string, any>;
    }>();

    (accountsRawData as any[]).forEach((acc) => {
      const historyMap = new Map<string, any>();
      (acc.history || []).forEach((h: any) => {
        historyMap.set(`${h.year}-${h.monthIndex}`, h);
      });
      map.set(acc.id, {
        id: acc.id,
        name: acc.name,
        provider: acc.provider,
        brand: acc.brand,
        historyMap,
      });
    });

    return map;
  }, []);

  // Generar timeline completo (2011 a 2025 = 15 años = 180 meses) calculado para el driver o consolidado
  const allData: MonthlyCostData[] = useMemo(() => {
    const startYear = 2011;
    const endYear = 2025;
    const result: MonthlyCostData[] = [];

    const isDriverFilter = driver && driver.connections && driver.connections.length > 0;

    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        const monthKey = `${y}-${m}`;
        const meta = monthsMeta[m];

        let compute = 0;
        let storage = 0;
        let database = 0;
        let other = 0;

        if (isDriverFilter && driver) {
          // Suma de todas las cuentas asignadas al driver
          const accountsList =
            driver.accounts && driver.accounts.length > 0
              ? driver.accounts
              : (driver.connections || []);

          accountsList.forEach((conn) => {
            const acc = accountsMap.get(conn.id);
            if (acc) {
              const hist = acc.historyMap.get(monthKey);
              if (hist) {
                compute += hist.compute;
                storage += hist.storage;
                database += hist.database;
                other += hist.other;
              }
            }
          });
        } else {
          // Consolidado total de todas las cuentas del sistema
          accountsMap.forEach((acc) => {
            const hist = acc.historyMap.get(monthKey);
            if (hist) {
              compute += hist.compute;
              storage += hist.storage;
              database += hist.database;
              other += hist.other;
            }
          });
        }

        const compRound = Math.round(compute);
        const storRound = Math.round(storage);
        const dbRound = Math.round(database);
        const othRound = Math.round(other);
        const total = compRound + storRound + dbRound + othRound;
        const budget = Math.round(total * 1.06);

        result.push({
          id: `${y}-${String(m + 1).padStart(2, '0')}`,
          year: y,
          month: meta.short,
          monthFull: meta.full,
          monthIndex: m,
          label: `${meta.short} ${String(y).slice(-2)}`,
          fullLabel: `${meta.full} ${y}`,
          compute: compRound,
          storage: storRound,
          database: dbRound,
          other: othRound,
          total,
          budget,
        });
      }
    }

    return result;
  }, [driver, accountsMap]);

  const totalMonths = allData.length;

  // Rango de índices activos [startIndex, endIndex]
  // Por defecto inicializamos con los últimos 8 meses
  const [rangeStart, setRangeStart] = useState<number>(() => Math.max(0, 180 - 8));
  const [rangeEnd, setRangeEnd] = useState<number>(() => 180 - 1);

  // Asegurar límites consistentes si cambia la longitud de los datos
  useEffect(() => {
    if (totalMonths > 0) {
      setRangeStart((prev) => Math.min(prev, Math.max(0, totalMonths - 4)));
      setRangeEnd((prev) => Math.min(Math.max(prev, 3), totalMonths - 1));
    }
  }, [totalMonths]);

  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all');
  const [hoveredPoint, setHoveredPoint] = useState<ChartBarPoint | null>(null);
  const [isQuickRangesOpen, setIsQuickRangesOpen] = useState<boolean>(false);
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

  // Referencias para el Timeline Slider interactivo
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<'left' | 'right' | 'middle' | null>(null);
  const dragStartXRef = useRef<number>(0);
  const dragStartRangeRef = useRef<{ start: number; end: number }>({ start: rangeStart, end: rangeEnd });

  // =========================================================================
  // LÓGICA DE CONSOLIDACIÓN DINÁMICA SEGÚN LA CANTIDAD DE AÑOS EN VENTANA:
  // <= 6 años: Mensual (1 barra por mes)
  // > 6 años y <= 12 años: Trimestral (4 cuartos por año: Q1, Q2, Q3, Q4)
  // > 12 años: Semestral (2 por año: S1, S2)
  // =========================================================================
  const { displayData, granularity, granularityLabel } = useMemo(() => {
    const rawSlice = allData.slice(rangeStart, rangeEnd + 1);
    const monthsCount = rawSlice.length;

    let gran: Granularity = 'monthly';
    let label = 'Mensual';

    if (monthsCount > 288) {
      gran = 'annual';
      label = 'Consolidado Anual (1 barra/año)';
    } else if (monthsCount > 144) {
      gran = 'semestral';
      label = 'Consolidado Semestral (2 barras/año)';
    } else if (monthsCount > 72) {
      gran = 'quarterly';
      label = 'Consolidado Trimestral (4 cuartos/año)';
    } else {
      gran = 'monthly';
      label = 'Desglose Mensual (1 barra/mes)';
    }

    if (gran === 'monthly') {
      const points: ChartBarPoint[] = rawSlice.map((item, idx) => ({
        id: item.id,
        label: item.label,
        fullLabel: item.fullLabel,
        year: item.year,
        isYearStart: item.monthIndex === 0 || (idx > 0 && rawSlice[idx - 1].year !== item.year),
        compute: item.compute,
        storage: item.storage,
        database: item.database,
        other: item.other,
        total: item.total,
        budget: item.budget,
        granularity: 'monthly',
      }));
      return { displayData: points, granularity: gran, granularityLabel: label };
    }

    if (gran === 'quarterly') {
      const map = new Map<string, ChartBarPoint>();
      rawSlice.forEach((item) => {
        const q = Math.floor(item.monthIndex / 3) + 1;
        const key = `${item.year}-Q${q}`;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            label: `Q${q} ${String(item.year).slice(-2)}`,
            fullLabel: `Trimestre ${q} (${item.year})`,
            year: item.year,
            isYearStart: q === 1,
            compute: 0,
            storage: 0,
            database: 0,
            other: 0,
            total: 0,
            budget: 0,
            granularity: 'quarterly',
          });
        }
        const point = map.get(key)!;
        point.compute += item.compute;
        point.storage += item.storage;
        point.database += item.database;
        point.other += item.other;
        point.total += item.total;
        point.budget += item.budget;
      });

      const points = Array.from(map.values()).map((pt, idx, arr) => ({
        ...pt,
        isYearStart: pt.isYearStart || (idx > 0 && arr[idx - 1].year !== pt.year),
      }));
      return { displayData: points, granularity: gran, granularityLabel: label };
    }

    if (gran === 'semestral') {
      const map = new Map<string, ChartBarPoint>();
      rawSlice.forEach((item) => {
        const s = Math.floor(item.monthIndex / 6) + 1;
        const key = `${item.year}-S${s}`;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            label: `S${s} ${String(item.year).slice(-2)}`,
            fullLabel: `Semestre ${s} (${item.year})`,
            year: item.year,
            isYearStart: s === 1,
            compute: 0,
            storage: 0,
            database: 0,
            other: 0,
            total: 0,
            budget: 0,
            granularity: 'semestral',
          });
        }
        const point = map.get(key)!;
        point.compute += item.compute;
        point.storage += item.storage;
        point.database += item.database;
        point.other += item.other;
        point.total += item.total;
        point.budget += item.budget;
      });

      const points = Array.from(map.values()).map((pt, idx, arr) => ({
        ...pt,
        isYearStart: pt.isYearStart || (idx > 0 && arr[idx - 1].year !== pt.year),
      }));
      return { displayData: points, granularity: gran, granularityLabel: label };
    }

    // annual
    const map = new Map<string, ChartBarPoint>();
    rawSlice.forEach((item) => {
      const key = `${item.year}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          label: `${item.year}`,
          fullLabel: `Año ${item.year}`,
          year: item.year,
          isYearStart: false,
          compute: 0,
          storage: 0,
          database: 0,
          other: 0,
          total: 0,
          budget: 0,
          granularity: 'annual',
        });
      }
      const point = map.get(key)!;
      point.compute += item.compute;
      point.storage += item.storage;
      point.database += item.database;
      point.other += item.other;
      point.total += item.total;
      point.budget += item.budget;
    });

    return { displayData: Array.from(map.values()), granularity: gran, granularityLabel: label };
  }, [allData, rangeStart, rangeEnd]);

  // Cálculos agregados
  const totalPeriodSpend = useMemo(
    () => displayData.reduce((acc, curr) => acc + curr.total, 0),
    [displayData]
  );

  const averagePointSpend = useMemo(
    () => (displayData.length > 0 ? Math.round(totalPeriodSpend / displayData.length) : 0),
    [displayData, totalPeriodSpend]
  );

  const maxTotalInPeriod = useMemo(() => {
    if (displayData.length === 0) return 1;
    if (activeCategory === 'all') {
      return Math.max(...displayData.map((d) => d.total));
    }
    return Math.max(...displayData.map((d) => d[activeCategory]));
  }, [displayData, activeCategory]);

  // Manejadores de Drag para el slider estilo Premiere con seguimiento 1:1 exacto
  const handleMouseDown = (type: 'left' | 'right' | 'middle', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = type;
    dragStartXRef.current = e.clientX;
    dragStartRangeRef.current = { start: rangeStart, end: rangeEnd };
    document.body.style.cursor = type === 'middle' ? 'grabbing' : 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !sliderTrackRef.current) return;

      const trackRect = sliderTrackRef.current.getBoundingClientRect();
      const trackWidth = trackRect.width;
      if (trackWidth <= 0) return;

      const { start: initialStart, end: initialEnd } = dragStartRangeRef.current;
      const currentSpan = initialEnd - initialStart;

      if (isDraggingRef.current === 'left') {
        const ratio = (moveEvent.clientX - trackRect.left) / trackWidth;
        const targetIndex = Math.round(ratio * (totalMonths - 1));
        const newStart = Math.max(0, Math.min(targetIndex, initialEnd - MIN_WINDOW_SIZE));
        setRangeStart(newStart);
      } else if (isDraggingRef.current === 'right') {
        const ratio = (moveEvent.clientX - trackRect.left) / trackWidth;
        const targetIndex = Math.round(ratio * (totalMonths - 1));
        const newEnd = Math.max(initialStart + MIN_WINDOW_SIZE, Math.min(targetIndex, totalMonths - 1));
        setRangeEnd(newEnd);
      } else if (isDraggingRef.current === 'middle') {
        const deltaX = moveEvent.clientX - dragStartXRef.current;
        const deltaIndices = Math.round((deltaX / trackWidth) * (totalMonths - 1));

        let newStart = initialStart + deltaIndices;
        let newEnd = initialEnd + deltaIndices;

        if (newStart < 0) {
          newStart = 0;
          newEnd = Math.min(totalMonths - 1, currentSpan);
        } else if (newEnd >= totalMonths) {
          newEnd = totalMonths - 1;
          newStart = Math.max(0, totalMonths - 1 - currentSpan);
        }

        setRangeStart(newStart);
        setRangeEnd(newEnd);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Atajos rápidos de períodos
  const setQuickRange = (monthsCount: number) => {
    const end = totalMonths - 1;
    const start = Math.max(0, end - monthsCount + 1);
    setRangeStart(start);
    setRangeEnd(end);
  };

  // Posición del Timeline en porcentaje
  const startPercent = totalMonths > 1 ? (rangeStart / (totalMonths - 1)) * 100 : 0;
  const endPercent = totalMonths > 1 ? (rangeEnd / (totalMonths - 1)) * 100 : 100;
  const widthPercent = Math.max(2, endPercent - startPercent);

  // Fechas del rango activo
  const startMonthLabel = allData[rangeStart]?.fullLabel || '';
  const endMonthLabel = allData[rangeEnd]?.fullLabel || '';
  const totalMonthsSelected = rangeEnd - rangeStart + 1;
  const yearsSpan = (totalMonthsSelected / 12).toFixed(1);

  return (
    <>
      {isMaximized && (
        <div
          onClick={() => setIsMaximized(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9990] transition-opacity duration-300"
        />
      )}
      <div
        className={`bg-container rounded-2xl shadow-sm flex flex-col gap-6 transition-all duration-300 ${isMaximized
          ? 'fixed inset-2 sm:inset-4 z-[9999] p-6 sm:p-8 overflow-y-auto shadow-2xl border border-[var(--color-neutral-400)] dark:border-neutral-700 bg-container'
          : 'w-full p-6'
          }`}
      >
        {/* Header del Card */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Título, driver tag y badge del rango activo */}
          <div className="flex items-center gap-3 flex-wrap">
            {!isMaximized ? (
              <div className="flex items-center gap-2">
                <div className="text-danger-main">
                  <CaralIcon name="screenChart" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  Gráfico Progresivo
                </h2>
              </div>
            ) : (
              <>
                {driver ? (
                  <div className="px-3 py-2 bg-neutral-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold bg-neutral-800 text-seidor-main dark:text-red-300 px-1.5 py-0.5 rounded">
                      {driver.code}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[220px]">
                      {driver.name}
                    </span>
                    <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full font-bold">
                      {(driver.accounts || driver.connections || []).length} cuentas asignadas
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl text-xs font-semibold  flex items-center gap-2 shadow-2xs text-neutral-900 font-bold ">
                    <CaralIcon name="filter" size={14} />
                    Todos los Drivers (Consolidado)
                  </div>
                )}

                <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <span>📅 {startMonthLabel} — {endMonthLabel}</span>
                  <span className="text-[10px] bg-blue-200 dark:bg-blue-800 px-1.5 py-0.2 rounded-full font-bold">
                    {yearsSpan} años ({totalMonthsSelected} meses)
                  </span>
                </div>

                {/* Si hay un driver activo, mostrar píldoras de las entidades o cuentas */}
                {driver && (
                  <div className="hidden xl:flex items-center gap-1.5 flex-wrap">
                    {(driver.entities || []).map((ent) => (
                      <span
                        key={ent.id}
                        className="inline-flex items-center gap-1 text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                        title={`${ent.name} - ${ent.percentage}%`}
                      >
                        {ent.color && (
                          <span
                            style={{ backgroundColor: ent.color }}
                            className="size-2 rounded-full shrink-0"
                          />
                        )}
                        <span className="truncate max-w-[120px]">{ent.name}</span>
                        <span className="font-bold text-seidor-main font-mono">({ent.percentage}%)</span>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Atajos Rápidos */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={isMaximized ? 'default' : 'ghost'}
              hasBorder
              isIconButton
              iconName={isMaximized ? 'arrowsMinimize' : 'arrowsMaximize'}
              className={isMaximized ? 'bg-seidor-main text-white' : 'border border-neutral-500'}
              title={isMaximized ? 'Restaurar tamaño (Esc)' : 'Ampliar al espacio total'}
              onClick={() => setIsMaximized(!isMaximized)}
            />

            <div className="flex items-center bg-[var(--color-neutral-500)] rounded-lg text-xs h-[40px] p-1 transition-all duration-300 ease-out shadow-xs">
              <div className="transition-transform duration-200 active:scale-95">
                <Button
                  variant='ghost'
                  isIconButton
                  iconName={isQuickRangesOpen ? 'x' : 'screenView'}
                  title={isQuickRangesOpen ? 'Cerrar vistas rápidas' : 'Vistas rápidas'}
                  onClick={() => setIsQuickRangesOpen(!isQuickRangesOpen)}
                />
              </div>

              <div
                className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out ${isQuickRangesOpen
                  ? 'max-w-[700px] opacity-100 pl-1 pr-1 translate-x-0'
                  : 'max-w-0 opacity-0 pointer-events-none -translate-x-2'
                  }`}
              >
                <button
                  onClick={() => setQuickRange(8)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${totalMonthsSelected === 8
                    ? 'bg-white dark:bg-neutral-700 text-seidor-main dark:text-white shadow-xs font-bold scale-[1.02]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                  8 meses (Mensual)
                </button>
                <button
                  onClick={() => setQuickRange(84)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${totalMonthsSelected === 84
                    ? 'bg-white dark:bg-neutral-700 text-seidor-main dark:text-white shadow-xs font-bold scale-[1.02]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  title="7 Años - Consolidado en 4 cuartos/año"
                >
                  7 Años (Trimestral)
                </button>
                <button
                  onClick={() => setQuickRange(180)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${totalMonthsSelected === 180
                    ? 'bg-white dark:bg-neutral-700 text-seidor-main dark:text-white shadow-xs font-bold scale-[1.02]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  title="15 Años - Consolidado en semestres"
                >
                  15 Años (Semestral)
                </button>
                <button
                  onClick={() => {
                    setRangeStart(0);
                    setRangeEnd(totalMonths - 1);
                  }}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${totalMonthsSelected === totalMonths
                    ? 'bg-white dark:bg-neutral-700 text-seidor-main dark:text-white shadow-xs font-bold scale-[1.02]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  title="Todo el historial (15 Años / Semestral)"
                >
                  Todo ({Math.round(totalMonths / 12)} Años)
                </button>
              </div>
            </div>

            <Button isIconButton iconName="arrowDownToLine" variant="info" />
          </div>
        </div>

        {/* Gráfico de Barras con Renderizado Dinámico */}
        <div className="w-full relative pt-4 pb-2">
          {/* Tooltip flotante al hacer hover */}
          {hoveredPoint && (
            <div className="absolute top-0 right-4 bg-[var(--color-neutral-full)] border border-[var(--color-neutral-400)] rounded-lg p-3 shadow-xl text-xs z-30 flex flex-col gap-1.5 pointer-events-none min-w-[210px]">
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 pb-1 font-bold text-[var(--color-neutral-900)] dark:text-white">
                <span>{hoveredPoint.fullLabel}</span>
                <span className="text-seidor-main dark:text-info-main">
                  ${hoveredPoint.total.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] pt-1">
                <span className="text-[#0191FF]">Compute: ${hoveredPoint.compute.toLocaleString()}</span>
                <span className="text-[#10B981]">Storage: ${hoveredPoint.storage.toLocaleString()}</span>
                <span className="text-[#F59E0B]">Database: ${hoveredPoint.database.toLocaleString()}</span>
                <span className="text-[#8B5CF6]">Other: ${hoveredPoint.other.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-neutral-800 pt-1 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">
                <span>Presupuesto objetivo:</span>
                <span className="font-semibold">${hoveredPoint.budget.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Eje de Barras Adaptable */}
          <div
            className={`grid gap-1.5 sm:gap-2.5 items-end px-2 border-b border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-800)] pb-2 relative transition-all duration-300 ${isMaximized ? 'h-[calc(100vh-380px)] min-h-[380px]' : 'h-[220px]'
              }`}
            style={{ gridTemplateColumns: `repeat(${displayData.length}, minmax(0, 1fr))` }}
          >
            {displayData.map((item) => {
              const isHovered = hoveredPoint?.id === item.id;
              const currentTotal = activeCategory === 'all' ? item.total : item[activeCategory];
              const heightPercent = Math.max(6, (currentTotal / (maxTotalInPeriod * 1.15)) * 100);

              const computePct = (item.compute / item.total) * 100;
              const storagePct = (item.storage / item.total) * 100;
              const dbPct = (item.database / item.total) * 100;
              const otherPct = (item.other / item.total) * 100;

              const showTopLabel = displayData.length <= 20 || isHovered;

              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  onMouseEnter={() => setHoveredPoint(item)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Línea azul (info-main) marcando el inicio del año (en modo mensual, trimestral o semestral) */}
                  {item.isYearStart && granularity !== 'annual' && (
                    <div className="absolute top-0 bottom-0 left-0 w-0 border-l-2 border-dashed border-[var(--color-info-main)] pointer-events-none z-10 flex flex-col justify-between items-start">
                      <span className="text-[9px] font-extrabold text-white bg-[var(--color-info-main)] px-1 py-0.5 rounded shadow-xs -translate-x-1/2 -mt-4 whitespace-nowrap">
                        {item.year}
                      </span>
                    </div>
                  )}

                  {/* Monto encima de la barra */}
                  {showTopLabel && (
                    <span
                      className={`text-[10px] font-semibold mb-1 transition-all duration-200 truncate ${isHovered
                        ? "text-seidor-main dark:text-info-main scale-110 font-bold"
                        : "text-neutral-800 opacity-80"
                        }`}
                    >
                      ${(currentTotal / 1000).toFixed(1)}k
                    </span>
                  )}

                  {/* Barra apilada o filtrada */}
                  <div
                    className={`w-full max-w-[48px] rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-200 shadow-2xs ${isHovered ? "ring-2 ring-seidor-main scale-x-110" : "hover:opacity-95"
                      }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {activeCategory === 'all' ? (
                      <>
                        <div
                          style={{ height: `${computePct}%` }}
                          className="bg-[#0191FF] w-full transition-all"
                          title={`Compute: $${item.compute.toLocaleString()}`}
                        />
                        <div
                          style={{ height: `${storagePct}%` }}
                          className="bg-[#10B981] w-full transition-all"
                          title={`Storage: $${item.storage.toLocaleString()}`}
                        />
                        <div
                          style={{ height: `${dbPct}%` }}
                          className="bg-[#F59E0B] w-full transition-all"
                          title={`Database: $${item.database.toLocaleString()}`}
                        />
                        <div
                          style={{ height: `${otherPct}%` }}
                          className="bg-[#8B5CF6] w-full transition-all"
                          title={`Other: $${item.other.toLocaleString()}`}
                        />
                      </>
                    ) : (
                      <div
                        className={`w-full h-full transition-all ${activeCategory === 'compute'
                          ? 'bg-[#0191FF]'
                          : activeCategory === 'storage'
                            ? 'bg-[#10B981]'
                            : activeCategory === 'database'
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#8B5CF6]'
                          }`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Eje X de Etiquetas */}
          <div
            className="grid gap-1.5 sm:gap-2.5 pt-3 px-2 text-center"
            style={{ gridTemplateColumns: `repeat(${displayData.length}, minmax(0, 1fr))` }}
          >
            {displayData.map((item, idx) => {
              const step = displayData.length > 50 ? 4 : displayData.length > 25 ? 2 : 1;
              const isVisible = item.isYearStart || idx % step === 0 || idx === displayData.length - 1;

              return (
                <div key={item.id} className="min-w-0">
                  <span
                    className={`text-[10px] sm:text-xs block truncate transition-colors ${item.isYearStart && granularity !== 'annual'
                      ? "text-[var(--color-info-main)] font-extrabold underline decoration-2 underline-offset-2"
                      : hoveredPoint?.id === item.id
                        ? "text-seidor-main-text dark:text-white font-bold"
                        : "text-neutral-600 dark:text-neutral-400"
                      } ${!isVisible ? 'hidden' : ''}`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TIMELINE RANGE SLIDER ESTILO ADOBE PREMIERE                               */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-800 px-1 font-medium">
            <span>{allData[0]?.year || 2011} (Inicio histórico)</span>

            {/* Badge de Granularidad Activa */}
            <div className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>{granularityLabel}</span>
            </div>

            <span>{allData[allData.length - 1]?.year || 2025} (Actual)</span>
          </div>

          <div
            ref={sliderTrackRef}
            className="relative w-full h-[28px] bg-[var(--color-neutral-300)]/60 dark:bg-neutral-800 rounded-full flex items-center px-1 select-none overflow-visible shadow-inner"
          >
            {/* Marcas anuales de referencia en la pista */}
            <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-0.5 h-2 bg-neutral-800 rounded-full" />
              ))}
            </div>

            {/* Ventana de selección activa */}
            <div
              className="absolute top-0 bottom-0 flex items-center justify-between z-10"
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                minWidth: '36px',
              }}
            >
              {/* Manejador Izquierdo */}
              <div
                onMouseDown={(e) => handleMouseDown('left', e)}
                className="w-[26px] h-[26px] rounded-full bg-[#8E9CAE] hover:bg-[#6D7D93] active:bg-seidor-main border-2 border-white dark:border-neutral-900 shadow-md cursor-ew-resize flex items-center justify-center shrink-0 -ml-[13px] z-20 transition-transform hover:scale-110"
                title="Arrastra para expandir/contraer el inicio del rango"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Barra conectora central */}
              <div
                onMouseDown={(e) => handleMouseDown('middle', e)}
                className="flex-1 h-[22px] mx-[-6px] bg-[#D7DFE9] dark:bg-neutral-600/80 hover:bg-[#C8D3E2] active:bg-[#BAC8DB] rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors shadow-2xs border border-[#CBD5E1] dark:border-neutral-800"
                title="Arrastra horizontalmente para mover la ventana de tiempo"
              >
                <div className="flex gap-1 items-center opacity-60">
                  <span className="w-1 h-2.5 bg-neutral-800 rounded-full" />
                  <span className="w-1 h-2.5 bg-neutral-800 rounded-full" />
                  <span className="w-1 h-2.5 bg-neutral-800 rounded-full" />
                </div>
              </div>

              {/* Manejador Derecho */}
              <div
                onMouseDown={(e) => handleMouseDown('right', e)}
                className="w-[26px] h-[26px] rounded-full bg-[#8E9CAE] hover:bg-[#6D7D93] active:bg-seidor-main border-2 border-white dark:border-neutral-900 shadow-md cursor-ew-resize flex items-center justify-center shrink-0 -mr-[13px] z-20 transition-transform hover:scale-110"
                title="Arrastra para expandir/contraer el final del rango"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Leyenda interactiva y Métricas resumidas */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)] text-xs text-neutral-600 dark:text-neutral-400">
          {/* Filtros por Categoría */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-semibold text-neutral-800 mr-1">Filtrar:</span>
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${activeCategory === 'all'
                ? 'bg-neutral-500 text-neutral-900 font-bold border-transparent'
                : 'text-neutral-900 border-neutral-300 hover:bg-neutral-500'
                }`}
            >
              <span>Todos</span>
            </button>
            <button
              onClick={() => setActiveCategory('compute')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${activeCategory === 'compute'
                ? 'bg-neutral-500 text-neutral-900 font-bold border-transparent'
                : 'text-neutral-900 border-neutral-300 hover:bg-neutral-500'
                }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0191FF]" />
              <span>Compute</span>
            </button>
            <button
              onClick={() => setActiveCategory('storage')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${activeCategory === 'storage'
                ? 'bg-neutral-500 text-neutral-900 font-bold border-transparent'
                : 'text-neutral-900 border-neutral-300 hover:bg-neutral-500'
                }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>Storage</span>
            </button>
            <button
              onClick={() => setActiveCategory('database')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${activeCategory === 'database'
                ? 'bg-neutral-500 text-neutral-900 font-bold border-transparent'
                : 'text-neutral-900 border-neutral-300 hover:bg-neutral-500'
                }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span>Database</span>
            </button>
            <button
              onClick={() => setActiveCategory('other')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${activeCategory === 'other'
                ? 'bg-neutral-500 text-neutral-900 font-bold border-transparent'
                : 'text-neutral-900 border-neutral-300 hover:bg-neutral-500'
                }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span>Otros</span>
            </button>
          </div>

          {/* Resumen del período seleccionado */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-neutral-800 block">Total en ventana:</span>
              <span className="font-bold text-[var(--color-neutral-900)] dark:text-white text-sm">
                ${totalPeriodSpend.toLocaleString()}
              </span>
            </div>
            <div className="border-l border-neutral-300 dark:border-neutral-700 pl-4">
              <span className="text-xs text-neutral-800 block">Promedio por barra:</span>
              <span className="font-bold text-info-main text-sm">
                ${averagePointSpend.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
