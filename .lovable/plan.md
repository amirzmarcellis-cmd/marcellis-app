

## Problem Analysis (from your screenshot)

Looking at your mobile screenshot, I can see three issues:

1. **Excessive left padding** - The `px-3` I added to Index.tsx stacks with `px-4` from DashboardLayout, creating too much space on the left
2. **Right boundary not visible** - The KPI cards (Active Jobs, Waiting Review, etc.) have no visible right edge - they blend into the dark background
3. **Cards look flat** - The current styling isn't creating enough contrast to show card boundaries

## Root Cause

The padding stacking:
- DashboardLayout main: `px-4` (16px)
- Index.tsx wrapper: `px-3` (12px)
- BentoKpis grid: `px-2` (8px)

This creates ~36px left padding on mobile, which is way too much.

## Solution (Mobile Only - Desktop Unchanged)

### 1. Remove the extra padding from Index.tsx wrapper
**File:** `src/pages/Index.tsx`

Remove the `px-3` I added since DashboardLayout already provides padding:
```
Before: mx-0 max-w-full px-3 sm:mx-auto sm:max-w-6xl sm:px-0
After:  mx-0 max-w-full sm:mx-auto sm:max-w-6xl
```

### 2. Remove extra padding from BentoKpis grid
**File:** `src/components/dashboard/BentoKpis.tsx`

Remove the `px-2` since the layout already handles it:
```
Before: px-2 sm:px-0
After:  (remove entirely)
```

### 3. Strengthen the card boundary visibility significantly
**File:** `src/components/dashboard/SimpleMetricCard.tsx`

The current `bg-white/15` and `border-white/25` aren't visible enough in dark mode. I'll make the boundary much more prominent:

- Increase background to `bg-white/20` (more visible glass effect)
- Increase border to `border-white/40` (much more visible)
- Add a stronger inset glow: `shadow-[inset_0_0_0_2px_rgba(255,255,255,0.25)]`
- Keep the outline as additional safeguard

### 4. Ensure DashboardLayout main has proper mobile padding
**File:** `src/components/dashboard/DashboardLayout.tsx`

Reduce mobile padding slightly to give cards more room:
```
Before: px-4 py-1.5
After:  px-2 py-1.5 sm:p-3 (smaller mobile padding, desktop unchanged)
```

## Technical Summary

| File | Change | Mobile Effect | Desktop |
|------|--------|---------------|---------|
| Index.tsx | Remove `px-3` | Less left space | Unchanged |
| BentoKpis.tsx | Remove `px-2 sm:px-0` | Cards use full width | Unchanged |
| SimpleMetricCard.tsx | Stronger `bg-white/20`, `border-white/40` | Visible boundaries | Unchanged via `sm:` |
| DashboardLayout.tsx | `px-2` instead of `px-4` | More card room | Unchanged via `sm:` |

## Expected Result

After these changes on mobile:
- No excessive left padding - content fills the screen properly
- KPI cards have clearly visible boundaries on ALL sides (including right)
- Cards still look compact
- Desktop view remains 100% identical

