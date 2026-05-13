# Security Policy

The Dauntless Agentic team takes the security of dauntlessagentic.com
and the Client Intelligence Portal seriously. This document is the
canonical place to report security issues responsibly.

## Reporting a vulnerability

If you have found a security vulnerability — in the marketing site,
the Client Intelligence Portal, the REST API, or any of the
dependencies we ship — please report it privately rather than via a
public issue.

**Preferred channel**: email
[security@dauntlessagentic.com](mailto:security@dauntlessagentic.com)
with:

- A description of the issue.
- Steps to reproduce.
- The impact you've observed or anticipate.
- A suggested remediation if you have one.

We acknowledge every report within **2 business days** and aim to
land a fix within **30 days** depending on severity.

## Scope

In scope:

- Cross-site scripting (XSS), CSRF, injection vulnerabilities.
- Authentication / authorization bypasses.
- API rate-limit / scope-token escalation paths.
- Sensitive data exposure (PII, audit log, evidence vault).
- Subdomain takeover, DNS / Cloudflare / Vercel misconfiguration.
- Dependency vulnerabilities affecting the published surface.

Out of scope:

- Best-practice missing-headers (CSP / HSTS) flagged by automated
  scanners with no demonstrated impact.
- Social engineering, physical attacks, or denial-of-service
  scenarios that require flooding our infrastructure.
- Issues in dependencies we haven't deployed yet (the portal runs
  on `main`; check the head commit before testing).
- Issues in the in-memory dev-bypass mode — that mode is intentional
  for the pre-launch stealth window and is not exposed publicly.

## Pre-launch posture

Until client onboarding begins, the portal runs in `dev-bypass` mode
with an in-memory repository and no real OAuth. The marketing site is
the only customer-facing surface. We will tighten the security
posture (Supabase persistence + NextAuth v5 + signed audit exports +
data residency) at the launch-eve sprint — see
`docs/launch-readiness-checklist.md` §3 and `docs/pre-launch-plan.md`
§B1.

## Recognition

We're a small team. We don't run a paid bounty program today. We do
maintain a security hall of fame on the marketing site and will
recognize valid disclosures publicly with the reporter's consent.

## Encrypted reports

PGP key forthcoming. For now, please email
`security@dauntlessagentic.com` for an out-of-band channel if your
report requires encrypted transport.
