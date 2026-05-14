import { computeNextBestActions } from "@/lib/portal/next-best-actions";
import { buildThisWeekDigest } from "@/lib/portal/digests/this-week";
import { tick as runInnovationEngineTick } from "@/lib/portal/innovation/engine";
import { loadPortalContext } from "@/lib/portal/server";
import { CommandCenterView } from "./command-center-view";

export const dynamic = "force-dynamic";

export default async function PortalCommandCenterPage() {
  const { snapshot, membership } = await loadPortalContext();
  // Phase 5.1: replace the static seeded NBA list with a live-computed one.
  const computedActions = computeNextBestActions({
    decisions: snapshot.decisions,
    engagements: snapshot.engagements,
    artifacts: snapshot.artifacts,
    knowledge: snapshot.knowledge,
    schedule: snapshot.schedule ?? [],
  });
  const enrichedSnapshot = { ...snapshot, nextBestActions: computedActions };
  // Advisory action #13: tick the engine so "What changed for you" has live data.
  await runInnovationEngineTick(snapshot.workspace.id);
  const digest = await buildThisWeekDigest({
    workspaceId: snapshot.workspace.id,
    role: membership.role,
  });
  return (
    <CommandCenterView
      snapshot={enrichedSnapshot}
      membership={membership}
      digest={digest}
    />
  );
}
