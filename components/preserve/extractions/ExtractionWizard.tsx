"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Steps } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMessage } from "@/lib/format";
import { SourceStep, sapConnections } from "./SourceStep";
import { CutOffStep, extractionDestinations } from "./CutOffStep";
import { ConfirmationStep } from "./ConfirmationStep";

const STEP_COUNT = 3;
const CONFIRMATION_STEP = STEP_COUNT - 1;

/** Asistente "Nueva extracción" de Preserve: origen → corte y destino → confirmación. */
export function ExtractionWizard() {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.preserve.extraction;

  const [step, setStep] = useState(0);
  const [sourceId, setSourceId] = useState(sapConnections[0].id);
  const [cutOff, setCutOff] = useState(extractionDestinations.defaultCutOff);
  const [destinationId, setDestinationId] = useState(extractionDestinations.defaultDestination);
  const isConfirmStep = step === CONFIRMATION_STEP;

  const sourceName = sapConnections.find((c) => c.id === sourceId)?.name ?? "";
  const stepLabels = [t.stepSource, t.stepCutOff, t.stepConfirmation];

  const steps = stepLabels.map((label, i) => ({
    label,
    status:
      i < step
        ? ("done" as const)
        : i === step
          ? ("default" as const)
          : ("disabled" as const),
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2.5 pb-10 font-poppins">
      {/* Encabezado: migas, título y cancelar */}
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-container px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1">
          <nav aria-label={t.breadcrumbExtractions} className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/preserve/extractions"
              className="flex items-center gap-1.5 text-info-main transition-colors hover:text-info-hard"
            >
              <CaralIcon name="arrowLeft" size={18} color="currentColor" />
              {t.breadcrumbExtractions}
            </Link>
            <span className="text-neutral-800">/</span>
            <span aria-current="page" className="text-neutral-800">
              {sourceName}
            </span>
          </nav>
          <h1 className="text-2xl font-bold text-neutral-900">{t.title}</h1>
          <p className="text-sm text-neutral-800">{t.subtitle}</p>
        </div>
        <Button variant="light" hasBorder onClick={() => router.push("/preserve/sources")}>
          {t.cancel}
        </Button>
      </header>

      {/* Stepper: solo se puede volver a pasos ya completados. */}
      <div className="overflow-x-auto rounded-lg bg-container px-2.5 py-2.5">
        <Steps
          steps={steps}
          // Caral pinta los pasos pendientes con text-neutral-500 (ilegible en claro): se sube el contraste.
          className="w-full! min-w-[720px] [&_.text-neutral-500]:text-neutral-800!"
          onStepClick={(i) => {
            if (i < step) setStep(i);
          }}
        />
      </div>

      {/* Cuerpo del paso */}
      {step === 0 && <SourceStep sourceId={sourceId} onSourceChange={setSourceId} />}
      {step === 1 && (
        <CutOffStep
          cutOff={cutOff}
          onCutOffChange={setCutOff}
          destinationId={destinationId}
          onDestinationChange={setDestinationId}
        />
      )}
      {step === CONFIRMATION_STEP && (
        <ConfirmationStep
          cutOff={cutOff}
          destinationId={destinationId}
          onBackToCutOff={() => setStep(1)}
        />
      )}

      {/* Navegación */}
      <footer className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          {step === 0 ? (
            <Button variant="light" hasBorder onClick={() => router.push("/preserve/sources")}>
              {t.cancel}
            </Button>
          ) : (
            <Button variant="light" hasBorder iconName="arrowLeft" onClick={() => setStep(step - 1)}>
              {t.back}
            </Button>
          )}
        </div>
        <span className="text-base text-neutral-800">
          {formatMessage(t.stepCounter, { current: step + 1, total: STEP_COUNT })}
        </span>
        <div className="flex justify-end">
          {isConfirmStep ? (
            // TODO: inicio de la extracción pendiente de diseño.
            <Button variant="success" iconName="arrowDownToLine" disabled>
              {t.start}
            </Button>
          ) : (
            <Button variant="success" onClick={() => setStep(step + 1)}>
              {t.next}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
