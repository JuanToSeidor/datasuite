"use client";

import React, { useState } from "react";
import { Button, Chip, Toggle, Drawer } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Input, Select, SelectOption } from "@/components/ui";
import { useRouter } from "next/navigation";

interface GeneralTabProps {
  onNavigateTab?: (tabId: string) => void;
}

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: "es", label: "Español (América Latina)" },
  { value: "en", label: "English (United States)" },
  { value: "pt", label: "Português (Brasil)" },
];

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: "America/Argentina/Buenos_Aires", label: "(GMT-03:00) Buenos Aires, Argentina" },
  { value: "America/Santiago", label: "(GMT-04:00) Santiago, Chile" },
  { value: "America/Bogota", label: "(GMT-05:00) Bogotá, Colombia" },
  { value: "America/Mexico_City", label: "(GMT-06:00) Ciudad de México" },
  { value: "America/Sao_Paulo", label: "(GMT-03:00) São Paulo, Brasil" },
  { value: "UTC", label: "(UTC) Coordinated Universal Time" },
];

const DATE_FORMAT_OPTIONS: SelectOption[] = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g. 24/08/2024)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g. 08/24/2024)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO 8601)" },
];

export function GeneralTab({ onNavigateTab }: GeneralTabProps = {}) {
  const router = useRouter();

  // Parallel Extraction States
  const [isFallbackActive, setIsFallbackActive] = useState(true);
  const [parallelRfcs, setParallelRfcs] = useState("1");
  const [parallelSaved, setParallelSaved] = useState(false);

  // SMTP Settings & Drawer States
  const [isSmtpActive, setIsSmtpActive] = useState(false);
  const [isSmtpDrawerOpen, setIsSmtpDrawerOpen] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [smtpAdminEmail, setSmtpAdminEmail] = useState("");
  const [smtpSenderName, setSmtpSenderName] = useState("");
  const [smtpTestEmail, setSmtpTestEmail] = useState("crestone@example.com");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailSuccess, setTestEmailSuccess] = useState(false);

  // Localization States
  const [language, setLanguage] = useState("es");
  const [timezone, setTimezone] = useState("America/Argentina/Buenos_Aires");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [isSavedPrefs, setIsSavedPrefs] = useState(false);

  const handleTestEmail = () => {
    setIsTestingEmail(true);
    setTimeout(() => {
      setIsTestingEmail(false);
      setTestEmailSuccess(true);
    }, 800);
  };

  const handleSaveSmtp = () => {
    setIsSmtpActive(true);
    setIsSmtpDrawerOpen(false);
  };

  const handleSaveParallel = () => {
    setParallelSaved(true);
    setTimeout(() => setParallelSaved(false), 2000);
  };

  const handleSavePreferences = () => {
    setIsSavedPrefs(true);
    setTimeout(() => setIsSavedPrefs(false), 2500);
  };

  const handleNavigate = (tabId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
    } else {
      router.push(`/settings?tab=${tabId}`, { scroll: false });
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 text-left font-poppins">
      {/* ========================================================= */}
      {/* 1. SECCIÓN: PARALLEL EXTRACTION ENGINE                   */}
      {/* ========================================================= */}
      <section className="space-y-3 pb-6 border-b border-neutral-500">
        <div>
          <h4 className="font-bold text-neutral-900 text-base">
            Parallel Extraction Engine
          </h4>
          <p className="text-neutral-800 text-xs leading-relaxed">
            Enables concurrent execution of multiple RFC calls instead of a single serial batch. When disabled, extractions run strictly through the default CRESTONE_SERVER RFC destination.
          </p>
        </div>

        {/* Card: Fallback */}
        <div className="flex flex-col rounded-xl border border-neutral-500 overflow-hidden ml-0 sm:ml-4">
          <div className="flex items-center justify-between w-full bg-neutral-500 p-4 border-b border-neutral-400">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-info-light/20 text-info-main">
                <CaralIcon name="job" size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-neutral-900">
                    Parallel Worker Fallback
                  </span>
                  <span style={{ transform: "scale(0.8)" }}>
                    <Chip
                      variant={isFallbackActive ? "success" : "warning"}
                      label={isFallbackActive ? "Active" : "Inactive"}
                      hasBorder
                      status={isFallbackActive ? "success" : "warning"}
                    />
                  </span>
                </div>
                <p className="text-xs text-neutral-800">
                  CRESTONE_SERVER RFC pool is utilized dynamically to handle concurrent throughput.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Toggle
                checked={isFallbackActive}
                onChange={setIsFallbackActive}
                label={isFallbackActive ? "Active" : "Inactive"}
              />
            </div>
          </div>

          {isFallbackActive && (
            <div className="p-4 flex items-end gap-3 max-w-md bg-container">
              <Input
                id="parallel-rfcs"
                label="Number of parallel RFCs"
                type="number"
                min={1}
                max={32}
                value={parallelRfcs}
                onChange={(e) => setParallelRfcs(e.target.value)}
                className="w-72 font-mono"
              />
              <Button
                variant={parallelSaved ? "success" : "success"}
                size="md"
                onClick={handleSaveParallel}
                className="shrink-0 mb-[1px]"
              >
                {parallelSaved ? "Saved!" : "Save"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN: ALERT & DELIVERY CHANNELS (SMTP)             */}
      {/* ========================================================= */}
      <section className="space-y-3 pb-6 border-b border-neutral-500">
        <div>
          <h4 className="font-bold text-neutral-900 text-base">
            Alerts & Delivery Channels
          </h4>
          <p className="text-neutral-800 text-xs">
            Configure the Crestone alert delivery channel to dispatch email notifications and security advisories.
          </p>
        </div>

        {/* Card: Configure SMTP */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-500 border border-neutral-400 ml-0 sm:ml-4">
          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-lg flex mt-2 items-center justify-center shrink-0 bg-success-light text-success-main">
              <CaralIcon name="envelope" size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-neutral-900">
                  Configure SMTP Server
                </span>
                <span style={{ transform: "scale(0.8)" }}>
                  <Chip
                    variant={isSmtpActive ? "success" : "warning"}
                    label={isSmtpActive ? "Configured" : "Not configured"}
                    hasBorder
                    status={isSmtpActive ? "success" : "warning"}
                  />
                </span>
              </div>
              <p className="text-xs text-neutral-800">
                Configure custom SMTP credentials to enable sending enterprise alerts and extraction reports.
              </p>
              {isSmtpActive && (
                <Button
                  variant="ghost"
                  hasBorder
                  iconName="edit"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsSmtpDrawerOpen(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Toggle
              checked={isSmtpActive}
              onChange={(checked) => {
                if (checked && !isSmtpActive) {
                  setIsSmtpDrawerOpen(true);
                } else {
                  setIsSmtpActive(checked);
                }
              }}
              label={isSmtpActive ? "Active" : "Inactive"}
            />
          </div>
        </div>

        {/* Sub-bloque: Set up alerts by workspace */}
        <div className="space-y-2 pt-2 ml-0 sm:ml-4">
          <h5 className="font-bold text-neutral-900 text-sm">
            Workspace alerts routing
          </h5>
          <p className="text-neutral-800 text-xs">
            Alert trigger thresholds, recipient rosters, and routing rules can also be customized per workspace.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="ghost"
              className="border border-neutral-500"
              iconName="book"
              size="sm"
              onClick={() => window.open("https://crestone-help.seidoranalytics.com/docs/documentation/sections/Settings/alerts", "_blank")}
            >
              Documentation
            </Button>
            <Button
              variant="default"
              className="text-neutral-100!"
              size="sm"
              onClick={() => handleNavigate("workspaces")}
            >
              View workspaces
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SECCIÓN: LOCALIZATION & REGIONAL PREFERENCES          */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6 border-b border-neutral-500">
        <div>
          <h4 className="font-bold text-neutral-900 text-base">
            Locations & Regional Settings
          </h4>
          <p className="text-xs text-neutral-800 mt-0.5">
            Configure system language, display timezone, and number formatting for analytics extractions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 ml-0 sm:ml-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-900">
              Interface Language
            </label>
            <Select
              options={LANGUAGE_OPTIONS}
              value={language}
              onValueChange={(val) => setLanguage(String(val))}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-900">
              Default Timezone
            </label>
            <Select
              options={TIMEZONE_OPTIONS}
              value={timezone}
              onValueChange={(val) => setTimezone(String(val))}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-900">
              Date & Timestamp Format
            </label>
            <Select
              options={DATE_FORMAT_OPTIONS}
              value={dateFormat}
              onValueChange={(val) => setDateFormat(String(val))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 ml-0 sm:ml-4">
          {isSavedPrefs ? (
            <span className="text-xs font-semibold text-success-main flex items-center gap-1.5 animate-in fade-in">
              <CaralIcon name="check" size={14} /> Preferences saved successfully
            </span>
          ) : (
            <span />
          )}
          <Button
            variant="success"
            size="sm"
            onClick={handleSavePreferences}
            className="font-medium"
          >
            Save preferences
          </Button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SECCIÓN: CONFIGURATION SHORTCUTS                      */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div>
          <h4 className="font-bold text-neutral-900 text-base">
            Configuration Hub
          </h4>
          <p className="text-xs text-neutral-800 mt-0.5">
            Jump directly to specialized management consoles and policy settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Security & PAT Card */}
          <div
            onClick={() => handleNavigate("security")}
            className="p-4 rounded-xl bg-neutral-500 border border-neutral-400 hover:border-seidor-main cursor-pointer transition-all hover:shadow-sm space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-info-light/20 text-info-main flex items-center justify-center group-hover:scale-105 transition-transform">
              <CaralIcon name="shieldHalved" size={18} />
            </div>
            <h5 className="text-sm font-bold text-neutral-900 group-hover:text-seidor-main">
              Security & PATs
            </h5>
            <p className="text-xs text-neutral-800 leading-relaxed">
              Personal Access Tokens, 2FA, Microsoft SSO, and active login sessions.
            </p>
          </div>

          {/* Workspaces Card */}
          <div
            onClick={() => handleNavigate("workspaces")}
            className="p-4 rounded-xl bg-neutral-500 border border-neutral-400 hover:border-seidor-main cursor-pointer transition-all hover:shadow-sm space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-seidor-light/30 text-seidor-main flex items-center justify-center group-hover:scale-105 transition-transform">
              <CaralIcon name="cube" size={18} />
            </div>
            <h5 className="text-sm font-bold text-neutral-900 group-hover:text-seidor-main">
              Workspaces
            </h5>
            <p className="text-xs text-neutral-800 leading-relaxed">
              Manage organization environments, member access, and capacity quotas.
            </p>
          </div>

          {/* Roles & Permissions Card */}
          <div
            onClick={() => handleNavigate("roles")}
            className="p-4 rounded-xl bg-neutral-500 border border-neutral-400 hover:border-seidor-main cursor-pointer transition-all hover:shadow-sm space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-warning-light/30 text-warning-hard flex items-center justify-center group-hover:scale-105 transition-transform">
              <CaralIcon name="userConfig" size={18} />
            </div>
            <h5 className="text-sm font-bold text-neutral-900 group-hover:text-seidor-main">
              Roles & Policies
            </h5>
            <p className="text-xs text-neutral-800 leading-relaxed">
              Define granular access control matrices and system role definitions.
            </p>
          </div>

          {/* Users Card */}
          <div
            onClick={() => handleNavigate("users")}
            className="p-4 rounded-xl bg-neutral-500 border border-neutral-400 hover:border-seidor-main cursor-pointer transition-all hover:shadow-sm space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-success-light text-success-main flex items-center justify-center group-hover:scale-105 transition-transform">
              <CaralIcon name="users" size={18} />
            </div>
            <h5 className="text-sm font-bold text-neutral-900 group-hover:text-seidor-main">
              Users & Team
            </h5>
            <p className="text-xs text-neutral-800 leading-relaxed">
              Invite teammates, assign enterprise roles, and manage credentials.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DRAWER: CONFIGURE SMTP (EMAIL SETTINGS)                  */}
      {/* ========================================================= */}
      <Drawer
        isOpen={isSmtpDrawerOpen}
        onClose={() => setIsSmtpDrawerOpen(false)}
        title="Configure SMTP"
        size="lg"
      >
        <div className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins">
          <div className="flex-1 overflow-y-auto space-y-6 pt-2 pr-1.5 scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Host"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="e.g. email-smtp.us-east-1.amazonaws.com"
                detail="Detail: address of the SMTP server used to send the emails."
                className="font-mono"
              />

              <Input
                label="Port"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="e.g. 587"
                detail="Detail: port of the SMTP server (e.g. 587 for TLS, 465 for SSL)."
                className="font-mono"
              />

              <Input
                label="User"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="e.g. smtp_user_account"
                detail="Detail: account used to authenticate against the SMTP server."
                className="font-mono"
              />

              <Input
                label="Password"
                type={showSmtpPassword ? "text" : "password"}
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••"
                detail="Detail: password of the SMTP account. Keep it private."
                className="font-mono"
                rightElement={
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName={showSmtpPassword ? "eyeSlash" : "eye"}
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="!p-1.5 text-neutral-800 hover:text-neutral-900 cursor-pointer"
                  />
                }
              />

              <Input
                label="Admin email"
                type="email"
                value={smtpAdminEmail}
                onChange={(e) => setSmtpAdminEmail(e.target.value)}
                placeholder="e.g. cloud@seidoranalytics.com"
                detail="Detail: email address shown as the sender of the messages."
              />

              <Input
                label="Sender name"
                value={smtpSenderName}
                onChange={(e) => setSmtpSenderName(e.target.value)}
                placeholder="e.g. Crestone Alerts"
                detail="Detail: display name shown next to the sender email."
              />
            </div>

            {/* Section: Test sending alerts */}
            <div className="space-y-3 pt-6 border-t border-neutral-400">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-900">
                  Test sending alerts
                </h4>
                <p className="text-xs text-neutral-800">
                  Send a test email to verify the configuration. Save is enabled once the test succeeds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-end gap-3">
                <Input
                  label="Email"
                  type="email"
                  value={smtpTestEmail}
                  onChange={(e) => setSmtpTestEmail(e.target.value)}
                  placeholder="crestone@example.com"
                  containerClassName="flex-1"
                />
                <Button
                  variant={testEmailSuccess ? "success" : "light"}
                  hasBorder
                  iconName="envelopeSend"
                  onClick={handleTestEmail}
                  disabled={isTestingEmail}
                  className="shrink-0 font-medium text-xs justify-center mb-[1px]"
                >
                  {isTestingEmail
                    ? "Testing..."
                    : testEmailSuccess
                      ? "Test succeeded"
                      : "Test email sending"}
                </Button>
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-400">
            <Button
              variant="ghost"
              onClick={() => setIsSmtpDrawerOpen(false)}
              className="text-neutral-800 hover:text-neutral-900"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSaveSmtp}
              className="font-medium"
            >
              Save configuration
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}