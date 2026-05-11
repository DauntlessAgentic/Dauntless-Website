import { loadPortalContext } from "@/lib/portal/server";
import { EngagementsView } from "./view";

export const dynamic = "force-dynamic";

export default async function EngagementsPage() {
  const { snapshot, membership } = await loadPortalContext();
  return <EngagementsView snapshot={snapshot} membership={membership} />;
}
