# Dauntless Agentic — Design System & Canonical Patterns
*Reference for implementing consistent page design across the full site.*

---

## 1. Colour Palette

### Brand / Purple (global accent)
| Token | Value | Use |
|---|---|---|
| `--accent` | `#7c3aed` | Primary CTA backgrounds, active states |
| `--accent-bright` | `#8b5cf6` | Gradient endpoint, hover states |
| `--accent-vivid` | `#a78bfa` | Eyebrow labels, icon tints |
| `--accent-dim` | `rgba(124,58,237,0.12)` | Subtle tint backgrounds |

### Service Brand Colours
| Service | Primary | Light | Use |
|---|---|---|---|
| **AI Literacy Training** | `#10b981` | `#34d399` | All training page accents |
| **AI Ops Consulting** | `#2563eb` / `#3b82f6` | `#60a5fa` | All consulting page accents |
| **Agentic Systems** | `#ec4899` | `#f472b6` | All agentic page accents |

### Surface Backgrounds (darkest → lightest)
| Token | Value | Use |
|---|---|---|
| `--mkt-bg` | `#07070d` | Base page background |
| `--mkt-section` | `#0b0b18` | Alternating section backgrounds |
| `--mkt-card` | `#10101e` | Card surfaces |

**Rule:** Sections alternate `--mkt-bg` / `--mkt-section` to create rhythm without hard borders.

### Text
| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#ededf5` | Headings, primary content |
| `--text-secondary` | `#8e8ea8` | Body copy, descriptions |
| `--text-muted` | `#52526a` | Supporting labels, captions |

---

## 2. Typography Scale
*8 steps — do not create intermediate sizes.*

| Step | Class | Size | Use |
|---|---|---|---|
| Display | `text-5xl` / `text-6xl` | 48–60px | Homepage hero headline only |
| H1 | `text-4xl` / `text-5xl` | 36–48px | Page hero headings |
| H2 | `text-2xl` / `text-3xl` | 24–30px | Section headings |
| H3 | `text-xl` | 20px | Card / component headings |
| Lead | `text-lg` | 18px | Subheadlines, hero body |
| Body | `text-base` | 16px | Standard body copy |
| Secondary | `text-sm` | 14px | Supporting text, descriptions |
| Label | `text-xs` | 12px | **Eyebrows, badges, captions ONLY** |

**Critical rule:** `text-xs` is never used for body content — only for overlines (e.g. `SERVICES`), badges, duration chips, and metadata.

Font families:
- **Headings** (`h1`, `h2`, `h3`): Display font + Inter fallback, `letter-spacing: -0.02em`
- **Body**: Inter
- **Mono labels / meta**: System mono

---

## 3. Layout & Width Standards

### Canonical Section Container
```tsx
// ALL content sections use this outer container — no exceptions
<div className="max-w-6xl mx-auto px-6">
```

**Rule:** Never mix `max-w-5xl`, `max-w-4xl`, etc. as the *outer* container for content sections. This causes misaligned card edges across the page.

### Narrower widths — only for centered text blocks *within* sections
```tsx
// Hero subheadline, CTA description — centred text columns only
<p className="max-w-2xl mx-auto ...">    // hero body copy
<p className="max-w-xl mx-auto ...">     // section subtitles
<div className="max-w-3xl mx-auto ...">  // bottom CTA blocks
```

### Fixed Nav Clearance
The nav is `fixed top-0 h-[72px]`. First content element on every page must clear it:
```tsx
// Breadcrumb wrapper (pages with breadcrumbs)
<div className="max-w-6xl mx-auto px-6 pt-[88px] pb-2">

// Hero section when breadcrumb is present — reduce its own pt
<section className="... pt-10 pb-24 ...">

// Hero section when NO breadcrumb (homepage-style) — carries full clearance
<section className="... pt-28 pb-16 ...">
```

---

## 4. Card Design System

### Base Card
```tsx
// soft-card utility (defined in globals.css)
// background: #10101e | box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.3)
// hover: purple border glow + translateY(-2px)
<div className="soft-card p-6">
```

### Service-Coloured Cards (premium treatment)
Used for tier cards, feature cards, testimonials, and cross-service links. Three elements work together:

