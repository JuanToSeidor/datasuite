"use client";

import React, { useState } from "react";
import { Button, Chip } from "caralstable";
import {
  Brand,
  CaralIcon,
  type CaralBrandName,
  type Icons,
} from "@/components/icons";
import { Select } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";

export interface TransactionArchive {
  id: string;
  sapRelease: string;
  database: string;
  databaseBrand: string;
  size: string;
  tables: number;
  status: "queryable" | "extracting";
  cutOff: string;
  recent: string[];
}

/** Ícono redondo de 25 px del diseño (marca o ícono Caral sobre fondo claro). */
function RoundIcon({ brand, icon }: { brand?: CaralBrandName; icon?: Icons }) {
  return (
    <span className="flex size-[25px] shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
      {brand ? (
        <Brand name={brand} size={15} />
      ) : (
        <CaralIcon name={icon!} size={15} color="currentColor" />
      )}
    </span>
  );
}

function StatusDot({ status }: { status: TransactionArchive["status"] }) {
  return (
    <span
      className={`size-[25px] shrink-0 rounded-full ${status === "queryable" ? "bg-success-main" : "bg-warning-main"}`}
    />
  );
}

/**
 * Barra de información del panel plegado: al pasar el mouse (o con foco) se despliega desde el
 * ícono hacia la derecha con el dato. Va con estado y estilos inline a propósito: el CSS de
 * caralstable trae `.hidden` y `transform` sin capa, que pisan `group-hover:*` y `translate-*` de Tailwind v4.
 */
