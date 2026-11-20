"use client";

import React, { useMemo, useRef, useState } from "react";
import { Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import {
  LicenseDict,
  LicenseHistoryEntry,
  LicenseHistoryStatus,
  ModuleLicense,
  licenseHref,
  parseIsoDate,
} from "./licenseData";
import { LicenseBreadcrumb, QuotaUsageCard, quotaTransitionName } from "./LicenseShared";

interface ModuleLicenseDetailProps {
  module: ModuleLicense;
}

const HISTORY_STATUS: Record<LicenseHistoryStatus, { variant: "success" | "warning" | "danger"; key: keyof LicenseDict }> = {
  active: { variant: "success", key: "statusActive" },
  expired: { variant: "warning", key: "statusExpired" },
  removed: { variant: "danger", key: "statusRemoved" },
};

/* ------------------------------------------------------------------ */
/* Zona de carga del paquete de licencias (.json)                      */
/* ------------------------------------------------------------------ */

type UploadFeedback = { kind: "success" | "error"; message: string } | null;

function LicenseDropzone({ t }: { t: LicenseDict }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<UploadFeedback>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setFeedback({ kind: "error", message: t.uploadWrongType });
      return;
    }
    try {
      JSON.parse(await file.text());
      setFeedback({ kind: "success", message: formatMessage(t.uploadSuccess, { name: file.name }) });
    } catch {
      setFeedback({ kind: "error", message: formatMessage(t.uploadInvalid, { name: file.name }) });
    }
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="w-full border border-neutral-500 rounded-lg overflow-hidden">
      <div className="bg-neutral-500 p-2.5">
        <h4 className="font-poppins font-semibold text-2xl text-neutral-900 tracking-tight">{t.uploadTitle}</h4>
        <p className="text-base text-neutral-800">{t.uploadSubtitle}</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`h-[295px] p-2.5 flex flex-col items-center justify-center gap-2.5 cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-info-main/40 ${
          isDragging ? "bg-info-100" : ""
        }`}
      >
        <span className="flex text-neutral-800">
          <CaralIcon name="cloudUp" size={150} />
        </span>
        <div className="flex flex-col items-center text-center">
          <p className="font-poppins font-semibold text-xl text-neutral-900">
            {t.dropText} <span className="text-info-main">{t.browse}</span>
          </p>
          <p className="text-base text-neutral-800">{t.fileTypes}</p>
        </div>
        {feedback && (
          <Chip
            variant={feedback.kind === "success" ? "success" : "danger"}
            iconName={feedback.kind === "success" ? "check" : "triangleExclamation"}
            label={feedback.message}
            hasBorder
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = ""; // permite volver a subir el mismo archivo
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vista de detalle de la licencia de un módulo                        */
/* ------------------------------------------------------------------ */

export function ModuleLicenseDetail({ module }: ModuleLicenseDetailProps) {
  const { dict, language } = useLanguage();
  const t = dict.settings.license;

  const historyColumns = useMemo<DataTableColumn<LicenseHistoryEntry>[]>(
    () => [
      {
        id: "type",
        accessorKey: "type",
        header: t.colType,
        filterType: "text",
        cell: ({ value }) => <span className="text-base text-neutral-900">{value}</span>,
      },
      {
        id: "status",
        accessorKey: "status",
        header: t.colStatus,
        width: 244,
        filterType: "select",
        filterSelectOptions: (Object.keys(HISTORY_STATUS) as LicenseHistoryStatus[]).map((s) => ({
          label: String(t[HISTORY_STATUS[s].key]),
          value: s,
        })),
        cell: ({ value }) => {
          const cfg = HISTORY_STATUS[value as LicenseHistoryStatus];
          return <Chip variant={cfg.variant} label={String(t[cfg.key])} hasBorder />;
        },
      },
      {
        id: "expiresAt",
        accessorKey: "expiresAt",
        header: t.colExpiration,
        width: 308,
        filterType: "none",
        cell: ({ value }) => (
          <span className="text-base text-neutral-900">{parseIsoDate(value).toLocaleDateString(language)}</span>
        ),
      },
    ],
    [t, language]
  );

  return (
    <div className="w-full flex flex-col gap-5 text-left font-poppins">
      {/* Migas, título y descripción */}
      <div className="pt-5 flex flex-col gap-2 min-w-0">
        <LicenseBreadcrumb
          ariaLabel={t.back}
          items={[
            { label: t.breadcrumb, href: licenseHref() },
            { label: formatMessage(t.detailTitle, { module: module.name }) },
          ]}
        />
        <div className="min-w-0">
          <h3 className="font-poppins font-semibold text-3xl text-neutral-900 tracking-tight">
            {formatMessage(t.detailTitle, { module: module.name })}
          </h3>
          <p className="text-base text-neutral-800">{formatMessage(t.detailSubtitle, { module: module.name })}</p>
        </div>
      </div>

      {/* KPIs: cuotas del módulo + plan contratado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {module.quotas.map((q) => (
          <QuotaUsageCard
            key={q.id}
            quota={q}
            t={t}
            href={licenseHref(module.id, q.id)}
            transitionName={quotaTransitionName(module.id, q.id)}
          />
        ))}
        <div className={`bg-neutral-100 rounded-lg px-2.5 py-[15px] flex flex-col justify-center self-stretch min-w-0 ${
            module.quotas.length > 0 ? "md:col-start-3" : ""
          }`}>
          <p className="text-base text-neutral-800">{t.plan}</p>
          <p className="font-poppins font-semibold text-3xl text-neutral-900 tracking-tight">
            {module.plan ?? t.noPlan}
          </p>
        </div>
      </div>

      <LicenseDropzone t={t} />

      {/* Historial */}
      <div className="flex flex-col gap-2.5">
        <h4 className="font-poppins font-semibold text-xl text-neutral-900">{t.history}</h4>
        {module.history.length === 0 ? (
          <div className="w-full p-10 text-center border border-neutral-500 rounded-lg text-sm text-neutral-800">
            {t.noHistory}
          </div>
        ) : (
          <DataTable<LicenseHistoryEntry>
            data={module.history}
            columns={historyColumns}
            keyExtractor={(h) => h.id}
            hideToolbar
            canSearch={false}
            canExport={false}
            canExpand={false}
          />
        )}
      </div>
    </div>
  );
}
