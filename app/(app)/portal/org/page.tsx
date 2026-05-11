import { loadPortalContext } from "@/lib/portal/server";
import { getOrgRollup } from "@/lib/portal/org-rollup";

import { OrgRollupView } from "./view";

export const dynamic = "force-dynamic";

export default async function OrgRollupPage() {
  const { snapshot, membership } = await loadPortalContext();
  const rollup = await getOrgRollup(snapshot.organization.id);
  return <OrgRollupView rollup={rollup} membership={membership} />;
}
