"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { ArchivePanel, type TransactionArchive } from "@/components/preserve/transactions/ArchivePanel";
import { useLanguage } from "@/contexts/LanguageContext";
import transactionsData from "@/data/preserve/transactions.json";

interface SapTransaction {
  code: string;
  module: string;
  description: string;
}

const archives = transactionsData.archives as TransactionArchive[];
const transactions = transactionsData.transactions as SapTransaction[];
/** Módulos en el orden en que aparecen en el catálogo (FI, MM, …). */
const modules = [...new Set(transactions.map((tx) => tx.module))];

const COLLAPSED_KEY = "preserve_transactions_collapsed";
const MAX_SUGGESTIONS = 8;

/** Pantalla del usuario final: reproducir transacciones SAP sobre el archivo histórico. */
export default function PreserveTransactionsPage() {
  const { dict } = useLanguage();
  const t = dict.preserve.transactions;

  const [archiveId, setArchiveId] = useState(archives[0].id);
  const archive = archives.find((a) => a.id === archiveId) ?? archives[0];
  // Recientes por archivo: arrancan del mock y se suman las transacciones elegidas.
  const [recentByArchive, setRecentByArchive] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(archives.map((a) => [a.id, a.recent])),
  );

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      /* sin storage: arranca expandido */
    }
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
      } catch {
        /* noop */
      }
      return !prev;
    });

  const [query, setQuery] = useState("");
  const [moduleIndex, setModuleIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cierra las sugerencias al hacer clic fuera del buscador.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const moduleTabs = useMemo(
    () => [
      { label: t.allModules },
      ...modules.map((m) => ({ label: `${m} - ${transactions.filter((tx) => tx.module === m).length}` })),
    ],
    [t.allModules],
  );
  const selectedModule = moduleIndex === 0 ? null : modules[moduleIndex - 1];

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((tx) => !selectedModule || tx.module === selectedModule)
      .filter((tx) => {
        if (!q) return true;
        return tx.code.toLowerCase().includes(q) || tx.description.toLowerCase().includes(q);
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [query, selectedModule]);

  const chooseTransaction = (tx: SapTransaction) => {
    const label = `${tx.code} · ${tx.description}`;
    setQuery(label);
    setIsFocused(false);
    setRecentByArchive((prev) => ({
      ...prev,
      [archive.id]: [label, ...(prev[archive.id] ?? []).filter((r) => r !== label)].slice(0, 6),
    }));
  };

  return (
    <div className="flex min-h-full w-full flex-1 gap-2.5 font-poppins">
      <ArchivePanel
        archives={archives}
        archive={archive}
        onArchiveChange={setArchiveId}
        recent={recentByArchive[archive.id] ?? []}
        onRecentClick={(item) => {
          setQuery(item);
          inputRef.current?.focus();
        }}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
      />

      <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[30px] rounded-lg bg-container px-6 py-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">{t.heading}</h2>
          <p className="text-base text-neutral-900">{t.description}</p>
        </div>

        <div ref={searchRef} className="relative w-full max-w-[996px]">
          <div className="flex items-center gap-2.5 rounded-[9px] border-2 border-success-main bg-container p-2.5 shadow-[0_0_11px_0_var(--color-success-main)]">
            <span className="shrink-0 text-neutral-900">
              <CaralIcon name="search" size={24} color="currentColor" />
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions[0]) chooseTransaction(suggestions[0]);
                if (e.key === "Escape") setIsFocused(false);
              }}
              placeholder={t.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-800"
            />
            <Button
              variant="light"
              size="sm"
              hasBorder
              className="shrink-0"
              onClick={() => {
                if (suggestions[0]) chooseTransaction(suggestions[0]);
                else inputRef.current?.focus();
              }}
            >
              {t.searchButton}
            </Button>
          </div>

          {isFocused && (
            <div className="absolute inset-x-0 top-[calc(100%+8px)] z-10 flex max-h-80 flex-col overflow-y-auto rounded-xl border border-neutral-300 bg-container py-1.5 shadow-xl">
              {suggestions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-neutral-800">{t.noResults}</p>
              ) : (
                suggestions.map((tx) => (
                  // Opción de lista (código + descripción + módulo en una fila): mismo patrón que el Select del proyecto.
                  <button
                    key={tx.code}
                    type="button"
                    onClick={() => chooseTransaction(tx)}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-neutral-100"
                  >
                    <span className="w-32 shrink-0 font-mono font-semibold text-neutral-900">{tx.code}</span>
                    <span className="flex-1 truncate text-neutral-800">{tx.description}</span>
                    <span className="text-xs font-semibold text-neutral-800">{tx.module}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <Tabs tabs={moduleTabs} activeIndex={moduleIndex} onChange={setModuleIndex} />
      </section>
    </div>
  );
}
