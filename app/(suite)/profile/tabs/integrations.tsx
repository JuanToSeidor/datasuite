"use client";

import React, { useState } from "react";
import { Button, Chip, Toggle, Drawer } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Input, Select, SelectOption } from "@/components/ui";

export interface CapabilityItem {
  id: string;
  label: string;
  description: string;
}

export interface CapabilityCategory {
  id: string;
  name: string;
  description: string;
  items: CapabilityItem[];
}

export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  {
    id: "workspaces",
    name: "Workspaces",
    description: "Choose which workspaces this token may access.",
    items: [
      {
        id: "workspaces:read",
        label: "Read workspaces",
        description: "View available workspaces.",
      },
    ],
  },
  {
    id: "connections",
    name: "Connections",
    description: "Choose access to connection discovery and connectivity checks.",
    items: [
      {
        id: "connections:read",
        label: "Read connections",
        description: "View connection records.",
      },
      {
        id: "connections:probe",
        label: "Probe connections",
        description: "Test a connection using the configured route.",
      },
      {
        id: "connections:probe_direct",
        label: "Probe connections directly",
        description: "Test a connection through the direct route.",
      },
      {
        id: "connections:create",
        label: "Create connections",
        description: "Create new connection records.",
      },
    ],
  },
  {
    id: "nodes",
    name: "Nodes",
    description: "Choose access to extraction node records.",
    items: [
      {
        id: "nodes:read",
        label: "Read nodes",
        description: "View extraction nodes.",
      },
      {
        id: "nodes:rename",
        label: "Rename nodes",
        description: "Change the name of an extraction node.",
      },
      {
        id: "nodes:create",
        label: "Create nodes",
        description: "Create new extraction nodes.",
      },
      {
        id: "nodes:edit",
        label: "Edit nodes",
        description: "Change existing extraction node settings.",
      },
    ],
  },
  {
    id: "connection_metadata",
    name: "Connection metadata",
    description: "Choose which provider metadata a token may inspect.",
    items: [
      {
        id: "metadata:postgres",
        label: "PostgreSQL metadata",
        description: "Inspect PostgreSQL schemas and objects.",
      },
      {
        id: "metadata:sap_hana",
        label: "SAP HANA metadata",
        description: "Inspect SAP HANA schemas and objects.",
      },
      {
        id: "metadata:mysql",
        label: "MySQL metadata",
        description: "Inspect MySQL schemas and objects.",
      },
      {
        id: "metadata:oracle",
        label: "Oracle metadata",
        description: "Inspect Oracle schemas and objects.",
      },
      {
        id: "metadata:db2",
        label: "DB2 metadata",
        description: "Inspect DB2 schemas and objects.",
      },
      {
        id: "metadata:sql_server",
        label: "SQL Server metadata",
        description: "Inspect SQL Server schemas and objects.",
      },
      {
        id: "metadata:snowflake",
        label: "Snowflake metadata",
        description: "Inspect Snowflake databases and tables.",
      },
      {
        id: "metadata:databricks",
        label: "Databricks metadata",
        description: "Inspect Databricks catalogs and objects.",
      },
    ],
  },
  {
    id: "jobs",
    name: "Jobs",
    description: "Choose access to job definitions and execution.",
    items: [
      {
        id: "jobs:read",
        label: "Read jobs",
        description: "View job definitions and status.",
      },
      {
        id: "jobs:rename",
        label: "Rename jobs",
        description: "Change the name of an existing job.",
      },
      {
        id: "jobs:create",
        label: "Create jobs",
        description: "Create new job definitions.",
      },
      {
        id: "jobs:run",
        label: "Run jobs",
        description: "Start an existing job.",
      },
      {
        id: "jobs:edit",
        label: "Edit jobs",
        description: "Change existing job definitions.",
      },
    ],
  },
  {
    id: "executions_and_logs",
    name: "Executions and logs",
    description: "Choose access to execution details and monitoring logs.",
    items: [
      {
        id: "executions:read",
        label: "Read executions",
        description: "View job execution details.",
      },
      {
        id: "logs:read",
        label: "Read logs",
        description: "View execution and monitoring logs.",
      },
    ],
  },
];

