import { notFound } from "next/navigation";

import { FEEDBACK_SCENARIOS } from "@/lib/portal/feedback/scenarios";
import { loadPortalContext } from "@/lib/portal/server";

import { FeedbackHarnessView } from "./view";

// Internal-only surface. Audit-2 §M1: ungated would leak the QA scenario
// list (persona names, internal time-on-task targets) to anyone hitting
// the URL in production.
export const dynamic = "force-dynamic";

export default async function FeedbackHarnessPage() {
  const { membership } = await loadPortalContext();
  const isAuthorized =
    membership.status === "dev-bypass" ||
    (membership.status === "member" &&
      membership.membership &&
      (membership.membership.role === "owner" ||
        membership.membership.role === "auditor"));
  if (!isAuthorized) {
    notFound();
  }
  return <FeedbackHarnessView scenarios={FEEDBACK_SCENARIOS} />;
}
