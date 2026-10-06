"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Toggle, Chip, ConfirmationModal, Alert, Tabs, Drawer } from "caralstable";
import { TextInput } from "caralstable";
import { Brand, CaralIcon } from "iconcaral2";

const VALID_BRANDS = new Set([
  "AWS", "AzureSql", "GoogleStorage", "SAP", "Saleforce", "Snowflake", "Redshift", "Cloudera", "Teradata", "Google", "Databricks", "AmazonRedshift", "GoogleBigquery", "Teams", "Deepseek", "Gemini", "OpenAI", "SAPHanaC", "S3", "Harbinger", "Doxa", "Daiana", "Crestone", "CloudCosting", "Feelings", "IBMDb2", "MSSQL", "mySQL", "PostgreSQL", "OneDrive", "Sharepoint", "PDF", "DOC", "DOCX", "CSV", "XLSX", "Json", "HTML", "Fabric", "Sybase", "Ollama", "Windows", "DataEngineering", "OneLake", "DataActivator", "DataFactory", "Synapse", "PowerBI", "Database", "IQ", "Dynamics", "Oracle", "Azure", "CloudStorage"
]);

function SourceLogo({ brandName, size, muted }: { brandName: string; size: number; muted?: boolean }) {
  const isBrand = VALID_BRANDS.has(brandName);

  if (isBrand && !muted) {
    return <Brand name={brandName as any} size={size} />;
  }

  const validIcons = new Set([
    "AWS", "Azure", "AzureSql", "CloudStorage", "Cloudera", "Database", "Databricks",
    "Deepseek", "Doxa", "Fabric", "Gemini", "Google", "GoogleBigquery", "GoogleStorage",
    "IBMDb2", "IQ", "MSSQL", "OneDrive", "OpenAI", "Oracle", "PowerBI", "PostgreSQL",
    "Redshift", "S3", "SAP", "SAPHanaC", "Saleforce", "SapOdata", "Sharepoint", "Snowflake",
    "Sybase", "Teams", "Teradata", "Windows", "OData", "database"
  ]);

  const iconName = validIcons.has(brandName) ? brandName : "database";
  return <CaralIcon name={iconName as any} size={size} color={muted ? "#94A3B8" : undefined} />;
}

// Supported sources list matching the Figma grid
interface SourceItem {
  id: string;
  name: string;
  category: "SQL" | "NoSQL" | "Data Warehouse" | "Big Data" | "Files" | "Cloud Storage";
  type: string;
  description: string;
  brandName: string;
  defaultPort: number;
  pillColor: 'default' | 'info' | 'success' | 'warning' | 'danger' | 'indido' | 'sakura' | 'light' | 'alwayslight' | 'outlight';
}

