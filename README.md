# App Chassis

**A production-quality starter for internal tools, AI workspaces, and decision-support surfaces.**

Dark-first. Agent-ready. Modular by design. Deep ultraviolet.

---

## What is App Chassis?

App Chassis is a cloneable, opinionated product shell — not a toy dashboard, not a template mill. It establishes a coherent house style and infrastructure for building many future products.

It's optimized for:
- Internal tools & admin surfaces
- AI agent workspaces  
- Analytics & monitoring dashboards
- Strategy, scoring & triage interfaces
- Scenario comparison & analysis tools
- Workflow management cockpits
- Lightweight product marketing front doors

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to the marketing homepage.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) → Command Center.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Motion | Framer Motion |
| Workspace Grid | react-grid-layout |
| Charts | Recharts |
| Tables | TanStack Table |
| Schema | Zod |
| Utilities | clsx + tailwind-merge + CVA |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Marketing homepage |
| `/portal` | **Client Intelligence Portal** — the living cockpit for client engagements (see below) |
| `/dashboard` | Command Center — flagship draggable card workspace |
| `/workspace` | Internal Tool — split queue / inspector layout |
| `/agents` | Multi-Agent Workspace — coordinated agent cards |
| `/analytics` | Analytics & Reporting — charts, filters, tables |
| `/settings` | Settings — dense, elegant preferences surface |
| `/intake` | Forms / Intake — multi-step workflow |
| `/showcase` | Component Style Guide — all tokens, primitives, patterns |

---

## Client Intelligence Portal

The portal is the post-marketing product surface that lives under `app/(app)/portal/`.
It turns the "engagements compound" marketing promise into a working cockpit: living
deliverables, decision register, evidence vault, contextual agent fleet, knowledge
architecture, outcomes telemetry, and governance.

| Doc | Purpose |
|-----|---------|
| `docs/client-portal-target-architecture.md` | Binding architecture — domain model, surfaces, components, data layer, trust mapping |
| `docs/client-portal-roadmap.md` | 15-phase product roadmap from real persistence through open agent market |
| `docs/caia-mapping.md` | CAIA → portal subsystem inventory; what to port, what to skip |

Routes:

- `/portal` — Command Center with the five-section Decision Surface
- `/portal/engagements` — success criteria, risks, milestones, in-flight decisions
- `/portal/deliverables` — artifact library, version history, canonical bookshelf
- `/portal/decisions` — Decision Register with evidence vault
- `/portal/agents` — agent fleet by archetype (Strategist · Operator · Auditor · Chief of Staff)
- `/portal/knowledge` — Desk · Bookshelf · Filing Cabinet with M0–M4 tiers
- `/portal/outcomes` — KPI grid, compounding chart, executive narrative
- `/portal/governance` — audit log, risk tiers, access roster, retention controls

Domain types and mock data live in `lib/portal/`. Portal-specific reusable patterns
live in `components/patterns/` (`portal-status-card`, `decision-list`, `artifact-list`,
`agent-fleet-panel`, `evidence-link`, `knowledge-shelf`).

### Data layer (Phase 2)

Every portal page is a server component that calls `loadPortalContext()`
(`lib/portal/server.ts`) to fetch a typed `{ snapshot, membership }` tuple
through the `PortalRepository` interface (`lib/portal/repositories/`).

- **Default**: `InMemoryPortalRepository` — wraps `mock-data.ts`; mutations
  persist for the lifetime of the dev server.
- **Hosted**: `SupabasePortalRepository` — activated by `SUPABASE_URL` or
  `PORTAL_DATABASE_URL`. Concrete adapter lands in Phase 2.1.

Mutations route through server actions in `lib/portal/actions.ts`. Every
write goes through the membership-gate (`lib/auth/membership-gate.ts`), appends
an audit-log entry, and emits a `Signal` so the Command Center's "What
changed?" feed updates on the next render.

Identity is resolved by `lib/auth/session.ts#getCurrentMembership()`. Without
OAuth configured, the portal runs in `dev-bypass` mode and a TopBar role
switcher writes a cookie that drives the gate. See `.env.local.example` for
the full set of knobs.

