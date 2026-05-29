# SECURITY_AUDIT.md

> **Resolution update (May 2026):** the original 2 HIGH and 4 of 6 MEDIUM
> findings have been closed by the post-audit hardening pass (Phases A–E,
> PRs #33–#37) and the Client Advisory Board polish (PRs #39–#43). See
> the **Resolution status** table immediately below the TL;DR. The
> remaining open items are explicitly Phase 2.1-gated (await real OAuth +
> Supabase). Current default-on posture is documented in
> `docs/safety-stance.md`.

**Audit date**: 2026-05-12
**Audit scope**: every line of code on `main` at commit `95f77f7`, plus
the npm dependency tree, the CI workflow, and the runtime configuration
posture.
**Audit method**: static review across dependencies, secrets, AuthN/AuthZ,
server actions, API surface, XSS sinks, anonymization, supply chain.

This audit is **point-in-time**. Phase 2.1 hasn't shipped yet, so several
findings are framed as "latent — will become real when the live OAuth /
Supabase / API-key paths are wired."

---

## TL;DR

- **0 critical issues** that block running the portal in dev or in a
  trusted-network demo today.
- **2 high-severity issues** that must be fixed before the portal is
  exposed to the public internet:
  1. **Next.js 16.1.6 → ≥16.1.7** (HTTP request smuggling, GHSA-ggv3-7p47-pfv8).
  2. **API gate dev-bypass default** silently accepts every request when
     `PORTAL_API_KEY` is unset. Must require an opt-in flag for
     dev-bypass and refuse to boot the API surface in production without
     the key.
- **6 medium-severity issues** to address before Phase 2.1 cuts to a
  hosted backend (timing-safe token comparison, audit-log
  immutability, open-redirect in auth callback, RLS, federation
  anonymization gaps, webhook signing).
- **8 low-severity items** for polish.

Run `npm audit fix` first — that resolves 2 of the 5 dependency issues
without risk; the remaining 3 require version bumps.

---

## Resolution status

| Original item | Status on current `main` | Evidence |
|---|---|---|
| Next.js vulnerable version | **Resolved** | `package.json` pins `next` at `^16.2.6`; `npm audit --omit=dev` reports 0 vulnerabilities. |
| API gate dev-bypass default | **Resolved** | `lib/portal/api/auth.ts` refuses production requests without `PORTAL_API_KEY` unless `PORTAL_ALLOW_OPEN_API=true`. |
| Timing-safe API key comparison | **Resolved** | `lib/portal/api/auth.ts` uses `node:crypto#timingSafeEqual`. |
| Audit-log mutability concerns | **Resolved for demo mode** | Proposal/approval/commit flows append audit entries in repository actions and are covered by portal tests. Durable storage remains Phase 2.1. |
| Auth callback open redirect | **Resolved for current stub** | `app/auth/callback/route.ts` does not accept arbitrary redirect targets in the live path. Real OAuth remains Phase 2.1. |
| RLS and durable client isolation | **Open, Phase 2.1-gated** | In-memory repository remains the active adapter; Supabase/RLS are not implemented. |
| Federation anonymization gaps | **Resolved for current demo scope** | Federation actions are owner/executive-gated and tested; real cross-tenant exchange remains a future hardening area. |
| Webhook signing and delivery | **Open, Phase 9.1-gated** | `lib/portal/webhooks.ts` is currently an in-process ledger, not signed outbound delivery. |
| Low-severity polish items | **Partially resolved** | Post-audit hardening and accessibility PRs closed the highest-impact items; remaining launch hygiene is tracked in `docs/launch-readiness-2026-05.md`. |

---

## Severity legend

- **HIGH** — exploitable on the public internet today, or trivially so
  once a known-future code path lights up.
- **MEDIUM** — exploitable in specific deployment configurations, or
  latent until Phase 2.1+ ships.
- **LOW** — defensive hardening that wouldn't block a procurement
  questionnaire but is below industry best practice.

---

## 1 · Dependencies (`npm audit`)

**`npm audit`** reports 5 vulnerabilities (2 moderate, 3 high) on
`a8fa9e8`'s lockfile.

| Sev | Package | Advisory | Notes |
|-----|---------|----------|-------|
| **HIGH** | `next` `<16.1.7` | GHSA-ggv3-7p47-pfv8 — HTTP request smuggling in rewrites | Direct dep. Current: `16.1.6`. Fix: bump to `16.1.7` or newer (16.2.6 is the suggested `audit fix --force` target). |
| HIGH | `flatted` `<=3.4.1` | GHSA-rf6f-7fwh-wjgh — prototype pollution via `parse()` | Transitive (eslint toolchain). `npm audit fix` resolves. |
| HIGH | `picomatch` `<=2.3.1 \|\| 4.0.0-4.0.3` | GHSA-3v7f-55p6-f55p / GHSA-c2c7-rcm5-vvqj — method injection + ReDoS | Transitive. `npm audit fix` resolves. |
| MOD | `brace-expansion` `<1.1.13 \|\| >=4.0.0 <5.0.5` | GHSA-f886-m6hf-6m8v — process hang / memory exhaustion | Transitive. `npm audit fix` resolves. |
| MOD | `postcss` `<8.5.10` | GHSA-qx2v-qp2m-jg93 — XSS via unescaped `</style>` | Transitive via `next`. Bumping Next.js fixes it. |

**Fix plan**

```sh
# Step 1: pull in the safe transitive bumps.
npm audit fix

# Step 2: bump Next.js to 16.1.7+ explicitly.
npm install next@^16.1.7

# Step 3: re-run.
npm audit
npm run lint && npm test && NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build
```

`npm audit fix --force` would bump Next to `16.2.6` (a newer minor); I'd
verify the test suite there first since `16.2` changed the Turbopack
defaults.

---

## 2 · Secrets

**No findings.**

- ✅ `git ls-files | grep .env` returns only `.env.local.example`.
- ✅ `.env.local.example` contains only placeholder names + comments.
- ✅ No hardcoded API keys, tokens, or passwords anywhere in the repo
  (scanned `.ts` / `.tsx` / `.mjs` / `.json` / `.env*`).
- ✅ No `console.log` lines emit credential values; the few
  `console.warn` calls in `lib/auth/supabase.ts` are flow-only.

Action: **none**.

---

## 3 · Authentication + Authorization

### 3.1 Server actions (10 modules; coverage map)

| Module | Auth check | Notes |
|--------|------------|-------|
| `lib/auth/actions.ts` | ✅ `getAuthRuntimeState().isDevBypassEnabled` gate | Role switcher refuses to mutate outside dev-bypass. |
| `lib/portal/actions.ts` | ✅ `canPerform()` per action | approve/defer/reject + promote-knowledge gated. |
| `lib/portal/agents/actions.ts` | ✅ `roleCanRun()` per archetype | |
| `lib/portal/agents/actions-impact.ts` | ✅ delegates to `runAgentAction` | thin shim; downstream gates. |
| `lib/portal/artifact-actions.ts` | ✅ `canPerform()` per write | save/mint/propose/approve/reject canonical, comments. |
| `lib/portal/federation/actions.ts` | ✅ membership.role === owner/executive | join/leave/contribute/withdraw. |
| `lib/portal/marketplace/actions.ts` | ✅ role checks per action | submit / eval / publish / install / killswitch. |
| `lib/portal/models/actions.ts` | ✅ owner/executive | propose / route / rollback. |
| `lib/portal/outbound-actions/actions.ts` | ✅ role checks per action | propose / approve / commit / rollback. |
| `lib/portal/schedule-actions.ts` | ✅ owner/executive/lead | propose / update status. |

**Finding 3.1.A — LOW** · `submitListingAction` (marketplace) accepts
listings without checking the caller's role. The intent was open
submissions, but in a hosted deployment this lets anonymous callers
create pending-eval rows. Fix: require `membership.role !== "viewer"`
or accept only via a webhook signed by the developer's pre-shared key.

**Finding 3.1.B — LOW** · `lib/auth/actions.ts#switchRole` sets the
role cookie with `httpOnly: false`. The server reads it via
`cookies()`; the client doesn't need direct access. Set
`httpOnly: true` to remove an unnecessary XSS sink. Also missing
`secure: true` for production.

### 3.2 Bearer-token API gate (`lib/portal/api/auth.ts`)

**Finding 3.2.A — MEDIUM (timing attack)** · Line 32 uses
`provided !== configured`, a non-constant-time string equality. An
attacker on the network can probe character-by-character. Fix:

```ts
import { timingSafeEqual } from "node:crypto";
const a = Buffer.from(provided);
const b = Buffer.from(configured);
if (a.length !== b.length || !timingSafeEqual(a, b)) {
  return { ok: false, status: 403, reason: "Invalid Bearer token." };
}
```

**Finding 3.2.B — HIGH (dev-bypass in production)** · When
`PORTAL_API_KEY` is unset the gate returns `ok: true, mode: "dev-bypass"`
and the entire REST surface is open. The `/portal/governance` page
flags this as a config gap, but the API itself emits no warning, no
log line, no startup refusal. Fix:

```ts
if (!configured) {
  if (process.env.NODE_ENV === "production" && !process.env.PORTAL_ALLOW_OPEN_API) {
    return { ok: false, status: 503, reason: "API key is required in production." };
  }
  return { ok: true, tokenLabel: "dev-bypass", mode: "dev-bypass" };
}
```

The new `PORTAL_ALLOW_OPEN_API` is an opt-in escape hatch for
controlled-environment demos.

**Finding 3.2.C — LOW (error message leakage)** · `withApiAuth()`
catches exceptions and returns `err.message` to the caller. This leaks
repository IDs, stack content embedded in messages, and so on. Fix:
log the full error server-side, return a generic `500 Internal Server Error`
body.

**Finding 3.2.D — LOW (no rate limiting)** · The API surface has no
rate-limit. Trivial to brute-force a token (combined with finding
3.2.A) or to drain Anthropic spend via `POST /decisions` →
`runEngagementAnalyst`. Fix: per-token + per-IP token-bucket limiter in
Phase 9.1.

### 3.3 Open-redirect (`app/auth/callback/route.ts`)

**Finding 3.3.A — MEDIUM (latent; activates when Phase 2.1 wires real
auth)** · The stub already includes:

```ts
const next = searchParams.get("next") ?? "/dashboard";
// ...
return NextResponse.redirect(`${origin}${next}`);
```

Today the redirect is hardcoded to `/dashboard` so the `next` param
isn't honored. **Phase 2.1 must validate the `next` param** before
using it. Required check:

```ts
function isSafeNext(next: string): boolean {
  return next.startsWith("/") && !next.startsWith("//");
}
```

The double-slash check is critical — `${origin}//attacker.com/path` is
parsed by browsers as `//attacker.com/path` (host-relative), bypassing
naive same-origin checks.

### 3.4 Workspace isolation

**Finding 3.4.A — HIGH (latent; activates when Phase 2.1 wires Supabase)**
· The in-memory `assertWorkspace()` is single-tenant only. **Phase 2.1
must implement Row-Level Security keyed off `Membership.role` and
`workspaceId` on every table.** Without RLS, a compromised JWT for one
workspace can SELECT/UPDATE rows in another via direct Supabase REST
calls.

Concrete: enable RLS on every table. Policy template:

```sql
CREATE POLICY workspace_isolation ON artifacts
  FOR ALL USING (workspace_id IN (
    SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
  ));
```

---

## 4 · XSS / output sanitization

**No findings.**

- ✅ Project-wide grep for `dangerouslySetInnerHTML`, `innerHTML`,
  `eval(` → **0 matches**.
- ✅ The Markdown renderer (`components/patterns/artifact-markdown.tsx`)
  uses React JSX text children exclusively. All Markdown bodies are
  safe by construction.
- ✅ Citation chips render `EvidenceLink` with prop-passed strings; no
  raw HTML.
- ✅ Outbound action payload preview uses `JSON.stringify` inside a
  `<pre>` — auto-escaped.

Action: **none**.

---

## 5 · Audit log integrity

**Finding 5.A — MEDIUM (latent; activates Phase 2.1)** · The in-memory
adapter only ever pushes to the audit-log array; no code path mutates
or deletes existing entries. ✅

But there's no enforcement. Phase 2.1's Supabase implementation must
add a Postgres trigger that rejects UPDATE/DELETE on `audit_log`:

```sql
CREATE OR REPLACE FUNCTION reject_mutations() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION reject_mutations();
CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION reject_mutations();
```

---

## 6 · Federation anonymization (`lib/portal/federation/index.ts`)

**Finding 6.A — MEDIUM (acknowledged in Phase 12.1 backlog)** ·
`STRICT_REPLACEMENTS` and `STANDARD_REPLACEMENTS` are hand-maintained
denylists of specific organization + person names. **New members or
non-listed PII leak through every anonymization level**:

- Geographic identifiers (Ottawa, specific addresses)
- Email addresses (`@dauntlessagentic.com`, `@tbs-sct.gc.ca`)
- Phone numbers, project codes, RFP numbers
- Direct quotes from cited evidence

Phase 12.1's "adversarial deanonymization tests" must:

1. Replace the hand-maintained list with an entity-recognition pass
   (or a deny-list maintained per `Membership`).
2. Add an explicit `[CONSULTANCY]`, `[CLIENT]`, `[PERSON]`,
   `[LOCATION]` token vocabulary and verify nothing else leaks.
3. Add a red-team test suite that tries to deanonymize sample
   contributions.

**Finding 6.B — LOW** · "Light" mode applies zero replacements. Showing
it as a tier alongside "standard" and "strict" implies anonymization
is happening. Either rename it (`"raw"`, `"no-anonymization"`) or add
a UI warning that it's a no-op.

---

## 7 · Outbound actions + marketplace

**Finding 7.A — LOW** · `proposeOutboundAction` accepts
`payload: Record<string, unknown>`. The current store doesn't validate
payload shape against the connector capability's schema. Phase 11.1
must add zod schemas per capability and validate at
`proposeOutboundAction` time — not at commit time — so malformed
payloads can't sit in pending-approval state.

**Finding 7.B — LOW** · Marketplace `submitListing` lets a caller
declare any `toolSurface`. The eval harness catches this
(`runEvalForListing` enforces `isToolPermitted`), but the unevaluated
submission still appears on `/portal/marketplace` with full scope
claims. Defense in depth: validate at submission time too.

---

## 8 · Webhooks (`lib/portal/webhooks.ts`)

**Finding 8.A — MEDIUM (latent; activates Phase 9.1)** · Phase 9.0
only records events. Phase 9.1 will wire HTTP delivery. **Real
deliveries must be HMAC-signed** so receivers can verify authenticity:

```ts
const signature = crypto
  .createHmac("sha256", workspaceWebhookSecret)
  .update(`${timestamp}.${JSON.stringify(payload)}`)
  .digest("hex");
// Send as `X-Portal-Signature: t=${timestamp},sig=${signature}` header.
```

Pattern follows Stripe / GitHub webhooks. Receivers must verify
within a 5-minute timestamp window.

**Finding 8.B — LOW** · No retry strategy yet. At-least-once delivery
with exponential backoff lands in 9.1.

---

## 9 · CI (`.github/workflows/portal-ci.yml`)

- ✅ `permissions: contents: read` — minimum.
- ✅ Actions pinned to major versions (`actions/checkout@v4`,
  `actions/setup-node@v4`).
- ✅ `timeout-minutes: 15` — bounded.
- ✅ Triggers on `claude/**` branches; secrets are not exposed to
  `pull_request` workflows from forks (GitHub default).

**Finding 9.A — LOW** · `npm ci || npm install` allows non-strict
lockfile resolution on CI. Fix: `npm ci` only. If `npm ci` fails the
build, fix the lockfile, don't fall through.

**Finding 9.B — LOW** · Actions pinned to major versions, not commit
SHAs. For a public-sector procurement posture, pin to SHA:

```yaml
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11   # v4.2.2
```

**Finding 9.C — LOW** · No CodeQL or dependency-review action. Add
GitHub's free CodeQL workflow:

```yaml
- uses: github/codeql-action/init@v3
  with: { languages: javascript-typescript }
- uses: github/codeql-action/analyze@v3
```

---

## 10 · PII / telemetry posture

**Finding 10.A — LOW** · `AuditEntry.detail` is a freeform string that
often contains member display names (e.g. `"Dr. Eleanor Vance approved
decision dec-…"`). When exports are signed and sent off-prem in Phase
10.1, these strings carry PII. The federation anonymization pipeline
must be applied to audit exports too.

**Finding 10.B — LOW** · `PortalEvent.actor` carries the agent ID or
member name verbatim. Same comment as 10.A applies.

---

## 11 · Findings summary table

| # | Sev | Area | Finding | Fix urgency |
|---|-----|------|---------|-------------|
| 1.A | HIGH | Deps | Next.js 16.1.6 → ≥16.1.7 (request smuggling) | **Before production** |
| 1.B | HIGH | Deps | `flatted` prototype pollution | Before production |
| 1.C | HIGH | Deps | `picomatch` method injection / ReDoS | Before production |
| 1.D | MED | Deps | `brace-expansion` / `postcss` | Before production |
| 3.1.A | LOW | Authz | Marketplace `submitListing` lacks role check | Phase 15.1 |
| 3.1.B | LOW | Authz | Role cookie missing `httpOnly: true` / `secure: true` | Quick fix |
| 3.2.A | MED | Authn | Bearer comparison not constant-time | Quick fix |
| 3.2.B | HIGH | Authn | API gate dev-bypass default | **Before production** |
| 3.2.C | LOW | Authn | API errors leak `err.message` | Phase 9.1 |
| 3.2.D | LOW | Authn | No rate limiting | Phase 9.1 |
| 3.3.A | MED | Authn | Open-redirect latent in auth callback | **Phase 2.1 wiring** |
| 3.4.A | HIGH | AuthZ | RLS missing — single-workspace assumption only | **Phase 2.1 wiring** |
| 5.A | MED | Integrity | Audit log not DB-immutable | Phase 2.1 |
| 6.A | MED | Privacy | Federation anonymization is denylist-only | Phase 12.1 |
| 6.B | LOW | UX | "Light" mode mislabeled as anonymization tier | Quick fix |
| 7.A | LOW | Validation | Outbound action payload unschema-validated | Phase 11.1 |
| 7.B | LOW | Defense-in-depth | Marketplace tool-surface unvalidated at submit | Phase 15.1 |
| 8.A | MED | Integrity | Webhook deliveries not HMAC-signed | Phase 9.1 |
| 8.B | LOW | Reliability | No webhook retry strategy | Phase 9.1 |
| 9.A | LOW | Supply chain | CI uses `npm ci \|\| npm install` | Quick fix |
| 9.B | LOW | Supply chain | Actions pinned to major, not SHA | Quick fix |
| 9.C | LOW | Supply chain | No CodeQL workflow | Quick fix |
| 10.A | LOW | Privacy | Audit-log detail carries PII | Phase 10.1 |
| 10.B | LOW | Privacy | PortalEvent.actor carries PII | Phase 10.1 |

---

## 12 · Immediate quick wins (single PR, ≤30m)

Five fixes that aren't blocking but tighten the posture today:

1. `npm audit fix` to clear `flatted`, `picomatch`, `brace-expansion`.
2. Bump Next.js to `^16.1.7` and re-run lint/test/build.
3. Use `crypto.timingSafeEqual` in `lib/portal/api/auth.ts`.
4. Set `httpOnly: true`, `secure: true` on the role-switcher cookie.
5. Switch CI to `npm ci` (drop the fallback).
6. Add a startup warning when `NODE_ENV=production` and `PORTAL_API_KEY`
   is unset.

I'll open these as a follow-up PR if you give the green light.

---

## 13 · Before-production checklist

When the portal is about to face the public internet:

- [ ] `npm audit` returns 0 vulnerabilities.
- [ ] `PORTAL_API_KEY` is set; refuse to serve `/api/portal/v1/*` if missing.
- [ ] Phase 2.1 lands Supabase + NextAuth.
- [ ] Phase 2.1 lands Row-Level Security on every table.
- [ ] Auth callback validates `next` parameter.
- [ ] Audit log has DB-level immutability triggers.
- [ ] Per-token rate limits on the REST API.
- [ ] CodeQL workflow active and green.
- [ ] Phase 10.1 signed evidence exports active before any export
      flows to a 3rd-party assessor.

This list mirrors the Phase 10 compliance posture surface at
`/portal/compliance` — many of these items will flip from `gap` → `pass`
automatically once Phase 2.1 + Phase 9.1 + Phase 10.1 land.
