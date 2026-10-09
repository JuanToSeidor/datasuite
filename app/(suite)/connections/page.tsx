"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button, Chip, Tabs, Drawer, Toggle, Alert } from "caralstable";
import { CaralIcon, Brand, CaralBrandName, Icons } from "@/components/icons";
import { Input, DataTable, DataTableColumn } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

const VALID_BRANDS = new Set([
  "AWS", "AzureSql", "GoogleStorage", "SAP", "Saleforce", "Snowflake", "Redshift", "Cloudera", "Teradata", "Google", "Databricks", "AmazonRedshift", "GoogleBigquery", "Teams", "Deepseek", "Gemini", "OpenAI", "SAPHanaC", "S3", "Harbinger", "Doxa", "Daiana", "Crestone", "CloudCosting", "Feelings", "IBMDb2", "MSSQL", "mySQL", "PostgreSQL", "OneDrive", "Sharepoint", "PDF", "DOC", "DOCX", "CSV", "XLSX", "Json", "HTML", "Fabric", "Sybase", "Ollama", "Windows", "DataEngineering", "OneLake", "DataActivator", "DataFactory", "Synapse", "PowerBI", "Database", "IQ", "Dynamics", "Oracle", "Azure", "CloudStorage"
]);

function SourceLogo({ brandName, size, muted }: { brandName: string; size: number; muted?: boolean }) {
  const isBrand = VALID_BRANDS.has(brandName);

  if (isBrand && !muted) {
    return <Brand name={brandName as CaralBrandName} size={size} />;
  }

  const validIcons = new Set([
    "AWS", "Azure", "AzureSql", "CloudStorage", "Cloudera", "Database", "Databricks",
    "Deepseek", "Doxa", "Fabric", "Gemini", "Google", "GoogleBigquery", "GoogleStorage",
    "IBMDb2", "IQ", "MSSQL", "OneDrive", "OpenAI", "Oracle", "PowerBI", "PostgreSQL",
    "Redshift", "S3", "SAP", "SAPHanaC", "Saleforce", "SapOdata", "Sharepoint", "Snowflake",
    "Sybase", "Teams", "Teradata", "Windows", "OData", "database"
  ]);

  const iconName = validIcons.has(brandName) ? brandName : "database";
  return <CaralIcon name={iconName as Icons} size={size} color={muted ? "#94A3B8" : undefined} />;
}

export interface ConnectionItem {
  id: string;
  name: string;
  status: "Enabled" | "Disabled";
  locationType: "Source" | "Destination";
  type: string;
  brandName: string;
  createdDay: string;
  createdBy: string;
  avatarText: string;
  isProduction?: boolean;
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  sslMode?: boolean;
}

import connectionsData from "@/data/connections.json";

const mockConnections: ConnectionItem[] = connectionsData as ConnectionItem[];

