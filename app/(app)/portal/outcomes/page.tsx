import { loadPortalContext } from "@/lib/portal/server";
import { OutcomesView } from "./view";

export const dynamic = "force-dynamic";

export default async function OutcomesPage() {
  const { snapshot, membership } = await loadPortalContext();
  return <OutcomesView snapshot={snapshot} membership={membership} />;
}
