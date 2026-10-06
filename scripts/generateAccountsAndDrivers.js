const fs = require('fs');
const path = require('path');

const months = [
  { short: 'Jan', full: 'Enero', num: 1 },
  { short: 'Feb', full: 'Febrero', num: 2 },
  { short: 'Mar', full: 'Marzo', num: 3 },
  { short: 'Apr', full: 'Abril', num: 4 },
  { short: 'May', full: 'Mayo', num: 5 },
  { short: 'Jun', full: 'Junio', num: 6 },
  { short: 'Jul', full: 'Julio', num: 7 },
  { short: 'Aug', full: 'Agosto', num: 8 },
  { short: 'Sep', full: 'Septiembre', num: 9 },
  { short: 'Oct', full: 'Octubre', num: 10 },
  { short: 'Nov', full: 'Noviembre', num: 11 },
  { short: 'Dec', full: 'Diciembre', num: 12 },
];

const ACCOUNT_DEFINITIONS = [
  // AWS (9 accounts)
  { id: "acc-aws-01", name: "AWS - Cloud Operations Production", provider: "AWS", brand: "AWS", accountNumber: "9482-1029-4481", startYear: 2011, baseSpend: 3200, color: "#FF9900" },
  { id: "acc-aws-02", name: "AWS - Kubernetes Core Cluster (EKS)", provider: "AWS", brand: "AWS", accountNumber: "1092-8834-5512", startYear: 2014, baseSpend: 2800, color: "#FF9900" },
  { id: "acc-aws-03", name: "AWS - Data Lake S3 & Athena", provider: "AWS", brand: "AWS", accountNumber: "5521-9901-2244", startYear: 2012, baseSpend: 1950, color: "#FF9900" },
  { id: "acc-aws-04", name: "AWS - Microservices Backend", provider: "AWS", brand: "AWS", accountNumber: "7741-3320-9988", startYear: 2015, baseSpend: 2400, color: "#FF9900" },
  { id: "acc-aws-05", name: "AWS - Machine Learning SageMaker", provider: "AWS", brand: "AWS", accountNumber: "6639-4411-8822", startYear: 2017, baseSpend: 1600, color: "#FF9900" },
  { id: "acc-aws-06", name: "AWS - E-Commerce & Checkout Portal", provider: "AWS", brand: "AWS", accountNumber: "8832-1190-4433", startYear: 2013, baseSpend: 3100, color: "#FF9900" },
  { id: "acc-aws-07", name: "AWS - Dev & Staging Environments", provider: "AWS", brand: "AWS", accountNumber: "3321-7788-0012", startYear: 2016, baseSpend: 1100, color: "#FF9900" },
  { id: "acc-aws-08", name: "AWS - Global CDN & CloudFront", provider: "AWS", brand: "AWS", accountNumber: "4490-2211-7766", startYear: 2015, baseSpend: 950, color: "#FF9900" },
  { id: "acc-aws-09", name: "AWS - Corporate IT & Backup", provider: "AWS", brand: "AWS", accountNumber: "1129-5566-3388", startYear: 2012, baseSpend: 820, color: "#FF9900" },

  // Azure (8 accounts)
  { id: "acc-azure-01", name: "Azure - EA Production Sub", provider: "Azure", brand: "Azure", accountNumber: "sub-88210-ea-prod", startYear: 2011, baseSpend: 4100, color: "#0089D6" },
  { id: "acc-azure-02", name: "Azure - Enterprise Data Warehouse", provider: "Azure", brand: "Azure", accountNumber: "sub-99320-dwh-ea", startYear: 2013, baseSpend: 2600, color: "#0089D6" },
  { id: "acc-azure-03", name: "Azure - DevOps & CI/CD Pipelines", provider: "Azure", brand: "Azure", accountNumber: "sub-11029-devops-corp", startYear: 2016, baseSpend: 1400, color: "#0089D6" },
  { id: "acc-azure-04", name: "Azure - Active Directory & Security", provider: "Azure", brand: "Azure", accountNumber: "sub-44912-sec-identity", startYear: 2012, baseSpend: 1750, color: "#0089D6" },
  { id: "acc-azure-05", name: "Azure - Cognitive Services AI", provider: "Azure", brand: "Azure", accountNumber: "sub-77192-ai-cognitive", startYear: 2018, baseSpend: 1300, color: "#0089D6" },
  { id: "acc-azure-06", name: "Azure - SQL Managed Instances", provider: "Azure", brand: "Azure", accountNumber: "sub-33019-sql-managed", startYear: 2014, baseSpend: 2200, color: "#0089D6" },
  { id: "acc-azure-07", name: "Azure - Virtual Desktops & VDI", provider: "Azure", brand: "Azure", accountNumber: "sub-55820-vdi-remote", startYear: 2017, baseSpend: 1150, color: "#0089D6" },
  { id: "acc-azure-08", name: "Azure - SAP on Cloud Infrastructure", provider: "Azure", brand: "Azure", accountNumber: "sub-22819-sap-infra", startYear: 2015, baseSpend: 3800, color: "#0089D6" },

  // GCP (7 accounts)
  { id: "acc-gcp-01", name: "GCP - BigQuery Analytics Platform", provider: "GCP", brand: "GoogleStorage", accountNumber: "crestone-gcp-bq-01", startYear: 2014, baseSpend: 2900, color: "#4285F4" },
  { id: "acc-gcp-02", name: "GCP - Marketing & Growth Experiments", provider: "GCP", brand: "GoogleStorage", accountNumber: "crestone-gcp-mktg-02", startYear: 2017, baseSpend: 1550, color: "#4285F4" },
  { id: "acc-gcp-03", name: "GCP - Vertex AI & Vector Search", provider: "GCP", brand: "GoogleStorage", accountNumber: "crestone-gcp-vertex-03", startYear: 2018, baseSpend: 2100, color: "#4285F4" },
  { id: "acc-gcp-04", name: "GCP - Cloud Spanner Core Banking", provider: "GCP", brand: "GoogleStorage", accountNumber: "crestone-gcp-spanner-04", startYear: 2015, baseSpend: 3400, color: "#4285F4" },
  { id: "acc-gcp-05", name: "GCP - Mobile App Backend Services", provider: "GCP", brand: "GoogleStorage", accountNumber: "crestone-gcp-mobile-05", startYear: 2016, baseSpend: 1850, color: "#4285F4" },
  { id: "acc-gcp-06", name: "GCP - Data Pipelines & Dataflow", provider: "GCP", brand: "GoogleStorage", accountNumber: "crestone-gcp-dataflow-06", startYear: 2015, baseSpend: 1650, color: "#4285F4" },
  { id: "acc-gcp-07", name: "GCP - Global Log Storage & Telemetry", provider: "GCP", brand: "GoogleStorage", accountNumber: "crestone-gcp-logs-07", startYear: 2013, baseSpend: 980, color: "#4285F4" },

  // Snowflake (6 accounts)
  { id: "acc-snow-01", name: "Snowflake - Corporate Analytics DWH", provider: "Snowflake", brand: "Snowflake", accountNumber: "xy82710.east-us-2", startYear: 2015, baseSpend: 3600, color: "#29B5E8" },
  { id: "acc-snow-02", name: "Snowflake - Financial Risk Modeling", provider: "Snowflake", brand: "Snowflake", accountNumber: "seidor-risk.west-eu", startYear: 2017, baseSpend: 2400, color: "#29B5E8" },
  { id: "acc-snow-03", name: "Snowflake - Customer 360 Insights", provider: "Snowflake", brand: "Snowflake", accountNumber: "cust360.us-central", startYear: 2016, baseSpend: 1900, color: "#29B5E8" },
  { id: "acc-snow-04", name: "Snowflake - Data Sharing Cleanroom", provider: "Snowflake", brand: "Snowflake", accountNumber: "cleanroom.eu-west", startYear: 2018, baseSpend: 1450, color: "#29B5E8" },
  { id: "acc-snow-05", name: "Snowflake - Supply Chain Telemetry", provider: "Snowflake", brand: "Snowflake", accountNumber: "supplychain.ap-south", startYear: 2016, baseSpend: 1750, color: "#29B5E8" },
  { id: "acc-snow-06", name: "Snowflake - Real-time Clickstream DWH", provider: "Snowflake", brand: "Snowflake", accountNumber: "clickstream.us-east", startYear: 2017, baseSpend: 2150, color: "#29B5E8" },
];

