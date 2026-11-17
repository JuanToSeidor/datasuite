"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CaralIcon, type CaralBrandName } from "@/components/icons";
import { Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJobTemplate } from "@/lib/move/jobs/types";
import AWSConfig from "./destination/AWSConfig";
import SnowflakeConfig from "./destination/SnowflakeConfig";
import {
  DESTINATION_TYPES,
  getDestinationSystems,
  getSourceSystems,
  type DestinationConfig,
  type JobSystem,
  type SetDestinationConfig,
} from "./types";

interface SyncProps {
  template: TJobTemplate | null;
  selectedSystemSource: JobSystem | null;
  setSelectedSystemSource: (value: JobSystem | null) => void;
  selectedSystemDestination: JobSystem | null;
  setSelectedSystemDestination: (value: JobSystem | null) => void;
  destinationConfig: DestinationConfig | null;
  setDestinationConfig: SetDestinationConfig;
}

const toOptions = (systems: JobSystem[]) =>
  systems.map((system) => ({
    value: system.system_id,
    label: system.name,
    brand: system.brandName as CaralBrandName,
  }));

/** Aviso cuando no hay conexiones compatibles: lleva a dar de alta una conexión. */
function EmptySystems({ label }: { label: string }) {
  return (
    <Link href="/connections/new" className="flex w-fit items-center gap-1.5 text-sm text-info-main hover:underline">
      {label}
      <CaralIcon name="upRightFromSquare" size={16} />
    </Link>
  );
}

/** Paso 3: origen (según el tipo de la plantilla) y destino con su configuración. */
export default function Sync({
  template,
  selectedSystemSource,
  setSelectedSystemSource,
  selectedSystemDestination,
  setSelectedSystemDestination,
  destinationConfig,
  setDestinationConfig,
}: SyncProps) {
  const { t } = useLanguage();
  const systemsSource = useMemo(() => getSourceSystems(template?.type), [template?.type]);
  const systemsDestination = useMemo(() => getDestinationSystems(), []);

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="border-b border-neutral-500 pb-3">
        <h2 className="font-poppins text-lg font-extrabold text-neutral-900">
          {t("moveJobsEditor.import.match.title")}
        </h2>
        <p className="text-sm text-neutral-800">{t("moveJobsEditor.import.match.subtitle")}</p>
      </div>

      <div className="flex h-full w-full items-start justify-center gap-2.5">
        <div className="flex w-4/12 flex-col gap-2.5">
          <Select
            label={t("moveJobsEditor.create.sync.selectSource")}
            options={toOptions(systemsSource)}
            value={selectedSystemSource?.system_id ?? ""}
            placeholder={t("moveJobsEditor.create.sync.selectSourcePlaceholder")}
            onValueChange={(value) =>
              setSelectedSystemSource(systemsSource.find((s) => s.system_id === value) ?? null)
            }
          />
          {systemsSource.length === 0 && <EmptySystems label={t("moveJobsEditor.create.sync.noSources")} />}
        </div>

        <div className="flex w-4/12 flex-col gap-5">
          <div className="flex w-full flex-col gap-2.5">
            <Select
              label={t("moveJobsEditor.create.sync.selectDestination")}
              options={toOptions(systemsDestination)}
              value={selectedSystemDestination?.system_id ?? ""}
              placeholder={t("moveJobsEditor.create.sync.selectDestinationPlaceholder")}
              onValueChange={(value) => {
                const next = systemsDestination.find((s) => s.system_id === value) ?? null;
                if (next?.system_id === selectedSystemDestination?.system_id) return;
                setSelectedSystemDestination(next);
                // Cambiar de destino descarta la config del anterior (como el reset de SnowflakeConfig en datasync).
                setDestinationConfig({});
              }}
            />
            {systemsDestination.length === 0 && (
              <EmptySystems label={t("moveJobsEditor.create.sync.noDestinations")} />
            )}
          </div>

          {selectedSystemDestination?.type === DESTINATION_TYPES.aws && (
            <AWSConfig
              key={selectedSystemDestination.system_id}
              destinationConfig={destinationConfig}
              setDestinationConfig={setDestinationConfig}
            />
          )}
          {selectedSystemDestination?.type === DESTINATION_TYPES.snowflake && (
            <SnowflakeConfig
              key={selectedSystemDestination.system_id}
              destinationConfig={destinationConfig}
              setDestinationConfig={setDestinationConfig}
              tableDisabled
            />
          )}
        </div>
      </div>
    </div>
  );
}
