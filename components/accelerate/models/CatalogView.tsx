"use client";

import React, { useMemo, useState } from "react";
import { Button, Drawer } from "caralstable";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { CatalogCard } from "./CatalogCard";
import type { AccelerateCatalogItem, AccelerateModel } from "../types";

type Availability = AccelerateCatalogItem["availability"];

interface CatalogFilters {
  contractedOnly: boolean;
  platforms: string[];
  availability: Availability[];
}

const EMPTY_FILTERS: CatalogFilters = { contractedOnly: false, platforms: [], availability: [] };

const toggle = <V,>(list: V[], value: V) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

interface CatalogViewProps {
  catalog: AccelerateCatalogItem[];
  models: AccelerateModel[];
  onViewDetail: (item: AccelerateCatalogItem) => void;
  onDeploy: (item: AccelerateCatalogItem) => void;
}

/** Píldora de filtro activable (Button Caral en forma de pill). */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button variant={active ? "warning" : "light"} hasBorder isPill size="sm" onClick={onClick} aria-pressed={active}>
      {label}
    </Button>
  );
}

export function CatalogView({ catalog, models, onViewDetail, onDeploy }: CatalogViewProps) {
  const { dict } = useLanguage();
  const t = dict.accelerate.models;

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const platforms = useMemo(() => Array.from(new Set(catalog.flatMap((c) => c.platforms))), [catalog]);

  const deploymentsByCatalog = useMemo(() => {
    const map: Record<string, { total: number; active: number }> = {};
    models.forEach((m) => {
      map[m.catalogId] ??= { total: 0, active: 0 };
      map[m.catalogId].total += 1;
      if (m.status === "active") map[m.catalogId].active += 1;
    });
    return map;
  }, [models]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (filters.contractedOnly && !item.contracted) return false;
      if (filters.platforms.length && !filters.platforms.some((p) => item.platforms.includes(p))) return false;
      if (filters.availability.length && !filters.availability.includes(item.availability)) return false;
      if (!q) return true;
      return [item.name, item.code, item.area, ...item.sapTables].some((v) => v.toLowerCase().includes(q));
    });
  }, [catalog, filters, search]);

  const activeFilterCount =
    Number(filters.contractedOnly) + filters.platforms.length + filters.availability.length;

  const quickFilters = (
    <>
      <FilterPill
        label={t.filterContracted}
        active={filters.contractedOnly}
        onClick={() => setFilters((f) => ({ ...f, contractedOnly: !f.contractedOnly }))}
      />
      {platforms.map((p) => (
        <FilterPill
          key={p}
          label={p}
          active={filters.platforms.includes(p)}
          onClick={() => setFilters((f) => ({ ...f, platforms: toggle(f.platforms, p) }))}
        />
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-3 font-poppins">
      {/* Barra de filtros + búsqueda */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-800">{t.filtersLabel}</span>
          {quickFilters}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-64 sm:w-80">
            <Input
              iconName="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchCatalog}
            />
          </div>
          <Button
            variant="warning"
            isIconButton
            iconName="filter"
            onClick={() => setIsFilterDrawerOpen(true)}
            title={activeFilterCount ? `${t.advancedFilters} (${activeFilterCount})` : t.advancedFilters}
            aria-label={t.advancedFilters}
          />
        </div>
      </div>

      {/* Tarjetas */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filtered.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              deployments={deploymentsByCatalog[item.id] ?? { total: 0, active: 0 }}
              onViewDetail={onViewDetail}
              onDeploy={onDeploy}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-container p-10 text-center">
          <p className="text-sm text-neutral-800">{t.noResults}</p>
          <Button variant="light" hasBorder size="sm" onClick={() => { setFilters(EMPTY_FILTERS); setSearch(""); }}>
            {dict.common.clearFilters}
          </Button>
        </div>
      )}

      {/* Drawer de filtros (montado solo cuando está abierto) */}
      {isFilterDrawerOpen && (
        <Drawer isOpen onClose={() => setIsFilterDrawerOpen(false)} title={t.advancedFilters} size="md">
          <div className="flex flex-col gap-6 font-poppins">
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">{t.filterAvailability}</h3>
              <div className="flex flex-wrap gap-2">
                {(["available", "comingSoon"] as Availability[]).map((a) => (
                  <FilterPill
                    key={a}
                    label={a === "available" ? t.available : t.comingSoon}
                    active={filters.availability.includes(a)}
                    onClick={() => setFilters((f) => ({ ...f, availability: toggle(f.availability, a) }))}
                  />
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">{t.filterLicense}</h3>
              <div className="flex flex-wrap gap-2">{quickFilters}</div>
            </section>
            <div className="flex justify-end gap-2">
              <Button variant="light" hasBorder onClick={() => setFilters(EMPTY_FILTERS)}>
                {dict.common.clearFilters}
              </Button>
              <Button variant="warning" onClick={() => setIsFilterDrawerOpen(false)}>
                {dict.common.apply}
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
