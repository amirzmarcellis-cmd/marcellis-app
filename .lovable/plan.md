
## Fix Dashboard Alignment - Scale Content to Fit

### Problem
The 5 KPI cards are still not fitting on your custom domain because:
- The sidebar takes up **16rem (256px)** when expanded
- Even at **xl breakpoint (1280px)**, the content area is only ~1024px
- This leaves insufficient space for 5 cards to display properly

### Solution
Apply a "zoom reduction" effect by either:
1. **Delay 5-column layout to 2xl breakpoint (1536px)** - ensures sufficient width
2. **Reduce card padding and text sizes** for more compact cards
3. **Add CSS transform scale** for a true "zoom out" effect on smaller screens

### Recommended Approach
Change the 5-column breakpoint from `xl` to `2xl` (1536px), which accounts for the sidebar width and ensures all 5 cards fit comfortably.

---

### Implementation

#### File: `src/components/dashboard/BentoKpis.tsx`

**Current:**
```typescript
const gridCols = columns === 5 
  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5" 
  : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
```

**Updated:**
```typescript
const gridCols = columns === 5 
  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5" 
  : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
```

This means:
| Screen Width | With Sidebar (256px) | Content Width | Columns |
|--------------|---------------------|---------------|---------|
| < 640px | Mobile overlay | Full | 2 |
| 640px - 767px | ~384px | ~600px | 3 |
| 768px - 1535px | ~512px | ~1024px | 4 |
| **1536px+** | ~1280px | **5** |

At **2xl (1536px)**, the content area has ~1280px available, which comfortably fits 5 cards even with the sidebar expanded.

---

### Alternative: Compact Cards (Optional)

If you prefer 5 columns at smaller screens, we can also reduce the card size:

#### File: `src/components/dashboard/SimpleMetricCard.tsx`

- Reduce padding from `p-4` to `p-3`
- Reduce value text from `text-3xl` to `text-2xl`
- Reduce icon container size

---

### Summary

| File | Change |
|------|--------|
| `src/components/dashboard/BentoKpis.tsx` | Change `xl:grid-cols-5` to `2xl:grid-cols-5` |

This ensures the 5-column layout only activates when there's truly enough horizontal space (1536px viewport), preventing the 4th/5th card from being cut off on your custom domain.
