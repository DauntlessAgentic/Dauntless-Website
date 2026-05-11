import { computeRevalidationQueue } from "@/lib/portal/knowledge";
import { loadPortalContext } from "@/lib/portal/server";
import { KnowledgeView } from "./view";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const { snapshot, membership } = await loadPortalContext();
  const revalidationQueue = computeRevalidationQueue(snapshot.knowledge);
  return (
    <KnowledgeView
      snapshot={snapshot}
      membership={membership}
      revalidationQueue={revalidationQueue}
    />
  );
}
