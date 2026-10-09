"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from 'caralstable';
import { CaralIcon } from '@/components/icons';
import { DriverItem } from '@/components/optimize/drivers/DriverAllocationRow';
import { DriversTable } from '@/components/optimize/drivers/DriversTable';
import { NewDriverDrawer } from '@/components/optimize/drivers/NewDriverDrawer';

import driversRawData from '@/data/drivers.json';
import { useLanguage } from '@/contexts/LanguageContext';

const INITIAL_DRIVERS: DriverItem[] = driversRawData as DriverItem[];

export default function OptimizeDriversPage() {
  const { dict } = useLanguage();
  const [drivers, setDrivers] = useState<DriverItem[]>(INITIAL_DRIVERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.accounts && d.accounts.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (d.entities && d.entities.some((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (d.connections && d.connections.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleUpdateDriver = (updated: DriverItem) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const handleCreateDriver = (newDriver: DriverItem) => {
    setDrivers((prev) => [newDriver, ...prev]);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header (Figma Frame 58) */}
      <div className="flex flex-wrap items-end justify-between gap-4 ">
        <div>
          <div className="flex items-center gap-2 text-seidor-main-text">
            <CaralIcon name="bolt" />
            <h1 className="text-3xl font-extrabold tracking-tight">
              Drivers
            </h1>
          </div>
          <p className="text-sm text-neutral-800">
            Manage your drivers to distribute your consumption. Haz clic en el ícono de engranaje (⚙) para ajustar el prorrateo.
          </p>
        </div>

        {/* Action Controls (Figma Frame 73) */}
        <div className="flex items-center gap-2.5">
          {/*Buscador */}
          <div className="relative">
            <div className="absolute inset-y-1 left-0 pl-3 flex items-center pointer-events-none">
              <span className='text-neutral-800'>
                <CaralIcon name="search" size={16} />
              </span>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10! pr-2 py-2 text-sm rounded-lg bg-container border border-neutral-800 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <Button
            variant="info"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 shadow-xs hover:shadow-md transition-all"
            onClick={() => setIsNewDrawerOpen(true)}
          >
            <CaralIcon name="plus" size={18} />
            <span>Add Driver</span>
          </Button>
        </div>
      </div>


      <div className=''>

        {/* Drivers Data Table & Allocation Panel (Figma Frames 75 & 103:2685) */}
        <section className="w-full mt-4 ">
          <DriversTable
            drivers={filteredDrivers}
            onUpdateDriver={handleUpdateDriver}
          />
        </section>

        {/* Drawer to Create New Driver */}
        <NewDriverDrawer
          isOpen={isNewDrawerOpen}
          onClose={() => setIsNewDrawerOpen(false)}
          onCreate={handleCreateDriver}
        />
      </div>
    </div>
  );
}
