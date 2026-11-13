"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CaralBrandName } from "@/components/icons";
import { CaralIcon } from "@/components/icons";
import { Input, Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import destinationData from "@/data/move/destination.json";

/** Selección del paso Destino; la guarda el formulario del nodo para validar el avance. */
export interface DestinationSelection {
  destinationId: string;
  outputType: string;
}

// Paso 3 del nodo: dónde y cómo se escriben los datos extraídos.
export function DestinationStep({
  value,
  onChange,
}: {
  value: DestinationSelection;
  onChange: (next: DestinationSelection) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode.destination;

  // Destino y datos de salida empiezan vacíos al crear: la ruta de
  // extracción solo se muestra cuando ambos están elegidos.
  const { destinationId, outputType } = value;
  const setDestinationId = (next: string) => onChange({ ...value, destinationId: next });
  const setOutputType = (next: string) => onChange({ ...value, outputType: next });
  const [exportFormat, setExportFormat] = useState(destinationData.exportFormats[0]);
  const [route, setRoute] = useState("/");

  const isDestinationReady = destinationId !== "" && outputType !== "";

  const destinationOptions = useMemo(
    () =>
      destinationData.destinations.map((d) => ({
        value: d.id,
        label: d.name,
        brand: d.brandName as CaralBrandName,
      })),
    []
  );
  const outputOptions = useMemo(
    () => destinationData.outputTypes.map((type) => ({ value: type, label: type })),
    []
  );
  const exportOptions = useMemo(
    () => destinationData.exportFormats.map((format) => ({ value: format, label: format })),
    []
  );

  return (
    <>
      {/* Conexión de destino */}
      <section className="flex flex-col gap-5 rounded-[12px] bg-container p-5">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-900">{t.connectionSection}</h3>
          <div className="h-px w-full bg-neutral-500" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Select
            label={t.destination}
            options={destinationOptions}
            value={destinationId || undefined}
            onValueChange={(value) => setDestinationId(String(value))}
          />
          <Select
            label={t.outputData}
            options={outputOptions}
            value={outputType || undefined}
            onValueChange={(value) => setOutputType(String(value))}
          />
        </div>

        <div className="h-px w-full bg-neutral-500" />

        <Link href="/connections" className="flex w-fit items-center gap-2 text-sm text-info-main hover:underline">
          <CaralIcon name="link" size={20} />
          {t.registerLink}
        </Link>
      </section>

      {/* Ruta de extracción: aparece al elegir destino y datos de salida */}
      {isDestinationReady && (
        <section className="flex flex-col gap-5 rounded-[12px] bg-container p-5">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-neutral-900">{t.routeSection}</h3>
            <div className="h-px w-full bg-neutral-500" />
          </div>

          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
            <Select
              label={t.exportFile}
              options={exportOptions}
              value={exportFormat}
              onValueChange={(value) => setExportFormat(String(value))}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="destination-route" className="flex items-baseline gap-1.5 text-sm font-semibold text-neutral-900">
                {t.route}
                <span className="text-xs font-medium text-neutral-800">{t.optional}</span>
              </label>
              <Input
                id="destination-route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                helperText={t.routeHelp}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
