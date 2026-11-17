"use client";

import { JobsProvider } from "@/components/move/jobs/JobsStore";

/** El store de jobs vive aquí para conservar el estado entre el asistente y el editor. */
export default function MoveJobsLayout({ children }: { children: React.ReactNode }) {
  return <JobsProvider>{children}</JobsProvider>;
}
