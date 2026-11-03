"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Steps } from "caralstable";
import { CaralIcon, type CaralBrandName } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import catalogData from "@/data/accelerate/catalog.json";
import catalogDetailsData from "@/data/accelerate/catalogDetails.json";
import deploySetupData from "@/data/accelerate/deploySetup.json";
import type {
  AccelerateCatalogDetail,
  AccelerateCatalogItem,
  AccelerateDeploySetup,
  SapSource,
  SourceTable,
} from "../types";
import { OriginStep } from "./OriginStep";
import { DestinationStep } from "./DestinationStep";
import { ValidationStep } from "./ValidationStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { DeploymentStep } from "./DeploymentStep";

const catalog = catalogData as AccelerateCatalogItem[];
const catalogDetails = catalogDetailsData as Record<
  string,
  AccelerateCatalogDetail
>;
const setup = deploySetupData as AccelerateDeploySetup;

/** Tablas a validar: metadata del entorno de la conexión, o las tablas SAP del catálogo como respaldo. */
function tablesToValidate(
  item: AccelerateCatalogItem,
  source: SapSource,
): SourceTable[] {
  const environments =
    catalogDetails[item.id]?.sourceTables?.environments ?? [];
  const env =
    environments.find((e) => e.id === source.metadataEnvironment) ??
    environments[0];
  if (env) return env.tables;
  return item.sapTables.map((table) => ({
    table,
    description: "",
    records: 0,
    lastLoad: "",
    flow: "",
    frequencyMinutes: 0,
    status: "available",
  }));
}

const STEP_COUNT = 5;

