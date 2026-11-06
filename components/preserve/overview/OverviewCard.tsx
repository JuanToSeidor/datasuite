import React from "react";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";

/** Contenedor base de las cards del Resumen de Preserve. */
export function OverviewCard({
  title,
  children,
  footer,
  className = "",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col gap-3 rounded-2xl bg-container p-4 font-poppins ${className}`}>
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <div className="h-px w-full bg-neutral-300" />
      <div className="flex flex-1 flex-col gap-3">{children}</div>
      {footer && (
        <>
          <div className="h-px w-full bg-neutral-300" />
          {footer}
        </>
      )}
    </section>
  );
}

/** Enlace de pie de card (texto + flecha), sin acción todavía. */
export function CardFooterLink({ label }: { label: string }) {
  return (
    <div className="flex justify-end">
      <Button variant="ghost" size="sm">
        <span className="flex items-center gap-1 font-normal text-neutral-800">
          {label}
          <CaralIcon name="arrowRight" size={18} color="currentColor" />
        </span>
      </Button>
    </div>
  );
}

/** Tile de métrica: número grande + etiqueta. */
export function Metric({
  value,
  label,
  tone = "success",
}: {
  value: React.ReactNode;
  label: string;
  tone?: "success" | "warning";
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-neutral-100 px-3 py-2">
      <span
        className={`flex items-center gap-1 text-2xl font-bold ${
          tone === "warning" ? "text-warning-main" : "text-success-main"
        }`}
      >
        {tone === "warning" && <CaralIcon name="triangleExclamation" size={20} color="currentColor" />}
        {value}
      </span>
      <span className="text-sm text-neutral-900">{label}</span>
    </div>
  );
}
