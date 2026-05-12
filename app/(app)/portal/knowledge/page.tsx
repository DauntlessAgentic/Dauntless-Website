import { loadPortalContext } from "@/lib/portal/server";
import { KnowledgeView } from "./view";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const { snapshot, membership } = await loadPortalContext();
  return <KnowledgeView snapshot={snapshot} membership={membership} />;
}
