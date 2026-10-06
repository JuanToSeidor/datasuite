const fs = require('fs');
const path = require('path');

const PROVIDER_SERVICES = {
  AWS: [
    { name: "Amazon Elastic Compute Cloud (EC2)", category: "compute", weight: 35 },
    { name: "Amazon Simple Storage Service (S3)", category: "storage", weight: 18 },
    { name: "Amazon Relational Database Service (RDS)", category: "database", weight: 15 },
    { name: "AWS CloudTrail", category: "other", weight: 2.5 },
    { name: "AWS Cost Explorer", category: "other", weight: 1.2 },
    { name: "AWS Glue", category: "other", weight: 3.5 },
    { name: "AWS Key Management Service", category: "other", weight: 2.0 },
    { name: "AWS Secrets Manager", category: "other", weight: 1.8 },
    { name: "AWS Step Functions", category: "other", weight: 2.2 },
    { name: "Amazon EC2 Container Registry (ECR)", category: "compute", weight: 2.0 },
    { name: "Amazon Elastic File System", category: "storage", weight: 3.0 },
    { name: "Amazon Location Service", category: "other", weight: 0.8 },
    { name: "Amazon Simple Email Service", category: "other", weight: 1.0 },
    { name: "Amazon Simple Notification Service", category: "other", weight: 1.2 },
    { name: "Amazon Simple Queue Service", category: "other", weight: 1.5 },
    { name: "CloudWatch Events", category: "other", weight: 2.8 },
    { name: "AWS Lambda", category: "compute", weight: 3.5 },
    { name: "Amazon DynamoDB", category: "database", weight: 3.0 },
    { name: "Tax", category: "other", weight: 4.0 }
  ],
  Azure: [
    { name: "Azure Virtual Machines", category: "compute", weight: 34 },
    { name: "Azure Blob Storage", category: "storage", weight: 18 },
    { name: "Azure SQL Database", category: "database", weight: 16 },
    { name: "Azure Cosmos DB", category: "database", weight: 6 },
    { name: "Azure Kubernetes Service (AKS)", category: "compute", weight: 5 },
    { name: "Azure Key Vault", category: "other", weight: 2 },
    { name: "Azure Monitor & Log Analytics", category: "other", weight: 4 },
    { name: "Azure Functions", category: "compute", weight: 2.5 },
    { name: "Azure Data Factory", category: "other", weight: 3.5 },
    { name: "Azure App Service", category: "compute", weight: 3 },
    { name: "Virtual Network & Bandwidth", category: "other", weight: 2 },
    { name: "Tax", category: "other", weight: 4 }
  ],
  GCP: [
    { name: "Google Compute Engine", category: "compute", weight: 32 },
    { name: "Google Cloud Storage", category: "storage", weight: 19 },
    { name: "Google Cloud SQL", category: "database", weight: 15 },
    { name: "Google BigQuery", category: "database", weight: 12 },
    { name: "Google Kubernetes Engine (GKE)", category: "compute", weight: 6 },
    { name: "Cloud Logging & Monitoring", category: "other", weight: 3.5 },
    { name: "Cloud Key Management Service", category: "other", weight: 1.5 },
    { name: "Cloud Pub/Sub", category: "other", weight: 2.5 },
    { name: "Cloud Functions", category: "compute", weight: 2 },
    { name: "Cloud Spanner", category: "database", weight: 2.5 },
    { name: "Tax", category: "other", weight: 4 }
  ],
  Snowflake: [
    { name: "Virtual Warehouse (Compute)", category: "compute", weight: 58 },
    { name: "Cloud Services Layer", category: "other", weight: 10 },
    { name: "Database Storage & Time Travel", category: "storage", weight: 14 },
    { name: "Fail-safe Storage", category: "storage", weight: 4 },
    { name: "Data Transfer & Egress", category: "other", weight: 3 },
    { name: "Snowpipe Streaming & Ingestion", category: "other", weight: 4 },
    { name: "Serverless Tasks & Streams", category: "compute", weight: 3 },
    { name: "Tax", category: "other", weight: 4 }
  ]
};

function generateServicesForAmount(provider, totalAmount, seedOffset = 0) {
  const serviceDefs = PROVIDER_SERVICES[provider] || PROVIDER_SERVICES.AWS;
  
  // Apply pseudo-random variation based on seed
  const rawItems = serviceDefs.map((s, idx) => {
    const variation = 0.8 + Math.sin(seedOffset * 3.7 + idx * 1.9) * 0.35;
    const effectiveWeight = Math.max(0.1, s.weight * variation);
    return { ...s, effectiveWeight };
  });

  const totalWeight = rawItems.reduce((sum, item) => sum + item.effectiveWeight, 0);

  let distributedSum = 0;
  const services = rawItems.map((item, idx) => {
    const isLast = idx === rawItems.length - 1;
    let amount;
    if (isLast) {
      amount = Math.max(0.5, Math.round((totalAmount - distributedSum) * 100) / 100);
    } else {
      amount = Math.max(0.5, Math.round((totalAmount * (item.effectiveWeight / totalWeight)) * 100) / 100);
      distributedSum += amount;
    }
    const percentage = Math.round((amount / totalAmount) * 1000) / 10;
    return {
      id: `srv-${idx + 1}`,
      name: item.name,
      category: item.category,
      amount,
      percentage
    };
  });

  // Sort descending by amount
  return services.sort((a, b) => b.amount - a.amount);
}

const accountsPath = path.join(__dirname, '..', 'data', 'accounts.json');
const accountsData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));

console.log(`Processing ${accountsData.length} accounts...`);

const updatedAccounts = accountsData.map((acc, accIdx) => {
  const provider = acc.provider || 'AWS';

  // Generate services for each history month
  const enrichedHistory = (acc.history || []).map((h, hIdx) => {
    const seed = accIdx * 1000 + hIdx;
    const services = generateServicesForAmount(provider, h.amount, seed);
    return {
      ...h,
      services
    };
  });

  // Top level services for the current month
  const latestMonthServices = generateServicesForAmount(provider, acc.amount, accIdx * 9999);

  return {
    ...acc,
    services: latestMonthServices,
    history: enrichedHistory
  };
});

fs.writeFileSync(accountsPath, JSON.stringify(updatedAccounts, null, 2), 'utf8');
console.log('Successfully updated accounts.json with detailed internal services breakdown per month!');
