"use client";

import type { DestinationConfig, SetDestinationConfig } from "../types";
import RouteTo from "./RouteTo";
import SelectExportTo from "./SelectExportTo";

/** Config de destino AWS/S3: formato del archivo + carpeta opcional. */
export default function AWSConfig({
  destinationConfig,
  setDestinationConfig,
}: {
  destinationConfig: DestinationConfig | null;
  setDestinationConfig: SetDestinationConfig;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SelectExportTo destinationConfig={destinationConfig} setDestinationConfig={setDestinationConfig} />
      <RouteTo destinationConfig={destinationConfig} setDestinationConfig={setDestinationConfig} />
    </div>
  );
}