Repository contract smoke tests: `npm test` (runs under `tsx --test`).

---

## Design System

### Color Philosophy

The primary accent identity is **deep ultraviolet** (`#7c3aed`). This is non-negotiable and should not be changed to blue, green, or any other color in the core system.

Secondary accents are used **semantically only**:
- Cyan (`--info`) — informational / data viz secondary
- Amber (`--warning`) — caution states
- Red (`--danger`) — destructive
- Green (`--success`) — healthy / complete

### Token System

All design values are CSS custom properties in `app/globals.css`. Zero hardcoded hex values in any component.

Tailwind v4 `@theme inline` bridge makes all tokens available as Tailwind utility classes:
```css
bg-[--panel-bg]        /* panel background */
text-[--text-primary]  /* primary text */
border-[--border-active] /* active/accent border */
```

### Card Anatomy

Every card in the workspace uses `DashboardCard` with a standardized anatomy:
- **Eyebrow** — `text-[9px] uppercase tracking-widest text-[--text-muted]`
- **Title** — `text-xs font-semibold text-[--text-primary]`
- **Drag handle** — `GripHorizontal`, cursor-grab
- **Status indicator** — agent state dot + label
- **Actions** — right-aligned icon buttons
- **Body** — flexible content slot
- **Footer** — optional bottom slot

### Agent States

Cards hosting AI agents support 6 visual states:

| State | Color | Animation | Meaning |
|-------|-------|-----------|---------|
| `idle` | Muted | None | Agent waiting |
| `active` | Accent (purple) | Pulse glow | Processing |
| `thinking` | Info (cyan) | Thinking pulse | Reasoning |
| `blocked` | Warning (amber) | None | Needs attention |
| `complete` | Success (green) | None | Work done |
| `updated` | Accent vivid | None | New output |

---

## File Structure

```
app/
  (app)/           # App shell route group
    dashboard/     # Command Center
    workspace/     # Internal Tool Workspace
    agents/        # Multi-Agent Workspace
    analytics/     # Analytics / Reporting
    settings/      # Settings
    intake/        # Forms / Intake
  (marketing)/     # Marketing shell route group
    page.tsx       # Homepage

components/
  ui/              # Core UI primitives
  shell/           # AppShell, SideRail, TopBar, WorkspaceHeader
  cards/           # DashboardCard, WorkspaceGrid, ChatCard, TaskCard
  patterns/        # KpiTile, FeedPanel, SummaryCard, DataTable
  viz/             # LineChart, BarChart, AreaChart, DonutChart, Radar
  marketing/       # MarketingNav, HeroSection, FeatureGrid, CTA, Footer

lib/
  workspace/       # Card registry, layout hooks
  mock-data/       # Demo data for all pages
  types.ts         # Shared TypeScript types
  cn.ts            # clsx + tailwind-merge utility
```

---

## Extending the Chassis

### Adding a new page

1. Create `app/(app)/my-page/page.tsx`
2. Use `WorkspaceHeader` at the top
3. Use `WorkspaceGrid` + `DashboardCard` for card layouts
4. Add nav item in `components/shell/side-rail.tsx`

### Adding a new card type

1. Add type to `CardType` in `lib/types.ts`
2. Register in `lib/workspace/card-registry.ts`
3. Create component in `components/cards/` or `components/patterns/`
4. Wrap with `DashboardCard` in your page

### Adding a chart

Use Recharts with the chart token palette:
- `var(--chart-1)` through `var(--chart-6)`
- Always pass `stroke="var(--border-subtle)"` to grids
- Use `fill: "var(--text-muted)"` for axis labels

---

## AI Agent Guidelines

See `AGENTS.md` for binding rules that ensure future AI coding agents extend this system without style drift.

Key rules:
- Never hardcode hex values — always use CSS tokens
- Always use `DashboardCard` for workspace cards
- Register new card types in `CARD_REGISTRY`
- Deep ultraviolet is the primary accent — do not change it
- Charts use `--chart-1` through `--chart-6`

---

## License

MIT — clone, modify, build products.
