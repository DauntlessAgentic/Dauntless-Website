# Token System

## Architecture

All design values are CSS custom properties defined in `app/globals.css`.
Tailwind v4 `@theme inline` bridges them to utility classes.

No hex values appear in components. Ever.

## Surface Stack

```
--app-bg     #09090e   Root page background (darkest)
--chrome-bg  #0d0d16   Shell chrome (sidebar, topbar)
--panel-bg   #111120   Card/panel surfaces
--elevated   #16162a   Elevated elements within cards
--elevated-2 #1c1c33   Double-elevated (modals, overlays)
--overlay    #1f1f38   Maximum elevation
```

## Primary Accent — Deep Ultraviolet

```
--accent         #7c3aed   Identity anchor (violet-600)
--accent-bright  #8b5cf6   Hover/active state (violet-500)
--accent-vivid   #a78bfa   Text accent (violet-400)
--accent-dim     rgba(124,58,237,0.12)   Dim background fill
--accent-glow    rgba(124,58,237,0.28)   Glow effect
```

**This color is fixed.** Do not substitute it.

## Semantic Accents

Use only for their designated meaning:

```
--info      #22d3ee   Informational / data viz secondary
--warning   #f59e0b   Caution / agent blocked
--danger    #ef4444   Destructive / error
--success   #22c55e   Complete / healthy
```

## Chart Palette

Always use these tokens for chart colors, in order:

```
--chart-1  #8b5cf6   (accent-bright, primary series)
--chart-2  #22d3ee   (info, secondary series)
--chart-3  #f59e0b   (warning, tertiary)
--chart-4  #22c55e   (success)
--chart-5  #ec4899   (pink)
--chart-6  #3b82f6   (blue)
```

## Using in Tailwind

```tsx
// Background
className="bg-[--panel-bg]"

// Text
className="text-[--text-primary]"
className="text-[--text-muted]"

// Border
className="border-[--border-default]"
className="border-[--border-active]"

// Inline CSS (for charts, dynamic styles)
style={{ color: "var(--accent-bright)" }}
```
