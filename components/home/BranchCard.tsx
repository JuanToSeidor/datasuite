"use client";

import React from 'react';
import { Branch, suiteConfig } from '@/config/suite';
import { Button } from 'caralstable';
import { CrestoneLogo } from '../icons';
import Link from 'next/link';

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="border bg-container  content-stretch flex flex-col gap-[10px] items-start justify-self-stretch overflow-clip p-4 relative rounded-lg self-stretch shrink-0 hover:shadow-lg transition-shadow">

      <div className="flex gap-2 items-center">
        <div
          className="content-stretch flex flex-col items-start overflow-clip p-[10px] relative rounded-[8px] shrink-0"
          style={{
            background: `linear-gradient(-145deg, ${branch.color} 0%, color-mix(in srgb, ${branch.color} 85%, black) 100%)`,
          }}
        >
          <CrestoneLogo size={24} accentColor="#fff" bodyColor="#fff" />
        </div>
        <p className="font-semibold leading-8 relative shrink-0 text-2xl tracking-tight whitespace-nowrap">
          {branch.title}
        </p>
      </div>

      <div className="content-stretch flex flex-[1_0_0] flex-col items-start  relative text-neutral-900 w-full mt-2">

        <p className="font-normal leading-6 min-w-full relative shrink-0 text-base">
          {branch.description}
        </p>
      </div>

      <div className="w-full flex justify-end mt-6 gap-2">
        <Button
          variant='ghost'
          className='font-light! text-neutral-800! hover:text-neutral-900! '
        >
          Mas info
        </Button>
        <Link href={branch.href || "#"}>
          <Button variant="ghost" className="border border-neutral-800 hover:bg-seidor-main! hover:text-white! transition-all">
            {branch.title === 'Profile' ? 'Probar' : 'Iniciar'}
          </Button>
        </Link>
      </div>

    </div>
  );
}