function HoverInfo({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative flex"
      style={{ zIndex: open ? 40 : 1 }}
      tabIndex={0}
      aria-label={`${label}: ${value}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {/* La barra nace detrás del ícono, que queda encima como su "cabeza". */}
      <div
        role="tooltip"
        aria-hidden={!open}
        className="pointer-events-none absolute flex items-center overflow-hidden whitespace-nowrap rounded-full border border-neutral-300 bg-container shadow-lg motion-reduce:transition-none"
        style={{
          left: -5,
          top: "50%",
          height: 35,
          transform: "translateY(-50%)",
          paddingLeft: open ? 40 : 30,
          paddingRight: open ? 14 : 0,
          maxWidth: open ? 480 : 35,
          opacity: open ? 1 : 0,
          transition:
            "max-width 280ms cubic-bezier(0.22, 1, 0.36, 1), padding 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease-out",
        }}
      >
        <span className="text-xs text-neutral-800">{label}</span>
        <span className="ml-2 text-sm font-semibold text-neutral-900">{value}</span>
      </div>
      <span className="relative">{children}</span>
    </div>
  );
}

/** Ancho del panel en cada estado (se anima entre ambos). */
const COLLAPSED_WIDTH = "64px";
const EXPANDED_WIDTH = "clamp(260px, 22vw, 400px)";

export function ArchivePanel({
  archives,
  archive,
  onArchiveChange,
  recent,
  onRecentClick,
  collapsed,
  onToggle,
}: {
  archives: TransactionArchive[];
  archive: TransactionArchive;
  onArchiveChange: (id: string) => void;
  recent: string[];
  onRecentClick: (query: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { dict } = useLanguage();
  const t = dict.preserve.transactions;
  const statusLabel =
    archive.status === "queryable" ? t.statusQueryable : t.statusExtracting;
  const tablesLabel = formatMessage(t.tables, { n: archive.tables });
  const databaseLabel = `${archive.database} ${archive.size}`;

  // Vista plegada: no se recorta (los tooltips salen por fuera del panel).
  const collapsedView = (
    <div
      aria-hidden={!collapsed}
      inert={!collapsed}
      className={`absolute inset-y-0 left-0 flex w-16 flex-col items-center gap-[30px] p-2.5 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
        collapsed ? "opacity-100 delay-150" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex items-center border-b border-neutral-500 pb-2.5">
        <Button
          variant="ghost"
          iconName="closeSidebarRigt"
          onClick={onToggle}
          title={t.expand}
          aria-label={t.expand}
        />
      </div>
      <div className="flex flex-col items-center gap-5">
        {/* El archivo seleccionado: al hacer clic se expande el panel para cambiarlo. */}
        <HoverInfo label={t.archive} value={archive.id}>
          <span onClick={onToggle} className="cursor-pointer">
            <RoundIcon icon="arrowDownToLine" />
          </span>
        </HoverInfo>
        <HoverInfo label={t.sapRelease} value={archive.sapRelease}>
          <RoundIcon brand="SAP" />
        </HoverInfo>
        <HoverInfo label={t.database} value={databaseLabel}>
          <RoundIcon brand={archive.databaseBrand as CaralBrandName} />
        </HoverInfo>
        <HoverInfo label={t.tablesLabel} value={tablesLabel}>
          <RoundIcon icon="checkList" />
        </HoverInfo>
        <HoverInfo label={t.statusLabel} value={statusLabel}>
          <StatusDot status={archive.status} />
        </HoverInfo>
        <HoverInfo label={t.cutOffLabel} value={archive.cutOff}>
          <RoundIcon icon="calendar" />
        </HoverInfo>
      </div>
    </div>
  );

  const infoRows: { key: string; icon: React.ReactNode; label: string }[] = [
    { key: "sap", icon: <RoundIcon brand="SAP" />, label: archive.sapRelease },
    {
      key: "db",
      icon: <RoundIcon brand={archive.databaseBrand as CaralBrandName} />,
      label: databaseLabel,
    },
    { key: "tables", icon: <RoundIcon icon="checkList" />, label: tablesLabel },
    {
      key: "status",
      icon: <StatusDot status={archive.status} />,
      label: statusLabel,
    },
  ];

  return (
    // Un solo panel que anima el ancho; las dos vistas se superponen y hacen un fundido cruzado.
    // La vista expandida tiene ancho fijo y se recorta mientras el panel se achica: el texto no se reacomoda.
    <aside
      className="relative shrink-0 rounded-lg bg-container transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
    >
      <div
        aria-hidden={collapsed}
        inert={collapsed}
        className={`absolute inset-0 overflow-hidden rounded-lg transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100 delay-100"
        }`}
      >
        <div
          className="flex h-full flex-col gap-[30px] overflow-y-auto p-2.5"
          style={{ width: EXPANDED_WIDTH }}
        >
          <div className="flex items-center justify-between border-b border-neutral-500 pb-2.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-900">
              {t.title}
            </h1>
            <Button
              variant="ghost"
              iconName="closeSidebarRigt"
              onClick={onToggle}
              title={t.collapse}
              aria-label={t.collapse}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Select
              label={t.archive}
              value={archive.id}
              options={archives.map((a) => ({ value: a.id, label: a.id }))}
              onValueChange={(v) => onArchiveChange(String(v))}
            />
            <div className="flex flex-col pt-2.5">
              {infoRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center gap-2.5 border-b border-neutral-500 py-2.5"
                >
                  {row.icon}
                  <span className="text-sm font-medium text-neutral-800">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
            <Chip
              variant="success"
              iconName="calendar"
              hasBorder
              label={formatMessage(t.cutOff, { date: archive.cutOff })}
              className="w-full justify-center"
            />
          </div>

          <div className="h-px w-full bg-neutral-500" />

          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-medium text-neutral-800">
              {t.recent}
            </span>
            {recent.length === 0 ? (
              <p className="px-2.5 text-sm text-neutral-800">{t.noRecent}</p>
            ) : (
              recent.map((item) => (
                // Fila de lista clicable (texto + chevron a todo el ancho): Button de Caral no admite
                // el ícono a la derecha con el texto alineado a la izquierda.
                <button
                  key={item}
                  type="button"
                  onClick={() => onRecentClick(item)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 text-left text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <span className="truncate">{item}</span>
                  <CaralIcon
                    name="chevronRigth"
                    size={24}
                    color="currentColor"
                  />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      {collapsedView}
    </aside>
  );
}
