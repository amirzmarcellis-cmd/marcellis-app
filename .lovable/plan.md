

## Problem Analysis: Why "Submitted" and "Fill Rate" Cards Are Not Visible

### Root Cause
The dashboard has **multiple overlapping `overflow-hidden` containers** that are silently clipping the rightmost cards:

1. **MissionBackground** (`src/components/layout/MissionBackground.tsx` line 12): Uses `overflow-hidden` - this clips BOTH horizontal and vertical overflow
2. **DashboardLayout** (`src/components/dashboard/DashboardLayout.tsx` line 32): Uses `overflow-x-hidden` - clips horizontal overflow
3. **Index.tsx** (line 633): Uses `overflow-x-hidden` - another horizontal clip layer

When the viewport is not wide enough to fit all 5 KPI cards (or 4 Advanced Metric cards) at their minimum widths, the cards that don't fit are **silently clipped** rather than wrapping to the next row or shrinking.

### Why Cards Have Minimum Widths
- **SimpleMetricCard** and **AdvancedMetricCard** contain text elements and Sparkline/SVG charts that establish an intrinsic minimum width
- Even with `min-w-0` applied, some internal elements (text nodes, chart containers) may still be enforcing minimum sizes

---

## Solution Plan

### File 1: `src/components/layout/MissionBackground.tsx`
**Change**: Replace `overflow-hidden` with `overflow-x-hidden`

Why: Allow vertical content to overflow naturally (for scrolling) while only preventing horizontal scrollbar. The background decorative elements (Aurora, Particles) will still be clipped horizontally.

```text
Line 12:
BEFORE: className={cn("relative min-h-screen bg-gradient-hero text-foreground overflow-hidden", className)}
AFTER:  className={cn("relative min-h-screen bg-gradient-hero text-foreground overflow-x-hidden", className)}
```

### File 2: `src/pages/Index.tsx`
**Change 1**: Remove conflicting `max-w-screen-2xl` and keep only `max-w-full` on line 633

Why: Having both `max-w-screen-2xl` (1536px) and `max-w-full` (100%) creates unpredictable behavior. The container should fill the available width inside the sidebar inset.

```text
Line 633:
BEFORE: className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-screen-2xl pb-20 w-full min-w-0 max-w-full"
AFTER:  className="min-h-screen bg-background text-foreground relative overflow-x-hidden pb-20 w-full min-w-0"
```

**Change 2**: Add `min-w-0 overflow-hidden` to each grid item wrapper for the KPI cards (lines 659-693) and AdvancedMetricCard items (lines 699-736)

Why: Ensures each grid cell can shrink independently and its contents won't force the grid wider.

### File 3: `src/components/dashboard/SimpleMetricCard.tsx`
**Change**: Ensure internal containers have proper shrink constraints

Add `overflow-hidden` to the card's internal text containers so long values are truncated rather than forcing width:

```text
Add truncate to the value span:
<span className="text-3xl font-semibold text-foreground truncate">{value}</span>
```

### File 4: `src/components/dashboard/AdvancedMetricCard.tsx`
**Change**: Add `overflow-hidden` to the main card content wrapper to ensure chart/SVG elements don't force width:

```text
Line 95:
BEFORE: <CardContent className="p-4 sm:p-5 min-w-0">
AFTER:  <CardContent className="p-4 sm:p-5 min-w-0 overflow-hidden">
```

---

## Technical Summary

| File | Change | Purpose |
|------|--------|---------|
| MissionBackground.tsx | `overflow-hidden` → `overflow-x-hidden` | Stop vertical content clipping |
| Index.tsx | Remove `max-w-screen-2xl mx-auto` | Eliminate conflicting max-width |
| SimpleMetricCard.tsx | Add `truncate` to value | Allow value text to shrink |
| AdvancedMetricCard.tsx | Add `overflow-hidden` to CardContent | Prevent charts from forcing width |

---

## Expected Result
After these changes:
- **"Submitted" card** (5th KPI card) will be visible even on narrower viewports
- **"Fill Rate" card** (4th Advanced Metric card) will be visible
- Cards will properly wrap to the next row on smaller screens based on the grid breakpoints
- No horizontal scrollbar will appear
- The layout will be truly responsive across all screen sizes

---

## Validation Plan
1. Test at viewport widths: 1280px, 1366px, 1440px, 1536px+
2. Test with sidebar collapsed and expanded
3. Confirm all 5 KPI cards are visible (wrapping is OK)
4. Confirm all 4 Advanced Metric cards are visible
5. Verify no horizontal scrolling on mobile (390px, 414px)

