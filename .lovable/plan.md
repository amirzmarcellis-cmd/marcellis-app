
## Fix Mobile Dashboard UI Issues

This plan addresses the mobile UI issues:
1. Cards not aligned properly
2. Cards appear too large on mobile
3. Live Candidate Feed is not visible (need to scroll down)

All changes use mobile-first responsive classes that only affect screens smaller than `lg` breakpoint (1024px), leaving the laptop/desktop view completely unchanged.

---

### Summary of Changes

| Issue | Solution |
|-------|----------|
| Live Candidate Feed not visible | Move it above Active Jobs Funnel on mobile using order classes |
| Cards too large | Reduce padding and font sizes on mobile only |
| Cards not aligned | Remove `max-w-2xl mx-auto` on mobile (keep for desktop) |

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Fix ordering, card sizing, and alignment for mobile |

---

### Detailed Changes

**1. Fix Live Candidate Feed visibility on mobile (Lines 741, 800)**

Make Live Candidate Feed appear FIRST on mobile by adding proper order classes:

```tsx
// Line 741 - Active Jobs Funnel section
// From:
<div className="space-y-2 sm:space-y-3 lg:col-span-1">

// To:
<div className="space-y-2 sm:space-y-3 lg:col-span-1 order-2 lg:order-1">


// Line 800 - Live Candidate Feed section (already has order-1 lg:order-2, no change needed)
<div className="space-y-3 sm:space-y-4 lg:space-y-4 lg:col-span-2 order-1 lg:order-2">
```

**2. Fix Live Candidate Feed card alignment on mobile (Line 802)**

Remove max-width constraint on mobile so it aligns with other cards:

```tsx
// From:
<Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border-cyan-400/30 shadow-2xl shadow-cyan-500/20 max-w-2xl mx-auto w-full">

// To:
<Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border-cyan-400/30 shadow-2xl shadow-cyan-500/20 w-full lg:max-w-2xl lg:mx-auto">
```

**3. Reduce KPI card sizes on mobile (BentoKpis)**

The BentoKpis grid already uses `grid-cols-1` on mobile. We can add smaller gap on mobile:

```tsx
// Line 658 - BentoKpis
// From:
<BentoKpis columns={5}>

// The BentoKpis component already handles responsive grid
// No changes needed here as it uses grid-cols-1 on mobile
```

**4. Reduce Advanced Metric Card sizes on mobile (Line 698)**

Add smaller gap on mobile:

```tsx
// From:
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 relative z-10 mt-4 w-full min-w-0 max-w-full">

// To:
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 relative z-10 mt-3 sm:mt-4 w-full min-w-0 max-w-full">
```

**5. Reduce Active Jobs Funnel ScrollArea height on mobile (Line 746)**

Already has mobile-responsive height: `h-[250px] sm:h-[320px] lg:h-[380px]` - no change needed.

---

### Visual Impact on Mobile

```text
Before (Mobile):
┌────────────────────────────┐
│   Header + Activity        │
│   ┌──────────────────────┐ │
│   │  5 large KPI cards   │ │ ← Too large
│   │  (stacked)           │ │
│   └──────────────────────┘ │
│   ┌──────────────────────┐ │
│   │  4 large metric cards│ │ ← Too large
│   │  (stacked)           │ │
│   └──────────────────────┘ │
│   ┌──────────────────────┐ │
│   │  Active Jobs Funnel  │ │ ← Shows first
│   │  (user sees this)    │ │
│   └──────────────────────┘ │
│   ┌─────────────────┐      │
│   │  Live Candidate │      │ ← Hidden (need scroll)
│   │  Feed (narrow)  │      │ ← Misaligned
│   └─────────────────┘      │
└────────────────────────────┘

After (Mobile):
┌────────────────────────────┐
│   Header + Activity        │
│   ┌──────────────────────┐ │
│   │  5 KPI cards         │ │ ← Proper size
│   │  (stacked, compact)  │ │
│   └──────────────────────┘ │
│   ┌──────────────────────┐ │
│   │  4 metric cards      │ │ ← Smaller gap
│   │  (stacked, compact)  │ │
│   └──────────────────────┘ │
│   ┌──────────────────────┐ │
│   │  Live Candidate Feed │ │ ← Shows FIRST
│   │  (full width)        │ │ ← Properly aligned
│   └──────────────────────┘ │
│   ┌──────────────────────┐ │
│   │  Active Jobs Funnel  │ │ ← Shows second
│   └──────────────────────┘ │
└────────────────────────────┘
```

---

### Desktop View (Unchanged)

The laptop/desktop view will remain exactly the same because:
- All changes use responsive classes that only apply below the `lg` breakpoint
- `lg:order-1`, `lg:order-2`, `lg:max-w-2xl`, `lg:mx-auto` preserve desktop behavior
- `sm:gap-3`, `sm:mt-4` preserve tablet/desktop spacing

---

### Safety Notes

- All changes are CSS-only using Tailwind responsive prefixes
- No business logic or data fetching is affected
- Desktop view is preserved using `lg:` and `sm:` prefixes
- No impact on other pages or components
