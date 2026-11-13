"use client";

import { useEffect, useState } from "react";
import { NodesTable } from "@/components/move/nodes/NodesTable";

export default function MoveNodesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-fit flex flex-col font-poppins select-none transition-colors duration-300 text-foreground">
      <NodesTable />
    </div>
  );
}
