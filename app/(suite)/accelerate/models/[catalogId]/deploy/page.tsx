import { DeployWizard } from "@/components/accelerate/deploy/DeployWizard";
import catalog from "@/data/accelerate/catalog.json";

export function generateStaticParams() {
  return catalog.map((item) => ({ catalogId: item.id }));
}

export default async function AccelerateDeployPage({
  params,
}: {
  params: Promise<{ catalogId: string }>;
}) {
  const { catalogId } = await params;
  return <DeployWizard catalogId={catalogId} />;
}
