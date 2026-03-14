# App Chassis — AGENTS.md
## Rules for AI Coding Agents

This file contains binding rules for any AI agent extending this codebase.
Follow these rules without exception to preserve style consistency.

---

## 1. Token System — CRITICAL

**Always use CSS custom property tokens. Never hardcode hex values.**

```tsx
// ✅ Correct
className="text-[--text-primary] bg-[--panel-bg] border-[--border-default]"

// ❌ Wrong
className="text-gray-100 bg-[#111120]"
style={{ color: "#ededf5" }}
```

All tokens are defined in `app/globals.css` under `:root {}`.
All tokens are bridged to Tailwind via `@theme inline {}`.

**Primary accent is DEEP ULTRAVIOLET — `--accent` / `--accent-bright` / `--accent-vivid`.**
Do not replace it with blue, green, or any other color as the identity anchor.

---

## 2. Card System — CRITICAL

All workspace cards MUST use `DashboardCard` from `components/cards/dashboard-card.tsx`.

```tsx
// ✅ Correct: always wrap content in DashboardCard
<DashboardCard id="my-card" title="My Card" eyebrow="SECTION">
  <MyContent />
</DashboardCard>

// ❌ Wrong: creating custom card containers from scratch
<div className="rounded-xl bg-gray-900 border border-gray-700 p-4">
  <MyContent />
</div>
```

All cards support these props:
- `agentState`: "idle" | "active" | "thinking" | "blocked" | "complete" | "updated"
- `agentId`: string (which agent owns this card)
- `eyebrow`: micro-label shown above title
- `badge`: status badge text
- `loading`: skeleton loading state
- `footer`: optional footer slot
- `onRemove`: removal handler

---

## 3. Card Registry — Required for new card types

If adding a new card TYPE, register it in `lib/workspace/card-registry.ts`:

```typescript
"my-card-type": {
  type: "my-card-type",
  label: "My Card",
  description: "What this card does",
  defaultW: 4, defaultH: 3,
  minW: 2, minH: 2,
}
```

---

## 4. Agent State — Required pattern for agent-bearing cards

When a card hosts an agent, always supply `agentState` and `agentId`:

```tsx
<DashboardCard
  id="my-agent-card"
  title="Agent Name"
  agentState="thinking"  // ← required for agent cards
  agentId="agent-alpha"  // ← links card to agent
>
```

Agent state visual mappings (do not change):
- `idle` → muted indicator, no animation
- `active` → accent-bright pulse animation
- `thinking` → info (cyan) indicator, thinking animation
- `blocked` → warning indicator
- `complete` → success indicator
- `updated` → accent-vivid indicator

---

## 5. Workspace Grid — Required pattern for draggable layouts

All draggable workspaces use `WorkspaceGrid` from `components/cards/workspace-grid.tsx`.

```tsx
<WorkspaceGrid defaultLayout={MY_LAYOUT}>
  {() => (
    <>
      <div key="card-id">
        <DashboardCard id="card-id" ...>...</DashboardCard>
      </div>
    </>
  )}
</WorkspaceGrid>
```

Layout arrays use react-grid-layout format. Use 12-column grid. Standard widths:
- Quarter: w=3
- Third: w=4
- Half: w=6
- Two-thirds: w=8
- Full: w=12

---

## 6. Design Principles — Non-negotiable

1. **Dark-first**: No bright white surfaces in the app shell. Ever.
2. **Token-only colors**: See rule #1.
3. **Purple is the identity anchor**: `--accent` (#7c3aed). Not blue, not green.
4. **Compact controls**: Use h-7 / h-8 inputs and buttons, not h-10+ unless explicit large UI.
5. **Uppercase micro-labels**: Use `text-[9px] font-bold uppercase tracking-widest text-[--text-muted]` for section labels.
6. **Matte surfaces over glass**: No `backdrop-blur` on app shell cards. Only on modals/overlays.
7. **Restrained motion**: Durations 120ms–350ms. No bounce. No spring overshoot.
8. **Charts use token colors**: Chart palette: `--chart-1` through `--chart-6`. Never hardcode.

---

## 7. Shell Components — Use existing, don't recreate

Existing shell components (do not re-implement):
- `AppShell` — top-level app container
- `SideRail` — left icon navigation
- `TopBar` — top chrome with search, notifications, user menu
- `WorkspaceHeader` — page-level header with title, badge, actions, filters

For new pages inside `(app)/`, just use these in `layout.tsx` or directly.

---

## 8. Marketing Shell — Shared DNA, not separate universe

The marketing shell (under `(marketing)/`) shares:
- All CSS tokens
- All UI primitives (Button, Badge, etc.)
- Same typography
- Same accent color

But it uses:
- `--mkt-bg`, `--mkt-section`, `--mkt-card`, `--mkt-border` surfaces
- Horizontal nav (not SideRail)
- Looser section spacing (py-24)
- `MarketingNav`, `MarketingFooter` components

Do not introduce a separate color system for marketing. It is the same system.

---

## 9. New Pages

For a new app page:
1. Create under `app/(app)/[page-name]/page.tsx`
2. Use `WorkspaceHeader` at the top
3. Use `WorkspaceGrid` if cards are needed, or split-panel layout otherwise
4. Use `DashboardCard` for all card containers
5. Add nav item in `components/shell/side-rail.tsx` if it needs primary navigation

For a new marketing page:
1. Create under `app/(marketing)/[page-name]/page.tsx`
2. Use `MarketingNav` + `MarketingFooter`
3. Use section-based layout with mkt- tokens

---

## 10. Typography Rules

- UI body: `var(--font-inter)` — 14px base, set in body
- Mono: `var(--font-mono-code)` — use for: timestamps, IDs, code, telemetry, system metrics
- Large values (KPI numbers): `text-2xl font-bold tabular-nums`
- Section labels: `text-[9px] font-bold uppercase tracking-widest text-[--text-muted]`
- Card titles: `text-xs font-semibold text-[--text-primary]`
- Body text in cards: `text-xs text-[--text-secondary]`

---

## 11. File Organization

```
components/ui/      ← Core primitives only (Button, Input, Badge, etc.)
components/shell/   ← Shell structure (AppShell, SideRail, TopBar, etc.)
components/cards/   ← Card system (DashboardCard, ChatCard, TaskCard)
components/patterns/← Reusable internal-tool patterns (KpiTile, FeedPanel, etc.)
components/viz/     ← Visualization components (charts, radar)
components/marketing/← Marketing-only components
lib/workspace/      ← Grid config, layout store, card registry
lib/mock-data/      ← Demo data for all pages
lib/types.ts        ← Shared TypeScript types
```

Do not create files outside this structure without strong reason.
Do not put page-specific logic in `components/` — keep it in `app/`.

---

## 12. Checklist Before Committing

- [ ] No hardcoded hex colors
- [ ] Agent-bearing cards have `agentState` and `agentId`
- [ ] New card types registered in `CARD_REGISTRY`
- [ ] New draggable layouts use `WorkspaceGrid`
- [ ] Charts use `--chart-1` through `--chart-6` tokens
- [ ] Component stays within its designated folder
- [ ] No new design language introduced (no random border radii, gradients, or color palettes)
- [ ] Marketing pages use `--mkt-*` surface tokens
