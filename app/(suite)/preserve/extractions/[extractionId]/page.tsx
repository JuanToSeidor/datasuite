import { ExtractionDetailView } from "@/components/preserve/extractions";
import extractionsData from "@/data/preserve/extractions.json";
import extractionDetails from "@/data/preserve/extractionDetails.json";

/**
 * Export estático (GitHub Pages): una página por extracción del listado y por cada detalle
 * (incluye la extracción en vivo del primer despliegue, que no figura en el listado base).
 */
export function generateStaticParams() {
  const ids = new Set([
    ...extractionsData.extractions.map((extraction) => extraction.id),
    ...Object.keys(extractionDetails),
  ]);
  return [...ids].map((extractionId) => ({ extractionId }));
}

export default async function PreserveExtractionDetailPage({
  params,
}: {
  params: Promise<{ extractionId: string }>;
}) {
  const { extractionId } = await params;
  return <ExtractionDetailView extractionId={extractionId} />;
}
