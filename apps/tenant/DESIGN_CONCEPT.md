# Shikhonary Tenant — Design Concept
## List View (Desktop + Mobile)

> This document is the design contract for **all list-view pages** in the tenant app.
> Antigravity must follow this exactly when building or updating any module's list view.
> Theme tokens are from `packages/ui/src/styles/globals.css` under `.dark`.

---

## 0. Layout Control (MANDATORY)

This is the most critical rule. Every list-view module **must** implement both a desktop and mobile view, split by a single breakpoint. Antigravity must never merge or skip either view.

### The Split Pattern

Every `*-view.tsx` (the top-level view component) must render both views separated by `hidden md:block` / `md:hidden`:

```tsx
// batches-view.tsx (or any-module-view.tsx)
export const BatchesView = () => {
  return (
    <>
      {/* ✅ Desktop — hidden on mobile */}
      <div className="hidden md:block">
        <List ... />
      </div>

      {/* ✅ Mobile — hidden on desktop */}
      <div className="md:hidden">
        <MobileList ... />
      </div>
    </>
  );
};
```

> ⚠️ **Rule**: Never use a single layout that tries to be both desktop and mobile via responsive classes inside one component tree. Always use two separate component trees.

---

### Desktop View Modes: List + Grid

Desktop must always support **two view modes** — Table (list) and Grid — toggled from the Filters toolbar. The state lives in the `<List>` index component.

```tsx
// desktop/list/index.tsx
const [viewMode, setViewMode] = useState<"table" | "grid">("table");

// Inside the content card:
<Filters viewMode={viewMode} onViewModeChange={setViewMode} />

<div className="relative flex-grow">
  {viewMode === "table" ? (
    <BatchTable batches={batches} isLoading={isLoading} ... />
  ) : (
    <div className="p-8 bg-card border-t border-white/[0.05]">
      <BatchGrid batches={batches} isLoading={isLoading} ... />
    </div>
  )}
</div>
```

**Grid view** renders data as cards in a `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4` layout. Each grid card uses the same token rules as the table row but in card form.

**Toggle buttons** in the Filters toolbar:
```tsx
<div className="flex items-center border border-white/[0.06] rounded-lg p-0.5">
  <button
    onClick={() => onViewModeChange("table")}
    className={cn(
      "p-1.5 rounded-md transition-colors",
      viewMode === "table"
        ? "bg-white/[0.08] text-foreground"
        : "text-muted-foreground hover:text-foreground"
    )}>
    <List className="w-4 h-4" />
  </button>
  <button
    onClick={() => onViewModeChange("grid")}
    className={cn(
      "p-1.5 rounded-md transition-colors",
      viewMode === "grid"
        ? "bg-white/[0.08] text-foreground"
        : "text-muted-foreground hover:text-foreground"
    )}>
    <LayoutGrid className="w-4 h-4" />
  </button>
</div>
```

---

### Mobile View: Auto-Render Card Layout

Mobile **always** renders cards — never a table. There is no view mode toggle on mobile. The `<MobileList>` component auto-renders the card layout unconditionally.

```tsx
// mobile/list/index.tsx — always card layout, no toggle
export const MobileList = ({ batches, isLoading, ... }) => {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col pb-20">
      <Header />      {/* sticky top bar + search */}
      <main className="flex-grow py-4 flex flex-col gap-4">
        <Stats />     {/* horizontal scroll pills */}
        <div className="px-4 space-y-3">
          {isLoading
            ? skeletons
            : batches.map((item, i) => (
                <MobileCard key={item.id} item={item} index={i} ... />
              ))
          }
        </div>
      </main>
      <Pagination total={total} />
    </div>
  );
};
```

> ⚠️ **Rule**: Mobile wrapper must use `bg-background` — never `bg-white`, `bg-slate-*`, or any hard-coded color. This ensures the dark theme applies correctly.

---

### Z-Index Rules

| Element | z-index | Class |
|---|---|---|
| Dashboard sidebar | `z-30` | Set in `dashboard-layout.tsx` — do not change |
| Mobile sticky header | `z-40` | `z-40` |
| Desktop page content | `z-10` | `relative z-10` inside main |
| Modals / dialogs | `z-100` | Handled by ShadCN |
| Popovers / dropdowns | `z-110` | Handled by ShadCN |

> ⚠️ **Rule**: Never set `z-50` or higher on non-modal page elements — it will overlap the sidebar toggle button.

---

### Background Rule

