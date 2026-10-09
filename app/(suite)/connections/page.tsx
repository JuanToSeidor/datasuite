"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button, Chip, Tabs, Drawer, Toggle, Alert, Table } from "caralstable";
import { Brand, CaralIcon, CaralBrandName, Icons } from "iconcaral2";
import { TextInput } from "caralstable";

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

interface ConnectionItem {
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

const mockConnections: ConnectionItem[] = [
  {
    id: "ezequielsap5",
    name: "EZequielSap5",
    status: "Enabled",
    locationType: "Destination",
    type: "IBM Cloud",
    brandName: "CloudStorage",
    createdDay: "January 12, 2026",
    createdBy: "Chris Lee",
    avatarText: "CL",
    isProduction: true
  },
  {
    id: "ezequielsap6",
    name: "EZequielSap6",
    status: "Enabled",
    locationType: "Destination",
    type: "Azure",
    brandName: "Azure",
    createdDay: "February 14, 2026",
    createdBy: "Anna Wu",
    avatarText: "AW"
  },
  {
    id: "ezequielsap7",
    name: "EZequielSap7",
    status: "Disabled",
    locationType: "Destination",
    type: "Google Cloud",
    brandName: "Google",
    createdDay: "March 12, 2026",
    createdBy: "Mark Taylor",
    avatarText: "MT"
  },
  {
    id: "ezequielsap8",
    name: "EZequielSap8",
    status: "Enabled",
    locationType: "Destination",
    type: "AWS",
    brandName: "AWS",
    createdDay: "April 1, 2026",
    createdBy: "Sarah Johnson",
    avatarText: "SJ",
    isProduction: true
  },
  {
    id: "ezequielsap9",
    name: "EZequielSap9",
    status: "Enabled",
    locationType: "Destination",
    type: "Oracle Cloud",
    brandName: "Oracle",
    createdDay: "May 15, 2026",
    createdBy: "David Brown",
    avatarText: "DB"
  },
  {
    id: "ezequielsap10",
    name: "EZequielSap10",
    status: "Disabled",
    locationType: "Destination",
    type: "DigitalOcean",
    brandName: "Database",
    createdDay: "June 22, 2026",
    createdBy: "Laura Smith",
    avatarText: "LS"
  },
  {
    id: "ezequielsap11",
    name: "EZequielSap11",
    status: "Enabled",
    locationType: "Destination",
    type: "Heroku",
    brandName: "Database",
    createdDay: "July 30, 2026",
    createdBy: "Kevin White",
    avatarText: "KW"
  },
  {
    id: "ezequielsap12",
    name: "EZequielSap12",
    status: "Enabled",
    locationType: "Destination",
    type: "Alibaba Cloud",
    brandName: "CloudStorage",
    createdDay: "August 18, 2026",
    createdBy: "Mia Chen",
    avatarText: "MC"
  },
  {
    id: "ezequielsap13",
    name: "EZequielSap13",
    status: "Disabled",
    locationType: "Destination",
    type: "Linode",
    brandName: "Database",
    createdDay: "September 25, 2026",
    createdBy: "Tom Harris",
    avatarText: "TH"
  },
  {
    id: "ezequielsap14",
    name: "EZequielSap14",
    status: "Enabled",
    locationType: "Destination",
    type: "Vultr",
    brandName: "AWS",
    createdDay: "October 30, 2026",
    createdBy: "Emma Wilson",
    avatarText: "EW"
  },
  {
    id: "ezequielsap2",
    name: "EZequielSAP2",
    status: "Enabled",
    locationType: "Source",
    type: "SAP",
    brandName: "SAP",
    createdDay: "2024-08-15 | 09:30",
    createdBy: "System Admin",
    avatarText: "SA",
    isProduction: true
  },
  {
    id: "conexionestrella",
    name: "ConexiónEstrella",
    status: "Enabled",
    locationType: "Destination",
    type: "AWS",
    brandName: "AWS",
    createdDay: "2024-09-01 | 14:00",
    createdBy: "System Admin",
    avatarText: "SA",
    isProduction: true
  },
  {
    id: "redrapida",
    name: "RedRápida",
    status: "Enabled",
    locationType: "Destination",
    type: "Snowflake",
    brandName: "Snowflake",
    createdDay: "2024-10-10 | 11:15",
    createdBy: "System Admin",
    avatarText: "SA"
  },
  {
    id: "alianzadigital",
    name: "AlianzaDigital",
    status: "Enabled",
    locationType: "Source",
    type: "SAP",
    brandName: "SAP",
    createdDay: "2024-11-22 | 16:45",
    createdBy: "System Admin",
    avatarText: "SA"
  },
  {
    id: "vinculoglobal",
    name: "VinculoGlobal",
    status: "Disabled",
    locationType: "Destination",
    type: "AWS",
    brandName: "AWS",
    createdDay: "2024-12-25 | 08:00",
    createdBy: "System Admin",
    avatarText: "SA"
  },
  {
    id: "puenteinnovador",
    name: "PuenteInnovador",
    status: "Enabled",
    locationType: "Source",
    type: "SAP",
    brandName: "SAP",
    createdDay: "2025-01-01 | 00:00",
    createdBy: "System Admin",
    avatarText: "SA",
    isProduction: true
  },
  {
    id: "nexoeficaz",
    name: "NexoEficaz",
    status: "Enabled",
    locationType: "Destination",
    type: "Fabric",
    brandName: "Fabric",
    createdDay: "2025-02-14 | 18:30",
    createdBy: "System Admin",
    avatarText: "SA"
  }
];

export default function ManageConnectionsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [connections, setConnections] = useState<ConnectionItem[]>(mockConnections);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isListView, setIsListView] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

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

  const tabs = ["All", "Source", "Destination"];

  const filteredConnections = useMemo(() => {
    return connections.filter((conn) => {
      const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === "All" || conn.locationType === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [connections, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredConnections.length / rowsPerPage) || 1;

  const paginatedConnections = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredConnections.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredConnections, currentPage, rowsPerPage]);

  const renderPagination = (roundedClass = "rounded-b-[20px]") => {
    return (
      <div className={`flex items-center justify-between gap-6 text-sm p-4 border-t border-neutral-400 sticky bottom-0 bg-container ${roundedClass} z-10 select-none`}>
        {/* Rows per page dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-800 font-medium">Rows per page</span>
          <div className="relative">
            <Button
              variant="ghost"
              isDropdown
              isOpen={isDropdownOpen}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="border border-neutral-400"
            >
              {rowsPerPage}
            </Button>
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute bottom-full mb-1.5 left-0 z-50 w-20 bg-container border border-neutral-400 rounded-[10px] shadow-lg py-1 flex flex-col animate-fade-in">
                  {[5, 10, 25, 50].map((val) => (
                    <Button
                      key={val}
                      variant="ghost"
                      onClick={() => {
                        setRowsPerPage(val);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full justify-start text-left px-3 py-1.5 text-xs font-semibold hover:bg-neutral-500/10 transition-colors cursor-pointer ${rowsPerPage === val ? "text-seidor-main font-bold" : "text-neutral-900"
                        }`}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Previous / Next Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3.5 py-1.5 h-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-neutral-900 hover:bg-neutral-500/10 rounded-lg transition-colors`}
          >
            <CaralIcon name="chevronLeft" size={12} />
            Previous
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3.5 py-1.5 h-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-neutral-900 hover:bg-neutral-500/10 rounded-lg transition-colors`}
          >
            Next
            <CaralIcon name="chevronRigth" size={12} />
          </Button>
        </div>
      </div>
    );
  };

  const tableColumns = [
    {
      key: "name",
      header: "Name",
      width: "25%",
      render: (conn: ConnectionItem) => (
        <div className="flex items-center gap-3">
          <div className="bg-container border border-neutral-800 p-1.5 rounded-[6px] flex items-center justify-center size-8 shrink-0">
            <SourceLogo brandName={conn.brandName} size={16} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-900 font-semibold text-sm">{conn.name}</span>
            {conn.isProduction && (
              <div className="relative group flex items-center">
                <span className="text-info-main cursor-help hover:text-info-hard transition-colors flex items-center">
                  <CaralIcon name="badgeSync" size={14} />
                </span>

                {/* Popover */}
                <div className="absolute top-6 left-0 z-50 w-72 p-4 bg-container border border-neutral-400 rounded-[12px] shadow-xl text-left scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 origin-top-left">
                  <div className="absolute -top-1.5 left-3 size-3 bg-container border-t border-l border-neutral-400 rotate-45" />
                  <div className="relative z-10 space-y-1.5 font-normal text-left">
                    <div className="flex items-center gap-2 text-info-hard">
                      <CaralIcon name="badgeSync" size={14} />
                      <span className="text-xs font-bold font-poppins">Productive environment</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-neutral-800">
                      Only origins marked with this flag can be used in automated jobs. Connections without this flag are intended for testing, validation, or QA environments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      width: "15%",
      render: (conn: ConnectionItem) => (
        <Chip
          label={conn.status}
          variant={conn.status === "Enabled" ? "success" : "danger"}
          hasBorder
        />
      )
    },
    {
      key: "locationType",
      header: "Location Type",
      width: "20%",
      render: (conn: ConnectionItem) => (
        <span className="text-neutral-800">{conn.locationType}</span>
      )
    },
    {
      key: "type",
      header: "Type",
      width: "20%",
      render: (conn: ConnectionItem) => (
        <div className="flex items-center gap-2">
          <SourceLogo brandName={conn.brandName} size={14} />
          <span className="text-neutral-800">{conn.type}</span>
        </div>
      )
    },
    {
      key: "createdDay",
      header: "Created day",
      width: "12%",
      render: (conn: ConnectionItem) => (
        <span className="text-neutral-800">{conn.createdDay}</span>
      )
    },
    {
      key: "actions",
      header: "Action",
      width: "8%",
      align: "right" as const,
      render: (conn: ConnectionItem) => (
        <Button
          variant="info"
          className="text-xs px-3.5 py-1.5 h-auto cursor-pointer"
          onClick={() => {
            setSelectedConnection(conn);
            setIsEditDrawerOpen(true);
          }}
        >
          Edit
        </Button>
      )
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch font-poppins select-none transition-colors duration-300 text-foreground w-full h-full">
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

      {/* Main Content Container */}
      <div className="flex-1 p-[18px] flex flex-col justify-start gap-6">
        {/* Top Header Card */}
        <div >
          <div className="flex items-end justify-between transition-colors duration-300">
            <div className="space-y-1 text-left">
              <h2 className="text-[30px] font-semibold tracking-tight leading-[35px] text-neutral-900 transition-colors duration-300 font-poppins">
                Manage Connections
              </h2>
              <p className="text-[16px] leading-6 text-neutral-800 transition-colors duration-300">
                View and manage your sources and destinations
              </p>
            </div>
          </div>


        </div>
        {/* Controls row */}
        <div className="flex justify-between items-center p-4 bg-container rounded-xl border border-neutral-400">
          {/* Horizontal Filter Tabs */}
          <Tabs
            activeIndex={tabs.indexOf(activeTab)}
            onChange={(index) => setActiveTab(tabs[index])}
            tabs={tabs.map((tab) => ({ label: tab }))}
          />

          {/* Right Side actions */}
          <div className="flex items-center gap-3 justify-end shrink-0">
            {/* Search Bar */}
            <div className="border border-neutral-800 rounded-[12px] min-h-[40px] flex items-center gap-3 px-4 py-2 w-64 shadow-[0_2px_5px_rgba(0,0,0,0.04)] bg-container transition-colors duration-300">
              <CaralIcon name="search" size={16} />
              <input
                type="text"
                placeholder="Search"
                className="w-full text-xs font-normal bg-transparent outline-none text-neutral-900 placeholder-neutral-800 transition-colors duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Switcher Button */}
            <Button
              iconName={isListView ? "grid" : "list"}
              isIconButton
              variant="info"
              hasBorder
              onClick={() => setIsListView((prev) => !prev)}
              title={isListView ? "Grid View" : "List View"}
              className="cursor-pointer"
            />

            {/* Add Connection "+" Button */}
            <Link href="/connections/new">
              <Button
                iconName="plus"
                isIconButton
                variant="success"
                title="Add Connection"
                className="cursor-pointer"
              />
            </Link>
          </div>
        </div>

        {/* List/Cards view split rendering */}
        {isListView ? (
          /* LIST VIEW TABLE */
          <div className="w-full bg-container border border-neutral-400 overflow-hidden rounded-[20px] shadow-sm transition-all duration-300 flex flex-col justify-between relative">
            <div className="w-full overflow-x-auto rounded-t-[20px]">
              {filteredConnections.length === 0 ? (
                <div className="text-center py-16 text-neutral-800 text-xs">
                  No connections found.
                </div>
              ) : (
                <Table
                  data={paginatedConnections}
                  columns={tableColumns}
                  className="w-full text-left border-collapse"
                  hasBorder={false}
                />
              )}
            </div>
            {filteredConnections.length > 0 && renderPagination()}
          </div>
        ) : (
          /* CARDS / GRID VIEW */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="border border-neutral-400 rounded-[20px] p-5 shadow-sm space-y-4 bg-container transition-colors duration-300 text-left flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top: logo, name and status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {conn.isProduction && (
                          <div className="relative group">
                            {/* Productive Badge */}
                            <div className="bg-info-light border border-info-main p-2 rounded-[12px] flex items-center justify-center size-10 shrink-0 text-info-main cursor-help transition-all duration-300">
                              <CaralIcon name="badgeSync" size={20} />
                            </div>

                            {/* Popover */}
                            <div className="absolute top-12 left-0 z-50 w-72 p-4 bg-container border border-neutral-400 rounded-[12px] shadow-xl text-left scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 origin-top-left">
                              <div className="absolute -top-1.5 left-4 size-3 bg-container border-t border-l border-neutral-400 rotate-45" />
                              <div className="relative z-10 space-y-1.5 font-normal">
                                <div className="flex items-center gap-2 text-info-hard">
                                  <CaralIcon name="badgeSync" size={16} />
                                  <span className="text-xs font-bold font-poppins">Productive environment</span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-neutral-800">
                                  Only origins marked with this flag can be used in automated jobs. Connections without this flag are intended for testing, validation, or QA environments.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-container border border-neutral-800 p-2 rounded-[6px] flex items-center justify-center size-10 shrink-0">
                          <SourceLogo brandName={conn.brandName} size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-900 leading-tight">
                            {conn.name}
                          </h4>
                          <p className="text-[10px] text-neutral-800">
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
                    <div className="flex items-center gap-3 pt-3.5 border-t border-neutral-400">
                      <div className="bg-warning-main w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {conn.avatarText}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900">
                          Create by {conn.createdBy}
                        </p>
                        <p className="text-[10px] text-neutral-800">
                          On {conn.createdDay.split(" | ")[0]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Edit connection button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="info"
                      className="text-xs font-semibold px-4 py-2 bg-seidor-main hover:bg-seidor-hard text-white rounded-md h-auto cursor-pointer"
                      onClick={() => {
                        setSelectedConnection(conn);
                        setIsEditDrawerOpen(true);
                      }}
                    >
                      Edit connection
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {filteredConnections.length === 0 && (
              <div className="col-span-full text-center py-16 border border-dashed border-neutral-400 rounded-[20px] text-neutral-800 text-xs bg-container">
                No connections found.
              </div>
            )}
            {filteredConnections.length > 0 && (
              <div className="bg-container border border-neutral-400 rounded-[20px] shadow-sm mt-6 relative">
                {renderPagination("rounded-[20px]")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Detail/Edit Drawer */}
      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={selectedConnection ? `Edit ${selectedConnection.locationType} Connection` : "Edit Connection"}
        size="md"
      >
        <div className="flex flex-col h-full justify-between pb-6 space-y-6 text-left">
          <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1.5 scrollbar-thin">
            {/* Header info - Brand name and location type */}
            {selectedConnection && (
              <div className="flex items-center gap-4 p-4 rounded-[12px] bg-neutral-500/10 border border-neutral-400 animate-fade-in">
                <div className="bg-container border border-neutral-800 p-2.5 rounded-[8px] flex items-center justify-center size-12 shrink-0">
                  <SourceLogo brandName={selectedConnection.brandName} size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 leading-tight">
                    {selectedConnection.type}
                  </h3>
                  <p className="text-xs text-neutral-800 font-sans">
                    Created by {selectedConnection.createdBy} on {selectedConnection.createdDay.split(" | ")[0]}
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: General Settings */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-400 pb-2">
                General Settings
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <TextInput
                  label="Connection Name"
                  placeholder="e.g. Production Data Source"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={isTesting}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {/* Status toggle */}
                <div className="flex items-center justify-between p-3.5 border border-neutral-400 rounded-[12px] bg-container">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-900">Active Status</span>
                    <span className="text-[10px] text-neutral-800">Toggle whether this connection is enabled</span>
                  </div>
                  <Toggle
                    checked={formStatus === "Enabled"}
                    onChange={(checked) => setFormStatus(checked ? "Enabled" : "Disabled")}
                    disabled={isTesting}
                  />
                </div>

                {/* Production environment toggle */}
                <div className="flex items-center justify-between p-3.5 border border-neutral-400 rounded-[12px] bg-container">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                      Production Environment
                      {formIsProduction && (
                        <span className="text-info-main">
                          <CaralIcon name="badgeSync" size={12} />
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-neutral-800">Production sources can be used in jobs</span>
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
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 border-b border-neutral-400 pb-2">
                Parameters & Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <TextInput
                    label="Host / Server"
                    placeholder="e.g. db.example.com"
                    value={formHost}
                    onChange={(e) => setFormHost(e.target.value)}
                    disabled={isTesting}
                  />
                </div>
                <div>
                  <TextInput
                    label="Port"
                    placeholder="e.g. 5432"
                    value={formPort}
                    onChange={(e) => setFormPort(e.target.value)}
                    disabled={isTesting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  label="Database / Schema Name"
                  placeholder="e.g. sales_db"
                  value={formDatabase}
                  onChange={(e) => setFormDatabase(e.target.value)}
                  disabled={isTesting}
                />
                <TextInput
                  label="Username"
                  placeholder="e.g. db_user"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  disabled={isTesting}
                />
              </div>

              {/* Password field with asterisks and eye show/hide toggle */}
              <div className="w-full space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <label className="text-sm font-semibold text-neutral-900">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="block w-full rounded-lg bg-container border border-neutral-400 focus:border-seidor-main focus:ring-seidor-main/20 px-3 py-2 pr-10 text-sm text-neutral-900 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="absolute inset-y-0 right-1 flex items-center text-neutral-800 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0 shadow-none hover:bg-transparent h-full px-2"
                  >
                    <CaralIcon name={showPassword ? "eye" : "eyeSlash"} size={16} />
                  </Button>
                </div>

                {/* Test Connection Button (al pie de password) */}
                <div className="pt-1">
                  <Button
                    variant="light"
                    onClick={handleTestConnection}
                    disabled={!isDirty || isTesting}
                    className={`w-full text-xs font-semibold h-[40px] justify-center items-center gap-2 border border-neutral-400 text-neutral-900 transition-all cursor-pointer ${!isDirty || isTesting
                      ? "opacity-50 cursor-not-allowed bg-neutral-500/20"
                      : "hover:bg-neutral-500/10"
                      }`}
                  >
                    {isTesting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <CaralIcon name="sync" size={14} />
                        Test Connection
                      </>
                    )}
                  </Button>
                  {!isDirty && !isTesting && (
                    <p className="text-[10px] text-neutral-800 mt-1 italic">
                      Modify any field to enable connection testing.
                    </p>
                  )}
                </div>
              </div>

              {/* SSL Mode toggle */}
              <div className="flex items-center justify-between p-3.5 border border-neutral-400 rounded-[12px] bg-container">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-900">Use SSL/TLS Connection</span>
                  <span className="text-[10px] text-neutral-800">Encrypt traffic between Crestone and data source</span>
                </div>
                <Toggle
                  checked={formSslMode}
                  onChange={setFormSslMode}
                  disabled={isTesting}
                />
              </div>
            </div>

            {/* Section 3: Danger Zone */}
            <div className="space-y-4 pt-4 border-t border-neutral-400">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-900">
                  Danger Zone
                </h4>
                <p className="text-xs text-neutral-800">
                  Irreversible and destructive actions.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border border-neutral-400 rounded-[12px] bg-neutral-500/10">
                <div className="flex flex-col text-left space-y-1">
                  <span className="text-xs font-semibold text-neutral-900">
                    Delete {selectedConnection?.locationType || "Connection"}
                  </span>
                  <span className="text-[10px] text-neutral-800">
                    Once you delete a connection, there is no going back
                  </span>
                </div>
                <Button
                  variant="danger"
                  onClick={handleDeleteConnection}
                  disabled={isTesting}
                  className="text-xs font-semibold px-4 py-2 bg-danger-main hover:bg-danger-hard text-white rounded-[6px] h-auto flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CaralIcon name="trash" size={14} />
                  Delete this connection
                </Button>
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-400">
            <Button
              variant="ghost"
              onClick={() => setIsEditDrawerOpen(false)}
              disabled={isTesting}
              className="flex-1 text-xs font-semibold h-[40px] bg-neutral-500 border border-neutral-800 text-neutral-900 hover:bg-neutral-500/20 justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </Button>
            <Button
              variant="info"
              onClick={handleSaveChanges}
              disabled={isTesting}
              className="flex-1 text-xs font-semibold h-[40px] justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
