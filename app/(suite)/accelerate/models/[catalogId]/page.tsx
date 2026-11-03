import { CatalogDetailView } from "@/components/accelerate/detail/CatalogDetailView";
import catalog from "@/data/accelerate/catalog.json";

/** Export estático (GitHub Pages): una página por ACT-IN del catálogo. */
export function generateStaticParams() {
  return catalog.map((item) => ({ catalogId: item.id }));
}

export default async function AccelerateCatalogDetailPage({
  params,
}: {
  params: Promise<{ catalogId: string }>;
}) {
  const { catalogId } = await params;
  return <CatalogDetailView catalogId={catalogId} />;
}