const endYear = 2025;

// Generate historical consumption for each account
const accounts = ACCOUNT_DEFINITIONS.map((def) => {
  const yearsActive = endYear - def.startYear + 1;
  const history = [];

  for (let y = def.startYear; y <= endYear; y++) {
    const yearProgress = (y - def.startYear) / Math.max(1, yearsActive - 1);
    // Compound growth from 30% of base up to current scale
    const growthScale = 0.3 + yearProgress * 0.7;

    for (let m = 0; m < 12; m++) {
      const monthObj = months[m];
      const seasonalFactor = 0.92 + Math.sin((m / 11) * Math.PI) * 0.16 + (m === 11 ? 0.12 : 0);
      const noise = 0.92 + ((def.id.charCodeAt(m % def.id.length) % 15) / 100);

      const totalAmount = Math.round(def.baseSpend * growthScale * seasonalFactor * noise);
      const compute = Math.round(totalAmount * 0.52);
      const storage = Math.round(totalAmount * 0.23);
      const database = Math.round(totalAmount * 0.18);
      const other = Math.max(0, totalAmount - (compute + storage + database));

      history.push({
        id: `${def.id}-${y}-${String(monthObj.num).padStart(2, '0')}`,
        year: y,
        month: monthObj.short,
        monthFull: monthObj.full,
        monthIndex: m,
        label: `${monthObj.short} ${String(y).slice(-2)}`,
        fullLabel: `${monthObj.full} ${y}`,
        amount: totalAmount,
        compute,
        storage,
        database,
        other,
      });
    }
  }

  // Latest month data (Dec 2025)
  const latestMonthData = history[history.length - 1];

  return {
    id: def.id,
    name: def.name,
    provider: def.provider,
    brand: def.brand,
    accountNumber: def.accountNumber,
    status: "active",
    color: def.color,
    historyStartYear: def.startYear,
    historyEndYear: endYear,
    yearsOfHistory: yearsActive,
    month: `${latestMonthData.monthFull} ${latestMonthData.year}`,
    amount: latestMonthData.amount,
    percentage: 0, // calculated below
    history,
  };
});

