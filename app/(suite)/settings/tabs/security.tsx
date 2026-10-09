"use client";

import React, { useState } from "react";
import { Button, Chip, Toggle, Drawer } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Input } from "@/components/ui";

interface PlatformSecurityTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function PlatformSecurityTab({ onNavigateTab }: PlatformSecurityTabProps = {}) {
  // Microsoft SSO Drawer States
  const [isMicrosoftSsoActive, setIsMicrosoftSsoActive] = useState(true);
  const [isMicrosoftSsoDrawerOpen, setIsMicrosoftSsoDrawerOpen] = useState(false);
  const [ssoRedirectUri] = useState("https://suite.seidoranalytics.com/auth/azure/callback/");
  const [ssoTenantId, setSsoTenantId] = useState("00000000-0000-0000-0000-000000000000");
  const [ssoClientId, setSsoClientId] = useState("00000000-0000-0000-0000-000000000000");
  const [ssoClientSecret, setSsoClientSecret] = useState("azure_client_secret_placeholder_value");
  const [showSsoSecret, setShowSsoSecret] = useState(false);
  const [isCopiedUri, setIsCopiedUri] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Handlers for SSO
  const handleCopyUri = () => {
    navigator.clipboard.writeText(ssoRedirectUri);
    setIsCopiedUri(true);
    setTimeout(() => setIsCopiedUri(false), 2000);
  };

