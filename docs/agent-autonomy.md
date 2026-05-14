# Agent autonomy stance

_Source: client advisory board, May 2026. Adopted as policy in PR following actions #16, #19, #32._

This document is a one-page answer to the question Lena asked at the
advisory board: **"If a bot books a meeting on my calendar that
shouldn't be there, what do I do?"**

It also answers the question Marcus asked: **"What controls are in
force right now?"**

If you can't find the answer to your question here, the answer is
"ask a human" — that's by design.

---

## What agents CAN do without explicit human approval

- **Read** anything the workspace member who triggered them can read.
- **Draft** an artifact, a decision, an outbound action proposal — any
  of these land in pending-approval state, not committed state.
- **Run analyses** against telemetry, signals, the audit log.
- **Propose** the next best action and surface it on the Innovation
  Studio engine card.
- **Comment** on artifacts, decisions, engagements.

Reading and drafting are not visible to anything outside the portal.

## What agents need approval for

- **Promoting an artifact to canonical** — requires a human in the
  owner / executive / lead role.
- **Approving a decision** — only humans in owner or executive role
  can approve. Agents cannot self-approve.
- **Committing an outbound action** — connector + capability + payload
  all validated before commit. A human in owner / executive / lead
  role must approve. Some connectors require dry-run first.
- **Promoting a model into production** — requires a measurable eval
  lift over the current baseline and a human pull-the-lever step.

## What agents will NEVER do autonomously

These four boundaries are hard-coded. No configuration, no
workspace setting, no agent prompt can move them:

1. **Send communication outside the workspace** without human approval.
   No email, no Slack DM, no calendar invite, no Jira comment goes
   out without a human approving the specific payload.
2. **Modify the audit log.** It is append-only. Even owners can't
   redact entries — only soft-archive them.
3. **Disable their own guardrails.** An agent can't enable a
   connector, lift a workspace freeze, or change its own tool
   catalog. Those are workspace-owner actions only.
4. **Approve a decision they proposed.** Separation of powers is
   enforced at the tool catalog level, not at runtime. Different
   archetypes hold different powers.

## Controls in force, plain English

- **Per-workspace connector enablement.** Connectors are off by default.
  Only `internal` (in-portal signal posts) is enabled on a fresh
  workspace. Owners explicitly add the rest, one at a time.
- **Workspace freeze switch.** A single button on
  `/portal/help/something-went-wrong` stops every outbound action
  commit and dry-run for this workspace. Reversible at any time.
- **Propose-time payload validation.** Every outbound action payload
  is validated against a zod schema *before* it can sit in
  pending-approval. Malformed payloads can't accumulate.
- **HMAC-signed evidence exports.** Impact Reports and audit-log
  exports are signed with a per-workspace key and watermarked with
  the requesting member.
- **Rate limiting.** Per-token + per-IP token bucket on every
  `/api/portal/v1` route. Burst 30, refill 5/sec by default.
- **Constant-time bearer comparison.** No timing oracle on API tokens.
- **CodeQL.** Static analysis runs on every PR + weekly cron.
- **Append-only audit log.** Every action — agent or human — flows
  through it. Including the freeze switch.

## What to do if something feels wrong

In order:

1. Press the freeze button on `/portal/help/something-went-wrong`.
   No technical knowledge required. Reversible.
2. Take a screenshot.
3. Open `/portal/governance` → audit log. Filter to "agent" actor
   kind and scan the last few hours.
4. Tell a human teammate. Workspace owners get notified
   automatically.
5. When ready, lift the freeze.

---

## How this document evolves

This stance is **conservative on purpose**. If a future capability
requires looser bounds, the change goes through:

1. A written RFC in `docs/rfcs/`.
2. A signed-off review by an owner-tier member.
3. An update to this document **before** the code change ships.

Reductions in agent autonomy are easy. Expansions require a paper
trail.
