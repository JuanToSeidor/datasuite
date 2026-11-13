import { NodeFormScreen } from "@/components/move/nodes/NodeForm";
import nodesData from "@/data/move/nodes.json";

/** Export estático (GitHub Pages): una página de edición por nodo. */
export function generateStaticParams() {
  return nodesData.map((node) => ({ nodeId: node.id }));
}

export default async function MoveEditNodePage({
  params,
}: {
  params: Promise<{ nodeId: string }>;
}) {
  const { nodeId } = await params;
  return <NodeFormScreen mode="edit" nodeId={nodeId} />;
}
