"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobEditor from "@/components/move/jobs/editor/JobEditor";

/**
 * Editor de jobs de Move. El id va por query (`/move/jobs/editor?id=<jobId>`) porque con
 * `output: "export"` no se pueden pre-generar páginas para jobs creados en tiempo de ejecución.
 */
function JobEditorContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id") ?? "";
  return <JobEditor key={jobId} jobId={jobId} />;
}

export default function MoveJobEditorPage() {
  return (
    <Suspense fallback={null}>
      <JobEditorContent />
    </Suspense>
  );
}
