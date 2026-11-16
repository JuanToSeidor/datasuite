"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Chip, Tabs, Toggle } from "caralstable";
import { Brand, CaralIcon, type CaralBrandName } from "@/components/icons";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidePanel } from "@/contexts/SidePanelContext";
import newNodeData from "@/data/move/newNode.json";
import nodesData from "@/data/move/nodes.json";
import originData from "@/data/move/originSource.json";
import destinationData from "@/data/move/destination.json";
import type { MoveNode, MoveNodeStatus } from "./NodesTable";
import { NodeSummaryPanel } from "./NodeSummaryPanel";
import { OriginStep, type OriginSelection } from "./origin/OriginStep";
import { DestinationStep, type DestinationSelection } from "./destination/DestinationStep";

interface RelatedJob {
  id: string;
  name: string;
  status: "neutral" | "danger";
}

export type NodeFormMode = "create" | "edit";

interface NodeFormProps {
  mode: NodeFormMode;
  /** Solo en modo edición: id del nodo a editar. */
  nodeId?: string;
}

const LOCALE_BY_LANGUAGE: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  pt: "pt-BR",
};


const STATUS_CHIP_VARIANT: Record<MoveNodeStatus, "success" | "warning" | "danger"> = {
  enabled: "success",
  drafted: "warning",
  stop: "danger",
};

const nodes = nodesData as MoveNode[];

// Demo: los nodos mock no guardan su configuración SAP, así que al editar se
// preseleccionan la primera conexión y el destino de la misma plataforma.
function initialOrigin(node?: MoveNode): OriginSelection {
  if (!node) return { sourceId: "", extractionType: "" };
  return { sourceId: originData.connections[0].id, extractionType: originData.extractionTypes[0] };
}

function initialDestination(node?: MoveNode): DestinationSelection {
  if (!node) return { destinationId: "", outputType: "" };
  const match = destinationData.destinations.find((d) => d.brandName === node.destination.brandName);
  return {
    destinationId: (match ?? destinationData.destinations[0]).id,
    outputType: destinationData.outputTypes[0],
  };
}

/** Pantalla de nodo (crear o editar). Se monta en cliente porque el idioma vive en localStorage. */
export function NodeFormScreen(props: NodeFormProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <NodeForm {...props} />;
}

function NodeForm({ mode, nodeId }: NodeFormProps) {
  const isEdit = mode === "edit";
  const node = isEdit ? nodes.find((n) => n.id === nodeId) : undefined;

  if (isEdit && !node) return <NodeNotFound />;
  return <NodeFormContent mode={mode} node={node} />;
}

function NodeNotFound() {
  const { dict } = useLanguage();
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col items-start gap-3 rounded-[20px] bg-container p-5 font-poppins">
      <p className="text-base text-neutral-900">{dict.move.newNode.nodeNotFound}</p>
      <Link href="/move/nodes" className="flex items-center gap-1.5 text-info-main hover:text-info-hard transition-colors">
        <CaralIcon name="arrowLeft" size={20} />
        <span>{dict.move.nodes.title}</span>
      </Link>
    </div>
  );
}

