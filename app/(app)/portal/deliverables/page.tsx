import { loadPortalContext } from "@/lib/portal/server";
import { DeliverablesView } from "./view";

export const dynamic = "force-dynamic";

export default async function DeliverablesPage() {
  const { snapshot, membership } = await loadPortalContext();
  return <DeliverablesView snapshot={snapshot} membership={membership} />;
}
