"use client";

import React, { useState } from 'react';
import { NewsBanner } from '@/components/home/NewsBanner';
import { BranchCard } from '@/components/home/BranchCard';
import { suiteConfig } from '@/config/suite';
import { Tabs } from 'caralstable';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const TABS = [
    { label: 'Todos' },
    { label: 'Destacados' },
    { label: 'AI generativa' },
    { label: 'Propios' },
    { label: 'Nuevas tendencias' },
    { label: 'Tecnología emergente' },
    { label: 'Colaboraciones' },
    { label: 'Proyectos futuros' }
  ];

  const filteredBranches = (!suiteConfig.enableTagDiscrimination || TABS[activeTab].label === 'Todos')
    ? suiteConfig.branches
    : suiteConfig.branches.filter(branch =>
      branch.tags?.includes(TABS[activeTab].label)
    );

  return (
    <>

      <NewsBanner />

      <div className="content-stretch flex flex-col gap-[20px] items-start relative w-full  rounded-lg">


        {suiteConfig.enableTagDiscrimination ? (
          <div className="bg-[var(--color-neutral-500)] content-stretch flex gap-[10px] items-start overflow-clip p-[10px] relative rounded-[10px] shrink-0 overflow-x-auto">
            <Tabs
              activeIndex={activeTab}
              onChange={(index) => setActiveTab(index)}
              tabs={TABS}
            />
          </div>
        ) : (
          <div className="w-full">
            <h2 className="text-[var(--color-neutral-900)] text-xl font-semibold">
              All apps in {suiteConfig.name}
            </h2>
            <p className="text-[var(--color-neutral-800)]">
              Browse all the apps available in {suiteConfig.name}, each designed to help you
            </p>

          </div>
        )}

        <div className="gap-[10px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
          {filteredBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}

          {filteredBranches.length === 0 && (
            <div className="col-span-full py-10 text-center text-[var(--color-neutral-800)]">
              No hay productos disponibles en esta categoría.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