```tsx
// ✅ Always — use CSS variable token
<div className="bg-background min-h-screen ...">

// ❌ Never — hard-coded light color overrides dark theme
<div className="bg-slate-50/30 text-slate-900 min-h-screen ...">
<div className="bg-white ...">
```

The global dark background (`#080d14`) is set by `dashboard-layout.tsx` and `globals.css`. Individual pages should **never** override it with their own background color.

---

### File Structure for Every Module

```
modules/{module}/ui/
├── views/
│   ├── {module}s-view.tsx      ← top-level: splits desktop / mobile
│   ├── {module}-view.tsx       ← detail view (future)
│   ├── new-{module}-view.tsx   ← create form (future)
│   └── edit-{module}-view.tsx  ← edit form (future)
└── components/
    ├── desktop/
    │   └── list/
    │       ├── index.tsx        ← manages viewMode state
    │       ├── header.tsx       ← page title + CTA button
    │       ├── stats.tsx        ← 4-column stat cards
    │       ├── filters.tsx      ← search + filters + view toggle
    │       ├── {module}-table.tsx  ← table view
    │       ├── {module}-grid.tsx   ← grid view
    │       └── pagination.tsx
    └── mobile/
        └── list/
            ├── index.tsx        ← mobile wrapper (always card layout)
            ├── header.tsx       ← sticky top bar + search
            ├── stats.tsx        ← horizontal scroll pills
            ├── card.tsx         ← mobile card component
            └── pagination.tsx
```

---

## 1. Token Reference (Dark Mode)

Always use these tokens. Never use hard-coded hex or Tailwind color classes like `slate-*`, `emerald-*`, `green-*` directly.

| Role | Token / Class | Dark Value |
|---|---|---|
| Page background | `bg-background` | `#080d14` |
| Card / panel | `bg-card` | `#0d1422` |
| Elevated surface | `bg-muted` | `#111b2e` |
| Primary text | `text-foreground` | `#e2eaf5` |
| Secondary text | `text-muted-foreground` | `#8ba0bc` |
| Section label | `text-[#4a607d]` | `#4a607d` |
| Primary accent | `text-primary` / `bg-primary` | `#00e5a0` |
| Primary text on fill | `text-primary-foreground` | `#001a0f` |
| Default border | `border-transparent shadow-lg shadow-black/40` | borderless with shadow |
| Divider | `border-white/[0.02]` | barely visible |
| Row divider | `border-transparent` | rely on hover/zebra |
| Row hover | `hover:bg-white/[0.02]` | barely visible |
| Active nav tint | `bg-[rgba(0,229,160,0.08)]` | faint emerald |
| Active badge bg | `bg-[rgba(0,229,160,0.10)]` | faint emerald |
| Active badge border | `border-[rgba(0,229,160,0.20)]` | soft emerald |
| Inactive badge | `bg-white/[0.06] text-muted-foreground` | muted |
| Skeleton | `bg-white/[0.06] animate-pulse` | dark pulse |
| Destructive | `text-[#ff4757]` `bg-[rgba(255,71,87,0.08)]` | red |

---

## 2. Desktop List View

### Wireframe Structure

```
┌─────────────────────────────────────────────────┐
│ STICKY PAGE HEADER                              │
│  h1 (Bengali title)    [Ghost Btn] [Primary +]  │
│  subtitle                                       │
├─────────────────────────────────────────────────┤
│ STATS ROW  [card][card][card][card]             │
├─────────────────────────────────────────────────┤
│ CONTENT CARD                                    │
│  ┌───────────────────────────────────────────┐  │
│  │ TOOLBAR  [Search]  [Filters]  [Grid|List] │  │
│  ├───────────────────────────────────────────┤  │
│  │ TABLE                                     │  │
│  │  thead: COL  COL  COL  COL  ACTIONS       │  │
│  │  tbody: row ─────────────────────────── │  │
│  │         row ─────────────────────────── │  │
│  │         row ─────────────────────────── │  │
│  ├───────────────────────────────────────────┤  │
│  │ PAGINATION          Showing 1–10 of 24   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Component Patterns

#### Page Wrapper
```tsx
<div className="hidden md:block min-h-screen bg-background relative isolate">
  {/* Decorative orbs — very faint, handled by dashboard-layout.tsx globally */}
  {/* Do NOT add extra blobs here */}

  <main className="container mx-auto px-6 py-12 lg:px-12 max-w-7xl relative z-10">
    <Header title="..." description="..." />
    <div className="mt-8"><Stats /></div>
    <div className="mt-12 bg-card rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col">
      <Filters />
      <div className="relative flex-grow">
        {viewMode === "table" ? <DataTable /> : <DataGrid />}
      </div>
      <Pagination total={total} />
    </div>
  </main>
