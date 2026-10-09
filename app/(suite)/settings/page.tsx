"use client";

import React, { Suspense } from "react";
import { Button, Tabs } from "caralstable";
import { GeneralTab } from "./tabs/general";
import { UsersTab } from "./tabs/users";
import { RolesTab } from "./tabs/roles";
import { WorkspacesTab } from "./tabs/workspaces";
import { PlatformSecurityTab } from "./tabs/security";
import { LicenseTab } from "./tabs/license";
import { useRouter, useSearchParams } from "next/navigation";

export const SETTINGS_TABS = [
  { id: "general", label: "General", description: "Parallel extraction engine, SMTP delivery, and regional preferences" },
  { id: "users", label: "Users", description: "Manage organization users, invitations, and permissions" },
  { id: "roles", label: "Roles", description: "Configure access control policies and role assignments" },
  { id: "workspaces", label: "Workspaces", description: "Configure global workspaces, environments, and quotas" },
  { id: "security", label: "Security", description: "Configure enterprise Single Sign-On (SSO) and identity providers" },
  { id: "license", label: "License", description: "View license details, seats, and enterprise plan status" },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTabId = searchParams.get("tab") || "general";

  // Encontrar el índice de la pestaña activa a partir de la URL (soporta compatibilidad previa)
  const activeTabIndex = Math.max(
    0,
    SETTINGS_TABS.findIndex((tab) =>
      tab.id === currentTabId ||
      (currentTabId === "settings" && tab.id === "general") ||
      (currentTabId === "sso" && tab.id === "security")
    )
  );

  const handleTabChange = (index: number) => {
    const selectedTab = SETTINGS_TABS[index];
    if (selectedTab) {
      router.push(`/settings?tab=${selectedTab.id}`, { scroll: false });
    }
  };

  const handleNavigateToTab = (tabId: string) => {
    router.push(`/settings?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 font-poppins">
      {/* ========================================================= */}
      {/* CONTROLS ROW: TABS & ACCIONES SUPERIORES                 */}
      {/* ========================================================= */}
      <div className="bg-container rounded-xl border border-neutral-400 p-4 space-y-6">
        {/* Caral Tabs Header */}
        <div className="flex justify-between items-center">
          <Tabs
            activeIndex={activeTabIndex}
            onChange={handleTabChange}
            tabs={SETTINGS_TABS}
          />

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Button
              isIconButton
              iconName="search"
              variant="ghost"
              hasBorder
              className="border-neutral-400 text-neutral-800 hover:text-neutral-900"
              title="Search settings"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 0: GENERAL SETTINGS                                   */}
        {/* ========================================================= */}
        {activeTabIndex === 0 && <GeneralTab onNavigateTab={handleNavigateToTab} />}

        {/* ========================================================= */}
        {/* TAB 1: USERS MANAGEMENT                                   */}
        {/* ========================================================= */}
        {activeTabIndex === 1 && <UsersTab />}

        {/* ========================================================= */}
        {/* TAB 2: ROLES & PERMISSIONS                                */}
        {/* ========================================================= */}
        {activeTabIndex === 2 && <RolesTab />}

        {/* ========================================================= */}
        {/* TAB 3: WORKSPACES MANAGEMENT                              */}
        {/* ========================================================= */}
        {activeTabIndex === 3 && <WorkspacesTab />}

        {/* ========================================================= */}
        {/* TAB 4: PLATFORM SECURITY & SSO                            */}
        {/* ========================================================= */}
        {activeTabIndex === 4 && <PlatformSecurityTab onNavigateTab={handleNavigateToTab} />}

        {/* ========================================================= */}
        {/* TAB 5: LICENSE & SUBSCRIPTION                             */}
        {/* ========================================================= */}
        {activeTabIndex === 5 && <LicenseTab />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-800 font-poppins">Loading platform settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
