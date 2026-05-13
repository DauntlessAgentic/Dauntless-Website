# Launch Readiness Checklist

The concrete checklist for flipping the marketing site out of stealth.

Pre-launch §A11. Use this doc when client onboarding is within ~2 weeks
(when the launch-eve sprint kicks off). Walk it top-to-bottom; each box
ships independently.

The companion docs are:
- `docs/pre-launch-plan.md` — the full pre-launch action queue.
- `docs/client-portal-roadmap.md` — phase-by-phase launch posture.

---

## 1 · Identity & stealth-mode switch

The stealth switch lives in `config/identity.ts` and is controlled by
the `NEXT_PUBLIC_STEALTH_MODE` env var. It is a build-time variable —
changes take effect only after redeploy.

### Audit (from this run)

- [x] `config/identity.ts` defines a single `STEALTH` boolean from
      `process.env.NEXT_PUBLIC_STEALTH_MODE === "true"`. Every
      identity-bearing field branches off that one boolean.
- [x] Stealth fields covered: founder name / title / photo / bio,
      contact email, LinkedIn, personal website, about-page
      title/description, background line items, testimonial wording,
      Schema.org `sameAs`.
- [x] `tests/portal/identity-stealth.test.mjs` (Pre-launch §A11) pins
      the contract so a future refactor of `identity.ts` that removes a
      stealth path fails fast.

### Flip steps (launch-eve)

1. **Verify founder assets exist on disk.**
   - `public/images/craig-headshot.jpg` — required for `founderPhoto`.
2. **Verify content is review-ready** (search across every page that
   reads `identity.founderName`, `identity.linkedIn`, etc.):
   ```sh
   grep -rn "identity\." app/ components/ | grep -v node_modules
   ```
3. **Set the env var.** In Vercel: Project Settings → Environment
   Variables → set `NEXT_PUBLIC_STEALTH_MODE=false` (or remove the
   variable). Redeploy.
4. **Verify the change rendered**:
   - [ ] Homepage founder card shows Craig Marchand + photo.
   - [ ] Contact page email reads `craig@dauntlessagentic.com`.
   - [ ] About page title reads "About — Craig Marchand".
   - [ ] LinkedIn link/card surfaces on the marketing footer + relevant
         pages.
   - [ ] Consulting page testimonial reads "Working with Craig's
         team…".
   - [ ] Homepage Schema.org JSON-LD includes the LinkedIn URL in
         `sameAs`.

### Rollback

Set `NEXT_PUBLIC_STEALTH_MODE=true` and redeploy. The stealth fallback
strings are battle-tested through the pre-launch period.

---

## 2 · Marketing surface readiness

### Metadata + OG cards

- [x] Every marketing route has `title` + `description` (verified via
      Pre-launch §A10 PR).
- [x] Every marketing route has `openGraph` + `twitter` blocks.
- [x] Root layout sets `metadataBase` so relative OG image URLs
      resolve.
- [ ] **Final OG image asset shipped at `/public/og-default.png`** (1200×630).
- [ ] Per-route OG images for `/platform`, `/services/*`, `/work`,
      `/case-studies/*` (optional polish; the default works fine).

### Structured data (Schema.org)

- [x] Homepage emits `ProfessionalService` JSON-LD.
- [x] Every services subpage emits `Service` JSON-LD (Pre-launch §A10).
- [x] case-studies/[slug] generates per-slug metadata via
      `generateMetadata`.
- [ ] Optional: add `Article` JSON-LD to insights pages once content
      lands.

### Sitemap + robots

- [x] `app/sitemap.ts` lists 20 marketing routes with stable
      `lastModified` anchored to a constant (Pre-launch §A10).
- [x] `public/robots.txt` allows everything and points at the sitemap.
- [ ] Optional: add a `Disallow: /portal/` block if the portal stays
      gated. (Today it's dev-bypass and discoverable; the marketing
      story benefits from search engines indexing `/portal/about` as
      product proof. Re-evaluate at launch-eve.)

### Lighthouse / a11y

- [ ] Run Lighthouse on the top 8 marketing routes; target ≥ 90 across
      Performance / Accessibility / Best Practices / SEO.
- [ ] Run axe-core on the top 8 routes; expect 0 critical / 0 serious
      violations.
- [ ] Fix any token contrast misses against WCAG AA.

---

## 3 · Portal surface readiness

### Demo experience

- [x] `Try the live portal demo` CTA on homepage + platform hero
      (Pre-launch §A4 PR).
- [x] `/portal` deep-link surfaces the demo-mode banner with a 5-minute
      guided-tour link to `/portal/help`.
- [x] OG metadata on `/portal` so the deep link previews well.
- [x] The portal boots in dev-bypass mode end-to-end with the
      in-memory repository.

### Data layer (launch-eve work)

- [ ] **Phase 2.1 lands**: real Supabase + Google OAuth (see
      `docs/pre-launch-plan.md` §B1).
- [ ] `PORTAL_DEV_BYPASS=false` set in production.
- [ ] Real Membership rows for the first onboarded client.
- [ ] Real workspace seeded via the one-shot provisioning script.

### Agent layer

- [x] Engagement Analyst runs in stub mode end-to-end (Phase 3.0
      shipped).
- [ ] **Set `ANTHROPIC_API_KEY`** when the eval-harness sprint
      (Pre-launch §A1) is ready to validate real model calls.
- [ ] Per-agent cost budget caps set before any client traffic.

### API surface

- [x] `/portal/api` surface lists the 7 REST endpoints.
- [x] Workspace-scoped tokens issuable from `/portal/api` (Pre-launch
      §A7 PR).
- [ ] Public-facing API docs site (optional; the in-portal explorer
      may be enough).
- [ ] Per-token rate limits set before any external traffic.

---

## 4 · Operational readiness

### Branch hygiene

- [ ] **Enable "Automatically delete head branches"** in repo
      Settings → General → Pull Requests. Sweeps every merged
      pre-launch branch and prevents the buildup going forward.
- [ ] Branch protection rule on `main`: require `verify` CI check;
      require pull-request review.

### CI / testing

- [x] `.github/workflows/portal-ci.yml` runs lint + typecheck + test +
      build on every PR.
- [x] Lint at 0 errors, warnings ≤ 1 (Pre-launch cleanup PR).
- [ ] Playwright golden-path e2e (Pre-launch §A3) — install
      `@playwright/test`, add 5 critical-path tests, extend the CI
      workflow with a `e2e` job.

### Observability

- [x] Every portal mutation emits an audit-log entry + a typed
      `PortalEvent` (Phase 6 telemetry bus).
- [ ] Real telemetry persistence (Phase 6.1, launch-eve work).
- [ ] Sentry / equivalent error reporting wired before any client
      traffic.

---

## 5 · Cutover sequence (the day of)

Run in this order with ~15 minutes per checkpoint:

1. Set `NEXT_PUBLIC_STEALTH_MODE=false` in Vercel; trigger a redeploy.
2. Verify the marketing surface rendered correctly (use the §1 audit
   checklist above).
3. Push the launch announcement (LinkedIn / Twitter / etc.).
4. Watch the analytics dashboard for traffic; verify no 500s in the
   error log.
5. Watch the portal `/api/portal/v1/*` access log for unexpected
   traffic patterns.
6. Take a moment.

---

*Compiled 2026-05-13 as part of the pre-launch Pre-launch §A11 audit.
Update this doc when items ship or new gaps surface.*
