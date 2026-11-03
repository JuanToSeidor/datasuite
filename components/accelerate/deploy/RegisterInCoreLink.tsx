"use client";

import React from "react";
import Link from "next/link";
import { CaralIcon } from "@/components/icons";

/** Enlace al alta de conexiones del Core, al pie de cada paso del asistente. */
export function RegisterInCoreLink({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-px w-full bg-neutral-500" />
      <Link
        href="/connections/new"
        className="flex w-fit items-center gap-2 py-2.5 text-base text-info-main transition-colors hover:text-info-hard"
      >
        <CaralIcon name="link" size={24} color="currentColor" />
        {label}
      </Link>
    </div>
  );
}