const supportedSources: SourceItem[] = [
  {
    id: "sap-hana",
    name: "SAP HANA",
    category: "SQL",
    type: "In-Memory DB",
    description: "SAP's implementation of in-memory database technology.",
    brandName: "SAP",
    defaultPort: 30015,
    pillColor: "info"
  },
  {
    id: "oracle",
    name: "Oracle Database",
    category: "SQL",
    type: "SQL Database",
    description: "A multi-model database management system produced by Oracle Corporation.",
    brandName: "Oracle",
    defaultPort: 1521,
    pillColor: "warning"
  },
  {
    id: "mssql",
    name: "Microsoft SQL Server",
    category: "SQL",
    type: "SQL Database",
    description: "A relational database management system developed by Microsoft.",
    brandName: "MSSQL",
    defaultPort: 1433,
    pillColor: "warning"
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "SQL",
    type: "SQL Database",
    description: "An open-source relational database known for its robustness and features.",
    brandName: "PostgreSQL",
    defaultPort: 5432,
    pillColor: "warning"
  },
  {
    id: "redshift",
    name: "AMAZON redshift",
    category: "Data Warehouse",
    type: "Data Warehouse",
    description: "A document-oriented NoSQL database that leverages flexible JSON-like structures, allowing for dynamic schemas.",
    brandName: "AmazonRedshift",
    defaultPort: 5439,
    pillColor: "success"
  },
  {
    id: "ibm-db2",
    name: "IBM Db2",
    category: "SQL",
    type: "SQL Database",
    description: "A family of data management products, including database servers, developed by IBM.",
    brandName: "IBMDb2",
    defaultPort: 50000,
    pillColor: "light"
  },
  {
    id: "cloudera",
    name: "Cloudera",
    category: "Big Data",
    type: "Data Platform",
    description: "An elastic NoSQL database engineered to efficiently manage vast datasets distributed across multiple nodes.",
    brandName: "Cloudera",
    defaultPort: 2181,
    pillColor: "danger"
  },
  {
    id: "fabric",
    name: "Fabric",
    category: "Big Data",
    type: "Data Platform",
    description: "An open-source relational database that is a fork of MySQL, developed for high performance.",
    brandName: "Fabric",
    defaultPort: 443,
    pillColor: "sakura"
  },
  {
    id: "onelake",
    name: "One Lake",
    category: "Cloud Storage",
    type: "Data Lake",
    description: "A high-performance open-source relational database derived from MySQL, optimized for speed and scalability.",
    brandName: "OneLake",
    defaultPort: 443,
    pillColor: "indido"
  },
  {
    id: "aws",
    name: "AWS Platform",
    category: "Cloud Storage",
    type: "Cloud Infrastructure",
    description: "Amazon Web Services global cloud infrastructure and resource management.",
    brandName: "AWS",
    defaultPort: 443,
    pillColor: "info"
  },
  {
    id: "azure-sql",
    name: "Azure SQL",
    category: "SQL",
    type: "SQL Database",
    description: "Microsoft Azure SQL Database cloud-based relational database service.",
    brandName: "AzureSql",
    defaultPort: 1433,
    pillColor: "warning"
  },
  {
    id: "google-storage",
    name: "Google Storage",
    category: "Cloud Storage",
    type: "Object Storage",
    description: "Google Cloud Storage unified object storage for developers and enterprises.",
    brandName: "GoogleStorage",
    defaultPort: 443,
    pillColor: "info"
  },
  {
    id: "sap",
    name: "SAP ERP",
    category: "SQL",
    type: "Enterprise ERP",
    description: "SAP application systems data connection server.",
    brandName: "SAP",
    defaultPort: 30015,
    pillColor: "info"
  },
  {
    id: "salesforce",
    name: "Salesforce CRM",
    category: "Cloud Storage",
    type: "CRM Data",
    description: "Salesforce cloud business CRM data service integration.",
    brandName: "Saleforce",
    defaultPort: 443,
    pillColor: "success"
  },
  {
    id: "snowflake",
    name: "Snowflake DW",
    category: "Data Warehouse",
    type: "SaaS Warehouse",
    description: "Cloud-based data warehousing platform for analytics and big data.",
    brandName: "Snowflake",
    defaultPort: 443,
    pillColor: "success"
  },
  {
    id: "teradata",
    name: "Teradata",
    category: "Data Warehouse",
    type: "Relational DB",
    description: "Teradata enterprise analytics and data warehousing platform.",
    brandName: "Teradata",
    defaultPort: 1025,
    pillColor: "success"
  },
  {
    id: "databricks",
    name: "Databricks Workspace",
    category: "Big Data",
    type: "Unified Analytics",
    description: "Databricks unified data analytics platform based on Apache Spark.",
    brandName: "Databricks",
    defaultPort: 443,
    pillColor: "danger"
  },
  {
    id: "odata",
    name: "OData Feed",
    category: "Files",
    type: "Web Protocol",
    description: "Open Data Protocol standard for building and consuming RESTful APIs.",
    brandName: "OData",
    defaultPort: 443,
    pillColor: "light"
  },
  {
    id: "sap-odata",
    name: "SAP OData Service",
    category: "Files",
    type: "ERP API",
    description: "SAP Gateway OData services for web applications integration.",
    brandName: "SapOdata",
    defaultPort: 443,
    pillColor: "light"
  },
  {
    id: "google-bigquery",
    name: "Google BigQuery",
    category: "Data Warehouse",
    type: "Serverless DW",
    description: "Google Cloud serverless, highly-scalable cloud data warehouse.",
    brandName: "GoogleBigquery",
    defaultPort: 443,
    pillColor: "success"
  },
  {
    id: "sap-hanac",
    name: "SAP HANA Cloud",
    category: "SQL",
    type: "Cloud In-Memory",
    description: "SAP HANA Cloud multi-model database service in the cloud.",
    brandName: "SAPHanaC",
    defaultPort: 443,
    pillColor: "info"
  },
  {
    id: "s3",
    name: "Amazon S3 Bucket",
    category: "Cloud Storage",
    type: "Object Storage",
    description: "Amazon Simple Storage Service object storage through web service interface.",
    brandName: "S3",
    defaultPort: 443,
    pillColor: "info"
  },
  {
    id: "mysql",
    name: "MySQL Database",
    category: "SQL",
    type: "SQL Database",
    description: "MySQL open-source relational database management system.",
    brandName: "mySQL",
    defaultPort: 3306,
    pillColor: "warning"
  },
  {
    id: "sybase",
    name: "Sybase ASE",
    category: "SQL",
    type: "SQL Database",
    description: "SAP Sybase ASE enterprise relational database server.",
    brandName: "Sybase",
    defaultPort: 5000,
    pillColor: "warning"
  },
  {
    id: "data-engineering",
    name: "Data Pipelines",
    category: "Big Data",
    type: "Data Workflow",
    description: "Data Engineering pipelines and processing connection.",
    brandName: "DataEngineering",
    defaultPort: 443,
    pillColor: "danger"
  },
  {
    id: "data-activator",
    name: "Data Activator",
    category: "Big Data",
    type: "Automation Hub",
    description: "Microsoft Fabric Data Activator for real-time detection and actions.",
    brandName: "DataActivator",
    defaultPort: 443,
    pillColor: "danger"
  },
  {
    id: "data-factory",
    name: "Data Factory",
    category: "Big Data",
    type: "ETL Pipelines",
    description: "Microsoft Azure Data Factory cloud-based data integration service.",
    brandName: "DataFactory",
    defaultPort: 443,
    pillColor: "danger"
  },
  {
    id: "synapse",
    name: "Azure Synapse",
    category: "Data Warehouse",
    type: "Analytics Service",
    description: "Azure Synapse Analytics enterprise analytics service.",
    brandName: "Synapse",
    defaultPort: 1433,
    pillColor: "success"
  },
  {
    id: "powerbi",
    name: "PowerBI Dataset",
    category: "Files",
    type: "Visualization",
    description: "Microsoft Power BI business analytics service connections.",
    brandName: "PowerBI",
    defaultPort: 443,
    pillColor: "light"
  },
  {
    id: "database",
    name: "Generic Database",
    category: "SQL",
    type: "Relational DB",
    description: "Generic relational SQL database connection standard.",
    brandName: "Database",
    defaultPort: 3306,
    pillColor: "warning"
  },
  {
    id: "sap-iq",
    name: "SAP IQ Server",
    category: "SQL",
    type: "Columnar DB",
    description: "SAP IQ columnar-based relational database server for analytics.",
    brandName: "IQ",
    defaultPort: 2638,
    pillColor: "warning"
  }
];

