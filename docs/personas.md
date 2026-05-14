# Portal personas — design + review

_Actions #28 and #34 from the May 2026 client advisory board._

We design for **the third user**, not the first user. Every new
portal surface ships with a "Priya test" outcome recorded in the PR
description.

## The three named personas

### Priya — the daily user

- Service designer at a federal department.
- Mid-level, mid-career. Knows Figma, Miro, Notion.
- Has been burned by three "enterprise transformation" platforms in
  five years.
- Mental model: "If I can't accomplish my primary task in 60 seconds
  the first time, I close the tab."
- Reads slowly when the vocabulary is unfamiliar. Skims when it isn't.

**The Priya test:** can a moderately tech-comfortable, time-pressed
daily user accomplish this surface's primary task in under 60 seconds
without help? If no, the surface is not ready.

### Marie — the federal sponsor

- Director General, bilingual, age 50+.
- 27 years in government. Briefs her ADM weekly.
- Translates pages back to French in her head before reading.
- Risk-averse. Will never click a button without a tooltip first.
- Cares deeply about audit trail and accessibility.

**The Marie test:** can a non-technical bilingual sponsor read the
page, understand the operational state, and brief upward — in either
language — without an internal translator?

### Marcus — the security officer

- Information Security Officer at a regulated enterprise.
- The only person who reads release notes.
- Asks "what controls are in force right now?" first.
- Approves connector by connector, never in bulk.

**The Marcus test:** is the security posture of this surface
discoverable from the surface itself, without scrolling, without
opening a second tab, without asking us?

## How this routes into review

Every PR description that adds a new client-facing surface includes a
**Personas test** section, with one line per persona:

```
## Personas test

- Priya: completed propose-a-decision flow in 38s on the first try.
- Marie: tooltipped every term; FR translation queued in dictionary.ts.
- Marcus: surface exposes posture in the top fold; no scroll required.
```

If you can't fill out all three lines, the PR is not ready.

## Anti-personas

We are **not** designing for:

- The CTO who wants every knob exposed at all times.
- The system integrator who wants to wire arbitrary connectors
  without approval.
- The marketing copywriter who wants every page to "tell a story".

If your design decision serves an anti-persona, pause and recheck.

## Reviewing for empathy

Common failure modes the reviewer should flag:

- **Acronym soup.** If a non-internal reader has to Google a word on
  the page, the page is not ready.
- **Density without trade.** Tiles overflow on a 1366×768 laptop at
  150% zoom. Always test there.
- **Action-without-trust.** Every destructive button needs a
  `<ConfirmAction>` modal or a clear undo path.
- **Help that is not help.** If `/portal/help/X` reads like
  developer notes instead of a runbook, it is not help.
