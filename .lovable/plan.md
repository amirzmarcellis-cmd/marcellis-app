
## Fix Dashboard Alignment - All Cards Visible

### Problem Analysis

From the screenshot of https://marcellis.eezi.ai/, I can see:

| Row | Expected Cards | Visible Cards | Issue |
|-----|----------------|---------------|-------|
| Top (KPI cards) | 5 | 4 (Submitted cut off) | Grid showing 4 columns but overflowing |
| Bottom (Advanced Metrics) | 4 | 3 (Fill Rate cut off) | `lg:grid-cols-4` too aggressive |

The sidebar takes **256px** when expanded. At a viewport of ~1400px, the content area is only ~1144px, which is insufficient for 4-5 large cards.

---

### Root Cause

1. **BentoKpis**: Currently uses `md:grid-cols-4` which triggers at 768px - but with sidebar, effective content width is ~512px
2. **Advanced Metrics grid**: Uses `lg:grid-cols-4` (1024px breakpoint) - but with sidebar, effective content width is ~768px
3. Both grids overflow because the cards' minimum widths exceed available space

---

### Solution

#### 1. Fix Top KPI Row (`BentoKpis.tsx`)

Change breakpoints to be more conservative:

```typescript
const gridCols = columns === 5 
  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5" 
  : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
```

| Viewport | Columns | With Sidebar |
|----------|---------|--------------|
| < 640px | 2 | Mobile overlay |
| 640-767px | 2 | ~400px content → 2 cards fit |
| 768-1023px | 3 | ~550px content → 3 cards fit |
| 1024-1535px | 4 | ~800px content → 4 cards fit |
| 1536px+ | 5 | ~1280px content → 5 cards fit |

#### 2. Fix Advanced Metrics Row (`Index.tsx`)

Change the grid breakpoint from `lg:grid-cols-4` to `xl:grid-cols-4`:

**Current:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 mt-6">
```

**Updated:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10 min-w-0 overflow-hidden">
```

This ensures 4 columns only appear at `xl` (1280px) viewport, giving ~1024px content width.

#### 3. Ensure Container Constraints

Add `min-w-0 overflow-hidden` to the Advanced Metrics grid container to prevent overflow.

---

### Implementation Details

#### File: `src/components/dashboard/BentoKpis.tsx`

| Line | Change |
|------|--------|
| 11-12 | Update breakpoints: `md:grid-cols-4` → `lg:grid-cols-4` and add `md:grid-cols-3` |

#### File: `src/pages/Index.tsx`

| Line | Change |
|------|--------|
| 698 | Change `lg:grid-cols-4` to `xl:grid-cols-4`, add `min-w-0 overflow-hidden` |

---

### Expected Result

At ~1400px viewport with expanded sidebar:
- **Top row**: 4 KPI cards (all visible, no overflow)
- **Bottom row**: 2 Advanced Metric cards per row (all visible, no overflow)

At 1536px+ viewport:
- **Top row**: 5 KPI cards
- **Bottom row**: 4 Advanced Metric cards

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/dashboard/BentoKpis.tsx` | Adjust breakpoints: `md:grid-cols-3`, `lg:grid-cols-4`, `2xl:grid-cols-5` |
| `src/pages/Index.tsx` | Change Advanced Metrics grid from `lg:grid-cols-4` to `xl:grid-cols-4` + add overflow handling |

This ensures both card rows display properly on your custom domain without any content being cut off.
