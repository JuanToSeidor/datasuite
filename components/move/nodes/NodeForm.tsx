"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Chip, Toggle } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { AnaliceIcon } from "@/components/icons/AnaliceIcon";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalice } from "@/contexts/AnaliceContext";
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

const STEP_COUNT = 3;

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
  const { toggleAnalice } = useAnalice();
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

  const stepComplete = [
    name.trim() !== "",
    origin.sourceId !== "" && origin.extractionType !== "",
    destination.destinationId !== "" && destination.outputType !== "",
  ];
  // Al crear, cada paso se desbloquea cuando los anteriores están completos. Al editar, todos están libres.
  const isStepUnlocked = (index: number) => isEdit || stepComplete.slice(0, index).every(Boolean);

  const goToStep = (index: number) => {
    if (isStepUnlocked(index)) setStepIndex(index);
  };

  const steps = useMemo(
    () => [
      { title: t.stepGeneral, desc: t.stepGeneralDesc },
      { title: t.stepOrigin, desc: t.stepOriginDesc },
      { title: t.stepDestination, desc: t.stepDestinationDesc },
    ],
    [t]
  );

  const isLastStep = stepIndex === STEP_COUNT - 1;
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
            <p className="max-w-[635px] text-base text-neutral-900">{isEdit ? t.editSubtitle : t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="light" onClick={toggleAnalice}>
              <span className="flex items-center gap-2">
                <AnaliceIcon size={20} />
                {t.askAnalice}
              </span>
            </Button>
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

        <div className="flex sd:flex-col gap-3 md:flex-row md:items-start">
          {/* Navegación de pasos (pestañas verticales) */}
          <nav
            role="tablist"
            aria-orientation="vertical"
            className="flex sd:w-full shrink-0 flex-col gap-1 rounded-[20px] bg-container p-3 md:w-[300px]"
          >
            {steps.map((step, index) => {
              const active = index === stepIndex;
              const locked = !isStepUnlocked(index);
              // El check de completado solo tiene sentido en el flujo de creación.
              const completed = !isEdit && !active && stepComplete[index] && index < stepIndex;
              return (
                <div
                  key={step.title}
                  role="tab"
                  tabIndex={locked ? -1 : 0}
                  aria-selected={active}
                  aria-disabled={locked}
                  title={locked ? t.stepLocked : undefined}
                  onClick={() => goToStep(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToStep(index);
                    }
                  }}
                  className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-4 py-3 text-left transition-colors ${
                    locked
                      ? "cursor-not-allowed opacity-50"
                      : active
                        ? "cursor-pointer bg-info-100"
                        : "cursor-pointer hover:bg-neutral-500/30"
                  }`}
                >
                  {completed ? (
                    <span className="flex items-center gap-1.5 text-base font-semibold text-success-main">
                      <span className="flex size-5 items-center justify-center rounded-full bg-success-light">
                        <CaralIcon name="check" size={12} />
                      </span>
                      {step.title}
                    </span>
                  ) : (
                    <span
                      className={`flex w-full items-center justify-between gap-2 text-base font-semibold ${
                        active ? "text-info-main" : "text-neutral-900"
                      }`}
                    >
                      <span>{isEdit ? step.title : `${index + 1} ${step.title}`}</span>
                      {locked && <CaralIcon name="lock" size={16} />}
                    </span>
                  )}
                  <span className={`text-sm ${completed ? "text-success-main" : "text-neutral-800"}`}>{step.desc}</span>
                </div>
              );
            })}
          </nav>

          {/* Contenido del paso */}
          <section className="flex min-w-0 flex-1 flex-col gap-3">
            {stepIndex === 0 ? (
              <GeneralStep
                showDetails={isEdit}
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
            ) : stepIndex === 1 ? (
              <OriginStep value={origin} onChange={setOrigin} />
            ) : (
              <DestinationStep value={destination} onChange={setDestination} />
            )}

            {/* Pie con navegación entre pasos: solo en el flujo de creación */}
            {!isEdit && (
              <footer className="flex items-center justify-between gap-3 rounded-[20px] bg-container p-4">
                <Link href="/move/nodes">
                  <Button variant="light">{dict.common.cancel}</Button>
                </Link>
                <span className="text-sm text-neutral-800">
                  {t.stepCounter.replace("{current}", String(stepIndex + 1)).replace("{total}", String(STEP_COUNT))}
                </span>
                {isLastStep ? (
                  <Button variant="info" onClick={handleSave} disabled={!stepComplete[stepIndex]}>
                    {dict.common.save}
                  </Button>
                ) : (
                  <Button
                    variant="info"
                    iconName="arrowRight"
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
    </div>
  );
}

interface GeneralStepProps {
  /** Información, trabajos relacionados y zona de peligro: solo al editar un nodo existente. */
  showDetails: boolean;
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

function GeneralStep({
  showDetails,
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

      {showDetails && (
        <>
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
      )}
    </>
  );
}
