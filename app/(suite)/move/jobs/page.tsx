"use client";

import { useEffect, useState } from "react";
import { JobsTable } from "@/components/move/jobs/JobsTable";

export default function MoveJobsPage() {
  // Igual que Nodos: se monta en cliente (fechas locales y store en memoria).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-fit flex flex-col font-poppins select-none transition-colors duration-300 text-foreground">
      <JobsTable />
    </div>
  );
}