</div>
```

#### Page Header
```tsx
<div className="relative flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
  <div className="relative max-w-2xl animate-in fade-in slide-in-from-top-4 duration-700">
    <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-foreground font-headline">
      {title}
    </h1>
    <div className="mt-2 mb-4 h-0.5 w-14 rounded-full bg-primary/80" />
    <p className="text-sm text-muted-foreground max-w-lg">{description}</p>
  </div>

  <Button asChild className="
    bg-primary text-primary-foreground font-bold text-sm
    px-5 py-2.5 rounded-2xl border-0
    shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/50
    hover:scale-[1.02] active:scale-[0.97]
    transition-all duration-200
  ">
    <Link href="/.../new">
      <Plus size={16} strokeWidth={3} />
      <span>নতুন যোগ করুন</span>
    </Link>
  </Button>
</div>
```

#### Stat Card
```tsx
// Token-correct stat card — works in both light and dark
<div className="bg-card border border-white/[0.06] p-6 rounded-xl flex items-center gap-5">
  <div className="w-12 h-12 rounded-full flex items-center justify-center
    bg-[rgba(0,229,160,0.08)] text-primary">
    <Icon className="w-6 h-6" />
  </div>
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <p className="text-2xl font-extrabold text-foreground">{value}</p>
  </div>
</div>

// Inactive / neutral stat — no accent
<div className="bg-card border border-white/[0.06] p-6 rounded-xl flex items-center gap-5">
  <div className="w-12 h-12 rounded-full flex items-center justify-center
    bg-white/[0.06] text-muted-foreground">
    <Icon className="w-6 h-6" />
  </div>
  ...