  const handleSaveSso = () => {
    setIsMicrosoftSsoActive(true);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsMicrosoftSsoDrawerOpen(false);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col gap-8 text-left font-poppins">
      {/* ========================================================= */}
      {/* 1. SECCIÓN: ENTERPRISE SINGLE SIGN-ON (SSO)               */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6 border-b border-neutral-500">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-neutral-900 text-base">
              Single Sign-On (SSO) Authentication
            </h4>
            <Chip variant="info" label="Platform Security" hasBorder />
          </div>
          <p className="text-neutral-800 text-xs mt-0.5 max-w-2xl leading-relaxed">
            Configure identity provider integration to enforce corporate Single Sign-On (SSO). When active, organization users authenticate through your centralized corporate directory.
          </p>
        </div>

        {/* SSO Microsoft Provider Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-xl bg-neutral-500 border border-neutral-400 gap-4 ml-0 sm:ml-4">
          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-neutral-400 flex items-center justify-center shrink-0 text-neutral-900">
              <CaralIcon name="Windows" size={22} classname="text-neutral-900" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">
                  Microsoft Entra ID (Azure AD) SSO
                </span>
                <span style={{ transform: "scale(0.85)" }}>
                  <Chip
                    variant={isMicrosoftSsoActive ? "success" : "warning"}
                    label={isMicrosoftSsoActive ? "Configured & Active" : "Disabled"}
                    hasBorder
                    status={isMicrosoftSsoActive ? "success" : "warning"}
                  />
                </span>
              </div>
              <p className="text-xs text-neutral-800 max-w-xl leading-relaxed">
                Allow company members to sign into Crestone Suite using their corporate Microsoft Office 365 or Entra ID accounts. Supports automatic role mapping and tenant isolation.
              </p>
              {isMicrosoftSsoActive && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    hasBorder
                    size="sm"
                    iconName="edit"
                    onClick={() => setIsMicrosoftSsoDrawerOpen(true)}
                    className="font-medium"
                  >
                    Edit configuration
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Toggle
              checked={isMicrosoftSsoActive}
              onChange={(active) => {
                if (active && !isMicrosoftSsoActive) {
                  setIsMicrosoftSsoDrawerOpen(true);
                } else {
                  setIsMicrosoftSsoActive(active);
                }
              }}
              label={isMicrosoftSsoActive ? "Active" : "Inactive"}
            />
          </div>
        </div>

        {/* SSO Policy Info */}
        <div className="ml-0 sm:ml-4 p-4 rounded-xl bg-neutral-500/50 border border-neutral-500 space-y-2">
          <div className="flex items-center gap-2">
            <CaralIcon name="shieldHalved" size={16} classname="text-seidor-main" />
            <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Enforcement & Login Policy
            </h5>
          </div>
          <p className="text-xs text-neutral-800 leading-relaxed">
            When Microsoft SSO is enabled, users with domains matching your registered Azure tenant (<code className="font-mono text-neutral-900 font-semibold">@seidoranalytics.com</code>) will be prompted to authenticate through Microsoft Entra ID. Personal credentials and tokens can be managed in individual user profiles.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DRAWER: CONFIGURE MICROSOFT SINGLE SIGN-ON (SSO)         */}
      {/* ========================================================= */}
      <Drawer
        isOpen={isMicrosoftSsoDrawerOpen}
        onClose={() => setIsMicrosoftSsoDrawerOpen(false)}
        title="Configure Microsoft Single Sign-On (SSO)"
        size="lg"
      >
        <div className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins">
          <div className="flex-1 overflow-y-auto space-y-6 pt-2 pr-1.5 scrollbar-thin">
            {saveSuccessMsg && (
              <div className="p-3 rounded-lg bg-success-light text-success-hard border border-success-main/30 text-xs flex items-center gap-2">
                <CaralIcon name="check" size={16} />
                <span>SSO configuration updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Redirect URI with Copy Button */}
              <div className="flex flex-col gap-1 w-full font-poppins md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-900 select-none">
                  Redirect URI (register this exact URL in your Azure App Registration)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center rounded-lg border border-neutral-500">
                    <input
                      readOnly
                      value={ssoRedirectUri}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-container border border-neutral-500 text-neutral-900 font-mono focus:outline-none"
                    />
                  </div>
                  <Button
                    variant={isCopiedUri ? "success" : "ghost"}
                    hasBorder
                    size="sm"
                    iconName={isCopiedUri ? "check" : "copy"}
                    onClick={handleCopyUri}
                    className="shrink-0 font-medium"
                  >
                    {isCopiedUri ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-neutral-800">
                  Detail: Add this exact Web redirect URI under Microsoft Azure Portal &gt; App Registrations &gt; Authentication.
                </p>
              </div>

              {/* Directory (tenant) ID */}
              <Input
                label="Directory (tenant) ID *"
                value={ssoTenantId}
                onChange={(e) => setSsoTenantId(e.target.value)}
                placeholder="e.g. 9445ab2e-91b8-406c-982b-5559fa56982f"
                detail="Copy from Azure Portal &gt; App registrations &gt; Overview &gt; Directory (tenant) ID."
                className="font-mono text-xs"
              />

              {/* Client ID */}
              <Input
                label="Application (client) ID *"
                value={ssoClientId}
                onChange={(e) => setSsoClientId(e.target.value)}
                placeholder="e.g. b15d451d-3186-4b9d-b46c-1ba477467a91"
                detail="Application (client) identifier of the registered Microsoft app."
                className="font-mono text-xs"
              />

              {/* Client Secret */}
              <div className="md:col-span-2">
                <Input
                  label="Client Secret *"
                  type={showSsoSecret ? "text" : "password"}
                  value={ssoClientSecret}
                  onChange={(e) => setSsoClientSecret(e.target.value)}
                  placeholder="••••••••"
                  detail="Secret value generated for the app registration in Certificates & secrets. Keep it confidential."
                  className="font-mono text-xs"
                  rightElement={
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName={showSsoSecret ? "eyeSlash" : "eye"}
                      onClick={() => setShowSsoSecret(!showSsoSecret)}
                      className="!p-1.5 text-neutral-800 hover:text-neutral-900 cursor-pointer"
                    />
                  }
                />
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-500">
            <Button
              variant="ghost"
              onClick={() => setIsMicrosoftSsoDrawerOpen(false)}
              className="text-neutral-800 hover:text-neutral-900"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSaveSso}
              className="bg-seidor-main text-white font-medium hover:bg-seidor-hard"
            >
              Save changes
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
