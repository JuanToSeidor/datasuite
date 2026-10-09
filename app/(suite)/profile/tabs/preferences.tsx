"use client";

import React, { useState } from "react";
import { Button, Chip } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { useTheme } from "@/contexts/ThemeContext";
import { Select, SelectOption } from "@/components/ui";

const INDEX_PAGE_OPTIONS: SelectOption[] = [
  { value: "/", label: "Suite Overview (Home)" },
  { value: "/dashboard", label: "Operations Dashboard" },
  { value: "/optimize", label: "Optimize Cloud Cost" },
  { value: "/connections", label: "Data Connections Hub" },
  { value: "/monitor", label: "Activity & System Monitor" },
];

export function PreferencesTab() {
  const { isDark, toggleDark, theme, setTheme } = useTheme();
  const [indexPage, setIndexPage] = useState("/");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-8 text-left font-poppins">
      {/* ========================================================= */}
      {/* 1. SECCIÓN: APPEARANCE & THEME                           */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6 border-b border-neutral-500">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-neutral-900 text-base">
              Appearance & Theme
            </h4>
            <Chip variant="info" label="Personal" hasBorder />
          </div>
          <p className="text-xs text-neutral-800 mt-0.5">
            Customize how Crestone looks on your current device. Theme preferences apply immediately to your session.
          </p>
        </div>

        {/* Theme cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ml-0 sm:ml-4">
          {/* Light Mode */}
          <div
            onClick={() => setTheme("light")}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
              theme === "light"
                ? "bg-neutral-500/80 border-seidor-main shadow-xs ring-1 ring-seidor-main/20"
                : "bg-neutral-500 border-neutral-400 hover:border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-warning-light/30 text-warning-hard flex items-center justify-center">
                <CaralIcon name="sunBright" size={18} />
              </div>
              {theme === "light" && (
                <Chip variant="success" label="Active" hasBorder status="success" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-neutral-900 block">Light Mode</span>
              <p className="text-xs text-neutral-800 mt-0.5">Clean, high-contrast bright appearance.</p>
            </div>
          </div>

          {/* Dark Mode */}
          <div
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
              theme === "dark"
                ? "bg-neutral-500/80 border-seidor-main shadow-xs ring-1 ring-seidor-main/20"
                : "bg-neutral-500 border-neutral-400 hover:border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-info-light/20 text-info-main flex items-center justify-center">
                <CaralIcon name="sunMoon" size={18} />
              </div>
              {theme === "dark" && (
                <Chip variant="success" label="Active" hasBorder status="success" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-neutral-900 block">Dark Mode</span>
              <p className="text-xs text-neutral-800 mt-0.5">Sleek, low-glare dark color palette.</p>
            </div>
          </div>

          {/* System Mode */}
          <div
            onClick={() => setTheme("system")}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
              theme === "system"
                ? "bg-neutral-500/80 border-seidor-main shadow-xs ring-1 ring-seidor-main/20"
                : "bg-neutral-500 border-neutral-400 hover:border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-neutral-400 text-neutral-900 flex items-center justify-center">
                <CaralIcon name="pc" size={18} />
              </div>
              {theme === "system" && (
                <Chip variant="success" label="Active" hasBorder status="success" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-neutral-900 block">System Default</span>
              <p className="text-xs text-neutral-800 mt-0.5">Sync automatically with operating system theme.</p>
            </div>
          </div>
        </div>

        {/* Quick toggle bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-neutral-500 border border-neutral-400 gap-4 ml-0 sm:ml-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-400 flex items-center justify-center shrink-0 text-neutral-900">
              <CaralIcon name={isDark ? "sunMoon" : "sunBright"} size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold text-neutral-900">
                Quick Toggle Color Scheme
              </span>
              <p className="text-xs text-neutral-800">
                Currently rendering in <strong className="text-neutral-900">{isDark ? "Dark Mode" : "Light Mode"}</strong>.
              </p>
            </div>
          </div>

          <Button
            isIconButton
            iconName={isDark ? "sunMoon" : "sunBright"}
            variant="ghost"
            hasBorder
            className="border-neutral-400 text-neutral-900 hover:bg-neutral-400/40 cursor-pointer shrink-0"
            onClick={toggleDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN: INDEX PAGE (LANDING DEFAULT)                 */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6">
        <div>
          <h4 className="font-bold text-neutral-900 text-base">
            Default Landing Page (Index)
          </h4>
          <p className="text-xs text-neutral-800 mt-0.5">
            Choose the default module or view to open automatically whenever you sign into Crestone Suite.
          </p>
        </div>

        <div className="max-w-xl ml-0 sm:ml-4 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-900">
              Home Route on Login
            </label>
            <Select
              options={INDEX_PAGE_OPTIONS}
              value={indexPage}
              onValueChange={(val) => setIndexPage(String(val))}
              className="w-full"
            />
          </div>

          <p className="text-xs text-neutral-800">
            When you navigate to the root address of the platform, you will be redirected to your chosen landing view.
          </p>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-success-main flex items-center gap-1.5 animate-in fade-in">
                <CaralIcon name="check" size={14} /> Preferences updated successfully!
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
        </div>
      </section>
    </div>
  );
}
