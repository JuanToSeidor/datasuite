"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TRIGGER_COLORS,
  TRIGGER_COLOR_CLASSES,
  useEditorPreferences,
  type EditorPreferences,
  type SidebarPosition,
  type SidebarTheme,
} from "./EditorPreferences";

const K = "moveJobsEditor.editor.appearance";

interface EditorAppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Punto de radio del diseño (relleno info cuando está seleccionado). */
function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border-2! ${
        checked ? "border-info-main" : "border-neutral-500"
      } bg-neutral-100`}
    >
      {checked && <span className="size-2 rounded-full bg-info-main" />}
    </span>
  );
}

/**
 * Tarjeta seleccionable (radio). Se usa <button> nativo con role="radio": el `Button` de Caral no
 * admite el contenido de varias filas (vista previa + radio + texto) que pide el diseño.
 */
function OptionCard({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`flex w-full cursor-pointer flex-col gap-3 rounded-lg p-3.5! text-left transition-colors ${
        checked
          ? "border-2! border-info-main bg-info-100"
          : "border! border-neutral-500 bg-neutral-100 hover:bg-info-100/50"
      }`}
    >
      {children}
    </button>
  );
}

/** Miniatura de la pantalla con la barra lateral a la izquierda o a la derecha. */
function PositionPreview({ position }: { position: SidebarPosition }) {
  return (
    <div
      aria-hidden
      className="relative h-20 w-full overflow-hidden rounded border! border-neutral-500 bg-container"
    >
      <div className="absolute inset-x-0 top-0 h-3 bg-neutral-500" />
      <div
        className={`absolute bottom-0 top-3 w-[52px] bg-info-main ${position === "left" ? "left-0" : "right-0"}`}
      />
      <div
        className={`absolute top-7 flex w-[60%] flex-col gap-2 ${position === "left" ? "left-[67px]" : "left-4"}`}
      >
        <span className="h-[7px] w-full rounded-sm bg-neutral-500" />
        <span className="h-1.5 w-[72%] rounded-sm bg-neutral-500" />
        <span className="h-1.5 w-[88%] rounded-sm bg-neutral-500" />
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col">
      <h3 className="font-poppins text-lg font-semibold text-seidor-main-text">
        {title}
      </h3>
      {subtitle && (
        <p className="font-poppins text-base text-neutral-900">{subtitle}</p>
      )}
    </div>
  );
}

/** Modal de personalización del editor: posición y tema del sidebar, y color del nodo de inicio. */
export function EditorAppearanceModal({
  isOpen,
  onClose,
}: EditorAppearanceModalProps) {
  const { t } = useLanguage();
  const { savedPreferences, setPreferences, setPreview } =
    useEditorPreferences();
  // Borrador: se ve en vivo detrás del modal, pero solo se guarda con "Guardar cambios".
  const [draft, setDraft] = useState<EditorPreferences>(savedPreferences);
  const update = (patch: Partial<EditorPreferences>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    setPreview(next);
  };
  // Cancelar / cerrar descarta la vista previa.
  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  const positions: SidebarPosition[] = ["left", "right"];
  const themes: SidebarTheme[] = ["simple", "explanatory"];

  if (typeof document === "undefined") return null;

  return createPortal(
    // El Modal de Caral cierra con clic en el velo (su primer hijo); aquí no, para no perder cambios por
    // un clic accidental. El velo no recibe clics y se cierra solo con la X, Cancelar o Guardar.
    <div className="contents [&>div>div:first-child]:pointer-events-none">
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t(`${K}.title`)}
        description={t(`${K}.subtitle`)}
        actions="double"
        secondaryActionText={t("moveJobsEditor.common.cancel")}
        onSecondaryAction={handleClose}
        primaryActionText={t(`${K}.save`)}
        primaryActionVariant="carbon"
        onPrimaryAction={() => {
          setPreferences(draft);
          setPreview(null);
          onClose();
        }}
        className="w-[680px]! max-w-[calc(100vw-2rem)]!"
      >
        <div className="flex flex-col gap-6 font-poppins">
          <section className="flex flex-col gap-2.5">
            <SectionTitle title={t(`${K}.positionTitle`)} />
            <div
              role="radiogroup"
              aria-label={t(`${K}.positionTitle`)}
              className="grid grid-cols-2! gap-5"
            >
              {positions.map((position) => (
                <OptionCard
                  key={position}
                  checked={draft.sidebarPosition === position}
                  onSelect={() => update({ sidebarPosition: position })}
                >
                  <PositionPreview position={position} />
                  <span className="flex items-center gap-2.5">
                    <RadioDot checked={draft.sidebarPosition === position} />
                    <span className="text-base font-semibold text-seidor-main-text">
                      {t(`${K}.${position}`)}
                    </span>
                  </span>
                </OptionCard>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <SectionTitle title={t(`${K}.themeTitle`)} />
            <div
              role="radiogroup"
              aria-label={t(`${K}.themeTitle`)}
              className="grid grid-cols-2! gap-5"
            >
              {themes.map((theme) => (
                <OptionCard
                  key={theme}
                  checked={draft.sidebarTheme === theme}
                  onSelect={() => update({ sidebarTheme: theme })}
                >
                  <span className="flex items-center gap-2.5">
                    <RadioDot checked={draft.sidebarTheme === theme} />
                    <span className="text-base font-semibold text-seidor-main-text">
                      {t(`${K}.${theme}`)}
                    </span>
                  </span>
                  <span className="text-sm text-neutral-900">
                    {t(`${K}.${theme}Desc`)}
                  </span>
                </OptionCard>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <SectionTitle
              title={t(`${K}.colorTitle`)}
              subtitle={t(`${K}.colorSubtitle`)}
            />
            <div
              role="radiogroup"
              aria-label={t(`${K}.colorTitle`)}
              className="flex flex-wrap gap-2.5"
            >
              {TRIGGER_COLORS.map((color) => {
                const checked = draft.triggerColor === color;
                const classes = TRIGGER_COLOR_CLASSES[color];
                return (
                  // Muestra de color de 30×30: <button> nativo (el Button de Caral impone padding y alto mínimo).
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={t(`${K}.colors.${color}`)}
                    title={t(`${K}.colors.${color}`)}
                    onClick={() => update({ triggerColor: color })}
                    className={`flex size-[30px] cursor-pointer items-center justify-center rounded-md text-neutral-100 transition-opacity hover:opacity-80 ${
                      checked ? classes.solid : classes.swatch
                    }`}
                  >
                    {checked && <CaralIcon name="check" size={22} />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </Modal>
    </div>,
    document.body,
  );
}
