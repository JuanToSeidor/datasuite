"use client";

import React, { useState } from 'react';
import { Button } from 'caralstable';
import { suiteConfig } from '@/config/suite';
import { useNewsData } from '@/hooks/useNewsData';

export function NewsBanner() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: newsData } = useNewsData();

  let latestVersion = "1.10.0";
  let latestLink = "";
  if (newsData) {
    const sortedReleases = Object.values(newsData).sort((a: any, b: any) => b.version.localeCompare(a.version));
    if (sortedReleases.length > 0) {
      const latest = sortedReleases[0] as any;
      latestVersion = latest.version;
      latestLink = latest.link;
    }
  }

  if (isCollapsed) {
    return (
      <div
        className="relative bg-[var(--color-seidor-main)] border border-[var(--color-neutral-800)] border-solid flex items-center justify-between overflow-clip rounded-[12px] w-full px-[24px] py-[16px] cursor-pointer hover:bg-[var(--color-neutral-900)] transition-colors"
        onClick={() => setIsCollapsed(false)}
      >
        {/* Subtle background highlight to match the screenshot vibe */}
        <div className="absolute left-0 top-0 bottom-0 w-1/2 pointer-events-none bg-gradient-to-r from-[var(--color-neutral-100)] to-[var(--color-neutral-100)]" />

        <h2 className="text-base font-bold text-[var(--color-neutral-100)] relative z-10 flex items-center">
          What's new in
          <span className="text-transparent bg-clip-text relative bg-[linear-gradient(90deg,_var(--color-info-light),_var(--color-info-main))] ml-1">
            {suiteConfig.name}
          </span>
        </h2>

        <div className="relative z-10 pointer-events-none">
          <Button iconName="arrowDown" variant="ghost" className='text-[var(--color-neutral-100)]!' />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#07153a] border border-[var(--color-neutral-500)]! border-solid content-stretch flex flex-col gap-[16px] items-center justify-center overflow-clip relative rounded-[30px] shrink-0 w-full py-[40px]">

      <style>{`
        @keyframes sweepArc {
          0% { left: -20%; transform: translateY(80px) rotate(-15deg); filter: blur(0px); }
          50% { left: 50%; transform: translateX(-50%) translateY(-20px) rotate(30deg) ; filter: blur(60px); }
          100% { left: 120%; transform: translateY(80px) rotate(15deg); filter: blur(0px); }
        }
        .animate-sweep-arc {
          animation: sweepArc 20s linear infinite alternate;
        }
      `}</style>
      <img src="/haz/4.png" alt="" className='absolute bottom-0 w-[700px] h-[700px] z-0 animate-sweep-arc opacity-50' />

      <div className="absolute! top-2 right-2 content-stretch flex items-center justify-end overflow-clip p-[10px] relative shrink-0 z-10">
        <Button isIconButton iconName="x" variant="ghost" className='text-[var(--color-neutral-100)]!' onClick={() => setIsCollapsed(true)} />
      </div>

      <h2 className="text-4xl font-extrabold text-[var(--color-neutral-100)]">
        What's new in
        <span className="text- text-4xl font-extrabold text-transparent bg-clip-text relative bg-[linear-gradient(90deg,_var(--color-info-light),_var(--color-info-main))]  ml-2">
          {suiteConfig.name}
        </span>
      </h2>

      <div className="content-stretch flex flex-col items-center relative shrink-0 text-[var(--color-neutral-100)] whitespace-nowrap text-center">
        <p className="font-semibold leading-7 relative shrink-0 text-xl tracking-tight">
          Find out about the latest news we bring for your team.
        </p>
        <p className="font-normal leading-6 relative shrink-0 text-base mt-2 opacity-80">
          V{latestVersion}
        </p>
      </div>

      <div className="mt-2">
        <a
          href={latestLink ? `https://crestone-help.seidoranalytics.com/docs/releasenotes/${latestLink}` : '#'}
          target={latestLink ? "_blank" : undefined}
          rel="noopener noreferrer"
        >
          <Button variant="info">
            See now
          </Button>
        </a>
      </div>

    </div>
  );
}
