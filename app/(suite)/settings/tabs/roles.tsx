"use client";

import React, { useState, useMemo } from "react";
import { Button, Chip } from "caralstable";
import { CaralIcon, Icons } from "@/components/icons";
import { Input, Select, SelectOption, IconSelector } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

export type RoleSectionId =
  | "general"
  | "platform"
  | "modules"
  | "license";

export interface RoleItem {
  id: string;
  name: string;
  type: "system" | "custom";
  typeLabel: string;
  description: string;
  iconName: Icons;
  color: string;
  homeScreen: string;
  userCount: number;
  permissions: {
    screens?: {
      home?: boolean;
      connections?: boolean;
      costOptimizer?: boolean;
      monitor?: boolean;
      docs?: boolean;
      workspaces?: boolean;
      settings?: boolean;
    };
    connections: {
      canAddSource: boolean;
      canEditSource: boolean;
      canDeleteSource: boolean;
      canAddDestination: boolean;
      canEditDestination: boolean;
      canDeleteDestination: boolean;
    };
    workspaces: {
      canAddUserInWorkspace: boolean;
      canEditWorkspace: boolean;
      canDeleteWorkspace: boolean;
      canDeleteUserInWorkspace: boolean;
    };
    settings: {
      canManageParallelExtraction: boolean;
      canManageSmtp: boolean;
      canManageSso: boolean;
    };
    usersAndRoles: {
      canManageUsers: boolean;
      canManageRoles: boolean;
      canInviteUsers?: boolean;
    };
    license: {
      canViewBilling: boolean;
      canUpgradePlan: boolean;
      canManageInvoices: boolean;
    };
    modules: {
      id: string;
      title: string;
      description: string;
      iconName: Icons;
      hasAccess: boolean;
    }[];
  };
}

const CARAL_COLOR_PALETTE = [
  { label: "Seidor", hex: "#07153A" },
  { label: "Info", hex: "#0191FF" },
  { label: "Success", hex: "#44CA9F" },
  { label: "Warning", hex: "#F88A00" },
  { label: "Danger", hex: "#EF4444" },
  { label: "Indigo", hex: "#3C096C" },
  { label: "Sakura", hex: "#FF2E8C" },
  { label: "Neutral", hex: "#242528" },
  { label: "Light", hex: "#E2E8F0" },
];

const HOME_SCREEN_OPTIONS: SelectOption[] = [
  { value: "Suite Home", label: "Suite Home", iconName: "house" },
  { value: "Connections", label: "Connections", iconName: "link" },
  { value: "Cost Optimizer", label: "Cost Optimizer", iconName: "bolt" },
  { value: "Workspaces", label: "Workspaces", iconName: "grid" },
  { value: "Settings", label: "Settings", iconName: "gear" },
];

const ROLE_SECTIONS: { id: RoleSectionId; title: string; subtitle: string }[] = [
  {
    id: "general",
    title: "General",
    subtitle: "Modify the general settings for this role",
  },
  {
    id: "platform",
    title: "Platform",
    subtitle: "Grant this role access to specific screens and functions",
  },
  {
    id: "modules",
    title: "Modules",
    subtitle: "Allow the user to manage connections",
  },
  {
    id: "license",
    title: "License",
    subtitle: "Grant access and permissions related to billing and licenses.",
  },
];

import rolesData from "@/data/roles.json";

const INITIAL_ROLES: RoleItem[] = rolesData as RoleItem[];

function PermissionCheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 p-2.5 hover:bg-neutral-500/10 cursor-pointer transition-colors select-none group border-b border-neutral-500 last:border-b-0"
    >
      <div
        className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 border transition-all ${checked
          ? "bg-success-main border-success-main text-neutral-100 shadow-xs"
          : "border-neutral-800 bg-container group-hover:border-neutral-500"
          }`}
      >
        {checked && <CaralIcon name="check" size={11} />}
      </div>
      <span
        className={`${checked ? "text-neutral-900 font-medium" : "text-neutral-800"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

export function RolesTab() {
  const { dict } = useLanguage();
  const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES);
  const [savedRolesState, setSavedRolesState] = useState<Record<string, RoleItem>>(() => {
    const map: Record<string, RoleItem> = {};
    INITIAL_ROLES.forEach((r) => {
      map[r.id] = JSON.parse(JSON.stringify(r));
    });
    return map;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [savedRoleId, setSavedRoleId] = useState<string | null>(null);
  const [activeSubSections, setActiveSubSections] = useState<Record<string, RoleSectionId>>({
    developers: "general",
  });

  const toggleExpand = (roleId: string) => {
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
    if (!activeSubSections[roleId]) {
      setActiveSubSections((prev) => ({ ...prev, [roleId]: "general" }));
    }
  };

  const setRoleSubSection = (roleId: string, sectionId: RoleSectionId) => {
    setActiveSubSections((prev) => ({ ...prev, [roleId]: sectionId }));
  };

  const updateRoleField = (roleId: string, field: keyof RoleItem, value: any) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRole = (roleId: string) => {
    const currentRole = roles.find((r) => r.id === roleId);
    if (currentRole) {
      setSavedRolesState((prev) => ({
        ...prev,
        [roleId]: JSON.parse(JSON.stringify(currentRole)),
      }));
    }
    setSavedRoleId(roleId);
    setTimeout(() => {
      setSavedRoleId(null);
    }, 2000);
  };

  const updatePermission = (
    roleId: string,
    category: keyof RoleItem["permissions"],
    key: string,
    value: boolean
  ) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        if (category === "modules") {
          return {
            ...r,
            permissions: {
              ...r.permissions,
              modules: r.permissions.modules.map((m) =>
                m.id === key ? { ...m, hasAccess: value } : m
              ),
            },
          };
        }
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [category]: {
              ...(r.permissions[category] as any),
              [key]: value,
            },
          },
        };
      })
    );
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.typeLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  return (
    <div className="w-full flex flex-col gap-6 text-left font-poppins">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h4 className="text-base font-bold text-neutral-900">
            Roles & Permissions
          </h4>
          <p className="text-xs text-neutral-800">
            Define role policies, assign workspace privileges, and manage system access levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconName="search"
              className="py-1.5 text-xs"
            />
          </div>
          <Button
            variant="default"
            size="sm"
            iconName="plus"
            className="text-neutral-100!"
          >
            Create role
          </Button>
        </div>
      </div>

      {/* Roles List */}
      <div className="flex flex-col gap-3">
        {filteredRoles.length === 0 ? (
          <div className="w-full p-12 text-center bg-container border border-neutral-400 rounded-xl text-xs text-neutral-800">
            No roles match your search.
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isExpanded = expandedRoleId === role.id;
            const currentSection = activeSubSections[role.id] || "general";
            const savedRole = savedRolesState[role.id];
            const isDirty = savedRole ? JSON.stringify(role) !== JSON.stringify(savedRole) : false;
            const isJustSaved = savedRoleId === role.id;

            return (
              <div
                key={role.id}
                className="w-full bg-container border border-neutral-500 hover:border-neutral-500 rounded-xl transition-all overflow-hidden shadow-xs"
              >
                {/* Main Accordion Row */}
                <div
                  onClick={() => toggleExpand(role.id)}
                  className="flex items-center justify-between p-4 cursor-pointer select-none gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Role Icon Preview */}
                    <div
                      style={{ backgroundColor: `${role.color}18`, borderColor: `${role.color}40` }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    >
                      <span style={{ color: role.color }} className="flex items-center">
                        <CaralIcon name={role.iconName} size={18} />
                      </span>
                    </div>

                    {/* Role Info */}
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-neutral-900 leading-snug">
                          {role.name}
                        </span>
                        {role.type === "system" && (
                          <span
                            style={{
                              transform: "scale(0.7)"
                            }}
                          >
                            <Chip
                              label={role.typeLabel}
                              variant="indido"
                              hasBorder
                            />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-800 truncate">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Save button if modified, else Chevron toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isJustSaved ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="text-neutral-100!"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <span className="flex items-center gap-1.5 text-white">
                          <CaralIcon name="check" size={14} /> Guardado
                        </span>
                      </Button>
                    ) : isDirty ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="text-neutral-100!"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveRole(role.id);
                        }}
                      >
                        Guardar
                      </Button>
                    ) : (
                      <Button
                        isIconButton
                        variant="ghost"
                        size="sm"
                        iconName="chevronDown"
                        className={`text-neutral-800 hover:text-neutral-900 transition-transform duration-200 pointer-events-none ${isExpanded ? "rotate-180" : ""
                          }`}
                        title={isExpanded ? "Collapse" : "Expand"}
                      />
                    )}
                  </div>
                </div>

                {/* Expanded View: Master-Detail Layout from Figma (211-3160 & 211-3481) */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-neutral-400 bg-neutral-500/5 space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      {/* Left Sidebar Sub-Navigation (4 columns) */}
                      <div className="lg:col-span-4 flex flex-col gap-2">
                        {ROLE_SECTIONS.map((sec) => {
                          const isActive = currentSection === sec.id;
                          return (
                            <div
                              key={sec.id}
                              onClick={() => setRoleSubSection(role.id, sec.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${isActive
                                ? "bg-neutral-500 border-neutral-500 shadow-xs"
                                : "bg-container border-neutral-400 hover:bg-neutral-500/10 hover:border-neutral-500"
                                }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <h5 className="text-xs font-bold text-neutral-900">
                                  {sec.title}
                                </h5>
                                <p className="text-[11px] text-neutral-800 line-clamp-1">
                                  {sec.subtitle}
                                </p>
                              </div>
                              <CaralIcon
                                name="chevronRigth"
                                size={14}
                                classname={`shrink-0 transition-colors ${isActive ? "text-neutral-900 font-bold" : "text-neutral-800"
                                  }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Content View (8 columns) */}
                      <div className="lg:col-span-8 bg-container border border-neutral-400 rounded-xl p-5 shadow-xs space-y-5">
                        {/* ========================================================= */}
                        {/* VIEW 1: GENERAL ROLE DETAILS (Node 211-3160)             */}
                        {/* ========================================================= */}
                        {currentSection === "general" && (
                          <div className="space-y-5 animate-in fade-in duration-150">
                            <div className="border-b border-neutral-400 pb-2">
                              <h5 className="text-sm font-bold text-neutral-900">
                                General details
                              </h5>
                              <p className="text-xs text-neutral-800">
                                Modify the name, visual color badge, description, and landing view.
                              </p>
                            </div>

                            {/* Name Input */}
                            <Input
                              label="Name"
                              value={role.name}
                              onChange={(e) => updateRoleField(role.id, "name", e.target.value)}
                              placeholder="e.g. Developers"
                            />

                            {/* Color Palette & Icon Modal Trigger */}
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-neutral-900 select-none">
                                Role Badge Color &amp; Icon
                              </label>
                              <div className="flex items-center gap-3">
                                {/* Icon Trigger that opens modal */}
                                <IconSelector
                                  value={role.iconName}
                                  onChange={(icon) => updateRoleField(role.id, "iconName", icon)}
                                  color={role.color}
                                  variant="compact"
                                />

                                {/* Caral Semantic Color Swatches */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {CARAL_COLOR_PALETTE.map((color) => {
                                    const isSelected = role.color.toLowerCase() === color.hex.toLowerCase();
                                    return (
                                      <button
                                        key={color.hex}
                                        type="button"
                                        onClick={() => updateRoleField(role.id, "color", color.hex)}
                                        style={{ backgroundColor: color.hex }}
                                        className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 relative ${isSelected
                                          ? "ring-3 ring-offset-2 ring-neutral-900 scale-105"
                                          : "opacity-85 hover:opacity-100"
                                          }`}
                                        title={color.label}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Description Textarea using Input with multiline */}
                            <Input
                              label="Description"
                              multiline
                              rows={4}
                              value={role.description}
                              onChange={(e) => updateRoleField(role.id, "description", e.target.value)}
                              placeholder="Describe the role's responsibilities and purpose..."
                            />

                            {/* Home Screen Selector */}
                            <Select
                              label="Home Screen"
                              value={role.homeScreen}
                              onValueChange={(val) => updateRoleField(role.id, "homeScreen", String(val))}
                              options={HOME_SCREEN_OPTIONS}
                              detail="Detail: default dashboard view when this user logs in."
                            />


                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* VIEW 2: UNIFIED PLATFORM PRIVILEGES (Node 211-3481)       */}
                        {/* ========================================================= */}
                        {currentSection === "platform" && (
                          <div className="space-y-6 animate-in fade-in duration-150">
                            {/* Top Header with Select All */}
                            <div className="flex items-center justify-between border-b border-neutral-400 pb-3">
                              <div>
                                <h3 className="font-bold text-neutral-900">
                                  Platform Privileges
                                </h3>
                                <p className="text-neutral-800">
                                  Grant this role access to specific screens and functions
                                </p>
                              </div>

                              <div

                                onClick={() => {
                                  const isAllSelected =
                                    Object.values(role.permissions.connections).every(Boolean) &&
                                    Object.values(role.permissions.workspaces).every(Boolean) &&
                                    Object.values(role.permissions.usersAndRoles).every(Boolean) &&
                                    Object.values(role.permissions.settings).every(Boolean);

                                  const nextVal = !isAllSelected;

                                  setRoles((prev) =>
                                    prev.map((r) =>
                                      r.id === role.id
                                        ? {
                                          ...r,
                                          permissions: {
                                            ...r.permissions,
                                            connections: {
                                              canAddSource: nextVal,
                                              canEditSource: nextVal,
                                              canDeleteSource: nextVal,
                                              canAddDestination: nextVal,
                                              canEditDestination: nextVal,
                                              canDeleteDestination: nextVal,
                                            },
                                            workspaces: {
                                              canAddUserInWorkspace: nextVal,
                                              canEditWorkspace: nextVal,
                                              canDeleteWorkspace: nextVal,
                                              canDeleteUserInWorkspace: nextVal,
                                            },
                                            usersAndRoles: {
                                              canManageUsers: nextVal,
                                              canManageRoles: nextVal,
                                            },
                                            settings: {
                                              canManageParallelExtraction: nextVal,
                                              canManageSmtp: nextVal,
                                              canManageSso: nextVal,
                                            },
                                          },
                                        }
                                        : r
                                    )
                                  );
                                }}
                                className="flex items-center gap-2.5 px-3 py-1.5  border border-neutral-400 hover:bg-neutral-500/10 cursor-pointer transition-colors select-none group w-[50%]"
                              >
                                {(() => {
                                  const isAllSelected =
                                    Object.values(role.permissions.connections).every(Boolean) &&
                                    Object.values(role.permissions.workspaces).every(Boolean) &&
                                    Object.values(role.permissions.usersAndRoles).every(Boolean) &&
                                    Object.values(role.permissions.settings).every(Boolean);

                                  return (
                                    <>
                                      <div
                                        className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 border transition-all ${isAllSelected
                                          ? "bg-success-main border-success-main text-white"
                                          : "border-neutral-400 bg-container group-hover:border-neutral-500"
                                          }`}
                                      >
                                        {isAllSelected && <CaralIcon name="check" size={11} />}
                                      </div>
                                      <span className="font-semibold text-neutral-900">
                                        Select all
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Subsection 1: Connections */}
                            <div className="space-y-2 flex gap-2">
                              <div className="w-[50%]">
                                <h5 className="font-bold text-neutral-900">Connections</h5>
                                <p className="text-neutral-800">
                                  Allow the user to manage connections
                                </p>
                              </div>

                              <div className="space-y-1 w-[50%]">
                                <PermissionCheckboxItem
                                  label="The collaborator can add source"
                                  checked={role.permissions.connections.canAddSource}
                                  onChange={(val) => updatePermission(role.id, "connections", "canAddSource", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can edit source"
                                  checked={role.permissions.connections.canEditSource}
                                  onChange={(val) => updatePermission(role.id, "connections", "canEditSource", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can delete source"
                                  checked={role.permissions.connections.canDeleteSource}
                                  onChange={(val) => updatePermission(role.id, "connections", "canDeleteSource", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can add destination"
                                  checked={role.permissions.connections.canAddDestination}
                                  onChange={(val) => updatePermission(role.id, "connections", "canAddDestination", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can edit destination"
                                  checked={role.permissions.connections.canEditDestination}
                                  onChange={(val) => updatePermission(role.id, "connections", "canEditDestination", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can delete destination"
                                  checked={role.permissions.connections.canDeleteDestination}
                                  onChange={(val) => updatePermission(role.id, "connections", "canDeleteDestination", val)}
                                />
                              </div>
                            </div>

                            {/* Subsection 2: Workspaces */}
                            <div className="space-y-2 flex gap-2 pt-2 border-t border-neutral-400">
                              <div className="w-[50%]">
                                <h5 className="font-bold text-neutral-900">Workspaces</h5>
                                <p className="text-neutral-800">
                                  Allow the user to manage Workspaces
                                </p>
                              </div>

                              <div className="space-y-1 w-[50%]">
                                <PermissionCheckboxItem
                                  label="The collaborator can add user in workspace"
                                  checked={role.permissions.workspaces.canAddUserInWorkspace}
                                  onChange={(val) => updatePermission(role.id, "workspaces", "canAddUserInWorkspace", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can edit workspace"
                                  checked={role.permissions.workspaces.canEditWorkspace}
                                  onChange={(val) => updatePermission(role.id, "workspaces", "canEditWorkspace", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can delete workspace"
                                  checked={role.permissions.workspaces.canDeleteWorkspace}
                                  onChange={(val) => updatePermission(role.id, "workspaces", "canDeleteWorkspace", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can delete user in workspace"
                                  checked={role.permissions.workspaces.canDeleteUserInWorkspace}
                                  onChange={(val) => updatePermission(role.id, "workspaces", "canDeleteUserInWorkspace", val)}
                                />
                              </div>
                            </div>

                            {/* Subsection 3: User and Role Management */}
                            <div className="space-y-2 flex gap-2 pt-2 border-t border-neutral-400">
                              <div className="w-[50%]">
                                <h5 className="font-bold text-neutral-900">
                                  User and Role Management
                                </h5>
                                <p className="text-neutral-800">
                                  Allow users with this role to manage other users&apos; access rights
                                </p>
                              </div>

                              <div className="space-y-1 w-[50%]">
                                <PermissionCheckboxItem
                                  label="The contributor can manage users"
                                  checked={role.permissions.usersAndRoles.canManageUsers}
                                  onChange={(val) => updatePermission(role.id, "usersAndRoles", "canManageUsers", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The contributor can manage roles"
                                  checked={role.permissions.usersAndRoles.canManageRoles}
                                  onChange={(val) => updatePermission(role.id, "usersAndRoles", "canManageRoles", val)}
                                />
                              </div>
                            </div>

                            {/* Subsection 4: Settings */}
                            <div className="space-y-2 flex gap-2 pt-2 border-t border-neutral-400">
                              <div className="w-[50%]">
                                <h5 className="font-bold text-neutral-900">Settings</h5>
                                <p className="text-neutral-800">
                                  Provide access to platform configuration
                                </p>
                              </div>

                              <div className="space-y-1 w-[50%]">
                                <PermissionCheckboxItem
                                  label="The contributor can add and manage parallel extraction"
                                  checked={role.permissions.settings.canManageParallelExtraction}
                                  onChange={(val) => updatePermission(role.id, "settings", "canManageParallelExtraction", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The contributor can add and manage SMTP"
                                  checked={role.permissions.settings.canManageSmtp}
                                  onChange={(val) => updatePermission(role.id, "settings", "canManageSmtp", val)}
                                />
                                <PermissionCheckboxItem
                                  label="The collaborator can manage Single Sign-On (SSO)"
                                  checked={role.permissions.settings.canManageSso}
                                  onChange={(val) => updatePermission(role.id, "settings", "canManageSso", val)}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* VIEW 3: SUITE MODULES                                    */}
                        {/* ========================================================= */}
                        {currentSection === "modules" && (
                          <div className="space-y-4 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between border-b border-neutral-400 pb-2">
                              <div>
                                <h5 className="text-sm font-bold text-neutral-900">
                                  Suite Modules
                                </h5>
                                <p className="text-xs text-neutral-800">
                                  Select which branches and suite products this role can access
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {role.permissions.modules.map((mod) => (
                                <div
                                  key={mod.id}
                                  onClick={() => updatePermission(role.id, "modules", mod.id, !mod.hasAccess)}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${mod.hasAccess
                                    ? "bg-neutral-500/10 border-neutral-500 shadow-xs"
                                    : "bg-container border-neutral-400 opacity-60 hover:opacity-100"
                                    }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mod.hasAccess ? "bg-info-light text-info-main" : "bg-neutral-400 text-neutral-800"
                                        }`}
                                    >
                                      <CaralIcon name={mod.iconName} size={16} />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                      <h6 className="text-xs font-bold text-neutral-900">
                                        {mod.title}
                                      </h6>
                                      <p className="text-[11px] text-neutral-800 truncate">
                                        {mod.description}
                                      </p>
                                    </div>
                                  </div>
                                  <Chip
                                    label={mod.hasAccess ? "Enabled" : "Disabled"}
                                    variant={mod.hasAccess ? "success" : "light"}
                                    hasBorder
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* VIEW 4: LICENSE & BILLING                                */}
                        {/* ========================================================= */}
                        {currentSection === "license" && (
                          <div className="space-y-4 animate-in fade-in duration-150">
                            <div className="space-y-2 flex gap-2">
                              <div className="w-[50%]">
                                <h5 className="font-bold text-neutral-900">
                                  License &amp; Billing
                                </h5>
                                <p className="text-neutral-800">
                                  Grant access and permissions related to billing, tier management, and invoices
                                </p>
                              </div>

                              <div className="space-y-1 w-[50%]">
                                <PermissionCheckboxItem
                                  label="Allow viewing billing overview and active license key"
                                  checked={role.permissions.license.canViewBilling}
                                  onChange={(val) => updatePermission(role.id, "license", "canViewBilling", val)}
                                />
                                <PermissionCheckboxItem
                                  label="Allow upgrading or changing company subscription tier"
                                  checked={role.permissions.license.canUpgradePlan}
                                  onChange={(val) => updatePermission(role.id, "license", "canUpgradePlan", val)}
                                />
                                <PermissionCheckboxItem
                                  label="Allow viewing, downloading, and forwarding invoices"
                                  checked={role.permissions.license.canManageInvoices}
                                  onChange={(val) => updatePermission(role.id, "license", "canManageInvoices", val)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
