# Shikhonary Tenant — Design System

**Theme Name**: Void Lightning  
**App**: Tenant SaaS Portal (`apps/tenant`)  
**Stack**: Next.js 16 + Tailwind v4 + ShadCN + next-themes  
**CSS Source**: `packages/ui/src/styles/globals.css`  
**Default Mode**: Dark (set in `apps/tenant/components/providers.tsx`)

---

## 🧠 Design Philosophy

> **"Understated authority."**  
> The Void Lightning theme is a premium, B2B-grade dark UI. It draws from the aesthetic vocabulary of tools like Linear, Vercel, and Stripe — clean, confident, and restrained. The electric emerald accent (`#00e5a0`) is used **sparingly** as a signal of action, activity, and brand identity. It must never feel like a gaming or neon aesthetic.

### Three Core Rules
1. **Emerald is a signal, not decoration.** Use `--lightning` only on active states, primary actions, and data highlights. Everything else is dark and muted.
2. **Depth through layers, not glow.** Elevation is communicated via background lightness (`#080d14` → `#0d1422` → `#111b2e`), not drop shadows or neon effects.
3. **Bengali content is first-class.** All UI text in Bengali must use the correct font stack and be as visually legible as English content.

---

## 🎨 Color Tokens

All tokens are defined as CSS custom properties in `globals.css` under the `.dark` class.

### Surface Layers (Background Hierarchy)

| Token | Hex | Usage |
|---|---|---|
| `--void-base` | `#080d14` | Page background (`bg-background`) |
| `--void-surface` | `#0d1422` | Cards, sidebar, panels (`bg-card`) |
| `--void-surface-hi` | `#111b2e` | Elevated cards, dropdown menus, popovers |
| `--void-surface-3` | `#15213a` | Highest elevation — modals, tooltips |
| `--void-rim` | `#1e2d47` | Divider lines when visible |

### Accent Colors

| Token | Hex | Usage |
|---|---|---|
| `--lightning` | `#00e5a0` | ⚡ Primary — active states, CTA buttons, chart lines |
| `--lightning-dim` | `#00b37a` | Hover state of primary, gradient start |
| `--lightning-muted` | `rgba(0,229,160,0.12)` | Active nav background tint, chip backgrounds |
| `--lightning-glow` | `rgba(0,229,160,0.25)` | Reduced — avoid using directly |
| `--lightning-pulse` | `rgba(0,229,160,0.08)` | Subtle hover tint on dark surfaces |
| `--spark` | `#38bdf8` | Secondary accent — charts, info states |
| `--spark-muted` | `rgba(56,189,248,0.10)` | Info badge backgrounds |

### Text Hierarchy

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#e2eaf5` | Headings, key content, active labels |
| `--text-secondary` | `#8ba0bc` | Descriptions, metadata, inactive nav |
| `--text-tertiary` | `#4a607d` | Placeholders, section labels, disabled |

### Semantic Colors

| Role | Value | Usage |
|---|---|---|
| Destructive | `#ff4757` | Delete, error, logout hover |
| Warning | `#f59e0b` | Warning badges |
| Info | `var(--spark)` | Info badges |
| Success | `var(--lightning)` | Success states |

### Borders

| Context | Value |
|---|---|
| Default card/panel border | `rgba(255,255,255,0.06)` — nearly invisible white |
| Sidebar right border | `rgba(255,255,255,0.05)` |
| Active/focus border | `rgba(0,229,160,0.25)` |
| Section divider | `rgba(255,255,255,0.05)` |

> ⚠️ **Rule**: Never use a solid colored border. All borders must be semi-transparent.

---

## 🔤 Typography

### Font Stack

```css
--font-sans:    "Inter", "SolaimanLipi", sans-serif;   /* UI / English */
--font-display: "SolaimanLipi", "Inter", sans-serif;   /* Headings / Bengali */
--font-body:    "SolaimanLipi", "Inter", sans-serif;   /* Body / Bengali */
--font-bengali: "SolaimanLipi", sans-serif;            /* Bengali-only */
```

### Scale

| Role | Size | Weight | Class |
|---|---|---|---|
| Page title | `20–24px` | 700 | `text-xl font-bold` |
| Section heading | `16px` | 600 | `text-base font-semibold` |
| Card title | `14px` | 600 | `text-sm font-semibold` |
| Body / labels | `14px` | 400–500 | `text-sm` |
| Small / metadata | `12px` | 400 | `text-xs` |
| Nav section labels | `10px` | 900 | `text-[10px] font-black uppercase tracking-widest` |
| Metric number (stat card) | `28–32px` | 700 | `text-3xl font-bold` |

