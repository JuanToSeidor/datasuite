import React from "react";
import Link from "next/link";
import { CaralIcon, type Icons } from "@/components/icons";

/** Acceso rápido: icono + título + descripción, enlazado a una sección de Move. */
export function QuickAccessCard({
  href,
  iconName,
  title,
  description,
}: {
  href: string;
  iconName: Icons;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-3 rounded-2xl bg-container p-3 font-poppins transition-colors hover:bg-neutral-100"
    >
      <span className="shrink-0 text-neutral-900">
        <CaralIcon name={iconName} size={24} color="currentColor" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-lg font-bold text-neutral-900">{title}</span>
        <span className="truncate text-sm text-neutral-800">{description}</span>
      </span>
    </Link>
  );
}
