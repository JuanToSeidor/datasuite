"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/icons";
import { Button } from "caralstable";
import { Select } from "@/components/ui/Select";
import { SourceInventoryResults } from "@/components/preserve/sources/SourceInventoryResults";
import { useLanguage } from "@/contexts/LanguageContext";
import sourcesData from "@/data/preserve/sources.json";
import inventoryData from "@/data/preserve/inventory.json";

interface SapConnection {
  id: string;
  name: string;
  product: string;
  environment: "production";
  client: string;
  health: "healthy";
  verifiedAt: string;
}

const connections = sourcesData.sapConnections as SapConnection[];

function fill(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    template
  );
}

export default function PreserveSourcesPage() {
  const { dict } = useLanguage();
  const t = dict.preserve.sources;
  const [selectedId, setSelectedId] = useState<string>("");
  const [scannedId, setScannedId] = useState<string | null>(null);

  const options = useMemo(
    () => connections.map((c) => ({ value: c.id, label: c.name })),
    []
  );

  const selected = connections.find((c) => c.id === selectedId);
  const scanned = scannedId !== null;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-col rounded-2xl bg-container px-4 py-3">
        <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
        <p className="text-sm text-neutral-800">{t.subtitle}</p>
      </header>

      {!scanned ? (
        /* Paso 2: elegir origen */
        <section className="mx-auto flex w-full max-w-[780px] flex-col gap-3 rounded-2xl bg-container p-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-neutral-900">{t.selectTitle}</h2>
            <p className="text-sm text-neutral-800">{t.selectSubtitle}</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-neutral-900">{t.sapConnection}</label>
            <Select
              options={options}
              value={selectedId || undefined}
              onValueChange={(value) => setSelectedId(String(value))}
              placeholder={t.placeholder}
              className="min-h-[44px]!"
            />
          </div>

          {selected && (
            <div className="flex flex-col gap-2 rounded-xl border-2 border-success-main bg-success-light p-4">
              <div className="flex items-center gap-2">
                <Brand name="SAP" size={22} />
                <span className="text-lg font-bold text-success-main">{selected.name}</span>
              </div>
              <p className="font-semibold text-neutral-900">
                {fill(t.summaryMeta, {
                  product: selected.product,
                  environment: t.environments[selected.environment],
                  client: selected.client,
                })}
              </p>
              <p className="text-sm text-neutral-900">
                {t.health[selected.health]} · {fill(t.verifiedAt, { time: selected.verifiedAt })}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="success" disabled={!selected} onClick={() => setScannedId(selectedId)}>
              {t.scan}
            </Button>
          </div>

          <div className="border-t border-neutral-300 pt-3">
            <Link href="/connections/new" className="text-sm font-medium text-info-main hover:underline">
              {t.registerLink}
            </Link>
          </div>
        </section>
      ) : (
        /* Paso 3: resultados del escaneo */
        <>
          <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-container p-4">
            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <label className="text-sm font-semibold text-neutral-900">{t.results.type}</label>
              <Select
                brand="SAP"
                options={[{ value: "s4hana", label: "SAP S/4HANA" }]}
                value="s4hana"
              />
            </div>
            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <label className="text-sm font-semibold text-neutral-900">{t.sapConnection}</label>
              <Select
                options={options}
                value={scannedId ?? undefined}
                onValueChange={(value) => setScannedId(String(value))}
              />
            </div>
            <Button variant="success">{t.results.scanAgain}</Button>
          </div>

          <SourceInventoryResults
            key={scannedId}
            tables={inventoryData.tables as Parameters<typeof SourceInventoryResults>[0]["tables"]}
            scan={inventoryData.scan}
          />
        </>
      )}
    </div>
  );
}
