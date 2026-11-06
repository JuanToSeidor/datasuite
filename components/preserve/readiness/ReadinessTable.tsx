"use client";

import React, { useMemo } from "react";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { ReadinessAction, ReadinessPhase, ReadinessStatus } from "./types";

const STATUS_CHIP: Record<ReadinessStatus, { variant: "success" | "info" | "light"; iconName?: "check" | "sync" }> = {
  complete: { variant: "success", iconName: "check" },
  inProgress: { variant: "info", iconName: "sync" },
  pending: { variant: "light" },
};

/** Tabla de las seis fases del PRD con estado, detalle y acción por fase. */
export function ReadinessTable({ phases }: { phases: ReadinessPhase[] }) {
  const { dict } = useLanguage();
  const t = dict.preserve.readiness;

  const statusLabel: Record<ReadinessStatus, string> = {
    complete: t.statusComplete,
    inProgress: t.statusInProgress,
    pending: t.statusPending,
  };
  const actionLabel: Record<ReadinessAction, string> = {
    checks: t.viewChecks,
    questions: t.viewQuestions,
    catalog: t.viewCatalog,
  };

  const detailOf = (phase: ReadinessPhase): string => {
    const copy = t.phases[phase.id].detail;
    switch (phase.id) {
      case "checks":
        return formatMessage(copy, { passed: phase.passed ?? 0, total: phase.total ?? 0, missing: phase.missing ?? "" });
      case "validation":
        return formatMessage(copy, { validated: phase.validated ?? 0, servable: phase.servable ?? 0 });
      case "seed":
      case "adjustment":
      case "catalog":
        return formatMessage(copy, { n: phase.n ?? 0 });
      default:
        return copy;
    }
  };

  const columns = useMemo<DataTableColumn<ReadinessPhase>[]>(
    () => [
      {
        id: "number",
        header: t.colNumber,
        width: 60,
        filterable: false,
        resizable: false,
        cell: ({ rowIndex }) => <span className="text-neutral-900">{rowIndex + 1}</span>,
      },
      {
        id: "phase",
        header: t.colPhase,
        width: 150,
        filterable: false,
        resizable: false,
        cell: ({ row }) => <span className="text-neutral-900">{t.phases[row.id].name}</span>,
      },
      {
        id: "what",
        header: t.colWhat,
        width: 340,
        filterable: false,
        cell: ({ row }) => <span className="text-neutral-900">{t.phases[row.id].what}</span>,
      },
      {
        id: "status",
        header: t.colStatus,
        width: 160,
        filterable: false,
        resizable: false,
        cell: ({ row }) => {
          const chip = STATUS_CHIP[row.status];
          return <Chip variant={chip.variant} label={statusLabel[row.status]} iconName={chip.iconName} hasBorder />;
        },
      },
      {
        id: "detail",
        header: t.colDetail,
        filterable: false,
        cell: ({ row }) => <span className="text-neutral-900">{detailOf(row)}</span>,
      },
      {
        id: "actions",
        header: t.colActions,
        width: 200,
        filterable: false,
        resizable: false,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm">
            <span className="flex items-center gap-1 text-info-main">
              {actionLabel[row.action]}
              <CaralIcon name="chevronRigth" size={18} color="currentColor" />
            </span>
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  return (
    <DataTable<ReadinessPhase>
      variant="embedded"
      data={phases}
      columns={columns}
      keyExtractor={(row) => row.id}
      canSearch={false}
      canFilterColumns={false}
      canExport={false}
      canExpand={false}
      canReadjust={false}
    />
  );
}
