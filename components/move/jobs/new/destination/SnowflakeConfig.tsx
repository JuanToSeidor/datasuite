"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import snowflakeObjects from "@/data/move/snowflakeObjects.json";
import type { DestinationConfig, SetDestinationConfig } from "../types";
import SelectExportTo from "./SelectExportTo";

const NEW_TABLE = "new-table";
const NEW_STAGE = "new-stage";

type StorageType = "table" | "stage";

interface SnowflakeState {
  type: StorageType | null;
  table: string | null;
  stage: string | null;
  newName: string | null;
}

/**
 * Config de destino Snowflake (portado de datasync). En el asistente de plantillas la opción
 * "Tabla" llega deshabilitada (`tableDisabled`), así que se escribe en un stage nuevo o existente
 * y se elige el formato del archivo. Las tablas/stages vienen de un mock (datasync los pedía a la API).
 */
export default function SnowflakeConfig({
  destinationConfig,
  setDestinationConfig,
  tableDisabled = false,
}: {
  destinationConfig: DestinationConfig | null;
  setDestinationConfig: SetDestinationConfig;
  tableDisabled?: boolean;
}) {
  const { t } = useLanguage();
  const initialType = destinationConfig?.type ?? null;
  const [state, setState] = useState<SnowflakeState>({
    type: initialType,
    table:
      destinationConfig?.mode === "new" && initialType === "table" ? NEW_TABLE : (destinationConfig?.name ?? null),
    stage:
      destinationConfig?.mode === "new" && initialType === "stage" ? NEW_STAGE : (destinationConfig?.name ?? null),
    newName: destinationConfig?.name ?? null,
  });

  /** Recalcula la config como los efectos de datasync: modo nuevo/existente y nombre según la selección. */
  const commit = (next: SnowflakeState) => {
    setState(next);
    if (next.type === "table") {
      const isNew = next.table === NEW_TABLE;
      setDestinationConfig((prev) => ({
        ...prev,
        type: "table",
        mode: isNew ? "new" : "exists",
        name: isNew ? next.newName : next.table,
        delete_existing_data: prev?.delete_existing_data ?? false,
        pre_execution_sql: prev?.pre_execution_sql ?? "",
        post_execution_sql: prev?.post_execution_sql ?? "",
      }));
    } else if (next.type === "stage") {
      const isNew = next.stage === NEW_STAGE;
      setDestinationConfig((prev) => ({
        ...prev,
        type: "stage",
        mode: isNew ? "new" : "exists",
        name: isNew ? next.newName : next.stage,
      }));
    }
  };

  const typeOptions = [
    { value: "table", label: t("moveJobsEditor.create.destination.table"), disabled: tableDisabled },
    { value: "stage", label: t("moveJobsEditor.create.destination.stage") },
  ];
  const stageOptions = [
    ...snowflakeObjects.stages.map((stage) => ({ value: stage, label: stage })),
    { value: NEW_STAGE, label: t("moveJobsEditor.create.destination.createNewStage") },
  ];
  const tableOptions = [
    ...snowflakeObjects.tables.map((table) => ({ value: table, label: table })),
    { value: NEW_TABLE, label: t("moveJobsEditor.create.destination.createNewTable") },
  ];

  const isCreatingNew = state.table === NEW_TABLE || state.stage === NEW_STAGE;

  return (
    <div className="flex w-full flex-col gap-5">
      <Select
        label={t("moveJobsEditor.create.destination.selectTypeStorage")}
        options={typeOptions}
        value={state.type ?? ""}
        placeholder={t("moveJobsEditor.create.destination.selectTypeStorage")}
        onValueChange={(value) =>
          commit({ type: value as StorageType, table: null, stage: null, newName: null })
        }
      />

      {state.type === "stage" && (
        <Select
          label={t("moveJobsEditor.create.destination.selectStage")}
          options={stageOptions}
          value={state.stage ?? ""}
          placeholder={t("moveJobsEditor.create.destination.selectStage")}
          onValueChange={(value) => commit({ ...state, stage: String(value) })}
        />
      )}
      {state.type === "table" && (
        <Select
          label={t("moveJobsEditor.create.destination.selectTable")}
          options={tableOptions}
          value={state.table ?? ""}
          placeholder={t("moveJobsEditor.create.destination.selectTable")}
          onValueChange={(value) => commit({ ...state, table: String(value) })}
        />
      )}

      {isCreatingNew && (
        <Input
          label={
            state.type === "table"
              ? t("moveJobsEditor.create.destination.createNewTable")
              : t("moveJobsEditor.create.destination.createNewStage")
          }
          value={state.newName ?? ""}
          placeholder={t("moveJobsEditor.create.destination.writeNewName")}
          onChange={(e) => commit({ ...state, newName: e.currentTarget.value })}
        />
      )}

      {state.type === "stage" && (
        <SelectExportTo destinationConfig={destinationConfig} setDestinationConfig={setDestinationConfig} />
      )}
    </div>
  );
}
