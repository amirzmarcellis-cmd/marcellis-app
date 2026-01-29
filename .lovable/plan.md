
## Fix Mobile Dashboard Card Alignment and Boundaries

This plan addresses the mobile UI issues shown in your screenshot where cards don't have proper boundaries and appear too long/stretched. The laptop view will remain completely unchanged.

---

### Issues Identified from Screenshot

| Issue | Root Cause |
|-------|------------|
| Cards extending to screen edges | Insufficient combined padding from DashboardLayout + Index.tsx on mobile |
| Right side boundary missing | Sparkline component may overflow or card border not visible |
| Cards appear too long | Cards are stacking at full width without proper margins |

---

### Summary of Changes

1. **Increase mobile padding in DashboardLayout** - Change `p-1.5` to `px-4 py-1.5` for better horizontal margins
2. **Ensure cards have visible rounded borders on mobile** - Add explicit border styling for better visibility
3. **Keep Index.tsx padding as-is** since DashboardLayout is the proper place for global padding

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardLayout.tsx` | Increase mobile horizontal padding in main content area |
| `src/components/dashboard/SimpleMetricCard.tsx` | Ensure sparkline doesn't overflow and border is visible |

---

### Detailed Changes

**1. Fix DashboardLayout mobile padding (Line 51)**

Increase horizontal padding on mobile so cards have proper breathing room:

```tsx
// From:
<main className="flex-1 p-1.5 sm:p-3 md:p-4 lg:p-6 w-full min-w-0">

// To:
<main className="flex-1 px-4 py-1.5 sm:p-3 md:p-4 lg:p-6 w-full min-w-0">
```

This changes mobile padding from 6px all around to:
- `px-4` = 16px horizontal padding on mobile (proper card boundaries)
- `py-1.5` = 6px vertical padding on mobile (keeps compact look)
- `sm:p-3` and above remain unchanged for tablet/desktop

---

**2. Remove duplicate padding from Index.tsx (Line 633)**

Since DashboardLayout now handles padding properly, remove the redundant padding from Index.tsx to avoid double-padding:

```tsx
// From:
<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-6xl pb-20 w-full min-w-0 px-3 sm:px-4 lg:px-0">

// To:
<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-6xl pb-20 w-full min-w-0">
```

---

**3. Ensure SimpleMetricCard border is visible (Lines 36-40)**

Add a more visible border on mobile:

```tsx
// From:
className={cn(
  "relative overflow-hidden rounded-xl border border-border/50 bg-card p-2 transition-all duration-200 hover:border-border min-w-0 max-w-full",
  onClick && "cursor-pointer hover:bg-accent/5",
  className
)}

// To:
className={cn(
  "relative overflow-hidden rounded-xl border border-border/60 bg-card p-3 sm:p-2 transition-all duration-200 hover:border-border min-w-0 max-w-full",
  onClick && "cursor-pointer hover:bg-accent/5",
  className
)}
```

Changes:
- `border-border/60` - Slightly more visible border (from 50% to 60% opacity)
- `p-3 sm:p-2` - Slightly more internal padding on mobile for better touch targets

---

### Visual Impact on Mobile

```text
Before (Mobile):
┌───────────────────────────────────┐
│ACTIVE JOBS                        │ ← No visible boundary
│35                                 │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│ ← Sparkline touches edge
│WAITING REVIEW                     │
│23                                 │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
└───────────────────────────────────┘

After (Mobile):
┌─────────────────────────────────┐
│  ┌─────────────────────────────┐│
│  │ ACTIVE JOBS             📁 ││ ← Visible card boundary
│  │ 35                          ││
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━ ││ ← Sparkline inside card
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ WAITING REVIEW          📋 ││
│  │ 23                          ││
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
   ↑                             ↑
   16px padding                  16px padding
```

---

### Desktop View (Unchanged)

All changes use responsive prefixes:
- `px-4 py-1.5 sm:p-3` - Desktop uses `lg:p-6` which overrides mobile settings
- `p-3 sm:p-2` - Desktop uses `sm:p-2` (unchanged from current behavior)
- The `max-w-6xl` constraint on Index.tsx preserves the centered layout

---

### Safety Notes

- All changes are CSS-only using Tailwind responsive prefixes
- No business logic or data fetching is affected
- Desktop/laptop view is preserved using `sm:` and `lg:` prefixes
- No impact on other pages since DashboardLayout padding affects all pages consistently
- Live production system remains stable
