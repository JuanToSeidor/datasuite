"use client";

import React, { useMemo } from "react";
import { Chip } from "caralstable";
import type { Icons } from "@/components/icons";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import type { AccelerateCatalogDetail, DestinationObject, DestinationObjectType } from "../types";

/** iconcaral2 no tiene ícono "Delta": se usa `database` para las tablas Delta. */
export const TYPE_ICON: Record<DestinationObjectType, Icons> = {
  deltaTable: "database",
  sqlView: "screenView",
  semanticModel: "code",
};

export function DestinationObjectsSection({
  destinationObjects,
}: {
  destinationObjects: NonNullable<AccelerateCatalogDetail["destinationObjects"]>;
}) {
  const { dict } = useLanguage();
  const t = dict.accelerate.detail;

  const columns = useMemo<DataTableColumn<DestinationObject>[]>(() => {
    const typeLabel: Record<DestinationObjectType, string> = {
      deltaTable: t.typeDeltaTable,
      sqlView: t.typeSqlView,
      semanticModel: t.typeSemanticModel,
    };
    return [
      { id: "name", accessorKey: "name", header: t.colObject, filterType: "none", width: 220 },
      {
        id: "type",
        accessorKey: "type",
        header: t.colType,
        filterType: "none",
        width: 240,
        cell: ({ row }) => (
          <Chip variant="success" hasBorder iconName={TYPE_ICON[row.type]} label={typeLabel[row.type]} />
        ),
      },
      { id: "builtFrom", accessorKey: "builtFrom", header: t.colBuiltFrom, filterType: "none", width: 270 },
      { id: "content", accessorKey: "content", header: t.colContent, filterType: "none", width: 560 },
    ];
  }, [t]);

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-container p-4 font-poppins">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-seidor-main-text">{t.destinationObjectsTitle}</h2>
        <p className="text-sm text-neutral-800">
          {formatMessage(t.destinationObjectsSubtitle, {
            destination: destinationObjects.destination,
            lakehouse: destinationObjects.lakehouse,
            workspace: destinationObjects.workspace,
          })}
        </p>
      </div>
      <DataTable<DestinationObject>
        variant="embedded"
        data={destinationObjects.objects}
        columns={columns}
        keyExtractor={(row) => row.name}
        canSearch={false}
        canFilterColumns={false}
        canFilterErrors={false}
        canExport={false}
        canExpand={false}
      />
    </section>
  );
}
