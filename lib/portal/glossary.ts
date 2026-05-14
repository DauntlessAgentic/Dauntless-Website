// ============================================================
// Portal vocabulary glossary
//
// Single source of truth for plain-language definitions of every
// piece of jargon used in the client portal. Surfaces:
//   - <GlossaryTerm> tooltip component (hover/tap)
//   - /portal/help/glossary searchable page
//   - Translation seed for future bilingual support
//
// Adding a term: keep `plain` to one sentence. If you can't write
// it in one sentence, the concept is unclear and the UI shouldn't
// expose the word at all.
//
// Source: client advisory board feedback, May 2026.
// ============================================================

export interface GlossaryEntry {
  /** The term as it appears in the UI. Case-insensitive lookup. */
  term: string;
  /** Plain-language definition. One sentence. */
  plain: string;
  /** Optional extended explanation for the /portal/help page. */
  extended?: string;
  /** Optional category for filtering on the help page. */
  category?: "agents" | "decisions" | "knowledge" | "governance" | "actions" | "innovation";
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "Canonical",
    category: "knowledge",
    plain:
      "The official version we promote across engagements — when an artifact becomes canonical, the rest of the workspace can reuse it as a trusted reference.",
    extended:
      "Canonical promotion happens after an audit step. Once promoted, the artifact appears in the Bookshelf for every engagement and is the default version cited by agents.",
  },
  {
    term: "Archetype",
    category: "agents",
    plain:
      "A type of agent role (e.g. Engagement Analyst, Risk Inspector). The archetype defines what tools the agent can use and what it is allowed to do.",
  },
  {
    term: "Bookshelf",
    category: "knowledge",
    plain:
      "The library of canonical artifacts in your workspace — the things we've decided are worth reusing across engagements.",
  },
  {
    term: "Engagement",
    category: "decisions",
    plain:
      "A scoped piece of work for a client — a discovery, design, build, activation, or advisory phase. Each engagement has its own decisions, artifacts, and tasks.",
  },
  {
    term: "Handoff",
    category: "agents",
    plain:
      "When one agent passes work to another (e.g. the Analyst hands a draft to the Risk Inspector). Every handoff is audit-logged and respects separation of powers.",
  },
  {
    term: "Next-Best-Course-of-Action",
    category: "innovation",
    plain:
      "A ranked recommendation for what to do next, based on the current state of decisions, signals, and engagements.",
    extended:
      "Sometimes shortened to NBCA. It operates over a multi-quarter horizon and weighs reversibility and option value alongside raw impact.",
  },
  {
    term: "Eval lift",
    category: "agents",
    plain:
      "How much better a fine-tuned agent scores against the workspace's quality benchmark, compared to the base model. We gate model rollouts on this.",
  },
  {
    term: "Dry-run",
    category: "actions",
    plain:
      "A test execution that simulates an outbound action without actually doing it. Use it to preview what would happen before approving the real call.",
    extended:
      "Only some connectors support dry-run. When supported, the dry-run returns a structured preview of the payload that would be sent.",
  },
  {
    term: "Inverse plan",
    category: "actions",
    plain:
      "The pre-recorded rollback sequence for an outbound action — what we would do to undo it if approved-and-committed turns out to be wrong.",
  },
  {
    term: "Separation of powers",
    category: "governance",
    plain:
      "A rule that prevents the same agent from both proposing and approving a high-risk decision. Different archetypes hold different powers.",
  },
  {
    term: "Risk tier",
    category: "governance",
    plain:
      "How careful we need to be with this decision or action. Low: routine. Medium: needs a manager. High: needs an approver and a second pair of eyes.",
  },
  {
    term: "Pending approval",
    category: "decisions",
    plain:
      "A decision an agent or team member has proposed, waiting for a human approver to accept, modify, or reject it.",
  },
  {
    term: "Outbound action",
    category: "actions",
    plain:
      "An action that touches a system outside the portal — creating a Jira ticket, sending an email, posting a Slack message. Every outbound action follows propose → approve → commit.",
  },
  {
    term: "Signed bundle",
    category: "governance",
    plain:
      "An exported file (Impact Report, audit log) with a tamper-evident signature footer and a watermark identifying who exported it. Suitable for audit and procurement.",
  },
  {
    term: "Innovation rate",
    category: "innovation",
    plain:
      "The share of your workspace's artifacts that have been promoted to canonical. Roughly: how much of your output is reusable.",
  },
  {
    term: "Pattern library",
    category: "innovation",
    plain:
      "A collection of proven approaches we've used across engagements. Each pattern has a maturity (emergent, validated, canonical) and an applicability tag set.",
  },
  {
    term: "Telemetry event bus",
    category: "governance",
    plain:
      "The internal stream of things-that-happened in your workspace. Audit log, agent runs, decisions proposed — everything flows through it.",
  },
  {
    term: "Workspace",
    category: "governance",
    plain:
      "An isolated slice of the portal for a single client or business unit. Everything (decisions, artifacts, audit log) is scoped to a workspace.",
  },
  {
    term: "Audit log",
    category: "governance",
    plain:
      "An append-only record of every action — agent or human — taken in this workspace. Cannot be edited or deleted after the fact.",
  },
  {
    term: "Canonical promotion",
    category: "knowledge",
    plain:
      "The act of marking an artifact as the official, reusable version. Requires an audit step. Reverberates across engagements.",
  },
  {
    term: "Membership",
    category: "governance",
    plain:
      "Your role inside a specific workspace — Owner, Approver, Manager, Read-only, or Auditor. Determines what you can see and do.",
  },
];

/** Look up a single term, case-insensitive. */
export function findGlossaryEntry(term: string): GlossaryEntry | null {
  const normalized = term.trim().toLowerCase();
  return (
    GLOSSARY.find((e) => e.term.toLowerCase() === normalized) ??
    GLOSSARY.find((e) => e.term.toLowerCase().includes(normalized)) ??
    null
  );
}

/** Search the glossary by free text against term + plain + extended. */
export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY.slice();
  return GLOSSARY.filter((e) => {
    const hay = `${e.term} ${e.plain} ${e.extended ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Group entries by category for the help page. */
export function groupGlossaryByCategory(): Record<string, GlossaryEntry[]> {
  const out: Record<string, GlossaryEntry[]> = {};
  for (const e of GLOSSARY) {
    const key = e.category ?? "other";
    if (!out[key]) out[key] = [];
    out[key].push(e);
  }
  return out;
}