export default function CrestoneConnectionPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const formRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);



  // Stage 1 State
  const [connectionName, setConnectionName] = useState("");
  const [isProduction, setIsProduction] = useState(false);

  // Drawer & Filter States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [onlyCloud, setOnlyCloud] = useState(false);

  // Stage 2 State (Grid, Tabs, Search)
  const [activeTab, setActiveTab] = useState<string>("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [isListView, setIsListView] = useState(false);

  // Stage 3 State (Connection Details)
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dbName, setDbName] = useState("");

  // Testing Connection Modal
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [saveSuccessAlert, setSaveSuccessAlert] = useState(false);

  // Suggest Connection Drawer States
  const [isSuggestDrawerOpen, setIsSuggestDrawerOpen] = useState(false);
  const [suggestedName, setSuggestedName] = useState("");
  const [suggestedDetails, setSuggestedDetails] = useState("");

  // Categories definition matching figma
  const tabs = ["All", "Popular", "SQL", "NoSQL", "Data Warehouse", "Big Data", "Files", "Cloud Storage"];

  // Filter sources
  const filteredSources = useMemo(() => {
    return supportedSources.filter((source) => {
      const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === "All" ||
        (activeTab === "Popular" && ["sap-hana", "Oracle", "postgresql", "onelake", "snowflake", "google-bigquery", "s3", "mssql", "mysql", "aws"].includes(source.id)) ||
        source.category === activeTab;

      // Filter by selected companies
      if (selectedCompanies.length > 0) {
        let companyGroup = "";
        const bName = source.brandName.toLowerCase();
        if (bName.includes("sap")) companyGroup = "SAP";
        else if (bName.includes("google")) companyGroup = "Google";
        else if (bName.includes("amazon") || bName.includes("aws") || bName.includes("redshift") || bName.includes("s3")) companyGroup = "AWS";
        else if (bName.includes("microsoft") || bName.includes("mssql") || bName.includes("fabric") || bName.includes("onelake") || bName.includes("azure")) companyGroup = "Microsoft";

        if (!selectedCompanies.includes(companyGroup)) return false;
      }

      // Filter by onlyCloud
      if (onlyCloud) {
        const isCloud = ["AmazonRedshift", "Fabric", "OneLake"].includes(source.brandName);
        if (!isCloud) return false;
      }

      return matchesSearch && matchesTab;
    });
  }, [activeTab, searchQuery, selectedCompanies, onlyCloud]);

  const clearForm = () => {
    setHost("");
    setPort("");
    setUsername("");
    setPassword("");
    setDbName("");
    setIsProduction(false);
  };

  const handleCloseForm = () => {
    setSelectedSource(null);
    clearForm();
  };

  const selectSourceAndPrepopulate = (source: SourceItem) => {
    setSelectedSource(source);
    setHost("");
    setPort(source.defaultPort.toString());
    setUsername("");
    setPassword("");
    setDbName("");
    setIsProduction(false);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestProgress(0);
    setTestCompleted(false);

    // Simulate progress
    const interval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTestCompleted(true);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleSaveConnection = () => {
    setSaveSuccessAlert(true);
    setTimeout(() => {
      setSaveSuccessAlert(false);
    }, 4000);
  };

  const handleSuggestSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    alert("Thank you! Your suggestion has been submitted.");
    setSuggestedName("");
    setSuggestedDetails("");
    setIsSuggestDrawerOpen(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch font-poppins select-none transition-colors duration-300 text-foreground w-full h-full">

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 p-[18px] flex flex-col justify-start gap-6">
        {/* Top Content Card */}
        <div className="border border-neutral-300 rounded-[20px] p-5 shadow-sm space-y-6 bg-container transition-colors duration-300">

          {/* Header Title Section */}
          <div className="flex items-end justify-between pb-6 border-b border-neutral-300 transition-colors duration-300">

            <div className="space-y-1">
              <Link href="/connections">
                <Button iconName="chevronLeft" variant="ghost" className="font-light text-base " >
                  Back
                </Button>
              </Link>
              <h2 className="text-[30px] font-semibold tracking-tight leading-[35px] text-neutral-900 transition-colors duration-300">
                Create a new Source
              </h2>
              <p className="text-[16px] leading-6 text-neutral-700 transition-colors duration-300">
                These connections allow you to log access to the systems that Crestone will use during data transfers.
              </p>
            </div>
            <Button
              variant="info"
              onClick={() => setIsSuggestDrawerOpen(true)}
              className="bg-info-main hover:bg-info-hard text-white text-sm font-medium px-4 py-2.5 rounded-[6px] shadow-sm transition-colors"
            >
              Suggest a connection
            </Button>
          </div>

          {/* STAGE 1: Name and environment configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            {/* Input: Name connection using caralstable TextInput */}
            <TextInput
              label="Name connection"
              placeholder="e.g. SAP HANA"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              iconName="shieldHalved"
              helperText="Type the connection name to display the compatible data sources."
            />


          </div>
        </div>

        {/* STAGES 2 & 3: Database Selection Grid and Parameter Column */}
        {connectionName.trim() !== "" ? (
          <div className="flex-1 flex flex-col justify-start space-y-6">

            {/* Category tabs, Search, and Filters bar */}
            <div className="flex justify-between p-4 bg-container rounded-xl">

              {/* Horizontal tabs using caralstable Tabs component */}
              <Tabs
                activeIndex={tabs.indexOf(activeTab)}
                onChange={(index) => setActiveTab(tabs[index])}
                tabs={tabs.map((tab) => ({ label: tab }))}
              />

              {/* Right controls */}
              <div className="flex items-center gap-2 justify-end shrink-0">
                {/* Search Bar */}
                <div className="border border-neutral-500  rounded-[12px] min-h-[40px] flex items-center gap-3 px-4 py-2 w-64 shadow-[0_2px_5px_rgba(0,0,0,0.04)] bg-container transition-colors duration-300">
                  <CaralIcon name="search" size={16} classname="text-neutral-800" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full text-xs font-normal bg-transparent outline-none text-neutral-900 placeholder-neutral-800 transition-colors duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="bg-neutral-500 px-1.5 py-0.5 rounded text-[10px] font-semibold text-neutral-800 font-mono">⌘K</span>
                </div>

                {/* Filter funnel button */}
                <Button
                  iconName="filter"
                  isIconButton
                  variant={selectedCompanies.length > 0 || onlyCloud ? "warning" : "info"}
                  onClick={() => setIsFilterDrawerOpen(true)}
                />

                {/*vista de lista */}
                <Button
                  iconName={isListView ? "grid" : "list"}
                  isIconButton
                  variant="info"
                  hasBorder
                  onClick={() => setIsListView(prev => !prev)}
                  title={isListView ? "Grid View" : "List View"}
                />
              </div>
            </div>

            {/* Grid/List content split area */}
            <div className="flex-1 flex gap-6 items-stretch">

              {/* Database List (Grid or Table-like list) */}
              {isListView ? (
                <div className={`flex flex-col gap-3.5 self-start ${selectedSource ? "flex-1" : "w-full"}`}>
                  {filteredSources.map((source) => {
                    const isSelected = selectedSource?.id === source.id;
                    return (
                      <div
                        key={source.id}
                        onClick={() => !selectedSource && selectSourceAndPrepopulate(source)}
                        className={`border p-2 pr-4 rounded-[20px] transition-all duration-300 flex gap-4 h-[72px] items-center ${selectedSource
                          ? isSelected
                            ? "cursor-default border-success-main shadow-[0_0_15px_rgba(68,202,159,0.35)] ring-1 ring-success-main/20 bg-white dark:bg-neutral-400"
                            : "cursor-not-allowed opacity-45 bg-transparent border-neutral-500 dark:border-neutral-300"
                          : "cursor-pointer bg-container border-neutral-500 dark:border-neutral-300 hover:bg-neutral-400 hover:shadow-md"
                          }`}
                      >
                        <div className="bg-container border border-neutral-800 p-2.5 rounded-[12px] flex items-center justify-center size-[56px] shrink-0">
                          <SourceLogo brandName={source.brandName} size={24} muted={!isSelected && !!selectedSource} />
                        </div>

                        <div className="w-40 shrink-0 text-left">
                          <h4 className={`font-semibold text-sm tracking-tight transition-colors duration-350 ${isSelected
                            ? "text-success-hard dark:text-success-main"
                            : selectedSource
                              ? "text-neutral-800"
                              : "text-seidor-main-text dark:text-seidor-light"
                            }`}>
                            {source.name}
                          </h4>
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-xs leading-relaxed line-clamp-2 transition-colors duration-350 ${isSelected
                            ? "text-neutral-900"
                            : selectedSource
                              ? "text-neutral-800"
                              : "text-neutral-900"
                            }`}>
                            {source.description}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <Chip
                            hasBorder
                            label={source.type}
                            variant={source.type === "In-Memory DB" ? "info" : source.pillColor}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {filteredSources.length === 0 && (
                    <div className="text-center py-16 border border-dashed border-zinc-350 rounded-[20px] text-zinc-500 text-xs">
                      No compatible data sources found.
                    </div>
                  )}
                </div>
              ) : (
                <div className={`grid gap-4 self-start ${selectedSource ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 flex-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 w-full"}`}>
                  {filteredSources.map((source) => {
                    const isSelected = selectedSource?.id === source.id;
                    return (
                      <div
                        key={source.id}
                        onClick={() => !selectedSource && selectSourceAndPrepopulate(source)}
                        className={`border p-5 rounded-[20px] transition-all duration-300 flex flex-col justify-between space-y-4 ${selectedSource
                          ? isSelected
                            ? "cursor-default border-success-main shadow-[0_0_15px_rgba(68,202,159,0.35)] ring-1 ring-success-main/20 bg-white dark:bg-neutral-400"
                            : "cursor-not-allowed opacity-45 bg-transparent border-neutral-500 dark:border-neutral-300"
                          : "cursor-pointer bg-container border-neutral-500 dark:border-neutral-300 hover:bg-neutral-400 hover:shadow-md"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="bg-neutral-100 border border-neutral-800 p-2.5 rounded-[6px] flex items-center justify-center">
                            <SourceLogo brandName={source.brandName} size={24} muted={!isSelected && !!selectedSource} />
                          </div>
                          <Chip
                            hasBorder
                            label={source.type}
                            variant={source.type === "In-Memory DB" ? "info" : source.pillColor}
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <h4 className={`font-semibold text-base tracking-tight transition-colors duration-350 ${isSelected
                            ? "text-success-hard dark:text-success-main"
                            : selectedSource
                              ? "text-neutral-800"
                              : "text-seidor-main-text-text"
                            }`}>
                            {source.name}
                          </h4>
                          <p className={`text-xs leading-relaxed line-clamp-3 transition-colors duration-350 ${isSelected
                            ? "text-neutral-900"
                            : selectedSource
                              ? "text-neutral-800"
                              : "text-neutral-900"
                            }`}>
                            {source.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {filteredSources.length === 0 && (
                    <div className="col-span-full text-center py-16 border border-dashed border-zinc-350 rounded-[20px] text-zinc-500 text-xs">
                      No compatible data sources found.
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 3: Parameter Configuration (Right side column) */}
              {selectedSource && (
                <div ref={formRef} className="scroll-mt-28 md:w-80 lg:w-96 border border-neutral-500 dark:border-neutral-300 rounded-[20px] p-5 space-y-6 shadow-sm shrink-0 flex flex-col justify-between self-start animate-in slide-in-from-right-4 bg-container text-neutral-900 dark:text-white transition-all duration-300">
                  <style>{`
                    @keyframes checkmark-draw {
                      to {
                        stroke-dashoffset: 0;
                      }
                    }
                    .animate-checkmark-stroke {
                      animation: checkmark-draw 0.5s ease-out 0.2s forwards;
                    }
                  `}</style>

                  {!isTesting && !testCompleted ? (
                    /* STATE 1: Credentials Form */
                    <div className="flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-5">
                        {/* Form Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-500 dark:border-neutral-300 transition-colors duration-300">
                          <div className="flex items-center gap-3">
                            <div className="bg-neutral-500 border border-neutral-800 p-2 rounded-[6px] flex items-center justify-center">
                              <SourceLogo brandName={selectedSource.brandName} size={20} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-seidor-main-text dark:text-white transition-colors duration-300">
                                {selectedSource.name} Settings
                              </h3>
                              <p className="text-[10px] text-neutral-800">Provide connection credentials</p>
                            </div>
                          </div>
                          <button
                            onClick={handleCloseForm}
                            className="p-1 rounded bg-neutral-500 text-neutral-800 hover:text-neutral-900 transition-colors"
                            title="Close"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Credentials inputs using caralstable TextInput */}
                        <div className="space-y-4 text-left">
                          <TextInput
                            label="Host / Server IP"
                            placeholder="e.g. hana-server.crestone.seidor.corp"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <TextInput
                              label="Port"
                              type="number"
                              placeholder={selectedSource.defaultPort.toString()}
                              value={port}
                              onChange={(e) => setPort(e.target.value)}
                            />
                            <TextInput
                              label="Database"
                              placeholder="e.g. SYSTEMDB"
                              value={dbName}
                              onChange={(e) => setDbName(e.target.value)}
                            />
                          </div>

                          <TextInput
                            label="Username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />

                          <TextInput
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />

                          {/* Toggle Banner: Production environment */}
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-1.5 text-left">
                              <span className="text-xs font-medium text-neutral-800">Production environment</span>
                              <div className="relative group flex items-center">
                                <span className="text-neutral-800 hover:text-neutral-900 cursor-help transition-colors">
                                  <CaralIcon name="circleInfo" size={12} />
                                </span>

                                {/* Popover */}
                                <div className="absolute top-6 right-0 z-50 w-72 p-4 bg-[#E2E8F0] dark:bg-neutral-450 border border-neutral-350 dark:border-neutral-600 rounded-[12px] shadow-xl text-left scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 origin-top-right">
                                  <div className="absolute -top-1.5 right-2 size-3 bg-[#E2E8F0] dark:bg-neutral-450 border-t border-l border-neutral-350 dark:border-neutral-600 rotate-45" />
                                  <div className="relative z-10 space-y-1.5 font-normal">
                                    <div className="flex items-center gap-2 text-info-hard dark:text-info-main">
                                      <CaralIcon name="badgeSync" size={14} />
                                      <span className="text-xs font-bold font-poppins">Productive environment</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-neutral-900 dark:text-neutral-200">
                                      Only origins marked with this flag can be used in automated jobs. Connections without this flag are intended for testing, validation, or QA environments.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="border rounded-[6px] flex items-center justify-between pr-3 overflow-hidden bg-info-light dark:bg-info-main/20 border-info-hard dark:border-info-main transition-colors duration-300">
                              <div className="flex items-center gap-3">
                                <div className="bg-info-hard flex h-[38px] w-[38px] items-center justify-center text-white">
                                  <CaralIcon name="badgeSync" size={24} />
                                </div>
                                <span className="text-xs font-normal leading-6 select-none text-neutral-900 transition-colors duration-300">
                                  Switch this source to the production environment
                                </span>
                              </div>
                              <Toggle checked={isProduction} onChange={setIsProduction} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons - Only Test Connection */}
                      <div className="pt-4 border-t border-neutral-500 dark:border-neutral-350 flex flex-col gap-2.5 transition-colors duration-300">
                        <Button
                          variant="info"
                          iconName="sync"
                          onClick={handleTestConnection}
                          disabled={!host || !username || !password}
                          className="w-full font-semibold h-[44px] text-xs justify-center"
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  ) : isTesting && !testCompleted ? (
                    /* STATE 2: Intermediate Testing Screen (Progress) */
                    <div className="flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-500 dark:border-neutral-300 transition-colors duration-300">
                          <h3 className="text-sm font-bold text-seidor-main-text dark:text-white transition-colors duration-300">
                            Connector details
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] dark:bg-[#0369A1]/20 dark:text-[#38BDF8]">
                            Selected
                          </span>
                        </div>

                        {/* Connector details card */}
                        <div className="bg-neutral-500/10 dark:bg-neutral-300/5 border border-neutral-500/20 dark:border-neutral-300/10 rounded-[12px] p-3.5 flex items-center gap-3.5 text-left">
                          <div className="bg-white dark:bg-neutral-100 border border-neutral-350 p-2 rounded-[6px] flex items-center justify-center size-10 shrink-0">
                            <SourceLogo brandName={selectedSource.brandName} size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                              {selectedSource.name}
                            </h4>
                            <p className="text-[10px] text-neutral-800">
                              {selectedSource.type}
                            </p>
                          </div>
                        </div>

                        {/* Loading Animation Progress */}
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="relative flex items-center justify-center size-20">
                            <svg className="animate-spin h-14 w-14 text-info-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="absolute text-xs font-semibold text-neutral-900 dark:text-white">
                              {testProgress}%
                            </span>
                          </div>

                          <div className="text-center space-y-1">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">Testing connection...</p>
                            <p className="text-[10px] text-neutral-800">Verifying host {host}:{port}...</p>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Test Button */}
                      <div className="pt-4 border-t border-neutral-500 dark:border-neutral-350">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsTesting(false);
                            setTestCompleted(false);
                            setTestProgress(0);
                          }}
                          className="w-full h-[40px] text-xs font-semibold border border-neutral-350 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 justify-center"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* STATE 3: Success Screen (Established) */
                    <div className="flex flex-col justify-between h-full space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-500 dark:border-neutral-300 transition-colors duration-300">
                          <h3 className="text-sm font-bold text-seidor-main-text dark:text-white transition-colors duration-300">
                            Connector details
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] dark:bg-[#0369A1]/20 dark:text-[#38BDF8]">
                            Selected
                          </span>
                        </div>

                        {/* Connector details card */}
                        <div className="bg-[#EAFDF7] dark:bg-success-main/10 border border-success-main/20 rounded-[12px] p-3.5 flex items-center gap-3.5 text-left transition-colors duration-300">
                          <div className="bg-white dark:bg-neutral-100 border border-neutral-350 p-2 rounded-[6px] flex items-center justify-center size-10 shrink-0">
                            <SourceLogo brandName={selectedSource.brandName} size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                              {selectedSource.name}
                            </h4>
                            <p className="text-[10px] text-[#059669] dark:text-[#34D399] font-medium">
                              {selectedSource.type}
                            </p>
                          </div>
                        </div>

                        {/* Success Icon Animation */}
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                          <div className="relative size-16 flex items-center justify-center bg-[#EAFDF7] dark:bg-success-main/15 rounded-full border border-success-main/30 shadow-sm animate-in zoom-in-50 duration-500">
                            <svg className="w-8 h-8 text-[#059669] dark:text-[#34D399]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline
                                points="20 6 9 17 4 12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="animate-checkmark-stroke"
                                style={{
                                  strokeDasharray: 40,
                                  strokeDashoffset: 40,
                                }}
                              />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-[#059669] dark:text-[#34D399]">
                            Connection established
                          </p>
                        </div>
                      </div>

                      {/* Actions Cancel & Create source */}
                      <div className="flex gap-3 pt-4 border-t border-neutral-500 dark:border-neutral-350">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsTesting(false);
                            setTestCompleted(false);
                            setTestProgress(0);
                          }}
                          className="flex-1 h-[44px] text-xs font-semibold border border-neutral-350 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 justify-center"
                        >
                          Cancel
                        </Button>
                        <Link href="/connections" className="flex-1" >
                          <Button
                            variant="info"
                            onClick={() => {
                              handleSaveConnection();
                              setIsTesting(false);
                              setTestCompleted(false);
                              setTestProgress(0);
                            }}
                            className="w-full h-[44px] text-xs font-semibold justify-center"
                          >
                            Create source
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Stage 1 Helper Text Empty Name */
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-neutral-800/50 dark:border-neutral-300 rounded-[20px] py-20 text-center bg-container transition-colors duration-300">
            <svg className="mx-auto h-12 w-12 text-neutral-800/60 dark:text-neutral-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900 transition-colors duration-300">
              Name is required
            </h3>
            <p className="mt-2 text-xs max-w-xs mx-auto text-neutral-800 transition-colors duration-300">
              Type a connection name above to enable the grid of compatible data sources.
            </p>
          </div>
        )}

      </div>


      {/* Advanced Filters Lateral Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Advanced Filters"
        size="md"
      >
        <div className="flex flex-col h-full justify-between pb-6 space-y-6">
          <div className="space-y-6 pt-4">
            {/* Empresa Filter */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">Company</h4>
              <div className="grid grid-cols-2 gap-2">
                {["SAP", "Google", "AWS", "Microsoft"].map((company) => {
                  const isSelected = selectedCompanies.includes(company);
                  return (
                    <Button
                      key={company}
                      variant={isSelected ? ("success" as const) : ("light" as const)}
                      iconName={isSelected ? "check" : undefined}
                      hasBorder
                      onClick={() => {
                        setSelectedCompanies(prev =>
                          prev.includes(company)
                            ? prev.filter(c => c !== company)
                            : [...prev, company]
                        );
                      }}
                      className="w-full text-xs font-semibold justify-start gap-2.5 px-3.5 py-2.5 rounded-[12px] h-auto"
                    >

                      <span>{company}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Cloud Filter */}
            <div className="space-y-3 text-left pt-4 border-t border-neutral-500 dark:border-neutral-300">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">Features</h4>
              <div className="flex items-center justify-between p-3.5 border border-neutral-500 dark:border-neutral-300 rounded-[12px] bg-white dark:bg-neutral-450">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">Cloud Only</span>
                  <span className="text-[10px] text-neutral-800">Show only cloud data sources</span>
                </div>
                <Toggle checked={onlyCloud} onChange={setOnlyCloud} />
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex gap-3 pt-6 border-t border-neutral-500 dark:border-neutral-300">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCompanies([]);
                setOnlyCloud(false);
              }}
              className="flex-1 text-xs font-semibold h-[40px] bg-neutral-500 border border-neutral-800 text-neutral-900 hover:bg-neutral-300 justify-center"
            >
              Clear
            </Button>
            <Button
              variant="info"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 text-xs font-semibold h-[40px] justify-center"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Suggest Connection Lateral Drawer */}
      <Drawer
        isOpen={isSuggestDrawerOpen}
        onClose={() => setIsSuggestDrawerOpen(false)}
        title="Suggest a Connection"
        size="md"
      >
        <div className="flex flex-col h-full justify-between pb-6 space-y-6">
          <div className="space-y-6 pt-4 text-left">
            {/* Upper section: Connections in progress */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                Connections in progress
              </h4>
              <p className="text-[11px] text-neutral-800">
                We are actively working on adding support for these data sources:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 border border-neutral-500/20 dark:border-neutral-300/10 rounded-[12px] bg-neutral-500/10 dark:bg-neutral-300/5">
                  <div className="bg-white dark:bg-neutral-100 p-1.5 rounded-[4px] border border-neutral-350 flex items-center justify-center size-8">
                    <SourceLogo brandName="Sybase" size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-neutral-900 dark:text-white">Sybase ASE</span>
                    <span className="text-[9px] text-warning-hard font-medium">In Development</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-neutral-500/20 dark:border-neutral-300/10 rounded-[12px] bg-neutral-500/10 dark:bg-neutral-300/5">
                  <div className="bg-white dark:bg-neutral-100 p-1.5 rounded-[4px] border border-neutral-350 flex items-center justify-center size-8">
                    <SourceLogo brandName="IBMDb2" size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-neutral-900 dark:text-white">IBM Db2</span>
                    <span className="text-[9px] text-warning-hard font-medium">In Development</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Link to all connections */}
            <div className="pt-4 border-t border-neutral-500 dark:border-neutral-300 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                Crestone Documentation
              </h4>
              <p className="text-[11px] text-neutral-800">
                Review our comprehensive documentation list of all supported integrations:
              </p>
              <a
                href="https://crestone-help.seidoranalytics.com/docs/documentation/sections/conections/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-info-hard dark:text-info-main hover:underline transition-colors mt-1"
              >
                <span>View all supported connections</span>
                <CaralIcon name="upRightFromSquare" size={12} />
              </a>
            </div>

            {/* Form to leave suggestions */}
            <div className="pt-4 border-t border-neutral-500 dark:border-neutral-300 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                Submit a Suggestion
              </h4>
              <p className="text-[11px] text-neutral-800">
                Let us know what connection you need for your data pipeline:
              </p>
              <div className="space-y-4">
                <TextInput
                  label="Connection Name"
                  placeholder="e.g. MongoDB, Cassandra"
                  value={suggestedName}
                  onChange={(e) => setSuggestedName(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-850 dark:text-neutral-300">Use case / Details</label>
                  <textarea
                    placeholder="Describe how your team plans to use this connection..."
                    value={suggestedDetails}
                    onChange={(e) => setSuggestedDetails(e.target.value)}
                    rows={3}
                    className="w-full border border-neutral-500 dark:border-neutral-300 rounded-[12px] bg-white dark:bg-neutral-100/40 text-xs p-3 focus:outline-none focus:border-info-main text-neutral-900 dark:text-white transition-colors placeholder:text-neutral-800"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex gap-3 pt-6 border-t border-neutral-500 dark:border-neutral-300">
            <Button
              variant="ghost"
              onClick={() => {
                setSuggestedName("");
                setSuggestedDetails("");
                setIsSuggestDrawerOpen(false);
              }}
              className="flex-1 text-xs font-semibold h-[40px] border border-neutral-350 text-neutral-800 hover:bg-neutral-100 justify-center"
            >
              Cancel
            </Button>
            <Button
              variant="info"
              onClick={() => handleSuggestSubmit()}
              disabled={!suggestedName.trim() || !suggestedDetails.trim()}
              className="flex-1 text-xs font-semibold h-[40px] justify-center"
            >
              Submit
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
