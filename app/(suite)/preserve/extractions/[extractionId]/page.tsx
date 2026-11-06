import { ExtractionDetailView } from "@/components/preserve/extractions";
import extractionsData from "@/data/preserve/extractions.json";

/** Export estático (GitHub Pages): una página por extracción. */
export function generateStaticParams() {
  return extractionsData.extractions.map((extraction) => ({
    extractionId: extraction.id,
  }));
}

export default async function PreserveExtractionDetailPage({
  params,
}: {
  params: Promise<{ extractionId: string }>;
}) {
  const { extractionId } = await params;
  return <ExtractionDetailView extractionId={extractionId} />;
}