### Bengali Text Rules
- Always use `font-display` or `font-body` class for Bengali content
- Bengali nav labels, section names, and headings look best at `font-black` weight
- Avoid `tracking-tight` on Bengali text — use `tracking-normal`

---

## 📐 Spacing & Layout

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius` | `0.75rem` (12px) | Default — buttons, inputs, chips |
| `--radius-lg` | `1rem` (16px) | Cards, panels |
| `--radius-xl` | `1.25rem` (20px) | Large modals, sheets |
| `rounded-full` | `9999px` | Avatars, pills, badges |

### Sidebar

- **Width (expanded)**: `w-64` (256px)
- **Width (collapsed)**: `w-16` (64px)
- **Background**: `#0d1422`
- **Right border**: `1px solid rgba(255,255,255,0.05)`
- **Transition**: `transition-all duration-300`

### Dashboard Layout

- **Structure**: `h-screen flex` — sidebar fixed height, main area scrollable
- **Main scroll container**: `overflow-y-auto` on `<main>`
- **Z-index**: sidebar `z-30`, header `z-40`, modals `z-100`

---

## 🧩 Component Patterns

### Cards

**Standard Dark Card**
```tsx
// Use this for any data panel, stat card, or content section
<div className="bg-card rounded-xl border border-white/[0.06] p-5">
  ...
</div>
```
- Background: `bg-card` → maps to `#0d1422`
- Border: `border border-white/[0.06]`
- Radius: `rounded-xl` (16px)
- No shadow by default
- Hover (optional): `hover:border-[rgba(0,229,160,0.15)] transition-colors duration-200`

**Glassmorphism Card** (use only for overlays, modals, floating elements)
```tsx
<div className="glass-void rounded-xl p-5">
  ...
</div>
```
- The `.glass-void` class: `background rgba(13,20,34,0.75)`, `backdrop-blur(16px)`, `border rgba(255,255,255,0.06)`

**Stat / Metric Card**
```tsx
<div className="bg-card rounded-xl border border-white/[0.06] p-5 group hover:border-[rgba(0,229,160,0.15)] transition-colors duration-200">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-9 h-9 rounded-lg bg-[rgba(0,229,160,0.08)] flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <p className="text-xs text-muted-foreground">মোট শিক্ষার্থী</p>
  </div>
  <p className="text-3xl font-bold text-foreground">1,247</p>
  <p className="text-xs text-primary mt-1">+12% গত মাস থেকে</p>
</div>
```

---

### Navigation (Sidebar Items)

**Active State**
```tsx
// Active nav link classes:
"bg-[rgba(0,229,160,0.08)] text-[#00e5a0] [box-shadow:inset_3px_0_0_#00e5a0]"
```
- Background: `rgba(0,229,160,0.08)` — very faint tint
- Text: `#00e5a0` (electric emerald)
- Left indicator: `inset 3px 0 0 #00e5a0` — the "lightning strike" mark
- **No outer glow**

**Inactive State**
```tsx
"text-[#8ba0bc] hover:text-[#e2eaf5] hover:bg-[rgba(255,255,255,0.04)]"
```

**Section Labels**
```tsx
<p className="px-3 mb-2 text-[10px] font-black text-[#4a607d] uppercase tracking-widest">
  মূল কার্যক্রম
</p>
```

---

### Buttons

**Primary Button** (CTA, create, save)
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  নতুন ব্যাচ
</Button>
```
- At rest: flat `#00e5a0` fill, no shadow
- On hover: `0 4px 16px rgba(0,229,160,0.20)` — light shadow only on hover
- Text color: `#001a0f` (very dark green for contrast)
- `transition-all duration-200`

**Secondary / Ghost Button**
```tsx
<Button variant="outline" className="border-white/10 text-foreground hover:bg-white/[0.04] hover:border-white/20">
  বাতিল
</Button>
```
- Border: `rgba(255,255,255,0.10)`
- Hover: border brightens to `rgba(255,255,255,0.20)`, background `rgba(255,255,255,0.04)`
- No color accent — stays neutral

