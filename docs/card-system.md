# Card System

## Overview

The card is the primary spatial unit of the App Chassis workspace. Every piece of content lives inside a card. Cards are draggable, resizable, and snap to a shared 12-column grid.

## Anatomy

```
┌─────────────────────────────────────────┐
│ ⠿  EYEBROW          Title       ● STATE │  ← CardHeader
│                              [actions] [⋯]│
├─────────────────────────────────────────┤
│                                         │
│              CardBody                   │  ← Content slot
│                                         │
├─────────────────────────────────────────┤
│ Footer content (optional)              ↘ │  ← CardFooter + resize handle
└─────────────────────────────────────────┘
```

## Usage

```tsx
import { DashboardCard } from "@/components/cards/dashboard-card";

<DashboardCard
  id="my-card"
  title="Situation Overview"
  eyebrow="AI SUMMARY"
  subtitle="Updated 3m ago"
  badge="Live"
  agentState="active"
  agentId="agent-alpha"
  loading={isLoading}
  footer={<FooterContent />}
  onRemove={(id) => removeCard(id)}
>
  <MyCardContent />
</DashboardCard>
```

## Agent States

All agent-bearing cards accept `agentState` and `agentId` props.

| State | Left border | Dot | Animation |
|-------|-------------|-----|-----------|
| `idle` | `--agent-idle` | Muted | None |
| `active` | `--agent-active` | Purple | Pulse glow |
| `thinking` | `--agent-thinking` | Cyan | Thinking pulse |
| `blocked` | `--agent-blocked` | Amber | None |
| `complete` | `--agent-complete` | Green | None |
| `updated` | `--agent-updated` | Vivid purple | None |

## Grid Integration

Wrap cards in `WorkspaceGrid` with a layout array:

```tsx
const LAYOUT = [
  { i: "card-1", x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2 },
  { i: "card-2", x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 2 },
];

<WorkspaceGrid defaultLayout={LAYOUT}>
  {() => (
    <>
      <div key="card-1"><DashboardCard id="card-1" ...>...</DashboardCard></div>
      <div key="card-2"><DashboardCard id="card-2" ...>...</DashboardCard></div>
    </>
  )}
</WorkspaceGrid>
```

## Card Registry

New card types must be registered in `lib/workspace/card-registry.ts` with:
- `type`: string identifier
- `label`: human-readable name
- `description`: purpose description  
- `defaultW`, `defaultH`: default grid dimensions
- `minW`, `minH`: minimum allowed dimensions
