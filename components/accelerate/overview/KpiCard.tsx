import React from "react";

interface KpiCardProps {
  /** Valor principal (grande, color del módulo). */
  value: React.ReactNode;
  /** Sufijo atenuado junto al valor, p.ej. "/16". */
  valueSuffix?: React.ReactNode;
  label: string;
  detail: string;
}

export function KpiCard({ value, valueSuffix, label, detail }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-container p-4 font-poppins">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-0.5">
          <span className="text-4xl font-extrabold leading-tight text-warning-main">{value}</span>
          {valueSuffix && (
            <span className="text-2xl font-bold text-warning-main/70">{valueSuffix}</span>
          )}
        </div>
        <span className="text-base font-bold text-neutral-900">{label}</span>
      </div>
      <div className="h-px w-full bg-neutral-500" />
      <span className="text-sm text-neutral-800">{detail}</span>
    </div>
  );
}
