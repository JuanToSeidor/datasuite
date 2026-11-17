"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button, Drawer, Tabs } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TJob } from "@/lib/move/jobs/types";

type TriggerSection = "endpoint" | "auth" | "headers";
type SnippetFormat = "cURL" | "HTTP";

interface RequestHeader {
  key: string;
  value: string;
}

const SECTIONS: TriggerSection[] = ["endpoint", "auth", "headers"];
const SNIPPET_FORMATS: SnippetFormat[] = ["cURL", "HTTP"];

const DEFAULT_HEADERS: RequestHeader[] = [{ key: "Content-Type", value: "application/json" }];
const DEFAULT_AUTH: RequestHeader[] = [{ key: "Bearer Token", value: "••••••••••••••••••••" }];

/** URL base de la API de la demo (en datasync venía de `NEXT_PUBLIC_URL_BACK`). */
const DEMO_API_URL = "https://crestone.demo.seidoranalytics.com/api";
/** En datasync el token salía de la cookie de sesión; la demo no tiene sesión real. */
const DEMO_TOKEN = "<your-token>";

const copyToClipboard = (text: string) => {
  navigator.clipboard?.writeText(text).catch(() => undefined);
};

/** Fila editable de la tabla de auth / headers. */
function ParamRow({
  param,
  isEditing,
  isCopied,
  displayValue,
  keyPlaceholder,
  valuePlaceholder,
  onToggleEdit,
  onCopy,
  onDelete,
  onChange,
  labels,
}: {
  param: RequestHeader;
  isEditing: boolean;
  isCopied: boolean;
  displayValue: string;
  keyPlaceholder: string;
  valuePlaceholder: string;
  onToggleEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onChange: (field: "key" | "value", value: string) => void;
  labels: { edit: string; copy: string; delete: string };
}) {
  return (
    <div className="grid grid-cols-[1fr_2fr_110px] items-center gap-2 px-4 py-2.5 hover:bg-neutral-500/40">
      {isEditing ? (
        <Input
          autoFocus
          value={param.key}
          onChange={(e) => onChange("key", e.currentTarget.value)}
          placeholder={keyPlaceholder}
          className="font-mono"
        />
      ) : (
        <span className="truncate font-mono text-sm text-neutral-900">{param.key}</span>
      )}
      {isEditing ? (
        <Input
          value={param.value}
          onChange={(e) => onChange("value", e.currentTarget.value)}
          placeholder={valuePlaceholder}
          className="font-mono"
        />
      ) : (
        <span className="truncate font-mono text-sm text-neutral-800">{displayValue}</span>
      )}
      <div className="flex items-center justify-center gap-1">
        <Button variant="ghost" size="sm" isIconButton iconName="edit" aria-label={labels.edit} onClick={onToggleEdit} />
        <Button
          variant="ghost"
          size="sm"
          isIconButton
          iconName={isCopied ? "check" : "copy"}
          aria-label={labels.copy}
          onClick={onCopy}
        />
        <Button variant="ghost" size="sm" isIconButton iconName="trash" aria-label={labels.delete} onClick={onDelete} />
      </div>
    </div>
  );
}