export default function ManageConnectionsPage() {
  const { dict } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [connections, setConnections] = useState<ConnectionItem[]>(mockConnections);
  const [isListView, setIsListView] = useState(true);

  // Drawer states
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Form states for selected connection
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState<"Enabled" | "Disabled">("Enabled");
  const [formIsProduction, setFormIsProduction] = useState(false);
  const [formHost, setFormHost] = useState("");
  const [formPort, setFormPort] = useState("");
  const [formDatabase, setFormDatabase] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formSslMode, setFormSslMode] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "danger" | "info" | "warning";
    title: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    if (selectedConnection) {
      setFormName(selectedConnection.name);
      setFormStatus(selectedConnection.status);
      setFormIsProduction(!!selectedConnection.isProduction);
      setFormHost(selectedConnection.host || `${selectedConnection.brandName.toLowerCase()}-srv.crestone.corp`);
      setFormPort(selectedConnection.port || (selectedConnection.brandName === "AWS" ? "3306" : "5432"));
      setFormDatabase(selectedConnection.database || "db_crestone_analytics");
      setFormUsername(selectedConnection.username || "crestone_usr");
      setFormPassword(selectedConnection.password || "p@ssw0rd_crestone_123");
      setFormSslMode(selectedConnection.sslMode ?? true);
      setShowPassword(false);
      setIsTesting(false);
    }
  }, [selectedConnection]);

  useEffect(() => {
    if (toast && toast.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isDirty = useMemo(() => {
    if (!selectedConnection) return false;

    const defaultHost = selectedConnection.host || `${selectedConnection.brandName.toLowerCase()}-srv.crestone.corp`;
    const defaultPort = selectedConnection.port || (selectedConnection.brandName === "AWS" ? "3306" : "5432");
    const defaultDatabase = selectedConnection.database || "db_crestone_analytics";
    const defaultUsername = selectedConnection.username || "crestone_usr";
    const defaultPassword = selectedConnection.password || "p@ssw0rd_crestone_123";
    const defaultSslMode = selectedConnection.sslMode ?? true;

    return (
      formName !== selectedConnection.name ||
      formStatus !== selectedConnection.status ||
      formIsProduction !== !!selectedConnection.isProduction ||
      formHost !== defaultHost ||
      formPort !== defaultPort ||
      formDatabase !== defaultDatabase ||
      formUsername !== defaultUsername ||
      formPassword !== defaultPassword ||
      formSslMode !== defaultSslMode
    );
  }, [
    selectedConnection,
    formName,
    formStatus,
    formIsProduction,
    formHost,
    formPort,
    formDatabase,
    formUsername,
    formPassword,
    formSslMode
  ]);

  const handleSaveChanges = () => {
    if (!selectedConnection) return;

    setConnections((prev) =>
      prev.map((c) =>
        c.id === selectedConnection.id
          ? {
            ...c,
            name: formName,
            status: formStatus,
            isProduction: formIsProduction,
            host: formHost,
            port: formPort,
            database: formDatabase,
            username: formUsername,
            password: formPassword,
            sslMode: formSslMode,
          }
          : c
      )
    );

    setToast({
      show: true,
      variant: "success",
      title: "Connection Updated",
      description: `Connection "${formName}" has been successfully updated.`,
    });

    setIsEditDrawerOpen(false);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setToast({
        show: true,
        variant: "success",
        title: "Connection Successful",
        description: `Successfully reached host "${formHost}" on port "${formPort}".`,
      });
    }, 1200);
  };

  const handleDeleteConnection = () => {
    if (!selectedConnection) return;

    setConnections((prev) => prev.filter((c) => c.id !== selectedConnection.id));

    setToast({
      show: true,
      variant: "danger",
      title: "Connection Deleted",
      description: `Connection "${selectedConnection.name}" has been permanently deleted.`,
    });

    setIsEditDrawerOpen(false);
  };

  const locationTypeOptions = useMemo(() => [
    { label: dict.common.source, value: "Source" },
    { label: dict.common.destination, value: "Destination" },
  ], [dict]);

  const typeOptions = useMemo(() => {
    const list = Array.from(new Set(connections.map((c) => c.type).filter(Boolean)));
    return list.map((t) => ({ label: t, value: t }));
  }, [connections]);

  const creatorOptions = useMemo(() => {
    const list = Array.from(new Set(connections.map((c) => c.createdBy).filter(Boolean)));
    return list.map((cr) => ({ label: cr, value: cr }));
  }, [connections]);

  // Columns definition for agnostic DataTable<ConnectionItem>
  const connectionColumns = useMemo<DataTableColumn<ConnectionItem>[]>(() => {
    return [
      // 1. Name & Brand Logo + Production sync badge
      {
        id: "name",
        accessorKey: "name",
        header: dict.connections.colName,
        filterLabel: dict.connections.colName,
        filterType: "text",
        width: 280,
        minWidth: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-container border border-neutral-800 p-1.5 rounded-[8px] flex items-center justify-center size-8 shrink-0">
              <SourceLogo brandName={row.brandName} size={16} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-neutral-900 font-semibold text-sm truncate" title={row.name}>
                {row.name}
              </span>
              {row.isProduction && (
                <div className="relative group flex items-center shrink-0">
                  <span className="text-info-main cursor-help hover:text-info-hard transition-colors flex items-center">
                    <CaralIcon name="badgeSync" size={14} />
                  </span>

                  {/* Tooltip Popover */}
                  <div className="hidden group-hover:block absolute top-6 left-0 z-50 w-72 p-4 bg-container border border-neutral-500 rounded-[12px] shadow-xl text-left transition-all duration-200 origin-top-left">
                    <div className="absolute -top-1.5 left-3 size-3 bg-container border-t border-l border-neutral-500 rotate-45" />
                    <div className="relative z-10 space-y-1.5 font-normal text-left">
                      <div className="flex items-center gap-2 text-info-hard">
                        <CaralIcon name="badgeSync" size={14} />
                        <span className="text-xs font-bold font-poppins">{dict.connections.productionEnv}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-800">
                        {dict.connections.productionEnvDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
        footer: ({ filteredData }) => (
          <span className="font-bold text-neutral-900">
            {dict.common.total}: {filteredData.length} {dict.connections.totalConnections}
          </span>
        ),
      },

      // 2. Tipo (Source / Destination)
      {
        id: "locationType",
        accessorKey: "locationType",
        header: dict.connections.colTipo,
        filterLabel: dict.connections.colTipo,
        filterType: "select",
        filterSelectOptions: locationTypeOptions,
        width: 170,
        minWidth: 130,
        cell: ({ value }) => (
          <Chip
            label={value === "Source" ? dict.common.source : dict.common.destination}
            variant={value === "Source" ? "info" : "indido"}
            hasBorder
          />
        ),
      },

      // 3. Type & Connector Brand
      {
        id: "type",
        accessorKey: "type",
        header: dict.connections.colConnector,
        filterLabel: dict.connections.colConnector,
        filterType: "select",
        filterSelectOptions: typeOptions,
        width: 190,
        minWidth: 140,
        cell: ({ row, value }) => (
          <div className="flex items-center gap-2">
            <SourceLogo brandName={row.brandName} size={15} />
            <span className="text-neutral-900 font-medium text-xs truncate">
              {String(value)}
            </span>
          </div>
        ),
      },

      // 4. Created Day
      {
        id: "createdDay",
        accessorKey: "createdDay",
        header: dict.connections.colCreatedDay,
        filterLabel: dict.connections.colCreatedDay,
        filterType: "text",
        width: 160,
        minWidth: 120,
        cell: ({ value }) => (
          <span className="text-neutral-800 text-xs font-mono">
            {String(value)}
          </span>
        ),
      },

      // 5. Created By
      {
        id: "createdBy",
        accessorKey: "createdBy",
        header: dict.connections.colCreatedBy,
        filterLabel: dict.connections.colCreatedBy,
        filterType: "select",
        filterSelectOptions: creatorOptions,
        width: 180,
        minWidth: 140,
        cell: ({ row, value }) => (
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-warning-main text-white flex items-center justify-center text-[10px] font-bold shadow-xs shrink-0 select-none">
              {row.avatarText || "SA"}
            </div>
            <span className="text-neutral-900 font-medium text-xs truncate" title={String(value)}>
              {String(value)}
            </span>
          </div>
        ),
      },

      // 6. Actions (Edit icon button)
      {
        id: "actions",
        header: dict.connections.colActions,
        align: "center",
        width: 100,
        minWidth: 80,
        filterable: false,
        hideInExport: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              isIconButton
              iconName="edit"
              className="text-neutral-800 hover:text-neutral-900 hover:bg-neutral-500/30 cursor-pointer p-1.5 rounded-lg transition-colors"
              title={dict.connections.editConnection}
              onClick={() => {
                setSelectedConnection(row);
                setIsEditDrawerOpen(true);
              }}
            />
          </div>
        ),
      },
    ];
  }, [locationTypeOptions, typeOptions, creatorOptions, dict]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-fit flex flex-col font-poppins select-none transition-colors duration-300 text-foreground">
      {toast && toast.show && (
        <Alert
          type="toast"
          position="top-right"
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(null)}
          autoClose={3000}
        />
      )}

      {/* View Switcher: Table View (Agnostic DataTable) or Cards / Grid View */}
      {isListView ? (
        <DataTable<ConnectionItem>
          title={dict.connections.title}
          description={dict.connections.description}
          iconName="link"
          data={connections}
          columns={connectionColumns}
          keyExtractor={(row) => row.id}
          canSearch={true}
          searchPlaceholder={dict.connections.searchPlaceholder}
          canFilterColumns={true}
          canFilterErrors={false}
          canExport={false}
          canExpand={true}
          toolbarRight={({ isMaximized }) => (
            <div className="flex items-center gap-2">
              {!isMaximized && (
                <Button
                  iconName="grid"
                  isIconButton
                  variant="ghost"
                  onClick={() => setIsListView(false)}
                  title={dict.connections.switchToCards}
                  className="cursor-pointer"
                />
              )}
              <Link href="/connections/new">
                <Button
                  variant="info"
                  iconName="plus"
                  title={dict.connections.addConnection}
                  className="cursor-pointer"
                >
                  {dict.connections.addConnection}
                </Button>
              </Link>
            </div>
          )}
        />
      ) : (
        /* Cards / Grid View with toolbar */
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center p-4 bg-container rounded-2xl border border-neutral-500">
            <div className="flex items-center gap-2">
              <CaralIcon name="link" size={18} />
              <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                {dict.connections.titleCards}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                iconName="list"
                isIconButton
                variant="info"
                onClick={() => setIsListView(true)}
                title={dict.connections.switchToTable}
                className="cursor-pointer"
              />
              <Link href="/connections/new">
                <Button
                  variant="info"
                  iconName="plus"
                  title={dict.connections.addConnection}
                  className="cursor-pointer"
                >
                  {dict.connections.addConnection}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="border border-neutral-500 rounded-2xl p-5 shadow-xs space-y-4 bg-container transition-colors duration-300 text-left flex flex-col justify-between hover:border-neutral-800"
              >
                <div className="space-y-4">
                  {/* Top: logo, name and status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {conn.isProduction && (
                        <div className="bg-info-light border border-info-main p-2 rounded-xl flex items-center justify-center size-10 shrink-0 text-info-main">
                          <CaralIcon name="badgeSync" size={18} />
                        </div>
                      )}

                      <div className="bg-container border border-neutral-500 p-2 rounded-xl flex items-center justify-center size-10 shrink-0">
                        <SourceLogo brandName={conn.brandName} size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-neutral-900 leading-tight truncate" title={conn.name}>
                          {conn.name}
                        </h4>
                        <p className="text-[11px] text-neutral-800 truncate">
                          {conn.locationType} | {conn.type}
                        </p>
                      </div>
                    </div>
                    <Chip
                      label={conn.status}
                      variant={conn.status === "Enabled" ? "success" : "danger"}
                      hasBorder
                    />
                  </div>

                  {/* Middle: author and avatar */}
                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-500">
                    <div className="bg-warning-main size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
                      {conn.avatarText}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        By {conn.createdBy}
                      </p>
                      <p className="text-[10px] text-neutral-800 font-mono">
                        On {conn.createdDay}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom: Edit connection button */}
                <div className="flex justify-end pt-3 border-t border-neutral-500">
                  <Button
                    variant="info"
                    className="text-xs font-semibold px-4 py-2 cursor-pointer"
                    onClick={() => {
                      setSelectedConnection(conn);
                      setIsEditDrawerOpen(true);
                    }}
                  >
                    {dict.connections.editConnection}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Detail/Edit Drawer */}
      {isEditDrawerOpen && (
        <Drawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          title={
            selectedConnection
              ? selectedConnection.locationType === "Source"
                ? dict.connections.editSourceConnection
                : dict.connections.editDestinationConnection
              : dict.connections.editConnection
          }
          size="md"
        >
          <div className="flex flex-col h-full justify-between pb-6 space-y-6 text-left">
            <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1.5 scrollbar-thin">
              {/* Header info - Brand name and location type */}
              {selectedConnection && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-500/10 border border-neutral-500 animate-fade-in">
                  <div className="bg-container border border-neutral-800 p-2.5 rounded-xl flex items-center justify-center size-12 shrink-0">
                    <SourceLogo brandName={selectedConnection.brandName} size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 leading-tight">
                      {selectedConnection.type}
                    </h3>
                    <p className="text-xs text-neutral-800 font-sans">
                      {selectedConnection.createdBy} • {selectedConnection.createdDay}
                    </p>
                  </div>
                </div>
              )}

              {/* Section 1: General Settings */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-500 pb-2">
                  {dict.connections.generalSettings}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label={dict.connections.connectionName}
                    placeholder="e.g. Production Data Source"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={isTesting}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {/* Status toggle */}
                  <div className="flex items-center justify-between p-3.5 border border-neutral-500 rounded-xl bg-container">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-neutral-900">{dict.connections.activeStatus}</span>
                      <span className="text-[10px] text-neutral-800">{dict.connections.activeStatusDesc}</span>
                    </div>
                    <Toggle
                      checked={formStatus === "Enabled"}
                      onChange={(checked) => setFormStatus(checked ? "Enabled" : "Disabled")}
                      disabled={isTesting}
                    />
                  </div>

                  {/* Production environment toggle */}
                  <div className="flex items-center justify-between p-3.5 border border-neutral-500 rounded-xl bg-container">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                        {dict.connections.productionEnv}
                        {formIsProduction && (
                          <span className="text-info-main">
                            <CaralIcon name="badgeSync" size={12} />
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-neutral-800">{dict.connections.productionEnvDesc}</span>
                    </div>
                    <Toggle
                      checked={formIsProduction}
                      onChange={setFormIsProduction}
                      disabled={isTesting}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Connection Parameters */}
              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-500 pb-2">
                  {dict.connections.paramsCredentials}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label={dict.connections.host}
                      placeholder="e.g. db.example.com"
                      value={formHost}
                      onChange={(e) => setFormHost(e.target.value)}
                      disabled={isTesting}
                    />
                  </div>
                  <div>
                    <Input
                      label={dict.connections.port}
                      placeholder="e.g. 5432"
                      value={formPort}
                      onChange={(e) => setFormPort(e.target.value)}
                      disabled={isTesting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={dict.connections.database}
                    placeholder="e.g. sales_db"
                    value={formDatabase}
                    onChange={(e) => setFormDatabase(e.target.value)}
                    disabled={isTesting}
                  />
                  <Input
                    label={dict.connections.username}
                    placeholder="e.g. db_user"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    disabled={isTesting}
                  />
                </div>

                {/* Password field with asterisks and eye show/hide toggle */}
                <div className="w-full space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-900">
                    {dict.connections.password}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="block w-full rounded-xl bg-container border border-neutral-500 focus:border-info-main focus:ring-1 focus:ring-info-main/30 px-3 py-2 pr-10 text-sm text-neutral-900 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      disabled={isTesting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      isIconButton
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isTesting}
                      className="absolute inset-y-0 right-1 flex items-center text-neutral-800 hover:text-neutral-900 transition-colors cursor-pointer bg-transparent border-0 shadow-none hover:bg-transparent h-full px-2"
                    >
                      <CaralIcon name={showPassword ? "eye" : "eyeSlash"} size={16} />
                    </Button>
                  </div>

                  {/* Test Connection Button */}
                  <div className="pt-2">
                    <Button
                      variant="light"
                      onClick={handleTestConnection}
                      disabled={!isDirty || isTesting}
                      className={`w-full text-xs font-semibold h-[40px] justify-center items-center gap-2 border border-neutral-500 text-neutral-900 transition-all cursor-pointer ${!isDirty || isTesting
                        ? "opacity-50 cursor-not-allowed bg-neutral-500/20"
                        : "hover:bg-neutral-500/10"
                        }`}
                    >
                      {isTesting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                          {dict.connections.testingConnection}
                        </>
                      ) : (
                        <>
                          <CaralIcon name="sync" size={14} />
                          {dict.connections.testConnection}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* SSL Mode toggle */}
                <div className="flex items-center justify-between p-3.5 border border-neutral-500 rounded-xl bg-container">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-900">{dict.connections.sslConnection}</span>
                    <span className="text-[10px] text-neutral-800">{dict.connections.sslDesc}</span>
                  </div>
                  <Toggle
                    checked={formSslMode}
                    onChange={setFormSslMode}
                    disabled={isTesting}
                  />
                </div>
              </div>

              {/* Section 3: Danger Zone */}
              <div className="space-y-4 pt-4 border-t border-neutral-500">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-900">
                    {dict.connections.dangerZone}
                  </h4>
                  <p className="text-xs text-neutral-800">
                    {dict.connections.dangerZoneDesc}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border border-danger-main/30 rounded-xl bg-danger-light/10">
                  <div className="flex flex-col text-left space-y-1">
                    <span className="text-xs font-semibold text-neutral-900">
                      {dict.connections.deleteConnection}
                    </span>
                    <span className="text-[10px] text-neutral-800">
                      {dict.connections.deleteWarning}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleDeleteConnection}
                    disabled={isTesting}
                    className="text-xs font-semibold px-4 py-2 bg-danger-main hover:bg-danger-hard text-white rounded-lg h-auto flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CaralIcon name="trash" size={14} />
                    {dict.connections.deleteConnection}
                  </Button>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions Bar */}
            <div className="flex gap-3 pt-4 border-t border-neutral-500">
              <Button
                variant="ghost"
                onClick={() => setIsEditDrawerOpen(false)}
                disabled={isTesting}
                className="flex-1 text-xs font-semibold h-[40px] justify-center cursor-pointer"
              >
                {dict.common.cancel}
              </Button>
              <Button
                variant="info"
                onClick={handleSaveChanges}
                disabled={isTesting}
                className="flex-1 text-xs font-semibold h-[40px] justify-center cursor-pointer"
              >
                {dict.common.saveChanges}
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
