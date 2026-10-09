"use client";

import React, { useState } from "react";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";

export function LicenseTab() {
  const [isKeyCopied, setIsKeyCopied] = useState(false);
  const licenseKey = "CST-ENT-2026-9482-A74B-EE19-SEIDOR";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-8 text-left font-poppins">
      {/* ========================================================= */}
      {/* 1. SECCIÓN: SUBSCRIPTION & PLAN SUMMARY                  */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6 border-b border-neutral-500">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-neutral-900 text-base">
              Enterprise License & Subscription
            </h4>
            <Chip variant="success" label="Active" hasBorder status="success" />
          </div>
          <p className="text-xs text-neutral-800 mt-0.5">
            Details of your organization&apos;s active commercial tier, node allocations, and support SLA.
          </p>
        </div>

        {/* License Hero Card */}
        <div className="p-6 rounded-xl bg-neutral-500 border border-neutral-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ml-0 sm:ml-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-seidor-light/30 text-seidor-main flex items-center justify-center shrink-0">
              <CaralIcon name="key" size={24} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-900">
                  Crestone Enterprise Suite
                </h3>
                <Chip variant="info" label="Annual Tier" hasBorder />
              </div>
              <p className="text-xs text-neutral-800">
                Licensed to: <strong className="text-neutral-900">Seidor Analytics Enterprise Corp</strong>
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs text-neutral-800">
                <span className="bg-container px-2 py-0.5 rounded border border-neutral-400 select-all">
                  {licenseKey}
                </span>
                <Button
                  variant={isKeyCopied ? "success" : "ghost"}
                  size="sm"
                  hasBorder
                  iconName={isKeyCopied ? "check" : "copy"}
                  onClick={handleCopyKey}
                  className="!p-1 h-7"
                >
                  {isKeyCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="text-left sm:text-right space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-neutral-800 font-semibold block">
                Valid Until
              </span>
              <span className="text-sm font-bold text-neutral-900 block">
                31 Dec 2026
              </span>
              <span className="text-[11px] text-success-main font-medium block">
                Auto-renewal active
              </span>
            </div>
          </div>
        </div>

        {/* Capacity & Allocation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-0 sm:ml-4">
          {/* User Seats */}
          <div className="p-4 rounded-xl bg-neutral-500 border border-neutral-400 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800">Licensed User Seats</span>
              <CaralIcon name="users" size={16} classname="text-neutral-800" />
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900">18</span>
                <span className="text-xs text-neutral-800 font-medium">/ 50 seats</span>
              </div>
              <div className="w-full bg-container h-2 rounded-full overflow-hidden border border-neutral-400">
                <div className="bg-seidor-main h-full rounded-full w-[36%]" />
              </div>
              <p className="text-[11px] text-neutral-800 pt-0.5">32 seats remaining available</p>
            </div>
          </div>

          {/* Extraction Nodes */}
          <div className="p-4 rounded-xl bg-neutral-500 border border-neutral-400 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800">Extraction Nodes</span>
              <CaralIcon name="job" size={16} classname="text-neutral-800" />
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900">4</span>
                <span className="text-xs text-neutral-800 font-medium">/ 8 nodes</span>
              </div>
              <div className="w-full bg-container h-2 rounded-full overflow-hidden border border-neutral-400">
                <div className="bg-info-main h-full rounded-full w-[50%]" />
              </div>
              <p className="text-[11px] text-neutral-800 pt-0.5">4 high-throughput nodes active</p>
            </div>
          </div>

          {/* Support Level */}
          <div className="p-4 rounded-xl bg-neutral-500 border border-neutral-400 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800">Support Level</span>
              <CaralIcon name="shieldHalved" size={16} classname="text-neutral-800" />
            </div>
            <div className="space-y-1">
              <span className="text-base font-bold text-neutral-900 block">24/7 Enterprise SLA</span>
              <p className="text-[11px] text-neutral-800">
                Dedicated Technical Account Manager &amp; 15-minute priority incident response.
              </p>
              <div className="pt-1">
                <a
                  href="https://seidoranalytics.com/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-seidor-main hover:underline"
                >
                  Contact enterprise support &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN: INCLUDED ENTERPRISE MODULES                   */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6">
        <div>
          <h4 className="font-bold text-neutral-900 text-base">
            Included Product Modules
          </h4>
          <p className="text-xs text-neutral-800 mt-0.5">
            The following capabilities are provisioned and active under your current license agreement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-0 sm:ml-4">
          {[
            { name: "Crestone Move", desc: "SAP & modern database extraction pipelines", active: true },
            { name: "Crestone Preserve", desc: "Long-term data vaulting and retention", active: true },
            { name: "Crestone Accelerate", desc: "Pre-built analytical models & SAP visualizations", active: true },
            { name: "Crestone Optimize", desc: "Cloud data warehouse cost telemetry", active: true },
            { name: "Crestone Analyze", desc: "Generative AI studio and automated insights", active: true },
            { name: "Crestone Migrate", desc: "Wave-based SAP modernization orchestrator", active: true },
          ].map((mod) => (
            <div
              key={mod.name}
              className="p-3.5 rounded-xl bg-neutral-500 border border-neutral-400 flex items-start gap-3"
            >
              <div className="size-6 rounded-md bg-success-light text-success-hard flex items-center justify-center shrink-0 mt-0.5">
                <CaralIcon name="check" size={14} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-neutral-900 block">{mod.name}</span>
                <span className="text-[11px] text-neutral-800 block leading-tight">{mod.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