export const WORKSPACE_SCOPE_OPTIONS = [
  { id: "ws-ex-default", name: "EX Default" },
  { id: "ws-mcp", name: "MCP" },
  { id: "ws-workspace-dev", name: "Workspace Dev" },
];

const ALL_CAPABILITY_IDS = CAPABILITY_CATEGORIES.flatMap((cat) => cat.items.map((i) => i.id));

export interface PersonalAccessToken {
  id: string;
  name: string;
  tokenPrefix: string;
  fullToken?: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  expiresInDays?: number | null;
  capabilities: string[];
  workspaces: string[];
}

const INITIAL_TOKENS: PersonalAccessToken[] = [
  {
    id: "pat-1",
    name: "VS Code Suite Extension",
    tokenPrefix: "cst_pat_live_7a82...e491",
    createdAt: "15 Jan 2024",
    lastUsedAt: "2 hours ago",
    expiresAt: "Never",
    expiresInDays: null,
    capabilities: [
      "workspaces:read",
      "connections:read",
      "connections:probe",
      "nodes:read",
      "jobs:read",
      "jobs:run",
      "executions:read",
      "logs:read",
    ],
    workspaces: ["EX Default", "Workspace Dev"],
  },
  {
    id: "pat-2",
    name: "CI/CD Ingestion Pipeline",
    tokenPrefix: "cst_pat_live_1b93...6f82",
    createdAt: "02 Feb 2024",
    lastUsedAt: "1 day ago",
    expiresAt: "In 28 days",
    expiresInDays: 28,
    capabilities: ALL_CAPABILITY_IDS,
    workspaces: ["EX Default", "MCP", "Workspace Dev"],
  },
  {
    id: "pat-3",
    name: "MCP Local Server Sidecar",
    tokenPrefix: "cst_pat_live_4d02...11ac",
    createdAt: "20 Mar 2024",
    lastUsedAt: "Just now",
    expiresAt: "In 84 days",
    expiresInDays: 84,
    capabilities: [
      "workspaces:read",
      "connections:read",
      "connections:probe",
      "metadata:postgres",
      "metadata:sap_hana",
      "metadata:snowflake",
      "jobs:read",
      "logs:read",
    ],
    workspaces: ["MCP"],
  },
];

const EXPIRATION_OPTIONS: SelectOption[] = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days" },
  { value: "365", label: "1 year" },
  { value: "0", label: "No expiration (Never)" },
];

