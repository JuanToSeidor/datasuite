"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button, Chip, Drawer, Tabs } from "caralstable";
import { CaralIcon, Icons } from "@/components/icons";
import { Input, Select, SelectOption, IconSelector } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

export type WorkspaceSectionId = "general" | "users";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarBg?: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  type: "system" | "custom";
  typeLabel: string;
  description: string;
  iconName: Icons;
  color: string;
  members: WorkspaceMember[];
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

const AVAILABLE_ICONS: Icons[] = [
  "grid",
  "database",
  "cloud",
  "cubeInCube",
  "chartSimple",
  "bolt",
  "robot",
  "network",
  "shieldHalved",
  "gear",
  "folder",
  "lock",
  "link",
];

import workspacesData from "@/data/workspaces.json";

const WORKSPACE_TABS: WorkspaceSectionId[] = ["general", "users"];

const ALL_AVAILABLE_USERS: WorkspaceMember[] = workspacesData.allAvailableUsers as WorkspaceMember[];
const INITIAL_WORKSPACES: WorkspaceItem[] = workspacesData.workspaces as WorkspaceItem[];

export function WorkspacesTab() {
  const { dict } = useLanguage();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(INITIAL_WORKSPACES);
  const [savedWorkspacesState, setSavedWorkspacesState] = useState<Record<string, WorkspaceItem>>(() => {
    const map: Record<string, WorkspaceItem> = {};
    INITIAL_WORKSPACES.forEach((w) => {
      map[w.id] = JSON.parse(JSON.stringify(w));
    });
    return map;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);
  const [maximizedWorkspaceId, setMaximizedWorkspaceId] = useState<string | null>(null);
  const [savedWorkspaceId, setSavedWorkspaceId] = useState<string | null>(null);
  const [activeSubSections, setActiveSubSections] = useState<Record<string, WorkspaceSectionId>>({
    default: "general",
  });
  const [userSearchTerm, setUserSearchTerm] = useState<Record<string, string>>({});
  const [isAddUserOpen, setIsAddUserOpen] = useState<string | null>(null);

  // Creation Drawer State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDescription, setNewWsDescription] = useState("");
  const [newWsColor, setNewWsColor] = useState("#0191FF");
  const [newWsIcon, setNewWsIcon] = useState<Icons>("grid");

  // Vista exclusiva de un workspace: oculta los demás; Esc vuelve al listado.
  useEffect(() => {
    if (!maximizedWorkspaceId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMaximizedWorkspaceId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximizedWorkspaceId]);

  const toggleExclusiveView = (wsId: string) => {
    if (maximizedWorkspaceId === wsId) {
      setMaximizedWorkspaceId(null);
      return;
    }
    setMaximizedWorkspaceId(wsId);
    setExpandedWorkspaceId(wsId); // al volver al listado el workspace sigue desplegado
    setIsAddUserOpen(null);
  };

  const toggleExpand = (wsId: string) => {
    if (maximizedWorkspaceId === wsId) return;
    setExpandedWorkspaceId((prev) => (prev === wsId ? null : wsId));
    if (!activeSubSections[wsId]) {
      setActiveSubSections((prev) => ({ ...prev, [wsId]: "general" }));
    }
  };

  const setWorkspaceSubSection = (wsId: string, sectionId: WorkspaceSectionId) => {
    setActiveSubSections((prev) => ({ ...prev, [wsId]: sectionId }));
  };

  const updateWorkspaceField = (wsId: string, field: keyof WorkspaceItem, value: any) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === wsId ? { ...w, [field]: value } : w))
    );
  };

  const handleSaveWorkspace = (wsId: string) => {
    const currentWs = workspaces.find((w) => w.id === wsId);
    if (currentWs) {
      setSavedWorkspacesState((prev) => ({
        ...prev,
        [wsId]: JSON.parse(JSON.stringify(currentWs)),
      }));
    }
    setSavedWorkspaceId(wsId);
    setTimeout(() => {
      setSavedWorkspaceId(null);
    }, 2000);
  };

  const handleRemoveMember = (wsId: string, memberId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== wsId) return w;
        return {
          ...w,
          members: w.members.filter((m) => m.id !== memberId),
        };
      })
    );
  };

  const handleAddMember = (wsId: string, member: WorkspaceMember) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== wsId) return w;
        if (w.members.some((m) => m.id === member.id)) return w;
        return {
          ...w,
          members: [...w.members, member],
        };
      })
    );
    setIsAddUserOpen(null);
  };

  const handleCreateWorkspace = () => {
    if (!newWsName.trim()) return;
    const newId = `ws-${Date.now()}`;
    const newWs: WorkspaceItem = {
      id: newId,
      name: newWsName.trim(),
      type: "custom",
      typeLabel: "Personalizado",
      description: newWsDescription.trim() || "Espacio de trabajo personalizado",
      iconName: newWsIcon,
      color: newWsColor,
      members: [ALL_AVAILABLE_USERS[0]], // Creator as initial member
    };

    setWorkspaces((prev) => [newWs, ...prev]);
    setSavedWorkspacesState((prev) => ({
      ...prev,
      [newId]: JSON.parse(JSON.stringify(newWs)),
    }));
    setExpandedWorkspaceId(newId);
    setActiveSubSections((prev) => ({ ...prev, [newId]: "general" }));

    // Reset drawer state
    setNewWsName("");
    setNewWsDescription("");
    setNewWsColor("#0191FF");
    setNewWsIcon("grid");
    setIsCreateOpen(false);
  };

  const filteredWorkspaces = useMemo(() => {
    // En vista exclusiva solo queda el workspace seleccionado (ignora la búsqueda).
    if (maximizedWorkspaceId) return workspaces.filter((ws) => ws.id === maximizedWorkspaceId);
    return workspaces.filter(
      (ws) =>
        ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workspaces, searchTerm, maximizedWorkspaceId]);

  const tw = dict.settings.workspaces;
  const tabItems = [{ label: tw.tabGeneral }, { label: tw.tabUsers }];

  return (
    <div className="w-full flex flex-col gap-6 text-left font-poppins">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h4 className="text-base font-bold text-neutral-900">
            Workspaces
          </h4>
          <p className="text-xs text-neutral-800">
            Manage workspace environments, styling, visual badges, and member assignments.
          </p>
        </div>

        {!maximizedWorkspaceId && (
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Search workspaces..."
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
            onClick={() => setIsCreateOpen(true)}
          >
            Create workspace
          </Button>
        </div>
        )}
      </div>

      {/* Workspaces List */}
      <div className="flex flex-col gap-3">
        {filteredWorkspaces.length === 0 ? (
          <div className="w-full p-12 text-center bg-container border border-neutral-500 rounded-xl text-xs text-neutral-800">
            No workspaces match your search.
          </div>
        ) : (
          filteredWorkspaces.map((ws) => {
            const isMaximized = maximizedWorkspaceId === ws.id;
            const isExpanded = expandedWorkspaceId === ws.id || isMaximized;
            const currentSection = activeSubSections[ws.id] || "general";
            const savedWs = savedWorkspacesState[ws.id];
            const isDirty = savedWs ? JSON.stringify(ws) !== JSON.stringify(savedWs) : false;
            const isJustSaved = savedWorkspaceId === ws.id;
            const currentSearch = userSearchTerm[ws.id] || "";

            const filteredMembers = ws.members.filter(
              (m) =>
                m.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                m.email.toLowerCase().includes(currentSearch.toLowerCase()) ||
                m.role.toLowerCase().includes(currentSearch.toLowerCase())
            );

            const availableToAdd = ALL_AVAILABLE_USERS.filter(
              (u) => !ws.members.some((m) => m.id === u.id)
            );

            return (
              <div
                key={ws.id}
                className={`w-full transition-all ${
                  isMaximized
                    ? "" // En vista exclusiva el workspace ocupa la página: sin borde ni padding de tarjeta
                    : "bg-container border border-neutral-500 hover:border-neutral-500 rounded-xl overflow-hidden shadow-xs"
                }`}
              >
                {/* Main Accordion Row */}
                <div
                  onClick={() => toggleExpand(ws.id)}
                  className={`flex items-center justify-between select-none gap-4 ${
                    isMaximized ? "py-4" : "p-4 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Workspace Icon Preview */}
                    <div
                      style={{ backgroundColor: `${ws.color}18`, borderColor: `${ws.color}40` }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    >
                      <span style={{ color: ws.color }} className="flex items-center">
                        <CaralIcon name={ws.iconName} size={18} />
                      </span>
                    </div>

                    {/* Workspace Info */}
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-neutral-900 leading-snug">
                          {ws.name}
                        </span>
                        {ws.type === "system" && (
                          <span
                            style={{
                              transform: "scale(0.7)",
                            }}
                          >
                            <Chip
                              label={ws.typeLabel}
                              variant="indido"
                              hasBorder
                            />
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-800 bg-neutral-500/10 px-2 py-0.5 rounded-md border border-neutral-500">
                          {ws.members.length} {ws.members.length === 1 ? "member" : "members"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-800 truncate">
                        {ws.description}
                      </p>
                    </div>
                  </div>

                  {/* Chevron del acordeón (oculto en vista exclusiva) */}
                  {!isMaximized && (
                    <span
                      className="flex text-neutral-900 transition-transform duration-200 shrink-0"
                      style={{ transform: isExpanded ? "rotate(180deg)" : undefined }}
                      title={isExpanded ? tw.collapse : tw.expand}
                    >
                      <CaralIcon name="chevronDown" size={24} />
                    </span>
                  )}
                </div>

                {/* Expanded View: Master-Detail Layout */}
                {isExpanded && (
                  <div
                    className={`space-y-4 animate-in fade-in duration-150 ${
                      isMaximized ? "pt-3" : "px-5 pb-5 pt-3 border-t border-neutral-500 bg-neutral-500/5"
                    }`}
                  >
                    {/* Barra: pestañas a la izquierda, acciones a la derecha */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <Tabs
                        tabs={tabItems}
                        activeIndex={WORKSPACE_TABS.indexOf(currentSection)}
                        onChange={(idx) => setWorkspaceSubSection(ws.id, WORKSPACE_TABS[idx])}
                      />
                      <div className="flex items-center gap-2.5">
                        <Button
                          isIconButton
                          variant="ghost"
                          hasBorder
                          iconName={isMaximized ? "arrowsMinimize" : "arrowsMaximize"}
                          className="border! border-neutral-800! text-neutral-900"
                          title={isMaximized ? tw.minimize : tw.maximize}
                          onClick={() => toggleExclusiveView(ws.id)}
                        />
                        <Button
                          variant="default"
                          iconName={isJustSaved ? "check" : "save"}
                          className="text-neutral-100!"
                          disabled={!isDirty && !isJustSaved}
                          onClick={() => isDirty && handleSaveWorkspace(ws.id)}
                        >
                          {isJustSaved ? tw.saved : tw.save}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-5">
                        {/* ========================================================= */}
                        {/* VIEW 1: GENERAL WORKSPACE DETAILS                         */}
                        {/* ========================================================= */}
                        {currentSection === "general" && (
                          <div className="space-y-5 animate-in fade-in duration-150">
                            <div className="border-b border-neutral-500 pb-2">
                              <h5 className="text-sm font-bold text-neutral-900">
                                General details
                              </h5>
                              <p className="text-xs text-neutral-800">
                                Modify the workspace name, visual badge color, icon, and description.
                              </p>
                            </div>

                            {/* Name Input */}
                            <Input
                              label="Workspace Name"
                              value={ws.name}
                              onChange={(e) => updateWorkspaceField(ws.id, "name", e.target.value)}
                              placeholder="e.g. Analytics & AI Core"
                            />

                            {/* Color Palette & Icon Modal Trigger */}
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-neutral-900 select-none">
                                Workspace Color &amp; Icon
                              </label>
                              <div className="flex items-center gap-3">
                                {/* Icon Trigger that opens modal */}
                                <IconSelector
                                  value={ws.iconName}
                                  onChange={(icon) => updateWorkspaceField(ws.id, "iconName", icon)}
                                  color={ws.color}
                                  variant="compact"
                                />

                                {/* Caral Semantic Color Swatches */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {CARAL_COLOR_PALETTE.map((color) => {
                                    const isSelected = ws.color.toLowerCase() === color.hex.toLowerCase();
                                    return (
                                      <button
                                        key={color.hex}
                                        type="button"
                                        onClick={() => updateWorkspaceField(ws.id, "color", color.hex)}
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

                            {/* Description Input */}
                            <Input
                              label="Description"
                              multiline
                              rows={3}
                              value={ws.description}
                              onChange={(e) => updateWorkspaceField(ws.id, "description", e.target.value)}
                              placeholder="Describe the workspace purpose, team scope and resources..."
                            />
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* VIEW 2: WORKSPACE MEMBERS (USERS)                         */}
                        {/* ========================================================= */}
                        {currentSection === "users" && (
                          <div className="space-y-4 animate-in fade-in duration-150">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-500 pb-3">
                              <div>
                                <h5 className="text-sm font-bold text-neutral-900">
                                  Workspace Members
                                </h5>
                                <p className="text-xs text-neutral-800">
                                  Manage team members assigned to this workspace environment.
                                </p>
                              </div>

                              {/* Add member button */}
                              <div className="relative">
                                <Button
                                  variant="default"
                                  size="sm"
                                  iconName="plus"
                                  className="text-neutral-100!"
                                  onClick={() => setIsAddUserOpen(isAddUserOpen === ws.id ? null : ws.id)}
                                >
                                  Add Member
                                </Button>

                                {/* Dropdown popover for adding members */}
                                {isAddUserOpen === ws.id && (
                                  <div className="absolute right-0 top-full mt-2 w-72 bg-container border border-neutral-500 rounded-xl shadow-lg p-2 z-20 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="px-2 py-1.5 border-b border-neutral-500 text-xs font-semibold text-neutral-900">
                                      Select member to add
                                    </div>
                                    <div className="max-h-52 overflow-y-auto space-y-1">
                                      {availableToAdd.length === 0 ? (
                                        <div className="p-3 text-center text-xs text-neutral-800">
                                          All users are already assigned.
                                        </div>
                                      ) : (
                                        availableToAdd.map((user) => (
                                          <div
                                            key={user.id}
                                            onClick={() => handleAddMember(ws.id, user)}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-500/10 cursor-pointer transition-colors"
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <div
                                                style={{ backgroundColor: user.avatarBg || "#0191FF" }}
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                              >
                                                {user.name.charAt(0).toUpperCase()}
                                              </div>
                                              <div className="min-w-0">
                                                <div className="text-xs font-medium text-neutral-900 truncate">
                                                  {user.name}
                                                </div>
                                                <div className="text-[10px] text-neutral-800 truncate">
                                                  {user.role}
                                                </div>
                                              </div>
                                            </div>
                                            <CaralIcon name="plus" size={12} classname="text-neutral-800" />
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Search bar inside members */}
                            <div className="w-full">
                              <Input
                                placeholder="Filter workspace members..."
                                value={userSearchTerm[ws.id] || ""}
                                onChange={(e) =>
                                  setUserSearchTerm((prev) => ({ ...prev, [ws.id]: e.target.value }))
                                }
                                iconName="search"
                                className="py-1.5 text-xs"
                              />
                            </div>

                            {/* Members list */}
                            <div className="space-y-1.5">
                              {filteredMembers.length === 0 ? (
                                <div className="p-8 text-center text-xs text-neutral-800 bg-neutral-500/5 rounded-xl border border-neutral-500">
                                  No members found in this workspace.
                                </div>
                              ) : (
                                filteredMembers.map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-500 bg-container hover:bg-neutral-500/5 transition-colors gap-3"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        style={{ backgroundColor: member.avatarBg || "#0191FF" }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                                      >
                                        {member.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-neutral-900 leading-snug">
                                            {member.name}
                                          </span>
                                          <span className="text-[10px] font-medium text-neutral-800 bg-neutral-500/10 px-1.5 py-0.5 rounded border border-neutral-500">
                                            {member.role}
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-neutral-800 truncate">
                                          {member.email}
                                        </div>
                                      </div>
                                    </div>

                                    <Button
                                      isIconButton
                                      variant="danger"
                                      hasBorder
                                      size="sm"
                                      iconName="trash"
                                      title="Remove from workspace"
                                      onClick={() => handleRemoveMember(ws.id, member.id)}
                                    />
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE WORKSPACE DRAWER */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Workspace"
        size="md"
      >
        <div className="flex flex-col h-full justify-between pb-6 space-y-6 text-left">
          <div className="space-y-4 pt-2">
            <Input
              label="Workspace Name *"
              placeholder="e.g. Marketing & Analytics"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
            />

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-900 select-none">
                Workspace Color &amp; Icon
              </label>
              <div className="flex items-center gap-3">
                <IconSelector
                  value={newWsIcon}
                  onChange={(icon) => setNewWsIcon(icon)}
                  color={newWsColor}
                  variant="compact"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {CARAL_COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewWsColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 relative ${newWsColor.toLowerCase() === c.hex.toLowerCase()
                        ? "ring-3 ring-offset-2 ring-neutral-900 scale-105"
                        : "opacity-85 hover:opacity-100"
                        }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Input
              label="Description"
              multiline
              rows={3}
              placeholder="Describe the workspace purpose..."
              value={newWsDescription}
              onChange={(e) => setNewWsDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-500">
            <Button
              variant="ghost"
              hasBorder
              size="md"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="md"
              className="text-neutral-100!"
              onClick={handleCreateWorkspace}
            >
              Create Workspace
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
