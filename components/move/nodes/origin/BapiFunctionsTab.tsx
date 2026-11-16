"use client";

import { useMemo, useState } from "react";
import { Button } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import originData from "@/data/move/originSource.json";

interface SapFunction {
  name: string;
  description: string;
}

const functions = originData.functions as SapFunction[];

// Convierte un patrón con comodines (*) en una expresión regular sin distinguir mayúsculas.
function wildcardToRegExp(pattern: string) {
  const trimmed = pattern.trim() || "*";
  const escaped = trimmed.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

/** Extracción BAPI: funciones del grupo buscado (el patrón se escribe en el panel izquierdo). */
export function BapiFunctionsTab({ pattern }: { pattern: string }) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.origin;
  const [syncedFunctions, setSyncedFunctions] = useState<string[]>([functions[0].name]);

  const filteredFunctions = useMemo(() => {
    const regex = wildcardToRegExp(pattern);
    return functions.filter((fn) => regex.test(fn.name));
  }, [pattern]);

  const columns = useMemo<DataTableColumn<SapFunction>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: t.colName,
        filterType: "text",
        minWidth: 240,
        cell: ({ value }) => <span className="block break-all text-sm font-medium text-neutral-900">{String(value)}</span>,
      },
      {
        id: "description",
        accessorKey: "description",
        header: t.colDescription,
        filterType: "text",
        minWidth: 220,
        cell: ({ value }) => <span className="text-sm text-neutral-900">{String(value)}</span>,
      },
      {
        id: "sync",
        header: t.colSync,
        align: "center",
        width: 90,
        minWidth: 80,
        filterable: false,
        resizable: false,
        cell: ({ row }) => {
          const synced = syncedFunctions.includes(row.name);
          return (
            <div className="flex items-center justify-center">
              <Button
                variant={synced ? "info" : "ghost"}
                isIconButton
                iconName="sync"
                title={t.syncFunction}
                aria-pressed={synced}
                onClick={() =>
                  setSyncedFunctions((prev) =>
                    prev.includes(row.name) ? prev.filter((n) => n !== row.name) : [...prev, row.name]
                  )
                }
              />
            </div>
          );
        },
      },
    ],
    [t, syncedFunctions]
  );

  return (
    <DataTable<SapFunction>
      variant="embedded"
      title={t.methodSection}
      data={filteredFunctions}
      columns={columns}
      keyExtractor={(row) => row.name}
      canSearch={false}
      canFilterColumns={false}
      canFilterErrors={false}
      canExport={false}
      canExpand={false}
    />
  );
}