**1. Top accent bar** — always visible, full width, 3px, gradient fade at edges:
```tsx
<div
  className="h-[3px] w-full"
  style={{ background: "linear-gradient(90deg, transparent, rgba(COLOR, 0.6) 25%, #COLOR 50%, rgba(COLOR, 0.6) 75%, transparent)" }}
/>
```

**2. Card background** — service-colour tint bleeds into dark card base:
```tsx
style={{ background: "linear-gradient(150deg, rgba(COLOR, 0.07) 0%, #10101e 55%)" }}
```

**3. Box shadow** — subtle glow matching service colour:
```tsx
style={{ boxShadow: "0 0 0 1px rgba(COLOR, 0.16), 0 4px 20px rgba(0,0,0,0.4)" }}
```

### Progressive Intensity (for sequential card sets)
When displaying tiers or ranked options, intensity of all three elements increases across the set:
```tsx
const glowOpacity  = [0.10, 0.16, 0.22, 0.35][i];   // border/shadow opacity
const bgOpacity    = [0.05, 0.07, 0.09, 0.12][i];    // background tint
const barOpacity   = [0.35, 0.55, 0.75, 1.00][i];    // top bar intensity
```
The final item (flagship/highest tier) gets an elevated glow and optionally a gradient card background.

### Watermark Numbers
Large semi-transparent numerals anchoring card identity — bottom-right:
```tsx
<span
  className="absolute bottom-4 right-6 text-[88px] font-black leading-none select-none pointer-events-none"
  style={{ color: `rgba(SERVICE_COLOR, ${[0.04, 0.06, 0.09, 0.13][i]})` }}
  aria-hidden="true"
>
  {tierNum}
</span>
```

### Left Accent Bar (alternative to top bar — for variety within a page)
Used on Delivery-type cards to avoid repeating the top-bar pattern:
```tsx
<div
  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
  style={{ background: `linear-gradient(to bottom, rgba(COLOR, 0.7), rgba(COLOR, 0.05))` }}
/>
// Card body must offset: className="pl-7 pr-6 py-6"
```

### Before / After Contrast Cards
Paired cards showing problem → outcome transformation:
```tsx
// Before — red tint
style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.13)" }}
// Label colour: #f87171

// After — service colour tint
style={{ background: `rgba(SERVICE_COLOR, 0.05)`, border: `1px solid rgba(SERVICE_COLOR, 0.15)` }}
// Label colour: service light colour
```

---

## 5. CTA Buttons

### Primary CTA (purple gradient — the canonical site-wide CTA)
```tsx
<Link
  href="/contact"
  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
  style={{
    background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
    boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
  }}
>
  Label Text <ArrowRight className="h-4 w-4" />
</Link>
```
**Rule:** Use this for every primary conversion action (Start a Conversation, Design Your Program, Book a Walkthrough). Never use `Button variant="primary"` for marketing CTAs — the flat variant lacks the gradient and glow that make the CTA pop.

### Secondary / Ghost CTA
```tsx
<Button variant="outline" size="lg">See All Services</Button>
// Or inline:
className="... border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] ..."
```

---

## 6. Section Eyebrow Pattern
Every section begins with a small-caps label above the H2:
```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Services</p>
// On service-specific pages, use the service colour:
<p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#34d399" }}>AI Literacy Training</p>
```

---

## 7. Testimonial Cards

### Scrolling Marquee (homepage / landing sections)
See `components/marketing/testimonials.tsx` — infinite scroll at 400s, card width 360px, `items-stretch` for uniform height.

### Static Grid (service pages)
Three cards in a `md:grid-cols-3` layout. Each card:
```tsx
<div
  className="relative rounded-2xl p-7 flex flex-col gap-5"
  style={{
    background: "linear-gradient(150deg, rgba(SERVICE_COLOR, 0.08) 0%, #10101e 55%)",
    border: "1px solid rgba(SERVICE_COLOR, 0.16)",
    boxShadow: "0 0 0 1px rgba(SERVICE_COLOR, 0.08), 0 6px 24px rgba(0,0,0,0.4)",
  }}
>
  {/* Large decorative quote mark in service colour */}
  {/* Italic blockquote — text-sm */}
  {/* Divider + attribution: role (text-xs uppercase service colour) + context (text-xs muted) */}
```