/** Drawer "Disparador": URL y snippets para ejecutar el job desde fuera, más auth y headers esperados. */
interface TriggersConfigProps {
  job: TJob;
  /** Control externo del drawer (la tarjeta "External Trigger" del panel también lo abre). */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const TriggersConfig = ({ job, isOpen: controlledOpen, onOpenChange }: TriggersConfigProps) => {
  const { t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = (open: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(open);
    onOpenChange?.(open);
  };
  const [currentSection, setCurrentSection] = useState<TriggerSection>("endpoint");
  const [snippetFormat, setSnippetFormat] = useState<SnippetFormat>("cURL");
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Headers editables
  const [headers, setHeaders] = useState<RequestHeader[]>(DEFAULT_HEADERS);
  const [draftHeaders, setDraftHeaders] = useState<RequestHeader[]>(DEFAULT_HEADERS);
  const [isDirty, setIsDirty] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [copiedHeaderIndex, setCopiedHeaderIndex] = useState<number | null>(null);

  // Auth editables
  const token = DEMO_TOKEN;
  const maskedToken = "•".repeat(token.length > 20 ? 20 : token.length);
  const [auth, setAuth] = useState<RequestHeader[]>(DEFAULT_AUTH);
  const [draftAuth, setDraftAuth] = useState<RequestHeader[]>(DEFAULT_AUTH);
  const [isAuthDirty, setIsAuthDirty] = useState(false);
  const [editingAuthIndex, setEditingAuthIndex] = useState<number | null>(null);
  const [copiedAuthIndex, setCopiedAuthIndex] = useState<number | null>(null);

  const triggerUrl = `${DEMO_API_URL}/jobs/${job?.job_id}/run/`;
  const host = typeof window !== "undefined" ? window.location.host : "crestone.company.com";

  // "Bearer Token" → el header HTTP real se llama "Authorization"
  const resolveHeaderName = (param: RequestHeader) => (param.key === "Bearer Token" ? "Authorization" : param.key);
  const resolveDisplayValue = (param: RequestHeader) =>
    param.key === "Bearer Token" ? `Bearer ${maskedToken}` : param.value;
  const resolveRealValue = (param: RequestHeader) => (param.key === "Bearer Token" ? `Bearer ${token}` : param.value);

  const validAuth = draftAuth.filter((a) => a.key.trim());
  const validHeaders = draftHeaders.filter((h) => h.key.trim());
  const httpLines = (list: RequestHeader[], value: (p: RequestHeader) => string, name = (p: RequestHeader) => p.key) =>
    list.map((p) => `\n${name(p)}: ${value(p)}`).join("");
  const curlLines = (list: RequestHeader[], value: (p: RequestHeader) => string, name = (p: RequestHeader) => p.key) =>
    list.map((p) => ` \\\n--header '${name(p)}: ${value(p)}'`).join("");

  const snippetHttpHeaders = httpLines(validHeaders, (h) => h.value);
  const snippetCurlHeaders = curlLines(validHeaders, (h) => h.value);

  const httpSnippet = `POST ${triggerUrl} HTTP/1.1\nHost: ${host}${httpLines(validAuth, resolveDisplayValue, resolveHeaderName)}${snippetHttpHeaders}`;
  const curlSnippet = `curl --location --request POST '${triggerUrl}'${curlLines(validAuth, resolveDisplayValue, resolveHeaderName)}${snippetCurlHeaders}`;
  const realHttpSnippet = `POST ${triggerUrl} HTTP/1.1\nHost: ${host}${httpLines(validAuth, resolveRealValue, resolveHeaderName)}${snippetHttpHeaders}`;
  const realCurlSnippet = `curl --location --request POST '${triggerUrl}'${curlLines(validAuth, resolveRealValue, resolveHeaderName)}${snippetCurlHeaders}`;

  const activeSnippet = snippetFormat === "cURL" ? curlSnippet : httpSnippet;
  const activeSnippetReal = snippetFormat === "cURL" ? realCurlSnippet : realHttpSnippet;

  const handleCopyUrl = () => {
    copyToClipboard(triggerUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleCopySnippet = () => {
    copyToClipboard(activeSnippetReal);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 3000);
  };

  // Headers CRUD
  const handleAddHeader = () => {
    const updated = [...draftHeaders, { key: "", value: "" }];
    setDraftHeaders(updated);
    setEditingIndex(updated.length - 1);
    setIsDirty(true);
  };
  const handleDeleteDraft = (index: number) => {
    setDraftHeaders((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };
  const handleDraftChange = (index: number, field: "key" | "value", val: string) => {
    setDraftHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: val } : h)));
    setIsDirty(true);
  };
  const handleSave = () => {
    setHeaders(draftHeaders);
    setIsDirty(false);
    setEditingIndex(null);
  };
  const handleDiscard = () => {
    setDraftHeaders(headers);
    setIsDirty(false);
    setEditingIndex(null);
  };
  const handleHeaderCopy = (index: number) => {
    copyToClipboard(draftHeaders[index].value);
    setCopiedHeaderIndex(index);
    setTimeout(() => setCopiedHeaderIndex(null), 2000);
  };

  // Auth CRUD
  const handleAddAuth = () => {
    const updated = [...draftAuth, { key: "", value: "" }];
    setDraftAuth(updated);
    setEditingAuthIndex(updated.length - 1);
    setIsAuthDirty(true);
  };
  const handleDeleteAuthDraft = (index: number) => {
    setDraftAuth((prev) => prev.filter((_, i) => i !== index));
    setIsAuthDirty(true);
  };
  const handleAuthDraftChange = (index: number, field: "key" | "value", val: string) => {
    setDraftAuth((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: val } : h)));
    setIsAuthDirty(true);
  };
  const handleAuthSave = () => {
    setAuth(draftAuth);
    setIsAuthDirty(false);
    setEditingAuthIndex(null);
  };
  const handleAuthDiscard = () => {
    setDraftAuth(auth);
    setIsAuthDirty(false);
    setEditingAuthIndex(null);
  };
  const handleAuthCopy = (index: number) => {
    const param = draftAuth[index];
    copyToClipboard(param.key === "Bearer Token" ? token : param.value);
    setCopiedAuthIndex(index);
    setTimeout(() => setCopiedAuthIndex(null), 2000);
  };

  const rowLabels = {
    edit: t("moveJobsEditor.workflow.triggers.actions"),
    copy: t("moveJobsEditor.workflow.triggers.actions"),
    delete: t("moveJobsEditor.common.delete"),
  };

  const sectionHeader = (title: string, iconName: "shieldHalved", iconClass: string, onAdd: () => void) => (
    <div className="flex items-center justify-between border-b! border-neutral-300 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
          <CaralIcon name={iconName} size={20} />
        </span>
        <h3 className="font-poppins text-base font-semibold text-neutral-900">{title}</h3>
      </div>
      <Button variant="ghost" size="sm" iconName="plus" onClick={onAdd}>
        {t("moveJobsEditor.workflow.triggers.addHeader")}
      </Button>
    </div>
  );

  const tableHead = (col1: string, col2: string) => (
    <div className="grid grid-cols-[1fr_2fr_110px] gap-2 border-b! border-neutral-300 bg-neutral-500/40 px-4 py-2">
      <span className="font-poppins text-sm font-medium text-neutral-800">{col1}</span>
      <span className="font-poppins text-sm font-medium text-neutral-800">{col2}</span>
      <span className="text-center font-poppins text-sm font-medium text-neutral-800">
        {t("moveJobsEditor.workflow.triggers.actions")}
      </span>
    </div>
  );

  const dirtyActions = (onDiscard: () => void, onSave: () => void) => (
    <div className="flex justify-end gap-2">
      <Button variant="light" hasBorder size="sm" onClick={onDiscard}>
        {t("moveJobsEditor.workflow.triggers.discardDraft")}
      </Button>
      <Button variant="default" size="sm" onClick={onSave}>
        {t("moveJobsEditor.workflow.triggers.saveConfig")}
      </Button>
    </div>
  );

  const drawer = (
    <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={t("moveJobsEditor.workflow.triggers.title")} size="lg">
      <div className="flex flex-col gap-4 font-poppins">
        <p className="text-sm text-neutral-800">{t("moveJobsEditor.workflow.triggers.subtitle")}</p>

        <Tabs
          className="w-fit"
          tabs={[
            { label: t("moveJobsEditor.workflow.triggers.tabEndpoint") },
            { label: t("moveJobsEditor.workflow.triggers.tabAuth") },
            { label: t("moveJobsEditor.workflow.triggers.tabHeaders") },
          ]}
          activeIndex={SECTIONS.indexOf(currentSection)}
          onChange={(index) => setCurrentSection(SECTIONS[index])}
        />

        {!job?.is_productive && (
          <div className="flex items-start gap-2 rounded-lg border! border-warning-main bg-warning-light px-3 py-2.5">
            <span className="flex shrink-0 text-warning-main">
              <CaralIcon name="triangleExclamation" size={20} />
            </span>
            <p className="text-xs text-neutral-900">{t("moveJobsEditor.workflow.triggers.nonProductive")}</p>
          </div>
        )}

        {/* ── ENDPOINT ── */}
        {currentSection === "endpoint" && (
          <div className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-xl border! border-neutral-300">
              <div className="flex w-full items-center">
                <span className="m-2 flex rounded-lg bg-info-light p-2 text-info-main">
                  <CaralIcon name="link" size={26} />
                </span>
                <h3 className="ml-1 text-lg font-semibold text-neutral-900">{t("moveJobsEditor.workflow.triggers.endpointUrl")}</h3>
              </div>
              <div className="p-4">
                <p className="mb-2 text-sm text-neutral-800">{t("moveJobsEditor.workflow.triggers.endpointDesc")}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-info-light px-2 py-2 text-base font-bold text-info-main">{"POST"}</span>
                  <div className="flex min-w-0 flex-1 items-center justify-between overflow-hidden rounded-md border! border-neutral-300 bg-neutral-500/40">
                    <span className="truncate px-3 py-3 font-mono text-xs text-neutral-900">{triggerUrl}</span>
                    <Button
                      variant="info"
                      isIconButton
                      iconName={urlCopied ? "check" : "copy"}
                      aria-label={t("moveJobsEditor.workflow.triggers.endpointUrl")}
                      onClick={handleCopyUrl}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Code snippet */}
            <section className="overflow-hidden rounded-xl border! border-neutral-300">
              <div className="flex items-center justify-between border-b! border-neutral-300 bg-neutral-500/40 px-4 py-2">
                <Tabs
                  tabs={SNIPPET_FORMATS.map((fmt) => ({ label: fmt }))}
                  activeIndex={SNIPPET_FORMATS.indexOf(snippetFormat)}
                  onChange={(index) => setSnippetFormat(SNIPPET_FORMATS[index])}
                />
                <Button
                  variant="ghost"
                  isIconButton
                  iconName={snippetCopied ? "check" : "copy"}
                  aria-label={snippetFormat}
                  onClick={handleCopySnippet}
                />
              </div>
              <div className="max-h-96 overflow-x-auto bg-seidor-main p-4">
                <pre className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-seidor-light">
                  {activeSnippet}
                </pre>
              </div>
            </section>

            <div className="flex items-center gap-2 rounded-lg border! border-success-main bg-success-light px-2 py-2.5">
              <span className="flex shrink-0 text-success-main">
                <CaralIcon name="circleInfo" size={26} />
              </span>
              <p className="text-sm font-semibold text-neutral-900">{t("moveJobsEditor.workflow.triggers.note")}</p>
              <p className="text-xs text-neutral-900">{t("moveJobsEditor.workflow.triggers.noteDesc")}</p>
            </div>
          </div>
        )}

        {/* ── AUTH ── */}
        {currentSection === "auth" && (
          <div className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-xl border! border-neutral-300">
              {sectionHeader(
                t("moveJobsEditor.workflow.triggers.requestAuth"),
                "shieldHalved",
                "bg-success-light text-success-main",
                handleAddAuth
              )}
              {tableHead(t("moveJobsEditor.workflow.triggers.authType"), t("moveJobsEditor.workflow.triggers.value"))}
              <div className="flex flex-col">
                {draftAuth.map((param, index) => (
                  <ParamRow
                    key={index}
                    param={param}
                    isEditing={editingAuthIndex === index}
                    isCopied={copiedAuthIndex === index}
                    displayValue={param.key === "Bearer Token" ? maskedToken : param.value}
                    keyPlaceholder={t("moveJobsEditor.workflow.triggers.authType")}
                    valuePlaceholder={t("moveJobsEditor.workflow.triggers.value")}
                    onToggleEdit={() => setEditingAuthIndex(editingAuthIndex === index ? null : index)}
                    onCopy={() => handleAuthCopy(index)}
                    onDelete={() => handleDeleteAuthDraft(index)}
                    onChange={(field, val) => handleAuthDraftChange(index, field, val)}
                    labels={rowLabels}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-2 border-t! border-neutral-300 bg-neutral-500/40 px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex text-warning-main">
                    <CaralIcon name="triangleExclamation" size={14} />
                  </span>
                  <p className="text-sm font-medium text-neutral-900">{t("moveJobsEditor.workflow.triggers.tokenExpires")}</p>
                </div>
                <p className="text-sm italic text-neutral-800">
                  {t("moveJobsEditor.workflow.triggers.authHeaderNote")}
                  <span className="font-mono not-italic">{"Authorization: Bearer <token>"}</span>
                </p>
              </div>
            </section>
            {isAuthDirty && dirtyActions(handleAuthDiscard, handleAuthSave)}
          </div>
        )}

        {/* ── HEADERS ── */}
        {currentSection === "headers" && (
          <div className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-xl border! border-neutral-300">
              {sectionHeader(
                t("moveJobsEditor.workflow.triggers.requestHeaders"),
                "shieldHalved",
                "bg-warning-light text-warning-main",
                handleAddHeader
              )}
              {tableHead(
                t("moveJobsEditor.workflow.triggers.headerKey"),
                t("moveJobsEditor.workflow.triggers.expectedValueFormat")
              )}
              <div className="flex flex-col">
                {draftHeaders.map((header, index) => (
                  <ParamRow
                    key={index}
                    param={header}
                    isEditing={editingIndex === index}
                    isCopied={copiedHeaderIndex === index}
                    displayValue={header.value}
                    keyPlaceholder={t("moveJobsEditor.workflow.triggers.headerKey")}
                    valuePlaceholder={t("moveJobsEditor.workflow.triggers.expectedValue")}
                    onToggleEdit={() => setEditingIndex(editingIndex === index ? null : index)}
                    onCopy={() => handleHeaderCopy(index)}
                    onDelete={() => handleDeleteDraft(index)}
                    onChange={(field, val) => handleDraftChange(index, field, val)}
                    labels={rowLabels}
                  />
                ))}
              </div>
              <div className="border-t! border-neutral-300 bg-neutral-500/40 px-4 py-3">
                <p className="text-center text-sm italic text-neutral-800">{t("moveJobsEditor.workflow.triggers.headersNote")}</p>
              </div>
            </section>
            {isDirty && dirtyActions(handleDiscard, handleSave)}
          </div>
        )}

        <div className="flex border-t! border-neutral-300 pt-4">
          <Button variant="light" hasBorder className="flex-1" onClick={() => setIsOpen(false)}>
            {t("moveJobsEditor.workflow.triggers.close")}
          </Button>
        </div>
      </div>
    </Drawer>
  );

  return (
    <>
      <Button
        variant="ghost"
        hasBorder
        isIconButton
        iconName="bolt"
        className="border! border-neutral-800! text-neutral-900 cursor-pointer"
        title={t("moveJobsEditor.workflow.triggers.button")}
        onClick={() => setIsOpen(true)}
      />
      {/* El canvas de React Flow crea su propio contexto de apilamiento: el drawer va al body. */}
      {isOpen && typeof document !== "undefined" && createPortal(drawer, document.body)}
    </>
  );
};

export default TriggersConfig;
