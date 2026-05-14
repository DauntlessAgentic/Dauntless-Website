import { FEEDBACK_SCENARIOS } from "@/lib/portal/feedback/scenarios";

import { FeedbackHarnessView } from "./view";

export const dynamic = "force-static";

export default function FeedbackHarnessPage() {
  return <FeedbackHarnessView scenarios={FEEDBACK_SCENARIOS} />;
}