/** Asistente "Desplegar ACT-IN": origen SAP → destino → validación → confirmación → despliegue. */
export function DeployWizard({ catalogId }: { catalogId: string }) {
  const router = useRouter();
  const { dict, language } = useLanguage();
  const t = dict.accelerate.deploy;
  const td = dict.accelerate.detail;
  const tm = dict.accelerate.models;

  const item = catalog.find((c) => c.id === catalogId);
  const detailHref = `/accelerate/models/${catalogId}`;

  const [step, setStep] = useState(0);

  // Paso 1 · origen
  const [sourceId, setSourceId] = useState(setup.sapSources[0].id);
  const source = setup.sapSources.find((s) => s.id === sourceId) as SapSource;
  const [companies, setCompanies] = useState<string[]>(source.defaultCompanies);

  // Paso 2 · destino
  const firstAvailable =
    item?.destinations.find((d) => d.available)?.brand ?? null;
  const [platform, setPlatform] = useState<CaralBrandName | null>(
    firstAvailable,
  );
  const workspaces = (platform && setup.workspaces[platform]) || [];
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [customLakehouse, setCustomLakehouse] = useState<string | null>(null);

  const selectedCountries = useMemo(() => {
    const codes = source.companies
      .filter((c) => companies.includes(c.code))
      .map((c) => c.country);
    return Array.from(new Set(codes));
  }, [source, companies]);

  const regionNames = useMemo(
    () => new Intl.DisplayNames([language], { type: "region" }),
    [language],
  );
  const regionName = (code: string) => regionNames.of(code) ?? code;

  const countriesLabel = useMemo(
    () =>
      new Intl.ListFormat(language, { type: "conjunction" }).format(
        selectedCountries.map((code) => regionNames.of(code) ?? code),
      ),
    [selectedCountries, language, regionNames],
  );

  // Sugerencia de lakehouse mientras el usuario no lo edite: LH_<cliente>_<SD>_<CLAR>.
  const suggestedLakehouse = item
    ? [setup.lakehousePrefix, item.code, selectedCountries.join("")]
        .filter(Boolean)
        .join("_")
    : "";
  const lakehouse = customLakehouse ?? suggestedLakehouse;

  // Paso 3 · validación: vale mientras no cambie el origen (conexión + sociedades).
  const validationKey = `${sourceId}|${[...companies].sort().join(",")}`;
  const [validatedKey, setValidatedKey] = useState<string | null>(null);

  // Paso 5 · despliegue
  const [deployed, setDeployed] = useState(false);

  if (!item || item.availability !== "available" || !item.contracted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-container p-10 text-center font-poppins">
        <p className="text-base text-neutral-900">
          {item ? t.notDeployable : td.notFound}
        </p>
        <Button
          variant="light"
          hasBorder
          iconName="arrowLeft"
          onClick={() => router.push(item ? detailHref : "/accelerate/models")}
        >
          {item ? t.backToDetail : td.backToCatalog}
        </Button>
      </div>
    );
  }

  const changeSource = (id: string) => {
    const next = setup.sapSources.find((s) => s.id === id);
    if (!next) return;
    setSourceId(id);
    setCompanies(next.defaultCompanies);
  };

  const toggleCompany = (code: string) =>
    setCompanies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  const changePlatform = (brand: CaralBrandName) => {
    setPlatform(brand);
    setWorkspaceId(setup.workspaces[brand]?.[0]?.id ?? "");
  };

  const validationTables = tablesToValidate(item, source);
  const isValidated = validatedKey === validationKey;

  const stepValid = [
    companies.length > 0 && source.health !== "unreachable",
    Boolean(platform && workspaceId && lakehouse.trim()),
    // Las tablas desactualizadas no bloquean; las faltantes sí.
    isValidated && !validationTables.some((r) => r.status === "missing"),
    true, // Confirmación: solo resumen.
    false, // TODO: despliegue pendiente de diseño.
  ];
  const isConfirmStep = step === 3;
  const isDeployStep = step === 4;

  const envLabel = {
    production: t.envProduction,
    quality: t.envQuality,
    development: t.envDevelopment,
  }[source.environment];
  const platformName =
    item.destinations.find((d) => d.brand === platform)?.name ?? "";

  const detail = catalogDetails[item.id];
  const deploymentName = countriesLabel
    ? `${item.name} · ${countriesLabel}`
    : item.name;
  // Frecuencia de deltas: el flujo Move más frecuente entre las tablas del modelo.
  const deltaMinutes = Math.min(
    ...validationTables.map((r) => r.frequencyMinutes).filter((m) => m > 0),
    Infinity,
  );

  const stepLabels = [
    t.stepOrigin,
    t.stepDestination,
    t.stepValidation,
    t.stepConfirmation,
    t.stepDeployment,
  ];
  const steps = stepLabels.map((label, i) => ({
    label,
    // Al terminar el despliegue, el último paso también queda completado.
    status:
      i < step || (deployed && i === step)
        ? ("done" as const)
        : i === step
          ? ("default" as const)
          : ("disabled" as const),
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2.5 pb-10 font-poppins">
      <header className="flex flex-col gap-3 rounded-2xl bg-container px-4 py-3">
        <nav
          aria-label={td.breadcrumb}
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <Link
            href="/accelerate/models?tab=catalog"
            className="flex items-center gap-1.5 text-info-main transition-colors hover:text-info-hard"
          >
            <CaralIcon name="arrowLeft" size={18} color="currentColor" />
            {tm.title}
          </Link>
          <span className="text-neutral-800">/</span>
          <Link
            href={detailHref}
            className="text-info-main transition-colors hover:text-info-hard"
          >
            {item.name}
          </Link>
          <span className="text-neutral-800">/</span>
          <span aria-current="page" className="text-neutral-800">
            {t.breadcrumbDeploy}
          </span>
        </nav>

        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-18 shrink-0 items-center justify-center rounded-xl bg-warning-main text-4xl font-bold text-neutral-100">
            {item.code}
          </span>
          <div className="flex min-w-0 flex-col">
            <h1 className="text-3xl font-bold text-seidor-main-text">
              {formatMessage(t.title, { name: item.name })}
            </h1>
            <p className="text-base text-neutral-800">{deploymentName}</p>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg bg-container px-2.5 py-2.5">
        {/* Solo se puede volver a pasos ya completados desde el stepper. */}
        <Steps
          steps={steps}
          // Caral pinta los pasos pendientes con text-neutral-500 (ilegible en claro): se sube el contraste.
          className="w-full! min-w-[720px] [&_.text-neutral-500]:text-neutral-800!"
          onStepClick={(i) => {
            if (i < step && !isDeployStep) setStep(i);
          }}
        />
      </div>

      {step === 0 && (
        <OriginStep
          sources={setup.sapSources}
          source={source}
          onSourceChange={changeSource}
          companies={companies}
          onToggleCompany={toggleCompany}
        />
      )}

      {step === 1 && (
        <DestinationStep
          platforms={item.destinations}
          descriptions={setup.platformDescriptions}
          platform={platform}
          onPlatformChange={changePlatform}
          workspaces={workspaces}
          workspaceId={workspaceId}
          onWorkspaceChange={setWorkspaceId}
          lakehouse={lakehouse}
          onLakehouseChange={setCustomLakehouse}
        />
      )}

      {step === 2 && (
        <ValidationStep
          // Remonta (y re-escanea) si cambió el origen desde la última validación.
          key={validationKey}
          modelName={item.name}
          system={source.system}
          tables={validationTables}
          alreadyValidated={isValidated}
          onComplete={() => setValidatedKey(validationKey)}
          onRestart={() => setValidatedKey(null)}
        />
      )}

      {isConfirmStep && (
        <ConfirmationStep
          item={item}
          deploymentName={deploymentName}
          source={source}
          companies={source.companies.filter((c) => companies.includes(c.code))}
          regionName={regionName}
          platformName={
            item.destinations.find((d) => d.brand === platform)?.name ?? ""
          }
          workspace={workspaces.find((w) => w.id === workspaceId)}
          lakehouse={lakehouse}
          deltaMinutes={Number.isFinite(deltaMinutes) ? deltaMinutes : 15}
          masterDataDailyAt={setup.deployment.masterDataDailyAt}
          servicePrincipal={setup.deployment.servicePrincipal}
          objects={detail?.destinationObjects?.objects ?? []}
          reports={detail?.reports ?? []}
          estimatedMinutes={
            setup.deployment.estimatedMinutes[item.id] ??
            setup.deployment.defaultEstimatedMinutes
          }
          outdatedTables={validationTables
            .filter((r) => r.status === "outdated")
            .map((r) => r.table)}
        />
      )}

      {isDeployStep && (
        <DeploymentStep
          modelName={item.name}
          route={`${source.system} · ${envLabel} → ${[
            platformName,
            workspaces.find((w) => w.id === workspaceId)?.name,
          ]
            .filter(Boolean)
            .join(" · ")}`}
          platformName={platformName}
          objects={detail?.destinationObjects?.objects ?? []}
          reports={detail?.reports ?? []}
          sourceTables={validationTables}
          onComplete={() => setDeployed(true)}
        />
      )}

      <footer className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Paso 1: Cancelar sale del asistente; desde el paso 2 se reemplaza por Atrás.
            En el despliegue ya no se puede volver. */}
        <div>
          {isDeployStep ? null : step === 0 ? (
            <Button
              variant="light"
              hasBorder
              onClick={() => router.push(detailHref)}
            >
              {t.cancel}
            </Button>
          ) : (
            <Button
              variant="light"
              hasBorder
              iconName="arrowLeft"
              onClick={() => setStep(step - 1)}
            >
              {t.back}
            </Button>
          )}
        </div>
        <span className="text-base text-neutral-800">
          {formatMessage(t.stepCounter, {
            current: step + 1,
            total: STEP_COUNT,
          })}
        </span>
        <div className="flex justify-end">
          {isDeployStep ? (
            // El despliegue corre en segundo plano: se puede salir antes de que termine.
            <Button
              variant={deployed ? "carbon" : "light"}
              hasBorder={!deployed}
              onClick={() => router.push("/accelerate/models?tab=deployed")}
            >
              {deployed ? t.viewDeployedModels : t.continueInBackground}
            </Button>
          ) : (
            // En la confirmación el avance es la acción de desplegar.
            <Button
              variant={isConfirmStep ? "warning" : "carbon"}
              iconName={isConfirmStep ? "planeDeparture" : undefined}
              disabled={!stepValid[step]}
              onClick={() => setStep(step + 1)}
            >
              {isConfirmStep ? td.deployModel : t.next}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