</div>
```

#### Table Header Row
```tsx
<thead>
  <tr className="bg-white/[0.02]">
    <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest
      text-[#4a607d] border-b border-white/[0.05]">
      Column Name
    </th>
    ...
  </tr>
</thead>
```

#### Table Body Row
```tsx
<tbody className="divide-y divide-white/[0.04]">
  <tr className="hover:bg-white/[0.02] transition-colors group">
    <td className="py-5 px-6">
      {/* Icon badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/[0.06]
          flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <span className="text-sm font-semibold text-foreground">{name}</span>
      </div>
    </td>
    ...
    {/* Status badge */}
    <td className="py-5 px-6">
      <span className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        isActive
          ? "bg-[rgba(0,229,160,0.10)] text-primary border-[rgba(0,229,160,0.20)]"
          : "bg-white/[0.06] text-muted-foreground border-transparent"
      )}>
        {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
      </span>
    </td>
    {/* Actions */}
    <td className="py-5 px-6 text-right">
      <Button variant="ghost" size="icon" asChild
        className="text-muted-foreground hover:text-primary
          hover:bg-[rgba(0,229,160,0.08)] rounded-lg transition-all">
        <Link href={`/.../${id}`}><Eye className="w-5 h-5" /></Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"
            className="text-muted-foreground hover:text-primary
              hover:bg-[rgba(0,229,160,0.08)] rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end"
          className="w-40 bg-[#111b2e] border border-white/[0.08] rounded-xl p-1">
          <DropdownMenuItem asChild
            className="rounded-lg cursor-pointer font-medium
              focus:bg-[rgba(0,229,160,0.08)] focus:text-primary">
            <Link href={`/.../edit/${id}`}><Edit className="w-4 h-4 mr-2" />সম্পাদনা</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem
            className="rounded-lg cursor-pointer font-medium
              text-[#ff4757] focus:text-[#ff4757] focus:bg-[rgba(255,71,87,0.08)]"
            onClick={() => onDelete(id, name)}>
            <Trash2 className="w-4 h-4 mr-2" />মুছুন
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  </tr>
</tbody>
```

#### Empty State
```tsx
<div className="py-20 flex flex-col items-center justify-center text-center space-y-4
  border-t border-white/[0.05]">
  <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center
    justify-center text-[#4a607d]">
    <Icon size={40} />
  </div>
  <div className="space-y-1">
    <h3 className="text-xl font-bold text-foreground">কোনো রেকর্ড নেই</h3>
    <p className="text-muted-foreground max-w-xs mx-auto text-sm">
      ফিল্টার পরিবর্তন করুন অথবা নতুন যোগ করুন।
    </p>
  </div>
</div>
```

#### Skeleton Row
```tsx
<tr>
  <td className="py-5 px-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-white/[0.06] animate-pulse" />
      <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
    </div>
  </td>
  <td className="py-5 px-6">
    <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
  </td>
  <td className="py-5 px-6">
    <div className="h-6 w-16 bg-white/[0.06] rounded-full animate-pulse" />
  </td>
  <td className="py-5 px-6 flex justify-end">
    <div className="w-9 h-9 rounded-lg bg-white/[0.06] animate-pulse" />
  </td>
</tr>
```

---

## 3. Mobile List View

### Wireframe Structure

```
┌─────────────────────────┐
│ STICKY HEADER           │
│  [Icon] Title  subtitle │ [+ Add]
│  [─────── Search ──── ×]│ (visible always)
│  [Filter chips scroll →]│
├─────────────────────────┤
│ STATS  (horizontal →)   │
│ [pill][pill][pill][pill] │
├─────────────────────────┤
│ CARD                    │
│ ║ Name          [badge] │
│ ║ subtitle             │
│ ║ ▓▓▓▓▓▓░░ 42/60       │
│ ║ [── View ──][✎][⟳]   │
├─────────────────────────┤
│ CARD                    │
├─────────────────────────┤
│ CARD                    │
├─────────────────────────┤
│     PAGINATION          │
└─────────────────────────┘
```

### Component Patterns

#### Mobile Page Wrapper
```tsx
<div className="bg-background text-foreground min-h-screen flex flex-col font-sans pb-20">
  <Header />
  <main className="flex-grow py-4 flex flex-col gap-4">
    <Stats />
    <div className="px-4 space-y-3">
      {/* cards */}
    </div>
  </main>
  <Pagination total={total} />
</div>
```

#### Mobile Header
```tsx
<header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md
  border-b border-white/[0.05]">

  {/* Top bar */}
  <div className="flex items-center justify-between px-4 pt-4 pb-3">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[10px] bg-primary
        flex items-center justify-center text-primary-foreground">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-[15px] font-bold text-foreground leading-none">
          ব্যাচ
        </h1>
        <p className="text-[9px] font-semibold text-muted-foreground
          uppercase tracking-[0.18em] mt-1">
          {subtitle}
        </p>
      </div>
    </div>

    <Button asChild className="
      bg-primary text-primary-foreground text-xs font-bold
      h-9 px-3 rounded-xl border-none shadow-md shadow-black/40
      active:scale-95 transition-all duration-150
    ">
      <Link href="/.../new">
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span className="hidden sm:inline ml-1">যোগ করুন</span>
      </Link>
    </Button>
  </div>

  {/* Search bar */}
  <div className="flex items-center gap-2 px-4 pb-3">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2
        text-muted-foreground w-3.5 h-3.5 pointer-events-none" />
      <Input
        placeholder="খুঁজুন..."
        className="w-full h-10 pl-9 bg-white/[0.05] border border-white/[0.08]
          rounded-xl text-sm text-foreground placeholder:text-muted-foreground
          focus-visible:ring-1 focus-visible:ring-[rgba(0,229,160,0.30)]
          focus-visible:border-[rgba(0,229,160,0.30)]"
      />
    </div>
    <div className="flex-shrink-0"><Filters /></div>
  </div>
</header>
```

#### Mobile Stats (horizontal scroll)
```tsx
// Replace 2×2 grid with a single horizontal scroll row
<div className="flex gap-2 px-4 overflow-x-auto scrollbar-none">
  <StatPill label="মোট" value={stats?.total} />
  <StatPill label="সক্রিয়" value={stats?.active} accent />
  <StatPill label="নিষ্ক্রিয়" value={stats?.inactive} />
  <StatPill label="শিক্ষার্থী" value={stats?.totalStudents} />
</div>

function StatPill({ label, value, accent }) {
  return (
    <div className={cn(
      "flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl min-w-[72px]",
      "bg-card border",
      accent
        ? "border-[rgba(0,229,160,0.20)] bg-[rgba(0,229,160,0.06)]"
        : "border-white/[0.06]"
    )}>
      <p className={cn(
        "text-lg font-bold",
        accent ? "text-primary" : "text-foreground"
      )}>
        {value ?? 0}
      </p>
      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
        {label}
      </p>
    </div>
  );
}
```

#### Mobile Card
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.3 }}
  className="bg-card rounded-xl border border-white/[0.06] overflow-hidden
    active:scale-[0.99] transition-transform duration-100"
>
  <div className="flex">
    {/* Left accent bar — 3px, colored by status */}
    <div className={cn(
      "w-[3px] flex-shrink-0",
      item.isActive ? "bg-primary" : "bg-white/[0.10]"
    )} />

    <div className="flex-1 p-4">
      {/* Top: name + status badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        </div>
        <span className={cn(
          "flex-shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
          item.isActive
            ? "bg-[rgba(0,229,160,0.10)] text-primary border-[rgba(0,229,160,0.20)]"
            : "bg-white/[0.06] text-muted-foreground border-transparent"
        )}>
          {item.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
        </span>
      </div>

      {/* Progress bar (if applicable — enrollment, capacity, etc.) */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between">
          <span className="text-[11px] text-muted-foreground">ভর্তি</span>
          <span className="text-[11px] text-foreground font-medium">
            {students}/{capacity}
          </span>
        </div>
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, delay: index * 0.08, ease: "easeOut" }}
            className={cn("h-full rounded-full",
              isFull ? "bg-[#ff4757]" : "bg-primary"
            )}
          />
        </div>
      </div>

      {/* Action row — full width, easy thumb targets */}
      <div className="flex gap-2">
        <Link href={`/.../${item.id}`}
          className="flex-1 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06]
            text-xs font-medium text-foreground
            flex items-center justify-center gap-1.5
            active:bg-white/[0.08] transition-colors">
          <Eye className="w-3.5 h-3.5" />
          দেখুন
        </Link>
        <Link href={`/.../edit/${item.id}`}
          className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06]
            flex items-center justify-center
            active:bg-white/[0.08] transition-colors">
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
        </Link>
        <button
          onClick={() => onToggleActive(item.id)}
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
            item.isActive
              ? "bg-[rgba(0,229,160,0.08)] text-primary"
              : "bg-white/[0.04] border border-white/[0.06] text-muted-foreground"
          )}>
          {item.isActive
            ? <ToggleRight className="w-4 h-4" />
            : <ToggleLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  </div>
</motion.div>
```

#### Mobile Card Skeleton
```tsx
<div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
  <div className="flex">
    <div className="w-[3px] bg-white/[0.06]" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-3 w-24 bg-white/[0.06] rounded animate-pulse" />
        </div>
        <div className="h-5 w-12 bg-white/[0.06] rounded-full animate-pulse" />
      </div>
      <div className="h-1 w-full bg-white/[0.06] rounded-full animate-pulse" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-white/[0.06] rounded-lg animate-pulse" />
        <div className="h-9 w-9 bg-white/[0.06] rounded-lg animate-pulse" />
        <div className="h-9 w-9 bg-white/[0.06] rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
</div>
```

#### Mobile Empty State
```tsx
<div className="flex flex-col items-center justify-center py-20 text-center px-8">
  <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center
    justify-center text-[#4a607d] mb-4">
    <Icon className="w-8 h-8" />
  </div>
  <p className="text-base font-bold text-foreground mb-1">কোনো রেকর্ড নেই</p>
  <p className="text-sm text-muted-foreground">
    ফিল্টার পরিবর্তন করুন অথবা নতুন যোগ করুন।
  </p>
</div>
```

---

---

## 4. Form View (Create / Edit)

Forms must follow a clean, distraction-free layout to make data entry easy on both desktop and mobile.

### Wireframe Structure

```
┌─────────────────────────────────────────────────┐
│ STICKY HEADER                                   │
│  [← Back]               Title           [Save]  │
├─────────────────────────────────────────────────┤
│ FORM CONTAINER (Centered max-w-3xl)             │
│  ┌───────────────────────────────────────────┐  │
│  │ SECTION 1: Basic Info                     │  │
│  │  [ Label ]                                │  │
│  │  [ Input field ─────────────────────────] │  │
│  │                                           │  │
│  │  [ Label ]       [ Label ]                │  │
│  │  [ Select ─▼ ]   [ Input ────────────── ] │  │
│  ├───────────────────────────────────────────┤  │
│  │ SECTION 2: Status                         │  │
│  │  (o) Active   ( ) Inactive                │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Component Patterns (Form)

#### Form Layout Wrapper
```tsx
// desktop & mobile share this base layout
<div className="min-h-screen bg-background flex flex-col pb-20">
  {/* Sticky Header */}
  <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md 
    border-b border-white/[0.02] px-4 py-3 flex items-center justify-between">
    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
      <ArrowLeft className="w-5 h-5 mr-2" /> বাতিল
    </Button>
    
    <h1 className="text-lg font-bold text-foreground">
      {isEdit ? "ব্যাচ সম্পাদনা" : "নতুন ব্যাচ"}
    </h1>

    <Button className="bg-primary text-primary-foreground shadow-md shadow-black/40">
      <Save className="w-4 h-4 mr-2" /> সংরক্ষণ
    </Button>
  </header>

  <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
    <form className="space-y-8">
      {/* Form sections go here */}
    </form>
  </main>
</div>
```

#### Form Section Card
```tsx
<div className="bg-card rounded-2xl shadow-xl shadow-black/40 p-6 md:p-8 space-y-6">
  <div className="border-b border-white/[0.02] pb-4 mb-6">
    <h2 className="text-xl font-bold text-foreground">সাধারণ তথ্য</h2>
    <p className="text-sm text-muted-foreground mt-1">ব্যাচের নাম এবং অন্যান্য তথ্য দিন</p>
  </div>
  
  {/* Form Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2 col-span-1 md:col-span-2">
      <Label className="text-sm font-semibold text-[#4a607d] uppercase tracking-wider">
        ব্যাচের নাম <span className="text-[#ff4757]">*</span>
      </Label>
      <Input 
        className="h-12 bg-white/[0.02] border-transparent shadow-inner focus-visible:ring-1 
          focus-visible:ring-primary focus-visible:bg-white/[0.04] text-foreground rounded-xl"
        placeholder="উদাঃ ব্যাচ ক-১" 
      />
    </div>
    {/* More inputs... */}
  </div>
</div>
```

---

## 5. Detail View (Read-Only)

The detail view (`[id]/page.tsx`) displays a specific record. It uses a 2-column layout on desktop and stacks on mobile.

### Wireframe Structure

```
┌─────────────────────────────────────────────────┐
│ STICKY HEADER                                   │
│  [← Back]               Title           [Edit]  │
├─────────────────────────────────────────────────┤
│ GRID (Left 2/3, Right 1/3)                      │
│                                                 │
│  [ MAIN INFO CARD ]        [ STATUS CARD ]      │
│    Data                      Active badge       │
│    Data                                         │
│                                                 │
│  [ RELATED LIST ]          [ STATS CARD ]       │
│    Table/List of items       Data               │
└─────────────────────────────────────────────────┘
```

---

## 6. Rules Summary

### Layout Rules
1. **Always** split desktop/mobile with `hidden md:block` / `md:hidden` — never merge into one tree
2. **Desktop** must support both `table` and `grid` view modes, toggled from the filters toolbar
3. **Mobile** always renders card layout — no view mode toggle, no tables
4. **Mobile wrapper** must use `bg-background` — never hard-coded background colors
5. **Mobile sticky header** uses `z-40` — never `z-50` or higher on page elements
6. **Never add extra background blobs** inside page components — `dashboard-layout.tsx` handles the global atmosphere
7. **File structure** must follow the `desktop/list/` + `mobile/list/` pattern for every module

### Theming Rules
8. **Never** use `bg-white`, `bg-slate-*`, `bg-emerald-*`, `text-slate-*`, `text-emerald-*` directly
9. **Always** use `bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`, `text-primary`, `bg-primary`
10. **Depth over Borders** — Cards and elevated surfaces MUST NOT use visible borders (`border-transparent`). Instead, use deep soft shadows (`shadow-xl shadow-black/40`) to float elements above the background.
11. **Skeleton** — always `bg-white/[0.06] animate-pulse`, never `bg-slate-100`
12. **Status active** — `bg-[rgba(0,229,160,0.10)] text-primary border-[rgba(0,229,160,0.20)]`
13. **Status inactive** — `bg-white/[0.06] text-muted-foreground border-transparent`
14. **Hover on rows** — `hover:bg-white/[0.02]`
15. **Hover on icon buttons** — `hover:bg-[rgba(0,229,160,0.08)] hover:text-primary`
16. **Destructive hover** — `hover:bg-[rgba(255,71,87,0.08)] hover:text-[#ff4757]`

### Mobile-Specific Rules
17. **Stats** — horizontal scroll pills, NOT a 2×2 grid
18. **Cards** — left accent bar (3px), NOT top color strip
19. **Action row** — full-width bottom row (`h-9` min), NOT tiny corner icons