// Calculate percentage of total spend for Dec 2025
const totalLatestSpend = accounts.reduce((sum, a) => sum + a.amount, 0);
accounts.forEach((acc) => {
  acc.percentage = Math.max(1, Math.round((acc.amount / totalLatestSpend) * 100));
});

// Generate 8 Drivers with 2 to 4 accounts each
const DRIVER_DEFINITIONS = [
  {
    id: "drv-01",
    code: "DRV-01",
    name: "Centro de Costos Corporativo",
    description: "Distribución de consumo core de producción entre plataformas de nube",
    accountIds: ["acc-aws-01", "acc-azure-01", "acc-snow-01"],
    percentages: [35, 45, 20],
  },
  {
    id: "drv-02",
    code: "DRV-02",
    name: "Operaciones Core Cloud & Cómputo",
    description: "Cómputo e instancias compartidas para backend e infraestructura",
    accountIds: ["acc-aws-02", "acc-gcp-04"],
    percentages: [60, 40],
  },
  {
    id: "drv-03",
    code: "DRV-03",
    name: "Data Engineering & Analytics",
    description: "Pipelines de ingesta analítica, bodegas de datos y consultas",
    accountIds: ["acc-snow-01", "acc-azure-02", "acc-gcp-01"],
    percentages: [45, 30, 25],
  },
  {
    id: "drv-04",
    code: "DRV-04",
    name: "Marketing & Growth Experiments",
    description: "Servicios de experimentación, marketing digital y analítica de usuarios",
    accountIds: ["acc-gcp-02", "acc-aws-06", "acc-snow-03", "acc-azure-03"],
    percentages: [30, 30, 20, 20],
  },
  {
    id: "drv-05",
    code: "DRV-05",
    name: "Seguridad y Redes Corporativas",
    description: "Gateways, VPNs, Active Directory e inspección de tráfico cloud",
    accountIds: ["acc-azure-04", "acc-aws-09", "acc-gcp-07"],
    percentages: [50, 30, 20],
  },
  {
    id: "drv-06",
    code: "DRV-06",
    name: "E-Commerce & Canales Digitales",
    description: "Plataforma de ventas, pasarelas de pago y microservicios de catálogo",
    accountIds: ["acc-aws-06", "acc-azure-08"],
    percentages: [55, 45],
  },
  {
    id: "drv-07",
    code: "DRV-07",
    name: "Machine Learning & AI Platform",
    description: "Modelos predictivos, embeddings vectoriales e inferencia en tiempo real",
    accountIds: ["acc-gcp-03", "acc-aws-05", "acc-azure-05"],
    percentages: [40, 35, 25],
  },
  {
    id: "drv-08",
    code: "DRV-08",
    name: "DevOps & CI/CD Tooling",
    description: "Entornos de pruebas, integración continua y despliegue automatizado",
    accountIds: ["acc-azure-03", "acc-aws-07", "acc-gcp-05", "acc-snow-04"],
    percentages: [35, 25, 25, 15],
  },
];

const drivers = DRIVER_DEFINITIONS.map((drv) => {
  const connections = drv.accountIds.map((accId, idx) => {
    const acc = accounts.find((a) => a.id === accId);
    return {
      id: acc.id,
      name: acc.name,
      brand: acc.brand,
      percentage: drv.percentages[idx],
      color: acc.color,
    };
  });

  return {
    id: drv.id,
    code: drv.code,
    name: drv.name,
    description: drv.description,
    connections,
  };
});

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'accounts.json'), JSON.stringify(accounts, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'drivers.json'), JSON.stringify(drivers, null, 2), 'utf8');

console.log(`Successfully generated:`);
console.log(`- ${accounts.length} accounts with 7-15 years of monthly consumption data in data/accounts.json`);
console.log(`- ${drivers.length} drivers with 2-4 accounts each in data/drivers.json`);