function NodeFormContent({ mode, node }: { mode: NodeFormMode; node?: MoveNode }) {
  const isEdit = mode === "edit";
  const { dict, language } = useLanguage();
  const t = dict.move.newNode;
  const tNodes = dict.move.nodes;
  const router = useRouter();
  const { isSidePanelOpen, openSidePanel, closeSidePanel } = useSidePanel();
  const locale = LOCALE_BY_LANGUAGE[language] ?? "en-US";

  const toggleSummary = () => {
    if (isSidePanelOpen) {
      closeSidePanel();
    } else {
      openSidePanel(<NodeSummaryPanel />);
    }
  };

  // Al editar, el resumen del nodo arranca abierto. Funciona porque este componente
  // se monta un render después de la ruta (NodeFormScreen espera a estar en cliente),
  // así que DashboardLayout ya vació el panel de la página anterior.
  useEffect(() => {
    if (isEdit) openSidePanel(<NodeSummaryPanel />);
  }, [isEdit, openSidePanel]);

  // Estado de los tres pasos: vive aquí para validar el avance y no perderse al cambiar de paso.
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState<string>(node?.name ?? "");
  const [isActive, setIsActive] = useState<boolean>(node ? node.status === "enabled" : newNodeData.defaults.isActive);
  const [limit, setLimit] = useState<string>(newNodeData.defaults.limit);
  const [timeout, setTimeoutValue] = useState<string>(newNodeData.defaults.timeout);
  const [origin, setOrigin] = useState<OriginSelection>(() => initialOrigin(node));
  const [destination, setDestination] = useState<DestinationSelection>(() => initialDestination(node));
  // Panel de Origen expandido: oculta la conexión y compacta el encabezado para dar espacio al mapeo.
  const [isOriginExpanded, setIsOriginExpanded] = useState(false);
  const isCompact = stepIndex === 1 && isOriginExpanded;
  const handleOriginExpandedChange = (expanded: boolean) => {
    setIsOriginExpanded(expanded);
    if (expanded) closeSidePanel();
  };

  const stepComplete = [
    name.trim() !== "",
    origin.sourceId !== "" && origin.extractionType !== "",
    destination.destinationId !== "" && destination.outputType !== "",
    true,
  ];
  // Al crear, cada paso se desbloquea cuando los anteriores están completos. Al editar, todos están libres.
  const isStepUnlocked = (index: number) => isEdit || stepComplete.slice(0, index).every(Boolean);

  const goToStep = (index: number) => {
    if (isStepUnlocked(index)) setStepIndex(index);
  };

  // Al editar: pestañas General/Origen/Destino. Al crear: asistente Nombre → Origen → Destino → Confirmación.
  const steps = useMemo(
    () =>
      isEdit
        ? [t.stepGeneral, t.stepOrigin, t.stepDestination]
        : [t.stepName, t.stepOrigin, t.stepDestination, t.stepConfirmation],
    [t, isEdit]
  );
  const stepCount = steps.length;
  const isLastStep = stepIndex === stepCount - 1;
  const formatDate = (value: Date) =>
    value.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const createdOn = node ? formatDate(new Date(`${node.createdAt}T00:00:00`)) : formatDate(new Date());

  // Guardado demo: la pantalla no persiste datos todavía; regresa al listado.
  const handleSave = () => router.push("/move/nodes");

  // Menú desplegable del botón Guardar del encabezado.
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSaveMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setIsSaveMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSaveMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSaveMenuOpen]);

  const saveOptions = [
    { id: "publish", label: t.savePublish, iconName: "cloudUp" as const, onSelect: handleSave },
    { id: "draft", label: t.saveDraft, iconName: "save" as const, onSelect: handleSave },
    { id: "copy", label: t.saveCopy, iconName: "copy" as const, onSelect: () => setShowCopyToast(true) },
  ];

  const statusLabel = (status: MoveNodeStatus) =>
    status === "enabled" ? tNodes.statusEnabled : status === "drafted" ? tNodes.statusDrafted : tNodes.statusStop;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-10 font-poppins">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Encabezado */}
        <header className="flex flex-wrap items-end justify-between gap-4 rounded-[20px] bg-container p-5">
          <div className="flex flex-col gap-2">
            <nav className="flex items-center gap-2 text-base">
              <Link href="/move/nodes" className="flex items-center gap-1.5 text-info-main hover:text-info-hard transition-colors">
                <CaralIcon name="arrowLeft" size={20} />
                <span>{tNodes.title}</span>
              </Link>
              <span className="text-neutral-800">/</span>
              <span className="text-neutral-800">{isEdit && node ? node.name : t.breadcrumbNew}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                {isEdit ? t.editTitle : t.title}
              </h1>
              {isEdit && node ? (
                <Chip variant={STATUS_CHIP_VARIANT[node.status]} label={statusLabel(node.status)} hasBorder />
              ) : (
                <Chip variant="warning" label={t.draft} hasBorder />
              )}
            </div>
            {/* Subtítulo y pestañas: se colapsan en alto cuando el panel de Origen está expandido */}
            <div
              inert={isCompact}
              aria-hidden={isCompact}
              className={`-mt-2 grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
                isCompact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
              }`}
            >
              <div className="flex min-h-0 flex-col gap-2 overflow-hidden pt-2">
                <p className="max-w-[635px] text-base text-neutral-900">{isEdit ? t.editSubtitle : t.subtitle}</p>
                {/* Al editar, los pasos se navegan con pestañas horizontales en el encabezado */}
                {isEdit && (
                  <Tabs
                    className="mt-1 w-fit"
                    tabs={steps.map((step) => ({ label: step }))}
                    activeIndex={stepIndex}
                    onChange={goToStep}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isSidePanelOpen ? "info" : "light"}
              isIconButton
              iconName="closeSidebarLeft"
              title={t.summaryToggle}
              aria-pressed={isSidePanelOpen}
              onClick={toggleSummary}
            />
            <div ref={saveMenuRef} className="relative">
              <Button
                variant="info"
                isDropdown
                isOpen={isSaveMenuOpen}
                aria-haspopup="menu"
                aria-expanded={isSaveMenuOpen}
                onClick={() => setIsSaveMenuOpen((open) => !open)}
              >
                {dict.common.save}
              </Button>
              {isSaveMenuOpen && (
                <div
                  role="menu"
                  aria-label={t.saveMenu}
                  className="absolute right-0 top-full z-50 mt-2 flex w-60 flex-col gap-1 rounded-2xl border border-neutral-500 bg-container p-2 shadow-xl"
                >
                  {saveOptions.map((option) => (
                    <Button
                      key={option.id}
                      role="menuitem"
                      variant="ghost"
                      className="w-full justify-start! text-left text-neutral-900! hover:bg-neutral-500"
                      onClick={() => {
                        setIsSaveMenuOpen(false);
                        option.onSelect();
                      }}
                    >
                      <span className="flex w-full items-center justify-start gap-2">
                        <CaralIcon name={option.iconName} size={20} color="var(--color-neutral-800)" />
                        {option.label}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {showCopyToast && (
          <Alert
            type="toast"
            position="top-right"
            variant="success"
            title={t.copySaved}
            description={t.copySavedDesc}
            onClose={() => setShowCopyToast(false)}
            autoClose={3000}
          />
        )}

        {/* Asistente de creación: pasos horizontales */}
        {!isEdit && (
          <CreateStepper steps={steps} current={stepIndex} isUnlocked={isStepUnlocked} onSelect={goToStep} />
        )}

        {/* Contenido del paso */}
        <section className="flex min-w-0 flex-col gap-3">
          {stepIndex === 0 ? (
            isEdit ? (
              <GeneralStep
                name={name}
                onNameChange={setName}
                isActive={isActive}
                onActiveChange={setIsActive}
                limit={limit}
                onLimitChange={setLimit}
                timeout={timeout}
                onTimeoutChange={setTimeoutValue}
                createdBy={node?.createdBy ?? newNodeData.createdBy}
                avatarText={node?.avatarText}
                createdOn={createdOn}
              />
            ) : (
              <NameStep name={name} onNameChange={setName} />
            )
          ) : stepIndex === 1 ? (
            <OriginStep
              value={origin}
              onChange={setOrigin}
              // Al crear, el origen arranca en una tarjeta angosta y se abre a dos paneles al elegir el tipo.
              limited={!isEdit && origin.extractionType === ""}
              expanded={isOriginExpanded}
              onExpandedChange={handleOriginExpandedChange}
            />
          ) : stepIndex === 2 ? (
            <DestinationStep value={destination} onChange={setDestination} />
          ) : (
            <ConfirmStep name={name} origin={origin} destination={destination} />
          )}

          {/* Pie con navegación entre pasos: solo en el flujo de creación */}
          {!isEdit && (
            <footer className="flex items-center justify-between gap-3">
              {stepIndex === 0 ? (
                <Link href="/move/nodes">
                  <Button variant="light" hasBorder>
                    {dict.common.cancel}
                  </Button>
                </Link>
              ) : (
                <Button variant="light" onClick={() => setStepIndex(stepIndex - 1)}>
                  {t.previous}
                </Button>
              )}
              <span className="text-base text-neutral-800">
                {t.stepCounter.replace("{current}", String(stepIndex + 1)).replace("{total}", String(stepCount))}
              </span>
              {isLastStep ? (
                <Button variant="default" className="text-neutral-100!" onClick={handleSave}>
                  {t.createNode}
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="text-neutral-100!"
                  disabled={!stepComplete[stepIndex]}
                  title={stepComplete[stepIndex] ? undefined : t.stepLocked}
                  onClick={() => goToStep(stepIndex + 1)}
                >
                  {t.next}
                </Button>
              )}
            </footer>
          )}
        </section>
      </div>
    </div>
  );
}

interface GeneralStepProps {
  name: string;
  onNameChange: (value: string) => void;
  isActive: boolean;
  onActiveChange: (value: boolean) => void;
  limit: string;
  onLimitChange: (value: string) => void;
  timeout: string;
  onTimeoutChange: (value: string) => void;
  createdBy: string;
  avatarText?: string;
  createdOn: string;
}

/** Paso General al editar: datos del nodo, información, trabajos relacionados y zona de peligro. */
function GeneralStep({
  name,
  onNameChange,
  isActive,
  onActiveChange,
  limit,
  onLimitChange,
  timeout,
  onTimeoutChange,
  createdBy,
  avatarText,
  createdOn,
}: GeneralStepProps) {
  const { dict } = useLanguage();
  const t = dict.move.newNode;
  const jobs = newNodeData.relatedJobs as RelatedJob[];
  const initials =
    avatarText ??
    createdBy
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      {/* Conexión de origen */}
      <div className="flex flex-col gap-5 rounded-[12px] bg-container p-5">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">{t.originSection}</h2>
          <div className="h-px w-full bg-neutral-500" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label={t.name}
            placeholder={dict.move.nodes.nodeNamePlaceholder}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-neutral-800">{t.activeNode}</span>
            <div className="flex items-center gap-2.5 rounded-md border border-success-main bg-success-light p-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success-main">
                <CaralIcon name="badgeSync" size={18} />
              </span>
              <span className="min-w-0 flex-1 text-sm text-neutral-900">{t.activeNodeDesc}</span>
              <Toggle checked={isActive} onChange={onActiveChange} />
            </div>
          </div>

          <Input
            label={t.limit}
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            helperText={t.limitHelp}
          />

          <Input
            label={t.timeout}
            value={timeout}
            onChange={(e) => onTimeoutChange(e.target.value)}
            helperText={t.timeoutHelp}
          />
        </div>
      </div>

          {/* Información y trabajos relacionados */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-5 rounded-[12px] bg-container p-5">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-neutral-900">{t.information}</h2>
                <div className="h-px w-full bg-neutral-500" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-seidor-main text-sm font-bold text-neutral-100">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-neutral-900">
                    {t.createdBy.replace("{user}", createdBy)}
                  </span>
                  <span className="text-sm text-neutral-800">{t.createdOn.replace("{date}", createdOn)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-[12px] bg-container p-5">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-neutral-900">{t.relatedJobs}</h2>
                <div className="h-px w-full bg-neutral-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {jobs.map((job) => (
                  <Chip
                    key={job.id}
                    variant={job.status === "danger" ? "danger" : "light"}
                    label={job.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Zona de peligro */}
          <div className="flex flex-col gap-5 rounded-[12px] bg-container border border-danger-main/30 p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-neutral-900">{t.dangerZoneTitle}</h2>
              <p className="text-sm text-neutral-800">{t.dangerZoneDesc}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-danger-light p-3">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-neutral-900">{t.deleteNode}</span>
                <span className="text-sm text-neutral-800">{t.deleteNodeDesc}</span>
              </div>
              <Button variant="danger" iconName="trash">
                {t.deleteNodeButton}
              </Button>
            </div>
          </div>
    </>
  );
}

/** Pasos horizontales del asistente de creación: completado (verde), actual (contorno) y pendiente (relleno gris). */
function CreateStepper({
  steps,
  current,
  isUnlocked,
  onSelect,
}: {
  steps: string[];
  current: number;
  isUnlocked: (index: number) => boolean;
  onSelect: (index: number) => void;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode;
  return (
    <nav aria-label={t.stepsLabel} className="rounded-[8px] bg-container p-2.5">
      <ol className="flex items-center gap-2.5">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const locked = !isUnlocked(index);
          return (
            <li key={step} className="flex min-w-0 flex-1 items-center gap-2.5 last:flex-none">
              {/* Disparador transparente sobre el círculo y el nombre del paso: un Button de Caral impondría su fondo y alto */}
              <button
                type="button"
                disabled={locked || active}
                aria-current={active ? "step" : undefined}
                title={locked ? t.stepLocked : undefined}
                onClick={() => onSelect(index)}
                className={`flex shrink-0 items-center gap-2.5 rounded-md text-sm font-medium ${
                  locked ? "cursor-not-allowed" : active ? "cursor-default" : "cursor-pointer hover:underline"
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full border text-sm ${
                    done
                      ? "border-success-hard bg-success-main text-neutral-100"
                      : active
                        ? "border-neutral-800 text-neutral-800"
                        : "border-neutral-500 bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`max-sm:sr-only ${done ? "text-success-main" : active ? "text-neutral-900" : "text-neutral-800"}`}
                >
                  {step}
                </span>
              </button>
              {index < steps.length - 1 && <span aria-hidden className="h-px min-w-4 flex-1 bg-neutral-800" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Tarjeta centrada de ancho limitado que usan los pasos simples del asistente. */
function WizardCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[792px] flex-col gap-5 rounded-[12px] bg-container p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold tracking-tight text-seidor-main-text">{title}</h2>
          {description && <p className="text-base text-neutral-800">{description}</p>}
        </div>
        <div className="h-px w-full bg-neutral-500" />
      </div>
      {children}
    </div>
  );
}

function NameStep({ name, onNameChange }: { name: string; onNameChange: (value: string) => void }) {
  const { dict } = useLanguage();
  const t = dict.move.newNode;
  return (
    <WizardCard title={t.nameTitle} description={t.nameDesc}>
      <div className="py-10">
        <Input
          label={t.name}
          placeholder={dict.move.nodes.nodeNamePlaceholder}
          value={name}
          autoFocus
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
    </WizardCard>
  );
}

function ConfirmStep({
  name,
  origin,
  destination,
}: {
  name: string;
  origin: OriginSelection;
  destination: DestinationSelection;
}) {
  const { dict } = useLanguage();
  const t = dict.move.newNode;
  const source = originData.connections.find((c) => c.id === origin.sourceId);
  const target = destinationData.destinations.find((d) => d.id === destination.destinationId);

  const rows: { label: string; value: string; brand?: CaralBrandName }[] = [
    { label: t.name, value: name },
    { label: t.stepOrigin, value: source?.name ?? "—", brand: "SAP" },
    { label: t.summaryExtraction, value: origin.extractionType },
    { label: t.stepDestination, value: target?.name ?? "—", brand: target?.brandName as CaralBrandName | undefined },
    { label: t.confirmOutput, value: destination.outputType },
  ];

  return (
    <WizardCard title={t.confirmTitle} description={t.confirmDesc}>
      <dl className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <dt className="text-sm font-medium text-neutral-800">{row.label}</dt>
            <dd className="flex items-center gap-2 text-base text-neutral-900">
              {row.brand && <Brand name={row.brand} size={20} />}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </WizardCard>
  );
}
