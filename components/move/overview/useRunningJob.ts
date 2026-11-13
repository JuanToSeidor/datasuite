"use client";

import { useEffect, useMemo, useState } from "react";
import type { JobNodeRun, RunningJob } from "./types";

const TICK_MS = 1000;

/**
 * Simula un job en vivo (demo sin backend): cada segundo los nodos en curso avanzan
 * un poco hasta llegar al 100 % y pasan a "completed"; los tiempos siguen corriendo
 * mientras quede algún nodo extrayendo. El % del job es la media de sus nodos.
 */
export function useRunningJob(initial: RunningJob) {
  const [nodes, setNodes] = useState<JobNodeRun[]>(initial.nodes);
  const [elapsedSeconds, setElapsedSeconds] = useState(initial.elapsedSeconds);

  const isRunning = nodes.some((node) => node.status === "running");

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setNodes((current) =>
        current.map((node) => {
          if (node.status !== "running") return node;
          // Al llegar al 100 % se mantiene un tick "en curso" (barra llena) y luego se completa.
          if (node.progress >= 100) return { ...node, status: "completed" };
          return {
            ...node,
            progress: Math.min(100, node.progress + 1 + Math.floor(Math.random() * 3)),
            elapsedSeconds: node.elapsedSeconds + 1,
          };
        })
      );
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const progress = useMemo(
    () => Math.round(nodes.reduce((sum, node) => sum + node.progress, 0) / Math.max(nodes.length, 1)),
    [nodes]
  );

  return { ...initial, nodes, elapsedSeconds, progress, isFinished: !isRunning };
}

/** 25 -> "25s", 125 -> "2m 05s". */
export function formatShortDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}

/** 601 -> "00:10:01". */
export function formatClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
