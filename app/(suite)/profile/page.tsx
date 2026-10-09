"use client";

import React, { Suspense } from "react";
import { Button, Tabs, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { PreferencesTab } from "./tabs/preferences";
import { ProfileSecurityTab } from "./tabs/security";
import { IntegrationsTab } from "./tabs/integrations";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();
  const currentTabId = searchParams.get("tab") || "preferences";

  const profileTabs = [
    { id: "preferences", label: dict.profile.tabPreferences, description: "Appearance, display theme, and default index landing route" },
    { id: "security", label: dict.profile.tabSecurity, description: "Password, credentials, and active browser sessions" },
    { id: "integrations", label: dict.profile.tabIntegrations, description: "Two-step verification (TOTP) and Personal Access Tokens (PAT)" },
  ];

  const activeTabIndex = Math.max(
    0,
    profileTabs.findIndex((tab) => tab.id === currentTabId)
  );

  const handleTabChange = (index: number) => {
    const selectedTab = profileTabs[index];
    if (selectedTab) {
      router.push(`/profile?tab=${selectedTab.id}`, { scroll: false });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 font-poppins">
      {/* ========================================================= */}
      {/* PROFILE HEADER / HERO BANNER                             */}
      {/* ========================================================= */}
      <div className="bg-container rounded-xl border border-neutral-400 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-info-main border-2 border-white/20 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-sm">
            JD
          </div>
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Juan David Torres
              </h1>
              <Chip variant="info" label={dict.profile.platformAdmin} hasBorder />
              <Chip variant="success" label={dict.profile.activeStatus} hasBorder status="success" />
            </div>
            <p className="text-xs text-neutral-800">
              jdtorres@seidoranalytics.com • Organization: <span className="font-semibold text-neutral-900">Seidor Analytics</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            hasBorder
            size="sm"
            iconName="gear"
            className="border-neutral-400 text-neutral-800 hover:text-neutral-900"
            onClick={() => router.push("/settings")}
          >
            {dict.settings.title}
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TABS CONTAINER ROW                                       */}
      {/* ========================================================= */}
      <div className="bg-container rounded-xl border border-neutral-400 p-4 space-y-6">
        {/* Caral Tabs Header */}
        <div className="flex justify-between items-center">
          <Tabs
            activeIndex={activeTabIndex}
            onChange={handleTabChange}
            tabs={profileTabs}
          />

          {/* Right side search action */}
          <div className="flex items-center gap-3">
            <Button
              isIconButton
              iconName="search"
              variant="ghost"
              hasBorder
              className="border-neutral-400 text-neutral-800 hover:text-neutral-900"
              title="Search profile settings"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 0: PREFERENCES (Appearance & Index page)              */}
        {/* ========================================================= */}
        {activeTabIndex === 0 && <PreferencesTab />}

        {/* ========================================================= */}
        {/* TAB 1: SECURITY (Password & Active sessions)              */}
        {/* ========================================================= */}
        {activeTabIndex === 1 && <ProfileSecurityTab />}

        {/* ========================================================= */}
        {/* TAB 2: INTEGRATIONS (TOTP & PAT)                          */}
        {/* ========================================================= */}
        {activeTabIndex === 2 && <IntegrationsTab />}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-800 font-poppins">Loading personal profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
