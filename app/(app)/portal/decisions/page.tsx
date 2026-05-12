import { loadPortalContext } from "@/lib/portal/server";
import { DecisionsView } from "./view";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  const { snapshot, membership } = await loadPortalContext();
  return <DecisionsView snapshot={snapshot} membership={membership} />;
}
