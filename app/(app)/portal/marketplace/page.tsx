import {
  listInstalls,
  listListings,
  listPayouts,
} from "@/lib/portal/marketplace/store";
import { loadPortalContext } from "@/lib/portal/server";

import { MarketplaceView } from "./view";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const { snapshot, membership } = await loadPortalContext();
  const listings = listListings();
  const installs = listInstalls(snapshot.workspace.id);
  const payouts = listPayouts();
  return (
    <MarketplaceView
      membership={membership}
      listings={listings}
      installs={installs}
      payouts={payouts}
    />
  );
}