**Destructive Button**
```tsx
<Button variant="ghost" className="text-[#4a607d] hover:text-[#ff4757] hover:bg-[rgba(255,71,87,0.08)]">
  মুছে ফেলুন
</Button>
```

---

### Inputs & Form Elements

**Text Input**
```tsx
<Input className="bg-[rgba(17,27,46,0.6)] border-[rgba(30,45,71,0.8)] text-foreground
  placeholder:text-muted-foreground
  focus:border-[rgba(0,229,160,0.30)] focus:ring-[rgba(0,229,160,0.06)] focus:ring-2" />
```
- Background: dark, slightly blue-tinted `rgba(17,27,46,0.6)`
- Border at rest: `rgba(30,45,71,0.8)` — visible but not harsh
- Focus: emerald border `rgba(0,229,160,0.30)` + `2px ring rgba(0,229,160,0.06)`
- **No glow spread beyond the ring**

**Select / Dropdown**
- Same styling as Text Input
- Dropdown panel: `bg-[#111b2e]` (void-surface-hi), `border border-white/[0.08]`

**Textarea**
- Same as Input, min-height `5rem`

**Labels**
```tsx
<label className="text-sm font-medium text-muted-foreground mb-1.5 block">
  ব্যাচের নাম
</label>
```

---

### Badges & Chips

