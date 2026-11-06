import { VaultDetailView } from "@/components/preserve/vaults";
import vaultsData from "@/data/preserve/vaults.json";

/** Export estático (GitHub Pages): una página por archivo. */
export function generateStaticParams() {
  return vaultsData.vaults.map((vault) => ({ archiveId: vault.id }));
}

export default async function PreserveVaultDetailPage({
  params,
}: {
  params: Promise<{ archiveId: string }>;
}) {
  const { archiveId } = await params;
  return <VaultDetailView vaultId={archiveId} />;
}
