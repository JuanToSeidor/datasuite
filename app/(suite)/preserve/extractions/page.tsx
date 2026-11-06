"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "caralstable";
import { ExtractionsTable } from "@/components/preserve/extractions";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PreserveExtractionsPage() {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.preserve.extractions;

  const openExtraction = useCallback(
    (id: string) => router.push(`/preserve/extractions/${id}`),
    [router],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      {/* Encabezado */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <Button variant="success" iconName="plus" onClick={() => router.push("/preserve/extractions/new")}>
          {t.newExtraction}
        </Button>
      </header>

      <section className="rounded-2xl bg-container p-4">
        <ExtractionsTable onOpen={openExtraction} />
      </section>
    </div>
  );
}
