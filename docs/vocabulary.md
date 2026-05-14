# Portal vocabulary policy

_Action #33 from the May 2026 client advisory board._

## The rule

Every piece of jargon used in the client portal must have a single,
plain-language definition in `lib/portal/glossary.ts`. New jargon
requires a maintainer's PR comment before it ships in a user-facing
surface.

If you cannot write the definition in one sentence, the concept is
unclear and the UI should not expose the word at all.

## How to use it

- Wrap glossary terms in client-facing copy with
  `<GlossaryTerm>` from `components/patterns/glossary-term.tsx`.
  Hovering reveals the same plain-language definition that ships
  on `/portal/help/glossary`.
- When you find a term in `app/(app)/portal/**` that is not in
  `lib/portal/glossary.ts`, either remove the term, replace it with a
  plain-language synonym, or add a glossary entry — in that order of
  preference.
- Internal docs (`docs/**`, code comments) can use any jargon. This
  policy is about user-facing copy only.

## How `/ultrareview` enforces it

The portal ultrareview rubric includes a vocabulary lint pass that
flags any client-facing string containing a term from the glossary
list that is NOT wrapped in `<GlossaryTerm>`. Reviewers are asked to
either tooltip the term or replace it.

## How translations stay in sync

`lib/portal/i18n/dictionary.ts` is the single source of truth for
EN/FR strings. Glossary entries have a parallel `gloss.<term>` id in
the dictionary; the i18n review pass enforces parity.

## What goes in the glossary

- Process words: canonical, archetype, bookshelf, engagement,
  handoff, NBCA, eval lift, dry-run, inverse plan
- Role words: separation of powers, risk tier, pending approval
- Object words: outbound action, signed bundle, innovation rate,
  pattern library, telemetry event bus, audit log
- Identity words: workspace, membership

## What does NOT go in the glossary

- Generic software terms (button, page, form, save).
- Brand or marketing language (e.g. "Strategic Partner tier") —
  those belong in `docs/marketing-positioning.md`.
- One-off project codenames.

## Banned words in client copy

Internal-only words to **never** ship in client-facing copy:

- "Phase 7.1" (internal milestone naming — say what it does instead)
- "Mem-palace" (memory architecture jargon)
- "Strategist" / "Inspector" as a noun without "Agent" suffix
- "Promote-to-canonical" without a tooltip
- "Tier" used without a number or label (e.g. say "risk tier" not "tier")

If you find these in a PR diff, ask the author to rephrase. We are
losing trust every time a client googles one of our words.
