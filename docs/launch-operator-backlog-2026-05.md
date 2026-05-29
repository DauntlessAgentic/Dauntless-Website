# Launch Operator Backlog — May 2026

This is the short list of things that still need a human decision, account access,
or production credentials before launch.

## P0 — needs operator action before public launch

1. **Choose and configure error reporting.**
   - Decision needed: Sentry, Vercel Observability, Logflare, or another vendor.
   - I can wire the code once the vendor and DSN/project details are available.
   - Done when a test exception appears in the dashboard with environment and release data.

2. **Enable `main` branch protection in GitHub.**
   - Required checks: `portal-ci / verify` and CodeQL.
   - Also require PR review, block force pushes, and dismiss stale approvals if desired.
   - Done when GitHub refuses direct pushes/merges without the checks.

3. **Confirm the public contact path.**
   - Current safe fallback: the contact form opens a direct email draft instead of pretending to submit.
   - Decision needed: keep email-only for launch, or wire a real form destination such as Resend, HubSpot, Notion, or a database.
   - Done when every public form has a monitored destination and a visible failure path.

4. **Confirm the security mailbox.**
   - `SECURITY.md` lists `security@dauntlessagentic.com` with `craig@dauntlessagentic.com` as fallback.
   - Decision needed: create/monitor the security alias or tell me the right disclosure address.

5. **Set production env vars in the hosting provider.**
   - Minimum public marketing launch: `NEXT_PUBLIC_PORTAL_BASE_URL`, `NEXT_PUBLIC_STEALTH_MODE`.
   - Public portal demo: also set `PORTAL_DEMO_MODE=true`, `PORTAL_API_KEY`, and usually keep `PORTAL_ALLOW_OPEN_API=false`.
   - Real client onboarding: add OAuth, Supabase, export signing, and observability secrets.

## P1 — decide the portal launch contract

1. **Pick the launch shape for `/portal`.**
   - Recommendation: public demo only, with sample data and reset warnings.
   - Alternative: keep `/portal` hidden until Supabase/OAuth/RLS lands.
   - Do not onboard real clients on the in-memory repository.

2. **Decide whether marketing should link to the portal demo.**
   - I did not add a public portal CTA yet because it depends on the demo-mode env decision.
   - Once you approve, I can add a fresh, explicit “View demo portal” link and avoid reviving stale PR #24.

3. **Choose the license/repo-public posture.**
   - Current package metadata is `UNLICENSED`, which matches a private/proprietary repo.
   - If the repo will become public, decide whether it is proprietary/all-rights-reserved, source-available, MIT, Apache-2.0, or something else.

4. **Confirm analytics and consent posture.**
   - Current privacy copy says no third-party analytics cookies are active.
   - If analytics ships on day one, pick the vendor and decide whether to add a cookie/consent banner for GDPR/PIPEDA visitors.

## P2 — real client onboarding work

1. **Complete Phase 2.1 persistence and identity.**
   - Supabase schema, repository adapter, OAuth session mapping, RLS, provisioning scripts, and migration tests.
   - This is the main blocker for real clients.

2. **Move API rate limiting to a shared store.**
   - Choose Redis, Upstash, Vercel KV, or equivalent.
   - Needed before multiple server replicas or real API customers.

3. **Decide webhook product scope.**
   - Current implementation is an in-process event ledger.
   - Real webhooks need HTTP delivery, HMAC signatures, timestamp replay protection, retry/backoff, and per-workspace secrets.

4. **Replace the platform placeholder with real demo proof.**
   - Needs an approved screenshot or short walkthrough capture from the demo portal.
   - I can wire the asset once the portal demo styling/content is approved.

5. **Close or revive stale draft PRs.**
   - Close as superseded: #23, #27, #30.
   - Recreate fresh after demo decision: #24.
   - Defer to Phase 2.1 or later: #25, #26, #29.
   - Cherry-pick useful pieces from #31 if desired; I already added `SECURITY.md` and Dependabot coverage here.

6. **Prune merged `claude/*` branches.**
   - Audit report lists the confirmed merged remote branches.
   - Requires repo-maintainer comfort because it deletes remote branch refs.
