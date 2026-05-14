// ============================================================
// Lightweight user-testing scenarios (Advisory action #29)
//
// Six scripted scenarios seeded from the May 2026 advisory board.
// Used by the in-portal feedback harness at /portal/dev/feedback.
// Logs time-on-task + start/end paths to the existing event bus
// so we don't need a third-party tool.
// ============================================================

export interface FeedbackScenario {
  id: string;
  title: string;
  persona: "priya" | "marie" | "marcus" | "lena" | "jim" | "sanjay";
  task: string;
  startAt: string;
  successCriterion: string;
  targetSeconds: number;
}

export const FEEDBACK_SCENARIOS: FeedbackScenario[] = [
  {
    id: "approve-high-risk-decision",
    title: "Approve a high-risk pending decision",
    persona: "marie",
    task: "Find the highest-risk pending-approval decision in this workspace, read its evidence, and approve it.",
    startAt: "/portal",
    successCriterion: "Decision status flips to approved + audit entry created.",
    targetSeconds: 90,
  },
  {
    id: "export-signed-audit-log",
    title: "Export a signed audit-log bundle for compliance",
    persona: "marcus",
    task: "Generate a tamper-evident audit-log bundle and verify the manifest watermark.",
    startAt: "/portal/governance",
    successCriterion: "File downloaded with signature footer; manifest shows correct workspace + member.",
    targetSeconds: 60,
  },
  {
    id: "find-pattern-for-engagement",
    title: "Find a pattern that fits an active engagement",
    persona: "priya",
    task: "Open the Innovation Studio, find one pattern that fits the first active engagement.",
    startAt: "/portal/innovation",
    successCriterion: "User reads a pattern card and clicks its 'Open engagement' deep-link.",
    targetSeconds: 45,
  },
  {
    id: "freeze-and-unfreeze",
    title: "Freeze and unfreeze outbound actions",
    persona: "lena",
    task: "Use the safety switch to freeze all outbound actions, then lift the freeze.",
    startAt: "/portal/help/something-went-wrong",
    successCriterion: "Two audit entries recorded; subsequent commit blocked then permitted.",
    targetSeconds: 30,
  },
  {
    id: "weekly-digest",
    title: "Find this week's three priority items",
    persona: "sanjay",
    task: "From the Command Center, identify the three things you most need to act on this week.",
    startAt: "/portal",
    successCriterion: "User scrolls 'This Week' card and clicks into one item.",
    targetSeconds: 30,
  },
  {
    id: "glossary-lookup",
    title: "Look up an unfamiliar term",
    persona: "jim",
    task: "Hover the word 'canonical' on any page and read its plain-language definition.",
    startAt: "/portal/knowledge",
    successCriterion: "Tooltip appears and user reads the definition.",
    targetSeconds: 20,
  },
];

export function findScenario(id: string): FeedbackScenario | null {
  return FEEDBACK_SCENARIOS.find((s) => s.id === id) ?? null;
}
