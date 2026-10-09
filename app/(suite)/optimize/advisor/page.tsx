"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from 'caralstable';
import { CaralIcon } from '@/components/icons';

export default function OptimizeAdvisorPage() {
  return (
    <div className="w-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-800)]">
        <div>
          <h1 className="text-3xl font-extrabold text-seidor-main-text dark:text-white tracking-tight">
            Advisor
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Recomendaciones inteligentes para reducción de costos, right-sizing y Reserved Instances.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-container-50)] dark:bg-[var(--color-neutral-900)] border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-800)] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500">
          <CaralIcon name="magic" size={36} />
        </div>
        <h3 className="text-xl font-bold text-[var(--color-neutral-900)] dark:text-white">
          Optimize Cost Advisor
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
          Sugerencias automatizadas basadas en IA para eliminar recursos ociosos y optimizar planes de ahorro.
        </p>
        <Link href="/optimize">
          <Button variant="ghost" className="mt-2">
            ← Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
