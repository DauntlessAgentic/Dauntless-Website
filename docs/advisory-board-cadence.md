# Client advisory board — quarterly cadence

_Action #35 from the May 2026 client advisory board._

## The cadence

Six clients × 90 minutes × four times a year. Rotate two of the six
each quarter so the board doesn't ossify, while keeping continuity.

## Who's on the board

Maintained in `docs/advisory-board-roster.md` (not checked in — held
in the workspace; redacted for public repos). Each member fits one of
the three named personas (see `docs/personas.md`) plus one financial
sponsor and one operational lead.

## The session

- **Format:** screen-share, narrate as you go. No facilitator
  prompts beyond "what are you trying to do right now?"
- **Length:** 90 minutes hard cap. The board doesn't read briefs.
- **Recording:** with permission. Clips published internally; no
  external sharing.
- **Output:** one written advisory-board report per session, filed in
  `docs/advisory-board/<YYYY-MM>.md`.

## How findings become work

1. Every finding in the report converts to a numbered action.
2. Each action lands in this repo as a comment on a tracking issue.
3. Tier-1 actions (≤1 day) are batched into a "board polish" PR
   within two sprints.
4. Tier-2 and Tier-3 actions enter the regular roadmap with
   provenance: each gets a `// Advisory-board action #N` reference
   in the code.

## What stays unchanged session to session

- The personas (`docs/personas.md`).
- The vocabulary policy (`docs/vocabulary.md`).
- The "third user" principle.
- The default-on safety stance (`docs/safety-stance.md`).

## What we expect from each session

- Two surface-level fixes per persona (six minimum).
- One cross-cutting theme.
- One strategic blind spot.

## Why we keep doing this

Without the board, we drift toward designing for the version of
ourselves who already understands the model. The board's job is to
return us to the version of the user who does not.
