import { loadPortalContext } from "@/lib/portal/server";
import {
  buildDecisionTree,
  DEFAULT_SCENARIOS,
  runScenarioSimulations,
} from "@/lib/portal/innovation/simulator";
import {
  listPatterns,
  matchPatternsForEngagement,
} from "@/lib/portal/innovation/patterns";

import { InnovationStudioView } from "./view";

export const dynamic = "force-dynamic";

export default async function InnovationStudioPage() {
  const { snapshot, membership } = await loadPortalContext();
  const patterns = listPatterns();

  // Pick the top pending high-risk decision for the tree visualization.
  const topDecision =
    snapshot.decisions.find((d) => d.status === "pending-approval" && d.riskTier === "high") ??
    snapshot.decisions.find((d) => d.status === "pending-approval") ??
    snapshot.decisions[0];

  const tree = topDecision ? buildDecisionTree(topDecision) : null;
  const simulations = runScenarioSimulations({
    scenarios: DEFAULT_SCENARIOS,
    metrics: snapshot.metrics,
    engagements: snapshot.engagements,
  });

  // Pattern matching keyed by the first active engagement for the
  // landing view; the client can switch engagements via dropdown.
  const focusEngagement =
    snapshot.engagements.find((e) => e.status === "active") ?? snapshot.engagements[0];
  const matches = focusEngagement
    ? matchPatternsForEngagement(focusEngagement.successCriteria, focusEngagement.kind)
    : [];

  // Innovation rate = canonical share among artifacts produced in the
  // active workspace; rough but useful.
  const innovationRate =
    snapshot.artifacts.length === 0
      ? 0
      : snapshot.artifacts.filter((a) => a.canonical).length / snapshot.artifacts.length;

  return (
    <InnovationStudioView
      patterns={patterns}
      simulations={simulations}
      tree={tree}
      decision={topDecision}
      engagements={snapshot.engagements}
      focusEngagement={focusEngagement}
      initialMatches={matches}
      innovationRate={innovationRate}
      membership={membership}
    />
  );
}
