import React from "react";
import Link from "next/link";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";

/** Contenedor base de las cards del Resumen de Move. */
export function MoveCard({
  title,
  action,
  children,
  footer,
  headerDivider = true,
  className = "",
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Línea separadora bajo el título (por defecto visible). */
  headerDivider?: boolean;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col gap-3 rounded-2xl bg-container p-4 font-poppins ${className}`}>
      {(title || action) && (
        <>
          <header className="flex items-center justify-between gap-3">
            {title && <h2 className="text-lg font-bold text-neutral-900">{title}</h2>}
            {action}
          </header>
          {headerDivider && <div className="h-px w-full bg-neutral-300" />}
        </>
      )}
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

/** Enlace de pie de card (texto + chevron). Sin `href` no navega todavía. */
export function MoveCardFooterLink({ label, href }: { label: string; href?: string }) {
  const button = (
    <Button variant="ghost" size="sm">
      <span className="flex items-center gap-1 font-normal text-info-main">
        {label}
        <CaralIcon name="chevronRigth" size={18} color="currentColor" />
      </span>
    </Button>
  );
  return <div className="flex justify-end">{href ? <Link href={href}>{button}</Link> : button}</div>;
}

/** Etiqueta de sección ("Quick access link", "Information"). */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-sm font-medium text-neutral-800">{children}</p>;
}

/** Zona reservada para el contenido que se implementará después. */
export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-300 p-4 text-xs text-neutral-800 ${className}`}
    >
      {label}
    </div>
  );
}