export function IntegrationsTab() {
  // TOTP States
  const [isTotpActive, setIsTotpActive] = useState(false);
  const [isTotpDrawerOpen, setIsTotpDrawerOpen] = useState(false);
  const [totpVerificationCode, setTotpVerificationCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpSecret] = useState("JBSWY3DPEHPK3PXP");

  // Personal Access Tokens States
  const [tokens, setTokens] = useState<PersonalAccessToken[]>(INITIAL_TOKENS);
  const [isCreateTokenDrawerOpen, setIsCreateTokenDrawerOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenExpiration, setNewTokenExpiration] = useState("30");

  // Capabilities & Workspace Scope in Drawer
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(ALL_CAPABILITY_IDS);
  const [selectedWorkspaceNames, setSelectedWorkspaceNames] = useState<string[]>(
    WORKSPACE_SCOPE_OPTIONS.map((w) => w.name)
  );
  const [tokenCreationError, setTokenCreationError] = useState("");

  // Generated Token Modal (one-time view)
  const [createdTokenData, setCreatedTokenData] = useState<{ name: string; token: string } | null>(null);
  const [isCopiedNewToken, setIsCopiedNewToken] = useState(false);

  // Token Revoke Confirmation Modal
  const [tokenToRevoke, setTokenToRevoke] = useState<PersonalAccessToken | null>(null);

  // TOTP Handlers
  const handleToggleTotp = (active: boolean) => {
    if (active && !isTotpActive) {
      setIsTotpDrawerOpen(true);
    } else {
      setIsTotpActive(active);
    }
  };

  const handleVerifyAndEnableTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpVerificationCode.trim().length < 6) {
      setTotpError("Please enter a valid 6-digit verification code.");
      return;
    }
    setTotpError("");
    setIsTotpActive(true);
    setIsTotpDrawerOpen(false);
    setTotpVerificationCode("");
  };

  // Capabilities Handlers
  const handleToggleCapability = (capId: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capId) ? prev.filter((id) => id !== capId) : [...prev, capId]
    );
  };

  const handleSelectAllCapabilities = () => {
    setSelectedCapabilities([...ALL_CAPABILITY_IDS]);
  };

  const handleClearAllCapabilities = () => {
    setSelectedCapabilities([]);
  };

  // Workspaces Scope Handlers
  const handleToggleWorkspace = (wsName: string) => {
    setSelectedWorkspaceNames((prev) =>
      prev.includes(wsName) ? prev.filter((name) => name !== wsName) : [...prev, wsName]
    );
  };

  const handleSelectAllWorkspaces = () => {
    setSelectedWorkspaceNames(WORKSPACE_SCOPE_OPTIONS.map((w) => w.name));
  };

  const handleClearAllWorkspaces = () => {
    setSelectedWorkspaceNames([]);
  };

  // Token Handlers
  const handleOpenCreateDrawer = () => {
    setTokenCreationError("");
    setNewTokenName("");
    setNewTokenExpiration("30");
    setSelectedCapabilities([...ALL_CAPABILITY_IDS]);
    setSelectedWorkspaceNames(WORKSPACE_SCOPE_OPTIONS.map((w) => w.name));
    setIsCreateTokenDrawerOpen(true);
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) {
      setTokenCreationError("Please provide a name or purpose for this token.");
      return;
    }
    if (selectedCapabilities.length === 0) {
      setTokenCreationError("At least one capability is required.");
      return;
    }
    if (selectedWorkspaceNames.length === 0) {
      setTokenCreationError("At least one workspace must be selected in workspace scope.");
      return;
    }

    setTokenCreationError("");

    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const generatedToken = `cst_pat_live_${randomHex}`;
    const tokenPrefix = `${generatedToken.slice(0, 16)}...${generatedToken.slice(-4)}`;

    const expDays = parseInt(newTokenExpiration, 10);
    const expiresAt = expDays === 0 ? "Never" : `In ${expDays} days`;

    const createdToken: PersonalAccessToken = {
      id: `pat-${Date.now()}`,
      name: newTokenName.trim(),
      tokenPrefix,
      createdAt: "Today",
      lastUsedAt: "Never",
      expiresAt,
      expiresInDays: expDays === 0 ? null : expDays,
      capabilities: [...selectedCapabilities],
      workspaces: [...selectedWorkspaceNames],
    };

    setTokens((prev) => [createdToken, ...prev]);
    setIsCreateTokenDrawerOpen(false);
    setCreatedTokenData({
      name: createdToken.name,
      token: generatedToken,
    });
  };

  const handleCopyNewToken = () => {
    if (createdTokenData?.token) {
      navigator.clipboard.writeText(createdTokenData.token);
      setIsCopiedNewToken(true);
      setTimeout(() => setIsCopiedNewToken(false), 2000);
    }
  };

  const handleRevokeToken = () => {
    if (!tokenToRevoke) return;
    setTokens((prev) => prev.filter((t) => t.id !== tokenToRevoke.id));
    setTokenToRevoke(null);
  };

  return (
    <div className="w-full flex flex-col gap-10 text-left font-poppins">
      {/* ========================================================= */}
      {/* 1. SECCIÓN: TOTP (TWO-FACTOR AUTHENTICATION)              */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6 border-b border-neutral-500">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-neutral-900 text-base">
              Time-based One-Time Password (TOTP)
            </h4>
            <Chip variant="info" label="2FA" hasBorder />
          </div>
          <p className="text-neutral-800 text-xs mt-0.5 leading-relaxed">
            Protect your personal account with time-based verification codes generated by an authenticator application (Google Authenticator, Microsoft Authenticator, 1Password, etc.).
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-500 border border-neutral-500 ml-0 sm:ml-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-400 flex items-center justify-center shrink-0 text-neutral-900">
              <CaralIcon name="grid" size={18} classname="text-neutral-900" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">
                  Authenticator Application
                </span>
                <span style={{ transform: "scale(0.8)" }}>
                  <Chip
                    variant={isTotpActive ? "success" : "warning"}
                    label={isTotpActive ? "Enabled" : "Disabled"}
                    hasBorder
                    status={isTotpActive ? "success" : "warning"}
                  />
                </span>
              </div>
              <p className="text-xs text-neutral-800">
                Receive one-time codes on your mobile device during sign-in verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Toggle
              checked={isTotpActive}
              onChange={handleToggleTotp}
              label={isTotpActive ? "Active" : "Inactive"}
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN: PERSONAL ACCESS TOKENS (PAT)                 */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-neutral-900 text-base">
                Personal Access Tokens (PAT)
              </h4>
              <Chip variant="info" label="API & Sidecars" hasBorder />
            </div>
            <p className="text-neutral-800 text-xs mt-1 max-w-2xl leading-relaxed">
              Personal access tokens function like API keys. Use them to securely authenticate automated scripts, developer extensions, CLI tooling, and Model Context Protocol (MCP) sidecars.
            </p>
          </div>

          <Button
            variant="default"
            size="md"
            iconName="key"
            className="bg-seidor-main text-white shrink-0 hover:bg-seidor-hard font-medium"
            onClick={handleOpenCreateDrawer}
          >
            Generate new token
          </Button>
        </div>

        {/* Tokens Table Card */}
        <div className="w-full bg-container border border-neutral-500 overflow-hidden rounded-xl shadow-xs ml-0 sm:ml-4">
          {tokens.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-neutral-500 flex items-center justify-center mx-auto text-neutral-800">
                <CaralIcon name="key" size={20} />
              </div>
              <p className="text-sm font-semibold text-neutral-900">No active Personal Access Tokens</p>
              <p className="text-xs text-neutral-800 max-w-sm mx-auto">
                Generate a token to interact programmatically with Crestone APIs and MCP sidecars.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-500 border-b border-neutral-500 text-neutral-900 font-semibold">
                    <th className="p-3.5 pl-4">Token Name & Prefix</th>
                    <th className="p-3.5">Capabilities</th>
                    <th className="p-3.5">Workspace Scope</th>
                    <th className="p-3.5">Created</th>
                    <th className="p-3.5">Last used</th>
                    <th className="p-3.5">Expiration</th>
                    <th className="p-3.5 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-400/60">
                  {tokens.map((token) => (
                    <tr key={token.id} className="hover:bg-neutral-500/5 transition-colors">
                      {/* Name & Prefix */}
                      <td className="p-3.5 pl-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 text-sm">{token.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-neutral-800 text-[11px] bg-neutral-500/40 w-fit px-1.5 py-0.5 rounded border border-neutral-500/40">
                            <CaralIcon name="key" size={12} classname="text-neutral-800" />
                            <span>{token.tokenPrefix}</span>
                          </div>
                        </div>
                      </td>

                      {/* Capabilities Summary */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          <span className="px-2 py-0.5 rounded-md bg-info-light/20 text-info-hard border border-info-main/30 text-[11px] font-semibold">
                            {token.capabilities.length === ALL_CAPABILITY_IDS.length
                              ? "All capabilities (20)"
                              : `${token.capabilities.length} capabilities`}
                          </span>
                        </div>
                      </td>

                      {/* Workspaces Scope */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {token.workspaces.map((ws) => (
                            <span
                              key={ws}
                              className="px-2 py-0.5 rounded-md bg-neutral-400/30 text-neutral-900 border border-neutral-500/60 text-[11px]"
                            >
                              {ws}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="p-3.5 text-neutral-800 whitespace-nowrap">
                        {token.createdAt}
                      </td>

                      {/* Last Used */}
                      <td className="p-3.5 text-neutral-800 whitespace-nowrap">
                        {token.lastUsedAt}
                      </td>

                      {/* Expiration */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span style={{ transform: "scale(0.85)", display: "inline-block", transformOrigin: "left center" }}>
                          <Chip
                            variant={token.expiresAt === "Never" ? "info" : "success"}
                            label={token.expiresAt}
                            hasBorder
                          />
                        </span>
                      </td>

                      {/* Action (Revoke) */}
                      <td className="p-3.5 pr-4 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          hasBorder
                          iconName="trash"
                          onClick={() => setTokenToRevoke(token)}
                          className="hover:bg-danger-light text-danger-main hover:text-danger-hard"
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* DRAWER: CONFIGURE TOTP                                   */}
      {/* ========================================================= */}
      <Drawer
        isOpen={isTotpDrawerOpen}
        onClose={() => setIsTotpDrawerOpen(false)}
        title="Enable Authenticator Application (TOTP)"
        size="md"
      >
        <form onSubmit={handleVerifyAndEnableTotp} className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins">
          <div className="flex-1 overflow-y-auto space-y-5 pt-2 pr-1.5 scrollbar-thin">
            <p className="text-xs text-neutral-800 leading-relaxed">
              Scan this QR code using your authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password), or enter the setup key manually.
            </p>

            {/* Mock QR display container */}
            <div className="p-4 bg-container rounded-xl border border-neutral-400 flex flex-col items-center justify-center gap-3">
              <div className="w-36 h-36 bg-white border border-neutral-300 rounded-lg flex items-center justify-center p-2 shadow-inner">
                <CaralIcon name="grid" size={96} classname="text-neutral-900" />
              </div>
              <div className="text-center space-y-1">
                <span className="text-[11px] text-neutral-800 block">Manual secret key:</span>
                <span className="font-mono text-xs font-bold text-neutral-900 tracking-wider bg-neutral-500 px-2 py-1 rounded">
                  {totpSecret}
                </span>
              </div>
            </div>

            {totpError && (
              <div className="p-3 rounded-lg bg-danger-light text-danger-hard border border-danger-main/30 text-xs">
                {totpError}
              </div>
            )}

            <Input
              label="6-Digit Verification Code"
              value={totpVerificationCode}
              onChange={(e) => setTotpVerificationCode(e.target.value)}
              placeholder="e.g. 123456"
              maxLength={6}
              className="font-mono text-center tracking-widest text-lg"
              detail="Enter the current code displayed in your authenticator application."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-500">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsTotpDrawerOpen(false)}
              className="text-neutral-800 hover:text-neutral-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-seidor-main text-white font-medium hover:bg-seidor-hard"
            >
              Verify and enable
            </Button>
          </div>
        </form>
      </Drawer>

      {/* ========================================================= */}
      {/* DRAWER: GENERATE NEW PERSONAL ACCESS TOKEN (PAT)         */}
      {/* ========================================================= */}
      <Drawer
        isOpen={isCreateTokenDrawerOpen}
        onClose={() => setIsCreateTokenDrawerOpen(false)}
        title="Generate Personal Access Token"
        size="lg"
      >
        <form onSubmit={handleCreateToken} className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins">
          <div className="flex-1 overflow-y-auto space-y-7 pt-2 pr-1.5 scrollbar-thin">
            {tokenCreationError && (
              <div className="p-3 rounded-lg bg-danger-light text-danger-hard border border-danger-main/30 text-xs">
                {tokenCreationError}
              </div>
            )}

            {/* Token Name & Expiration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Input
                  label="Token Name / Purpose *"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="e.g. CI/CD Extraction Runner or Local MCP Agent"
                  detail="Give this token a recognizable name to remember where it is being used."
                  className="font-poppins"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-900">
                  Expiration *
                </label>
                <Select
                  options={EXPIRATION_OPTIONS}
                  value={newTokenExpiration}
                  onValueChange={(val) => setNewTokenExpiration(String(val))}
                  className="w-full"
                />
                <p className="text-xs text-neutral-800 mt-1">
                  Tokens expire automatically after the selected window.
                </p>
              </div>
            </div>

            {/* Workspace Scope Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-neutral-900">Workspace Scope</h5>
                  <p className="text-xs text-neutral-800">
                    Restricts token access strictly to the selected enterprise environments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllWorkspaces}
                    className="text-xs text-seidor-main font-medium hover:underline p-0 h-auto"
                  >
                    Select all
                  </Button>
                  <span className="text-neutral-400">•</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllWorkspaces}
                    className="text-xs text-neutral-800 font-medium hover:underline p-0 h-auto"
                  >
                    Clear all
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {WORKSPACE_SCOPE_OPTIONS.map((ws) => {
                  const isChecked = selectedWorkspaceNames.includes(ws.name);
                  return (
                    <div
                      key={ws.id}
                      onClick={() => handleToggleWorkspace(ws.name)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                        isChecked
                          ? "bg-neutral-500/80 border-seidor-main"
                          : "bg-neutral-500 border-neutral-400 hover:border-neutral-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-neutral-400 text-seidor-main focus:ring-seidor-main cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-neutral-900">{ws.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Capability Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-neutral-900">Token Capabilities & Permissions</h5>
                  <p className="text-xs text-neutral-800">
                    Select granular actions and resources permitted for this token.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllCapabilities}
                    className="text-xs text-seidor-main font-medium hover:underline p-0 h-auto"
                  >
                    Select all
                  </Button>
                  <span className="text-neutral-400">•</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllCapabilities}
                    className="text-xs text-neutral-800 font-medium hover:underline p-0 h-auto"
                  >
                    Clear all
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {CAPABILITY_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl bg-neutral-500/40 border border-neutral-400 space-y-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        {cat.name}
                      </span>
                      <p className="text-[11px] text-neutral-800">{cat.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {cat.items.map((item) => {
                        const isSelected = selectedCapabilities.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleCapability(item.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                              isSelected
                                ? "bg-container border-seidor-main/80"
                                : "bg-container/50 border-neutral-400/80 hover:border-neutral-500"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-0.5 rounded border-neutral-400 text-seidor-main focus:ring-seidor-main cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-medium text-neutral-900 block leading-tight">
                                {item.label}
                              </span>
                              <span className="text-[11px] text-neutral-800 block leading-tight">
                                {item.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-500">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateTokenDrawerOpen(false)}
              className="text-neutral-800 hover:text-neutral-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-seidor-main text-white font-medium hover:bg-seidor-hard"
            >
              Generate token
            </Button>
          </div>
        </form>
      </Drawer>

      {/* ========================================================= */}
      {/* MODAL: ONE-TIME TOKEN REVEAL                             */}
      {/* ========================================================= */}
      {createdTokenData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-container border border-neutral-400 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-light text-success-hard flex items-center justify-center shrink-0">
                <CaralIcon name="check" size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-900">
                  Personal Access Token Generated
                </h4>
                <p className="text-xs text-neutral-800">
                  Copy this token now. For your security, it will never be displayed again.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 bg-neutral-500 p-3.5 rounded-xl border border-neutral-400">
              <span className="text-[11px] font-semibold text-neutral-800 block">{createdTokenData.name}</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={createdTokenData.token}
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-container border border-neutral-400 font-mono text-neutral-900 select-all"
                />
                <Button
                  variant={isCopiedNewToken ? "success" : "default"}
                  size="sm"
                  iconName={isCopiedNewToken ? "check" : "copy"}
                  onClick={handleCopyNewToken}
                  className="shrink-0 font-medium"
                >
                  {isCopiedNewToken ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="default"
                size="md"
                className="bg-seidor-main text-white"
                onClick={() => setCreatedTokenData(null)}
              >
                I have stored this token securely
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRM REVOKE TOKEN                               */}
      {/* ========================================================= */}
      {tokenToRevoke && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-container border border-neutral-400 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-danger-light text-danger-hard flex items-center justify-center shrink-0">
                <CaralIcon name="trash" size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-900">
                  Revoke Personal Access Token?
                </h4>
                <p className="text-xs text-neutral-800 leading-relaxed">
                  Are you sure you want to revoke <strong>{tokenToRevoke.name}</strong>? Any automated workflows, CLI sessions, or pipelines using this token will fail immediately.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setTokenToRevoke(null)}
                className="text-neutral-800"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevokeToken}
                className="font-medium"
              >
                Revoke token
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