**Rule:** Pick 3 testimonials from different participant types (role diversity). Favour quotes that speak to transformation over feature descriptions.

---

## 8. Cross-Service Navigation Cards ("Also in Services")

Each card uses its target service's brand colour — not purple:
```tsx
// Consulting (blue)
background: "linear-gradient(150deg, rgba(37,99,235,0.08) 0%, #10101e 55%)"
boxShadow: "0 0 0 1px rgba(37,99,235,0.16), ..."
accent bar: #3b82f6

// Agentic (pink)
background: "linear-gradient(150deg, rgba(236,72,153,0.08) 0%, #10101e 55%)"
boxShadow: "0 0 0 1px rgba(236,72,153,0.16), ..."
accent bar: #ec4899

// Training (emerald) — when linking from other service pages
background: "linear-gradient(150deg, rgba(16,185,129,0.08) 0%, #10101e 55%)"
boxShadow: "0 0 0 1px rgba(16,185,129,0.16), ..."
accent bar: #10b981
```
Cards include: top accent bar, service label in brand colour, headline (text-base font-semibold), description (text-sm), arrow icon.

---

## 9. Navigation & Breadcrumbs

### Nav
- Fixed, `h-[72px]`, transparent until scroll, then `bg-[--mkt-bg]/90 backdrop-blur-xl`
- Logo: `soft-card` container (`background: #10101e`, shadow) + 48px PNG
- Active link: `text-[--accent-vivid] bg-[rgba(124,58,237,0.1)]`
- CTA button: purple gradient (same as §5 Primary CTA, size `px-5 py-2.5`)

### Breadcrumbs
```tsx
// Always place BEFORE the hero section
<div className="max-w-6xl mx-auto px-6 pt-[88px] pb-2">
  <Breadcrumbs crumbs={[
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Current Page" },  // no href on current
  ]} />
</div>
// Then reduce hero pt: pt-10 (not pt-28/pt-32)
```

---

## 10. Page Structure Template (Service Pages)

```
MarketingNav (fixed)
├── Breadcrumb (pt-[88px])
├── Hero section (pt-10, pb-24) — service colour radial glow bg
│     eyebrow · H1 with gradient span · lead paragraph · primary CTA
├── Problem / Framing section (bg-[--mkt-section])
│     H2 · Before/After contrast card pair
├── Platform / Method section (bg-[--mkt-bg])
│     eyebrow · H2 · 2–4 column feature cards
├── Tiers / Packages section (bg-[--mkt-section])
│     eyebrow · H2 · sequential cards with progressive intensity
├── Delivery / Format section (bg-[--mkt-bg])
│     eyebrow · H2 · left-bar accent cards (2×2 grid)
├── Participant Voices / Testimonials (bg-[--mkt-bg], border-t)
│     eyebrow · H2 · 3-column static testimonial cards
├── Also in Services (bg-[--mkt-section], border-t)
│     eyebrow · 2-column cross-service cards in brand colours
├── Bottom CTA (bg-[--mkt-section])
│     H2 · subtext · primary CTA (purple gradient) + ghost CTA
MarketingFooter
```

---

## 11. Accessibility & Readability Rules

