"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "caralstable";
import { VaultsTable } from "@/components/preserve/vaults";
import type { PreserveVaultsData, Vault } from "@/components/preserve/vaults";
import { useLanguage } from "@/contexts/LanguageContext";
import vaultsData from "@/data/preserve/vaults.json";

const data = vaultsData as PreserveVaultsData;

export default function PreserveVaultsPage() {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.preserve.vaults;

  const openVault = useCallback((vault: Vault) => router.push(`/preserve/vaults/${vault.id}`), [router]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <Button variant="success" iconName="plus">
          {t.newExtraction}
        </Button>
      </header>

      <section className="rounded-2xl bg-container p-4">
        <VaultsTable vaults={data.vaults} onOpen={openVault} />
      </section>
    </div>
  );
}
