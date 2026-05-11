import { loadPortalContext } from "@/lib/portal/server";
import { AgentsView } from "./view";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const { snapshot, membership } = await loadPortalContext();
  return <AgentsView snapshot={snapshot} membership={membership} />;
}
