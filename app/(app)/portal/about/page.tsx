import {
  getCoverageByTier,
  getShippedCount,
  ROADMAP_STATUS,
} from "@/lib/portal/roadmap-status";
import { loadPortalContext } from "@/lib/portal/server";

import { AboutView } from "./view";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { membership } = await loadPortalContext();
  return (
    <AboutView
      phases={ROADMAP_STATUS}
      shippedCount={getShippedCount()}
      coverage={getCoverageByTier()}
      membership={membership}
    />
  );
}
