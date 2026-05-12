import { loadPortalContext } from "@/lib/portal/server";

import { HelpView } from "./view";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const { membership } = await loadPortalContext();
  return <HelpView membership={membership} />;
}
