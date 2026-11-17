"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Chip, Tabs, Toggle } from "caralstable";
import { CaralIcon, CrestoneLogo, Icons } from "@/components/icons";
import { Checkbox, DataTable, DataTableColumn, Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { suiteConfig } from "@/config/suite";
import { getRolePreviewUrl } from "@/components/layout/RolePreviewBanner";
import type { TranslationDictionary } from "@/locales";
import rolesData from "@/data/roles.json";
import roleModulesData from "@/data/roleModules.json";
import usersData from "@/data/users.json";

/* ------------------------------------------------------------------ */
/* Tipos y catálogos                                                   */
/* ------------------------------------------------------------------ */

type RolesDict = TranslationDictionary["settings"]["roles"];

/** Acciones concedidas por recurso: { sources: ["view", "create"] } */
type ResourceGrants = Record<string, string[]>;

export interface RoleItem {
  id: string;
  name: string;
  type: "system" | "custom";
  description: string;
  permissions: {
    platform: ResourceGrants;
    modules: Record<string, { enabled: boolean; resources: ResourceGrants }>;
  };
}

interface RoleModuleDefinition {
  id: string;
  description: string;
  licensed: boolean;
  resources: { id: string; label: string }[];
}

interface RoleUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

type RoleTabId = "general" | "modules" | "users";
const ROLE_TABS: RoleTabId[] = ["general", "modules", "users"];

const CRUD_ACTIONS = ["view", "create", "edit", "delete"];

const ACTION_LABEL_KEY: Record<string, keyof RolesDict> = {
  view: "actionView",
  create: "actionCreate",
  edit: "actionEdit",
  delete: "actionDelete",
  viewDatasets: "actionViewDatasets",
  scan: "actionScan",
  viewHistory: "actionViewHistory",
  editDeclare: "actionEditDeclare",
  viewList: "actionViewList",
  enableDisable: "actionEnableDisable",
};

interface PermissionGroup {
  id: string;
  titleKey: keyof RolesDict;
  subtitleKey?: keyof RolesDict;
  resources: { id: string; labelKey: keyof RolesDict; actions: string[] }[];
}

const PLATFORM_GROUPS: PermissionGroup[] = [
  {
    id: "connections",
    titleKey: "connections",
    resources: [
      { id: "sources", labelKey: "sources", actions: CRUD_ACTIONS },
      { id: "destinations", labelKey: "destinations", actions: CRUD_ACTIONS },
      { id: "llms", labelKey: "llms", actions: CRUD_ACTIONS },
    ],
  },
  {
    id: "dataset",
    titleKey: "dataset",
    subtitleKey: "datasetSubtitle",
    resources: [
      { id: "catalog", labelKey: "catalog", actions: ["viewDatasets", "scan", "viewHistory", "editDeclare", "delete"] },
      { id: "aiEnabled", labelKey: "aiEnabled", actions: ["viewList", "enableDisable"] },
    ],
  },
  {
    id: "configuration",
    titleKey: "configuration",
    subtitleKey: "configurationSubtitle",
    resources: [
      { id: "workspace", labelKey: "workspace", actions: CRUD_ACTIONS },
      { id: "analyzeChat", labelKey: "analyzeChat", actions: ["viewList", "enableDisable"] },
    ],
  },
];

/** Solo SuperAdmin, Admin y Lector tienen icono propio; el resto comparte uno único. */
const ROLE_VISUALS: Record<string, { icon: Icons; box: string; icon_: string }> = {
  superadmin: { icon: "shieldHalved", box: "bg-sakura-light", icon_: "text-sakura-main" },
  admin: { icon: "users", box: "bg-warning-light", icon_: "text-warning-main" },
  lector: { icon: "eye", box: "bg-danger-light", icon_: "text-danger-main" },
};
const DEFAULT_ROLE_VISUAL = { icon: "user" as Icons, box: "bg-info-light", icon_: "text-info-main" };

const ROLE_MODULES = roleModulesData as RoleModuleDefinition[];
const INITIAL_ROLES = rolesData as RoleItem[];
const USERS = usersData as RoleUser[];

const cloneRole = (role: RoleItem): RoleItem => JSON.parse(JSON.stringify(role));

const createEmptyRole = (): RoleItem => ({
  id: `role-${Date.now()}`,
  name: "",
  type: "custom",
  description: "",
  permissions: {
    platform: {},
    modules: Object.fromEntries(ROLE_MODULES.map((m) => [m.id, { enabled: false, resources: {} }])),
  },
});

/* ------------------------------------------------------------------ */
/* Piezas de UI                                                        */
/* ------------------------------------------------------------------ */

function PermissionCheck({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-2.5 select-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <Checkbox checked={checked} onChange={onChange} disabled={disabled} />
      <span className="text-sm text-neutral-800 whitespace-nowrap">{label}</span>
    </label>
  );
}

/** Matriz recurso × acciones (etiqueta a la izquierda, casillas a la derecha). */
function PermissionMatrix({
  resources,
  grants,
  disabled,
  actionLabel,
  onToggle,
}: {
  resources: { id: string; label: string; actions: string[] }[];
  grants: ResourceGrants;
  disabled?: boolean;
  actionLabel: (action: string) => string;
  onToggle: (resourceId: string, action: string, checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[144px_minmax(0,1fr)] gap-x-10 gap-y-3.5 items-center">
      {resources.map((res) => (
        <React.Fragment key={res.id}>
          <span className="text-sm text-neutral-900">{res.label}</span>
          <div className="flex flex-wrap items-center gap-2.5">
            {res.actions.map((action) => (
              <PermissionCheck
                key={action}
                label={actionLabel(action)}
                checked={grants[res.id]?.includes(action) ?? false}
                disabled={disabled}
                onChange={(checked) => onToggle(res.id, action, checked)}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h5 className="font-poppins font-semibold text-lg text-seidor-main-text">{title}</h5>
      {subtitle && <p className="text-sm text-neutral-800">{subtitle}</p>}
    </div>
  );
}

/** Chip de Caral reducido al tamaño del diseño (las variantes de Chip no traen tamaño). */
function SmallChip({ label, variant }: { label: string; variant: "success" | "danger" }) {
  return (
    <span className="inline-flex origin-left" style={{ transform: "scale(0.75)" }}>
      <Chip label={label} variant={variant} hasBorder />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Pestaña principal                                                   */
/* ------------------------------------------------------------------ */

export function RolesTab() {
  const { dict } = useLanguage();
  const t = dict.settings.roles;

  const [roles, setRoles] = useState<RoleItem[]>(() => INITIAL_ROLES.map(cloneRole));
  const [savedRoles, setSavedRoles] = useState<Record<string, RoleItem>>(() =>
    Object.fromEntries(INITIAL_ROLES.map((r) => [r.id, cloneRole(r)]))
  );
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [maximizedRoleId, setMaximizedRoleId] = useState<string | null>(null);
  const [justSavedRoleId, setJustSavedRoleId] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, RoleTabId>>({});
  const [selectedModules, setSelectedModules] = useState<Record<string, string>>({});

  // Vista exclusiva de un rol: oculta los demás roles; Esc vuelve al listado.
  useEffect(() => {
    if (!maximizedRoleId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMaximizedRoleId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximizedRoleId]);

  const toggleExclusiveView = (roleId: string) => {
    if (maximizedRoleId === roleId) {
      setMaximizedRoleId(null);
      return;
    }
    setMaximizedRoleId(roleId);
    setExpandedRoleId(roleId); // al volver al listado el rol sigue desplegado
  };

  const visibleRoles = maximizedRoleId ? roles.filter((r) => r.id === maximizedRoleId) : roles;

  const actionLabel = (action: string) => {
    const key = ACTION_LABEL_KEY[action];
    return key ? String(t[key]) : action;
  };

  const branchById = useMemo(
    () => Object.fromEntries(suiteConfig.branches.map((b) => [b.id, b])),
    []
  );

  const updateRole = (roleId: string, updater: (role: RoleItem) => RoleItem) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? updater(r) : r)));
  };

  const toggleGrant = (grants: ResourceGrants, resourceId: string, action: string, checked: boolean): ResourceGrants => {
    const current = grants[resourceId] ?? [];
    const next = checked ? Array.from(new Set([...current, action])) : current.filter((a) => a !== action);
    return { ...grants, [resourceId]: next };
  };

  const togglePlatformGrant = (roleId: string, resourceId: string, action: string, checked: boolean) =>
    updateRole(roleId, (r) => ({
      ...r,
      permissions: { ...r.permissions, platform: toggleGrant(r.permissions.platform, resourceId, action, checked) },
    }));

  const updateModule = (
    roleId: string,
    moduleId: string,
    updater: (mod: { enabled: boolean; resources: ResourceGrants }) => { enabled: boolean; resources: ResourceGrants }
  ) =>
    updateRole(roleId, (r) => {
      const mod = r.permissions.modules[moduleId] ?? { enabled: false, resources: {} };
      return { ...r, permissions: { ...r.permissions, modules: { ...r.permissions.modules, [moduleId]: updater(mod) } } };
    });

  const handleSave = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    setSavedRoles((prev) => ({ ...prev, [roleId]: cloneRole(role) }));
    setJustSavedRoleId(roleId);
    setTimeout(() => setJustSavedRoleId((cur) => (cur === roleId ? null : cur)), 2000);
  };

  const handleAddRole = () => {
    const role = createEmptyRole();
    setRoles((prev) => [...prev, role]);
    setSavedRoles((prev) => ({ ...prev, [role.id]: cloneRole(role) }));
    setExpandedRoleId(role.id);
    setActiveTabs((prev) => ({ ...prev, [role.id]: "general" }));
  };

  const userColumns = useMemo<DataTableColumn<RoleUser>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: t.userColumn,
        filterType: "text",
        cell: ({ value }) => <span className="font-semibold text-neutral-900">{value}</span>,
      },
      { id: "email", accessorKey: "email", header: t.emailColumn, filterType: "text" },
      { id: "department", accessorKey: "department", header: t.departmentColumn, filterType: "text" },
    ],
    [t]
  );

  const tabItems = [{ label: t.tabGeneral }, { label: t.tabModules }, { label: t.tabUsers }];

  /* --------------------------- Contenido por pestaña --------------------------- */

  const renderGeneral = (role: RoleItem) => (
    <div className="grid grid-cols-1 lg:grid-cols-3! gap-x-5 gap-y-4 items-start">
      <div className="flex flex-col gap-2.5">
        <Input
          label={t.name}
          value={role.name}
          placeholder={t.namePlaceholder}
          onChange={(e) => updateRole(role.id, (r) => ({ ...r, name: e.target.value }))}
        />
        <Input
          label={t.description}
          multiline
          rows={8}
          value={role.description}
          placeholder={t.descriptionPlaceholder}
          onChange={(e) => updateRole(role.id, (r) => ({ ...r, description: e.target.value }))}
        />
      </div>

      <div className="lg:col-span-2 flex flex-col gap-5">
        {PLATFORM_GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col gap-1.5">
            <SectionTitle
              title={String(t[group.titleKey])}
              subtitle={group.subtitleKey ? String(t[group.subtitleKey]) : undefined}
            />
            <PermissionMatrix
              resources={group.resources.map((res) => ({ id: res.id, label: String(t[res.labelKey]), actions: res.actions }))}
              grants={role.permissions.platform}
              actionLabel={actionLabel}
              onToggle={(resourceId, action, checked) => togglePlatformGrant(role.id, resourceId, action, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderModules = (role: RoleItem) => {
    const selectedId = selectedModules[role.id] ?? ROLE_MODULES[0]?.id;
    const selected = ROLE_MODULES.find((m) => m.id === selectedId) ?? ROLE_MODULES[0];
    const selectedState = role.permissions.modules[selected.id] ?? { enabled: false, resources: {} };
    const selectedTitle = branchById[selected.id]?.title ?? selected.id;
    const matrixDisabled = !selected.licensed || !selectedState.enabled;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3! gap-x-5 gap-y-4 items-start">
        {/* Lista de módulos */}
        <div className="flex flex-col gap-2.5">
          {ROLE_MODULES.map((mod) => {
            const branch = branchById[mod.id];
            const state = role.permissions.modules[mod.id] ?? { enabled: false, resources: {} };
            const isSelected = mod.id === selected.id;
            return (
              <div
                key={mod.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedModules((prev) => ({ ...prev, [role.id]: mod.id }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedModules((prev) => ({ ...prev, [role.id]: mod.id }));
                  }
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-info-main/40 ${
                  isSelected ? "bg-neutral-500" : "hover:bg-neutral-500/50"
                }`}
              >
                <div
                  className="flex items-center justify-center p-2.5 rounded-lg shrink-0"
                  style={{ backgroundColor: branch?.color ?? "var(--color-neutral-800)" }}
                >
                  <CrestoneLogo size={28} accentColor="white" bodyColor="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-poppins font-semibold text-xl text-neutral-900 truncate">
                      {branch?.title ?? mod.id}
                    </span>
                    <SmallChip
                      label={mod.licensed ? t.licensed : t.unlicensed}
                      variant={mod.licensed ? "success" : "danger"}
                    />
                  </div>
                  <p className="text-sm text-neutral-800 truncate">{mod.description}</p>
                </div>
                {mod.licensed && (
                  <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Toggle
                      checked={state.enabled}
                      onChange={(enabled) => updateModule(role.id, mod.id, (m) => ({ ...m, enabled }))}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Permisos internos del módulo seleccionado */}
        <div className="lg:col-span-2 flex flex-col gap-1.5 p-2.5">
          <SectionTitle title={`${selectedTitle} · ${t.internalPermissions}`} />
          {matrixDisabled && (
            <p className="text-sm text-neutral-800">
              {!selected.licensed ? t.moduleUnlicensedHint : t.moduleDisabledHint}
            </p>
          )}
          <PermissionMatrix
            resources={selected.resources.map((res) => ({ ...res, actions: CRUD_ACTIONS }))}
            grants={selectedState.resources}
            disabled={matrixDisabled}
            actionLabel={actionLabel}
            onToggle={(resourceId, action, checked) =>
              updateModule(role.id, selected.id, (m) => ({
                ...m,
                resources: toggleGrant(m.resources, resourceId, action, checked),
              }))
            }
          />
        </div>
      </div>
    );
  };

  const renderUsers = (role: RoleItem) => {
    const roleUsers = USERS.filter((u) => u.role.toLowerCase() === role.name.toLowerCase());
    if (roleUsers.length === 0) {
      return (
        <div className="w-full p-10 text-center border border-neutral-500 rounded-lg text-sm text-neutral-800">
          {t.noUsers}
        </div>
      );
    }
    return (
      <DataTable<RoleUser>
        data={roleUsers}
        columns={userColumns}
        keyExtractor={(u) => u.id}
        canSearch={false}
        canExport={false}
      />
    );
  };

  /* --------------------------------- Render --------------------------------- */

  return (
    <div className="w-full flex flex-col gap-2.5 text-left font-poppins">
      {/* Encabezado */}
      <div className="flex items-end justify-between gap-4">
        <div className="p-2.5 min-w-0">
          <h3 className="font-poppins font-semibold text-3xl text-neutral-900 tracking-tight">{t.title}</h3>
          <p className="text-base text-neutral-800">{t.subtitle}</p>
        </div>
        {!maximizedRoleId && (
          <Button variant="default" iconName="plus" className="text-neutral-100! shrink-0" onClick={handleAddRole}>
            {t.addRole}
          </Button>
        )}
      </div>

      {/* Listado de roles (en vista exclusiva solo queda el rol seleccionado) */}
      {visibleRoles.length === 0 ? (
        <div className="w-full p-12 text-center border border-neutral-500 rounded-md text-sm text-neutral-800">
          {t.noRoles}
        </div>
      ) : (
        visibleRoles.map((role) => {
          const visual = ROLE_VISUALS[role.id] ?? DEFAULT_ROLE_VISUAL;
          const isExpanded = expandedRoleId === role.id;
          const isMaximized = maximizedRoleId === role.id;
          const activeTab = activeTabs[role.id] ?? "general";
          const saved = savedRoles[role.id];
          const isDirty = saved ? JSON.stringify(role) !== JSON.stringify(saved) : true;
          const isJustSaved = justSavedRoleId === role.id;

          return (
            <React.Fragment key={role.id}>
              {/* En vista exclusiva el rol ocupa la página: sin borde ni padding de tarjeta */}
              <div className={`w-full ${isMaximized ? "" : "border border-neutral-500 rounded-md overflow-hidden"}`}>
                {/* Cabecera del acordeón */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => {
                    if (isMaximized) return;
                    setExpandedRoleId((prev) => (prev === role.id ? null : role.id));
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isMaximized) {
                      e.preventDefault();
                      setExpandedRoleId((prev) => (prev === role.id ? null : role.id));
                    }
                  }}
                  className={`flex items-center gap-2.5 select-none outline-none focus-visible:ring-2 focus-visible:ring-info-main/40 ${
                    isMaximized ? "py-2.5" : "p-2.5 cursor-pointer"
                  }`}
                >
                  <div className={`flex items-center justify-center p-2.5 rounded-lg shrink-0 ${visual.box}`}>
                    <span className={`flex ${visual.icon_}`}>
                      <CaralIcon name={visual.icon} size={30} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-semibold text-xl text-neutral-900 truncate">
                      {role.name || t.namePlaceholder}
                    </p>
                    <p className="text-base text-neutral-800 truncate">{role.description}</p>
                  </div>
                  {!isMaximized && (
                    <span
                      className="flex text-neutral-900 transition-transform duration-200"
                      style={{ transform: isExpanded ? "rotate(180deg)" : undefined }}
                      title={isExpanded ? t.collapse : t.expand}
                    >
                      <CaralIcon name="chevronDown" size={24} />
                    </span>
                  )}
                </div>

                {/* Detalle del rol */}
                {(isExpanded || isMaximized) && (
                  <div className={`flex flex-col gap-2.5 ${isMaximized ? "py-2.5" : "p-2.5"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <Tabs
                        tabs={tabItems}
                        activeIndex={ROLE_TABS.indexOf(activeTab)}
                        onChange={(idx) => setActiveTabs((prev) => ({ ...prev, [role.id]: ROLE_TABS[idx] }))}
                      />
                      <div className="flex items-center gap-2.5">
                        <Button
                          isIconButton
                          variant="ghost"
                          hasBorder
                          iconName={isMaximized ? "arrowsMinimize" : "arrowsMaximize"}
                          className="border! border-neutral-800! text-neutral-900"
                          title={isMaximized ? t.minimize : t.maximize}
                          onClick={() => toggleExclusiveView(role.id)}
                        />
                        <Button
                          isIconButton
                          variant="ghost"
                          hasBorder
                          iconName="screenView"
                          className="border! border-neutral-800! text-neutral-900"
                          title={t.preview}
                          disabled={!role.name.trim()}
                          onClick={() => window.open(getRolePreviewUrl(role.name.trim()), "_blank", "noopener")}
                        />
                        <Button
                          variant="default"
                          iconName={isJustSaved ? "check" : "save"}
                          className="text-neutral-100!"
                          disabled={!isDirty && !isJustSaved}
                          onClick={() => isDirty && handleSave(role.id)}
                        >
                          {isJustSaved ? t.saved : t.save}
                        </Button>
                      </div>
                    </div>

                    {activeTab === "general" && renderGeneral(role)}
                    {activeTab === "modules" && renderModules(role)}
                    {activeTab === "users" && renderUsers(role)}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })
      )}
    </div>
  );
}
