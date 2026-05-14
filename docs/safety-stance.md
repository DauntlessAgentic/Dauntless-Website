# Default-on safety stance

_Action #36 from the May 2026 client advisory board._

## The stance

**Nothing reaches a client system without an explicit two-person path.**

We make this commitment in product. It is not a marketing line. It is
the union of four primitives, default-on for every workspace:

1. **Per-workspace connector enablement.** Only `internal` is enabled
   on a fresh workspace. Owners explicitly add others, one at a time.
   Surface: `/portal/governance` → CONNECTORS card.

2. **Workspace freeze switch.** One button on
   `/portal/help/something-went-wrong` stops every outbound action
   commit and dry-run for the workspace. Reversible at any time.

3. **Propose → Approve → Commit lifecycle.** Every outbound action
   crosses the human/system boundary only at the commit step. The
   approver and the proposer cannot be the same actor for high-risk
   tiers.

4. **Append-only audit log.** Every freeze, enable, propose, approve,
   commit, rollback emits an audit entry that cannot be edited.

The four together form a hard floor. Reducing any of them is a
governance change, not a code change.

## How this gets surfaced to clients

- **In marketing copy.** Lead with the stance, not the agent
  capability. "Agents that can be trusted because they can be stopped."
- **In onboarding.** First-run wizard walks the new workspace owner
  through enabling their first connector. Explicit, audited.
- **In governance.** `/portal/governance` opens with the
  **CONTROLS IN FORCE** card. Marcus's first question is answered
  before he scrolls.
- **In help.** `/portal/help/something-went-wrong` is one click from
  every page footer. The button is big and reversible.

## How we expand autonomy in the future

Reductions in agent autonomy are easy and need no approval.
Expansions require:

1. A written RFC in `docs/rfcs/`.
2. Sign-off from an owner-tier maintainer.
3. An update to `docs/agent-autonomy.md` **before** the code change
   ships.
4. A note in the next quarterly advisory-board session.

## Things that look risky but aren't

- An agent reading a workspace artifact: the artifact is already in
  the workspace; reading doesn't leave.
- An agent drafting an outbound action: the draft sits in
  pending-approval, never executes.
- An agent commenting on a decision: that's an in-portal annotation,
  visible only to workspace members.

## Things that ARE risky and have hard guardrails

- An agent committing an outbound action: requires `propose → approve
  → commit`, an enabled connector, and the workspace not frozen.
- A human committing an outbound action that originated from an
  agent's proposal: same path. We do not treat agent-proposed and
  human-proposed differently at the commit gate; both pass through the
  same validation.
- A workspace owner enabling a new connector: audit-logged with
  tier=medium. The first connector enable for a workspace is also
  flagged in the weekly digest.

## How a client verifies the stance

- Read `/portal/governance` → CONTROLS IN FORCE. Confirms posture.
- Read `docs/agent-autonomy.md` (linked from the same page).
- Inspect a signed bundle. Bundle includes member-id watermark and
  HMAC signature.
- Run the verification CLI: `scripts/verify-bundle.ts`.

If a client can't independently verify the stance, the stance is
just words. The whole point of the audit-log + signed-bundle +
verification-CLI combination is to keep us honest.
