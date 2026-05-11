import { computeCrossEngagementSuggestions } from "@/lib/portal/cross-engagement";
import { loadPortalContext } from "@/lib/portal/server";
import { EngagementsView } from "./view";

export const dynamic = "force-dynamic";

export default async function EngagementsPage() {
  const { snapshot, membership } = await loadPortalContext();
  const crossSuggestions = computeCrossEngagementSuggestions(
    snapshot.engagements,
    snapshot.artifacts,
  );
  return (
    <EngagementsView
      snapshot={snapshot}
      membership={membership}
      crossSuggestions={crossSuggestions}
    />
  );
}