**Active / Success Badge**
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-[rgba(0,229,160,0.10)] text-[#00e5a0] border border-[rgba(0,229,160,0.20)]">
  সক্রিয়
</span>
```

**Inactive / Neutral Badge**
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-[rgba(255,255,255,0.06)] text-[#8ba0bc] border border-white/[0.08]">
  নিষ্ক্রিয়
</span>
```

**Warning Badge**
```tsx
<span className="bg-[rgba(245,158,11,0.10)] text-amber-400 border border-amber-500/20 ...">
```

**Destructive / Error Badge**
```tsx
<span className="bg-[rgba(255,71,87,0.10)] text-[#ff4757] border border-[rgba(255,71,87,0.20)] ...">
```

---

### Tables

```tsx
// Table wrapper
<div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-white/[0.05]">
        <th className="px-4 py-3 text-left text-[10px] font-black text-[#4a607d] uppercase tracking-widest">
          নাম
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
        <td className="px-4 py-3 text-sm text-foreground">...</td>
      </tr>
    </tbody>
  </table>
</div>
```
- Header row text: `text-[10px] font-black text-[#4a607d] uppercase tracking-widest`
- Row dividers: `border-b border-white/[0.04]` — very faint
- Row hover: `hover:bg-white/[0.02]`
- No zebra striping

---

### Modals & Dialogs

```tsx
// DialogContent styling
<DialogContent className="bg-[#0d1422] border border-white/[0.08] rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
  <DialogHeader className="border-b border-white/[0.05] pb-4">
    <DialogTitle className="text-base font-semibold text-foreground">শিরোনাম</DialogTitle>
  </DialogHeader>
  ...
  <DialogFooter className="border-t border-white/[0.05] pt-4">
    ...
  </DialogFooter>
</DialogContent>
```

---

### Page Header (Dashboard Pages)

Every page should have a consistent header pattern:
```tsx
<div className="px-6 py-5 border-b border-white/[0.05] sticky top-0 z-40 bg-background/90 backdrop-blur-md">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-bold text-foreground">ব্যাচ ম্যানেজমেন্ট</h1>
      <p className="text-sm text-muted-foreground mt-0.5">সকল ব্যাচ পরিচালনা করুন</p>
    </div>
    <div className="flex items-center gap-2">
      {/* action buttons */}
    </div>
  </div>
</div>
```
- Sticky, with `backdrop-blur-md` and `bg-background/90` for glass scroll effect
- `border-b border-white/[0.05]` separator
- Left: title + subtitle / Right: actions

---

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-14 h-14 rounded-xl bg-[rgba(0,229,160,0.06)] flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-[#4a607d]" />
  </div>
  <p className="text-sm font-medium text-foreground mb-1">কোনো ডেটা নেই</p>
  <p className="text-xs text-muted-foreground mb-4">এখনো কোনো ব্যাচ তৈরি হয়নি</p>
  <Button size="sm">নতুন তৈরি করুন</Button>
</div>
```

---

### Loading / Skeleton States

```tsx
// Use Tailwind's animate-pulse with dark-appropriate colors
<div className="h-4 bg-[rgba(255,255,255,0.06)] rounded animate-pulse" />
<div className="h-4 bg-[rgba(255,255,255,0.04)] rounded animate-pulse w-3/4 mt-2" />
```

---

## 🌫️ Background & Atmosphere

### Page Background
The `.dark body` has `background: var(--gradient-void-mesh)` — two barely-visible radial orbs (emerald at top-left 2%, sky-blue at right 1.5%) over a flat `#080d14` base. This is applied globally and should **not be overridden** on individual pages.

### Decorative Orbs (Dashboard Layout Only)
Three fixed-position blur orbs at 2–3% opacity are in `dashboard-layout.tsx`. They are intentionally imperceptible — they exist to add temperature variation, not visible color.

### No Patterns / No Textures on Pages
Do not add background patterns, gradients, or textures to individual page content areas. Only the global layout background has atmosphere. Keep page content backgrounds `transparent` or `bg-background`.

---

## ✅ Do's and ❌ Don'ts

### Do's
- ✅ Use `bg-card` for all content panels and cards
- ✅ Use `text-muted-foreground` for secondary labels
- ✅ Use `border border-white/[0.06]` for default card borders
- ✅ Use `#00e5a0` only on active/primary elements
- ✅ Use `rounded-xl` (16px) for cards, `rounded-lg` (12px) for buttons/inputs
- ✅ Write Bengali text with `font-display` or `font-body` class
- ✅ Use `transition-colors duration-200` on interactive elements
- ✅ Use `text-[10px] uppercase tracking-widest font-black` for section labels

### Don'ts
- ❌ Don't use `box-shadow` with `rgba(0,229,160,...)` unless it's a focus ring (max 2px, max 6% opacity)
- ❌ Don't add `glow` effects to static (non-interactive) elements
- ❌ Don't use solid borders — always semi-transparent
- ❌ Don't use `white` or `black` directly — use `foreground`/`background` tokens
- ❌ Don't add `bg-white/5` hover to non-interactive elements
- ❌ Don't stack multiple box-shadows — max 1 per element
- ❌ Don't use `text-green-*` Tailwind colors — always use `text-primary` or `text-[#00e5a0]`
- ❌ Don't animate on mount without a fade-in — use `animate-fade-in` class
- ❌ Don't use `bg-gradient-*` on cards — flat backgrounds only

---

## 🎯 Tailwind Quick Reference (Dark Mode)

```
bg-background        → #080d14  (page bg)
bg-card              → #0d1422  (panel/card)
bg-muted             → #111b2e  (elevated)
text-foreground      → #e2eaf5  (primary text)
text-muted-foreground → #8ba0bc (secondary text)
text-primary         → #00e5a0  (emerald accent)
border-border        → rgba(0,229,160,0.12)
ring-ring            → #00e5a0

bg-primary           → #00e5a0
text-primary-foreground → #001a0f

bg-destructive       → #ff4757
bg-secondary         → #111b2e
bg-accent            → #38bdf8
```

---

## 📦 ShadCN Component Overrides

When using ShadCN components, apply these className overrides for consistency:

```tsx
// Card
<Card className="bg-card border-white/[0.06] rounded-xl shadow-none" />

// Badge
<Badge className="bg-[rgba(0,229,160,0.10)] text-primary border border-[rgba(0,229,160,0.20)] rounded-full" />

// Separator
<Separator className="bg-white/[0.05]" />

// ScrollArea
<ScrollArea className="[&_[data-radix-scroll-area-scrollbar]]:w-1.5
  [&_[data-radix-scroll-area-thumb]]:bg-white/10" />
```

---

## 🗂️ File Map

| File | Purpose |
|---|---|
| `packages/ui/src/styles/globals.css` | All CSS tokens, dark mode vars, base styles |
| `apps/tenant/components/providers.tsx` | `defaultTheme="dark"` — do not change |
| `apps/tenant/modules/layout/ui/layout/dashboard-layout.tsx` | Root layout, background orbs |
| `apps/tenant/modules/layout/ui/layout/dashboard-sidebar.tsx` | Sidebar nav, dark styles |
| `apps/tenant/modules/layout/ui/layout/dashboard-header.tsx` | Page header component |

---

*This document is the single source of truth for all Shikhonary Tenant UI decisions. When in doubt, reference this file before implementing any component.*