- Minimum body font size on dark backgrounds: `text-sm` (14px)
- `text-xs` (12px) reserved for: eyebrow labels, badges, duration chips, navigation breadcrumbs, card metadata
- All decorative elements (watermarks, quote marks, dividers) get `aria-hidden="true"` and `select-none pointer-events-none`
- Contrast: `--text-secondary` (#8e8ea8) on `--mkt-card` (#10101e) passes WCAG AA at 14px+
- `--text-muted` (#52526a) is only used for truly supplementary info (org name, date, source) — never for primary content

---

## 12. Implemented Pages (reference)

| Page | Status | Notes |
|---|---|---|
| Homepage (`/`) | ✅ Complete | Canonical hero, client ribbon, testimonials marquee, feature grid |
| Training (`/services/training`) | ✅ Complete | Full pattern reference — use this as the template |
| Consulting (`/services/consulting`) | ✅ Complete | Blue brand colour throughout |
| Agentic Systems (`/services/agentic-systems`) | ✅ Complete | Pink brand colour throughout |
| Services index (`/services`) | ✅ Complete | Three service summary cards, Trust Architecture grid, philosophy section eyebrow added |
| About (`/about`) | ✅ Complete | Origin/Credentials bg alternation fixed, `--border-active` → explicit rgba, body text size fixes |
| About: Manifesto (`/about/manifesto`) | ✅ Complete | Canonical primary CTA, outline secondary CTA |
| Method (`/method`) | ✅ Complete | Core Promise eyebrow added, Engagement Phases/Trust Architecture bg alternation fixed |
| Platform (`/platform`) | ✅ Complete | "The Difference" eyebrow added, "Get Started" eyebrow added |
| Pricing (`/pricing`) | ✅ Complete | Progressive purple intensity applied to all three tier cards |
| FAQ (`/faq`) | ✅ Complete | Nav clearance `pt-28` added to hero, canonical primary CTA in "Still have questions" |
| Work (`/work`) | ✅ Complete | Canonical primary CTA replacing `<Link><button>` nesting |
| Insights (`/insights`) | ✅ Complete | No violations found — section alternation and CTAs correct |
| Contact (`/contact`) | ✅ Complete | Contact reference values upgraded `text-xs` → `text-sm`, bg alternation verified |

---

## 13. Watermark + Grid Padding Pattern

When a section grid contains large semi-transparent watermark numerals (e.g. tier numbers, phase numbers), the grid container must include right and bottom padding to prevent the watermark from overlapping adjacent text or card borders:

```tsx
// Grid container — add pr-20 pb-20 when watermark is present in cards
<div className="grid md:grid-cols-3 gap-6 pr-20 pb-20">
  {items.map((item, i) => (
    <div key={i} className="relative ...">
      {/* Card content */}
      <span
        className="absolute bottom-4 right-6 text-[88px] font-black leading-none select-none pointer-events-none"
        style={{ color: `rgba(124,58,237,${[0.04, 0.06, 0.09, 0.13][i]})` }}
        aria-hidden="true"
      >
        {i + 1}
      </span>
    </div>
  ))}
</div>
```

**Why:** The absolute-positioned watermark extends outside the card bounds into the grid gap and potentially overlaps the next column or the section padding. `pr-20 pb-20` on the grid container creates a consistent buffer.

**When to apply:** Any grid where cards have `absolute` positioned watermark numerals larger than `text-[60px]`.

---

## 14. Adjacent Section Merging (Calendar / Utility Strips)

Short utility sections (< 100px tall, e.g. calendar booking banners, procurement notes) that logically belong with the content that follows can share the same background as the **hero** (not the content section below). This groups them visually with the page intro rather than breaking the hero → section alternation rhythm.

```
Hero bg-[--mkt-bg]
  ↓
Utility strip bg-[--mkt-bg]   ← same as hero, flows as one unit
  ↓
Form/Content section bg-[--mkt-section]  ← first contrast step
  ↓
Next section bg-[--mkt-bg]
```

**Rule:** Never place a utility strip between two sections of different backgrounds if it causes a third consecutive background value — that reads as a visual stutter.

---

## 15. Stealth Mode — Identity Switch

All personal/founder references are centralised in **`config/identity.ts`**. A single build-time environment variable toggles between full-identity and anonymous-team copy with no code changes required.

### Activation

```bash
# .env.local (never committed)
NEXT_PUBLIC_STEALTH_MODE=true
```

Redeploy after setting. To reveal identity, remove the variable (or set to `"false"`) and redeploy again.

### What the switch controls

| Field | Normal | Stealth |
|---|---|---|
| Founder name | Craig Marchand | *(hidden)* |
| Founder title | Founder, Dauntless Agentic · … | Dauntless Agentic |
| Founder photo | `/images/craig-headshot.jpg` | *(hidden)* |
| Founder bio (short) | BDO Canada / FutureCraft copy | Anonymous 20+ years copy |
| Founder bio (long, about page) | Full Craig narrative | Anonymous team narrative |
| Background items | VP Innovation, BDO Canada / FutureCraft Architect / … | 20+ years public sector / 180+ workflows / … |
| Email | craig@dauntlessagentic.com | hello@dauntlessagentic.com |
| LinkedIn | linkedin.com/in/craigmarchand | *(hidden — card removed)* |
| Personal website | craigmarchand.com | *(hidden)* |
| SEO sameAs | LinkedIn URL | `[]` |
| About page title | About — Craig Marchand | About Dauntless Agentic |
| Consulting testimonial | "Working with Craig's team…" | "Working with this team…" |

### Files that consume `identity`

- `config/identity.ts` — source of truth
- `components/marketing/why-dauntless.tsx` — homepage founder card
- `components/marketing/footer.tsx` — email + LinkedIn
- `app/(marketing)/page.tsx` — schema.org sameAs
- `app/(marketing)/about/page.tsx` — full bio section, metadata, background list
- `app/(marketing)/about/manifesto/page.tsx` — LinkedIn CTA button
- `app/(marketing)/insights/page.tsx` — LinkedIn card + speaking copy
- `app/(marketing)/contact/page.tsx` — quick reference list
- `app/(marketing)/services/consulting/page.tsx` — ESDC testimonial
- `app/(marketing)/legal/privacy/page.tsx` — contact email (×3)
- `app/(marketing)/legal/terms/page.tsx` — contact email

### Adding new identity references

Import from `@/config/identity` and use the exported `identity` object. Never hardcode personal details directly in a component.
# Dauntless Agentic — Design System & Canonical Patterns
*Reference for implementing consistent page design across the full site.*

---

## 1. Colour Palette

### Brand / Purple (global accent)
| Token | Value | Use |
|---|---|---|
| `--accent` | `#7c3aed` | Primary CTA backgrounds, active states |
| `--accent-bright` | `#8b5cf6` | Gradient endpoint, hover states |
| `--accent-vivid` | `#a78bfa` | Eyebrow labels, icon tints |
| `--accent-dim` | `rgba(124,58,237,0.12)` | Subtle tint backgrounds |

### Service Brand Colours
| Service | Primary | Light | Use |
|---|---|---|---|
| **AI Literacy Training** | `#10b981` | `#34d399` | All training page accents |
| **AI Ops Consulting** | `#2563eb` / `#3b82f6` | `#60a5fa` | All consulting page accents |
| **Agentic Systems** | `#ec4899` | `#f472b6` | All agentic page accents |

### Surface Backgrounds (darkest → lightest)
| Token | Value | Use |
|---|---|---|
| `--mkt-bg` | `#07070d` | Base page background |
| `--mkt-section` | `#0b0b18` | Alternating section backgrounds |
| `--mkt-card` | `#10101e` | Card surfaces |

**Rule:** Sections alternate `--mkt-bg` / `--mkt-section` to create rhythm without hard borders.

### Text
| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#ededf5` | Headings, primary content |
| `--text-secondary` | `#8e8ea8` | Body copy, descriptions |
| `--text-muted` | `#52526a` | Supporting labels, captions |

---

## 2. Typography Scale
*8 steps — do not create intermediate sizes.*

| Step | Class | Size | Use |
|---|---|---|---|
| Display | `text-5xl` / `text-6xl` | 48–60px | Homepage hero headline only |
| H1 | `text-4xl` / `text-5xl` | 36–48px | Page hero headings |
| H2 | `text-2xl` / `text-3xl` | 24–30px | Section headings |
| H3 | `text-xl` | 20px | Card / component headings |
| Lead | `text-lg` | 18px | Subheadlines, hero body |
| Body | `text-base` | 16px | Standard body copy |
| Secondary | `text-sm` | 14px | Supporting text, descriptions |
| Label | `text-xs` | 12px | **Eyebrows, badges, captions ONLY** |

**Critical rule:** `text-xs` is never used for body content — only for overlines (e.g. `SERVICES`), badges, duration chips, and metadata.

Font families:
- **Headings** (`h1`, `h2`, `h3`): Display font + Inter fallback, `letter-spacing: -0.02em`
- **Body**: Inter
- **Mono labels / meta**: System mono

---

## 3. Layout & Width Standards

### Canonical Section Container
```tsx
// ALL content sections use this outer container — no exceptions
<div className="max-w-6xl mx-auto px-6">
```

**Rule:** Never mix `max-w-5xl`, `max-w-4xl`, etc. as the *outer* container for content sections. This causes misaligned card edges across the page.

### Narrower widths — only for centered text blocks *within* sections
```tsx
// Hero subheadline, CTA description — centred text columns only
<p className="max-w-2xl mx-auto ...">    // hero body copy
<p className="max-w-xl mx-auto ...">     // section subtitles
<div className="max-w-3xl mx-auto ...">  // bottom CTA blocks
```

### Fixed Nav Clearance
The nav is `fixed top-0 h-[72px]`. First content element on every page must clear it:
```tsx
// Breadcrumb wrapper (pages with breadcrumbs)
<div className="max-w-6xl mx-auto px-6 pt-[88px] pb-2">

// Hero section when breadcrumb is present — reduce its own pt
<section className="... pt-10 pb-24 ...">

// Hero section when NO breadcrumb (homepage-style) — carries full clearance
<section className="... pt-28 pb-16 ...">
```

---

## 4. Card Design System

### Base Card
```tsx
// soft-card utility (defined in globals.css)
// background: #10101e | box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.3)
// hover: purple border glow + translateY(-2px)
<div className="soft-card p-6">
```

### Service-Coloured Cards (premium treatment)
Used for tier cards, feature cards, testimonials, and cross-service links. Three elements work together:

**1. Top accent bar** — always visible, full width, 3px, gradient fade at edges:
```tsx
<div
  className="h-[3px] w-full"
  style={{ background: "linear-gradient(90deg, transparent, rgba(COLOR, 0.6) 25%, #COLOR 50%, rgba(COLOR, 0.6) 75%, transparent)" }}
/>
```

**2. Card background** — service-colour tint bleeds into dark card base:
```tsx
style={{ background: "linear-gradient(150deg, rgba(COLOR, 0.07) 0%, #10101e 55%)" }}
```

**3. Box shadow** — subtle glow matching service colour:
```tsx
style={{ boxShadow: "0 0 0 1px rgba(COLOR, 0.16), 0 4px 20px rgba(0,0,0,0.4)" }}
```

### Progressive Intensity (for sequential card sets)
When displaying tiers or ranked options, intensity of all three elements increases across the set:
```tsx
const glowOpacity  = [0.10, 0.16, 0.22, 0.35][i];   // border/shadow opacity
const bgOpacity    = [0.05, 0.07, 0.09, 0.12][i];    // background tint
const barOpacity   = [0.35, 0.55, 0.75, 1.00][i];    // top bar intensity
```
The final item (flagship/highest tier) gets an elevated glow and optionally a gradient card background.

### Watermark Numbers
Large semi-transparent numerals anchoring card identity — bottom-right:
```tsx
<span
  className="absolute bottom-4 right-6 text-[88px] font-black leading-none select-none pointer-events-none"
  style={{ color: `rgba(SERVICE_COLOR, ${[0.04, 0.06, 0.09, 0.13][i]})` }}
  aria-hidden="true"
>
  {tierNum}
</span>
```

### Left Accent Bar (alternative to top bar — for variety within a page)
Used on Delivery-type cards to avoid repeating the top-bar pattern:
```tsx
<div
  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
  style={{ background: `linear-gradient(to bottom, rgba(COLOR, 0.7), rgba(COLOR, 0.05))` }}
/>
// Card body must offset: className="pl-7 pr-6 py-6"
```

### Before / After Contrast Cards
Paired cards showing problem → outcome transformation:
```tsx
// Before — red tint
style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.13)" }}
// Label colour: #f87171

// After — service colour tint
style={{ background: `rgba(SERVICE_COLOR, 0.05)`, border: `1px solid rgba(SERVICE_COLOR, 0.15)` }}
// Label colour: service light colour
```

---

## 5. CTA Buttons

### Primary CTA (purple gradient — the canonical site-wide CTA)
```tsx
<Link
  href="/contact"
  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
  style={{
    background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
    boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
  }}
>
  Label Text <ArrowRight className="h-4 w-4" />
</Link>
```
**Rule:** Use this for every primary conversion action (Start a Conversation, Design Your Program, Book a Walkthrough). Never use `Button variant="primary"` for marketing CTAs — the flat variant lacks the gradient and glow that make the CTA pop.

### Secondary / Ghost CTA
```tsx
<Button variant="outline" size="lg">See All Services</Button>
// Or inline:
className="... border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] ..."
```

---

## 6. Section Eyebrow Pattern
Every section begins with a small-caps label above the H2:
```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Services</p>
// On service-specific pages, use the service colour:
<p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#34d399" }}>AI Literacy Training</p>
```

---

## 7. Testimonial Cards

### Scrolling Marquee (homepage / landing sections)
See `components/marketing/testimonials.tsx` — infinite scroll at 400s, card width 360px, `items-stretch` for uniform height.

### Static Grid (service pages)
Three cards in a `md:grid-cols-3` layout. Each card:
```tsx
<div
  className="relative rounded-2xl p-7 flex flex-col gap-5"
  style={{
    background: "linear-gradient(150deg, rgba(SERVICE_COLOR, 0.08) 0%, #10101e 55%)",
    border: "1px solid rgba(SERVICE_COLOR, 0.16)",
    boxShadow: "0 0 0 1px rgba(SERVICE_COLOR, 0.08), 0 6px 24px rgba(0,0,0,0.4)",
  }}
>
  {/* Large decorative quote mark in service colour */}
  {/* Italic blockquote — text-sm */}
  {/* Divider + attribution: role (text-xs uppercase service colour) + context (text-xs muted) */}
```

**Rule:** Pick 3 testimonials from different participant types (role diversity). Favour quotes that speak to transformation over feature descriptions.

---

## 8. Cross-Service Navigation Cards ("Also in Services")

Each card uses its target service's brand colour — not purple:
```tsx
// Consulting (blue)
background: "linear-gradient(150deg, rgba(37,99,235,0.08) 0%, #10101e 55%)"
boxShadow: "0 0 0 1px rgba(37,99,235,0.16), ..."
accent bar: #3b82f6

// Agentic (pink)
background: "linear-gradient(150deg, rgba(236,72,153,0.08) 0%, #10101e 55%)"
boxShadow: "0 0 0 1px rgba(236,72,153,0.16), ..."
accent bar: #ec4899

// Training (emerald) — when linking from other service pages
background: "linear-gradient(150deg, rgba(16,185,129,0.08) 0%, #10101e 55%)"
boxShadow: "0 0 0 1px rgba(16,185,129,0.16), ..."
accent bar: #10b981
```
Cards include: top accent bar, service label in brand colour, headline (text-base font-semibold), description (text-sm), arrow icon.

---

## 9. Navigation & Breadcrumbs

### Nav
- Fixed, `h-[72px]`, transparent until scroll, then `bg-[--mkt-bg]/90 backdrop-blur-xl`
- Logo: `soft-card` container (`background: #10101e`, shadow) + 48px PNG
- Active link: `text-[--accent-vivid] bg-[rgba(124,58,237,0.1)]`
- CTA button: purple gradient (same as §5 Primary CTA, size `px-5 py-2.5`)

### Breadcrumbs
```tsx
// Always place BEFORE the hero section
<div className="max-w-6xl mx-auto px-6 pt-[88px] pb-2">
  <Breadcrumbs crumbs={[
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Current Page" },  // no href on current
  ]} />
</div>
// Then reduce hero pt: pt-10 (not pt-28/pt-32)
```

---

## 10. Page Structure Template (Service Pages)

```
MarketingNav (fixed)
├── Breadcrumb (pt-[88px])
├── Hero section (pt-10, pb-24) — service colour radial glow bg
│     eyebrow · H1 with gradient span · lead paragraph · primary CTA
├── Problem / Framing section (bg-[--mkt-section])
│     H2 · Before/After contrast card pair
├── Platform / Method section (bg-[--mkt-bg])
│     eyebrow · H2 · 2–4 column feature cards
├── Tiers / Packages section (bg-[--mkt-section])
│     eyebrow · H2 · sequential cards with progressive intensity
├── Delivery / Format section (bg-[--mkt-bg])
│     eyebrow · H2 · left-bar accent cards (2×2 grid)
├── Participant Voices / Testimonials (bg-[--mkt-bg], border-t)
│     eyebrow · H2 · 3-column static testimonial cards
├── Also in Services (bg-[--mkt-section], border-t)
│     eyebrow · 2-column cross-service cards in brand colours
├── Bottom CTA (bg-[--mkt-section])
│     H2 · subtext · primary CTA (purple gradient) + ghost CTA
MarketingFooter
```

---

## 11. Accessibility & Readability Rules

- Minimum body font size on dark backgrounds: `text-sm` (14px)
- `text-xs` (12px) reserved for: eyebrow labels, badges, duration chips, navigation breadcrumbs, card metadata
- All decorative elements (watermarks, quote marks, dividers) get `aria-hidden="true"` and `select-none pointer-events-none`
- Contrast: `--text-secondary` (#8e8ea8) on `--mkt-card` (#10101e) passes WCAG AA at 14px+
- `--text-muted` (#52526a) is only used for truly supplementary info (org name, date, source) — never for primary content

---

## 12. Implemented Pages (reference)

| Page | Status | Notes |
|---|---|---|
| Homepage (`/`) | ✅ Complete | Canonical hero, client ribbon, testimonials marquee, feature grid |
| Training (`/services/training`) | ✅ Complete | Full pattern reference — use this as the template |
| Consulting (`/services/consulting`) | ✅ Complete | Blue brand colour throughout |
| Agentic Systems (`/services/agentic-systems`) | ✅ Complete | Pink brand colour throughout |
| Services index (`/services`) | ✅ Complete | Three service summary cards, Trust Architecture grid, philosophy section eyebrow added |
| About (`/about`) | ✅ Complete | Origin/Credentials bg alternation fixed, `--border-active` → explicit rgba, body text size fixes |
| About: Manifesto (`/about/manifesto`) | ✅ Complete | Canonical primary CTA, outline secondary CTA |
| Method (`/method`) | ✅ Complete | Core Promise eyebrow added, Engagement Phases/Trust Architecture bg alternation fixed |
| Platform (`/platform`) | ✅ Complete | "The Difference" eyebrow added, "Get Started" eyebrow added |
| Pricing (`/pricing`) | ✅ Complete | Progressive purple intensity applied to all three tier cards |
| FAQ (`/faq`) | ✅ Complete | Nav clearance `pt-28` added to hero, canonical primary CTA in "Still have questions" |
| Work (`/work`) | ✅ Complete | Canonical primary CTA replacing `<Link><button>` nesting |
| Insights (`/insights`) | ✅ Complete | No violations found — section alternation and CTAs correct |
| Contact (`/contact`) | ✅ Complete | Contact reference values upgraded `text-xs` → `text-sm`, bg alternation verified |

---

## 13. Watermark + Grid Padding Pattern

When a section grid contains large semi-transparent watermark numerals (e.g. tier numbers, phase numbers), the grid container must include right and bottom padding to prevent the watermark from overlapping adjacent text or card borders:

```tsx
// Grid container — add pr-20 pb-20 when watermark is present in cards
<div className="grid md:grid-cols-3 gap-6 pr-20 pb-20">
  {items.map((item, i) => (
    <div key={i} className="relative ...">
      {/* Card content */}
      <span
        className="absolute bottom-4 right-6 text-[88px] font-black leading-none select-none pointer-events-none"
        style={{ color: `rgba(124,58,237,${[0.04, 0.06, 0.09, 0.13][i]})` }}
        aria-hidden="true"
      >
        {i + 1}
      </span>
    </div>
  ))}
</div>
```

**Why:** The absolute-positioned watermark extends outside the card bounds into the grid gap and potentially overlaps the next column or the section padding. `pr-20 pb-20` on the grid container creates a consistent buffer.

**When to apply:** Any grid where cards have `absolute` positioned watermark numerals larger than `text-[60px]`.

---

## 14. Adjacent Section Merging (Calendar / Utility Strips)

Short utility sections (< 100px tall, e.g. calendar booking banners, procurement notes) that logically belong with the content that follows can share the same background as the **hero** (not the content section below). This groups them visually with the page intro rather than breaking the hero → section alternation rhythm.

```
Hero bg-[--mkt-bg]
  ↓
Utility strip bg-[--mkt-bg]   ← same as hero, flows as one unit
  ↓
Form/Content section bg-[--mkt-section]  ← first contrast step
  ↓
Next section bg-[--mkt-bg]
```

**Rule:** Never place a utility strip between two sections of different backgrounds if it causes a third consecutive background value — that reads as a visual stutter.
