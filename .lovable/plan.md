

## Reduce Dashboard Page Size

This plan makes the dashboard more compact by reducing card sizes and the overall content max-width.

---

### Summary of Changes

1. **Reduce max-width** of the dashboard content container from `max-w-screen-2xl` (1536px) to `max-w-7xl` (1280px)
2. **Make KPI cards smaller** by reducing padding, font sizes, and icon sizes
3. **Make Advanced Metric cards smaller** by reducing padding and font sizes
4. **Reduce section heights** for the Jobs Funnel and Live Feed scroll areas

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Reduce max-width, decrease scroll area heights, reduce gaps between sections |
| `src/components/dashboard/SimpleMetricCard.tsx` | Smaller padding (p-4 → p-3), smaller value text (text-3xl → text-2xl), smaller icon |
| `src/components/dashboard/AdvancedMetricCard.tsx` | Smaller padding (p-4/p-5 → p-3/p-4), smaller value text (text-4xl → text-2xl) |
| `src/components/dashboard/BentoKpis.tsx` | Reduce gap between cards (gap-4 → gap-3) |

---

### Detailed Changes

**File: `src/pages/Index.tsx`**

1. Change the main container max-width:
   - From: `max-w-screen-2xl` (1536px)
   - To: `max-w-7xl` (1280px)

2. Reduce scroll area heights:
   - Jobs Funnel: from `h-[400px] sm:h-[500px] lg:h-[600px]` to `h-[300px] sm:h-[400px] lg:h-[450px]`
   - Live Feed: from `h-[400px] sm:h-[450px] lg:h-[500px]` to `h-[300px] sm:h-[350px] lg:h-[400px]`

3. Reduce gaps between sections:
   - Main grid gap: from `gap-4 sm:gap-6` to `gap-3 sm:gap-4`
   - Header margin: from `mb-6 sm:mb-8` to `mb-4 sm:mb-6`

---

**File: `src/components/dashboard/SimpleMetricCard.tsx`**

1. Reduce card padding:
   - From: `p-4`
   - To: `p-3`

2. Reduce main value font size:
   - From: `text-3xl`
   - To: `text-2xl`

3. Reduce icon container:
   - Padding: `p-2` → `p-1.5`
   - Icon size: `h-5 w-5` → `h-4 w-4`

4. Reduce sparkline margin:
   - From: `mt-3`
   - To: `mt-2`

---

**File: `src/components/dashboard/AdvancedMetricCard.tsx`**

1. Reduce card padding:
   - From: `p-4 sm:p-5`
   - To: `p-3 sm:p-4`

2. Reduce main value font size:
   - From: `text-2xl sm:text-3xl md:text-4xl`
   - To: `text-xl sm:text-2xl md:text-3xl`

3. Reduce icon container size:
   - From: `p-1 sm:p-1.5`
   - To: `p-1`

---

**File: `src/components/dashboard/BentoKpis.tsx`**

1. Reduce grid gap:
   - From: `gap-3 sm:gap-4`
   - To: `gap-2 sm:gap-3`

---

### Visual Impact

```text
Before:
┌────────────────────────────────────────────────────────────────┐
│                    max-width: 1536px                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │  Large   │ │  Large   │ │  Large   │ │  Large   │ │  Large   │
│  │  Cards   │ │  Cards   │ │  Cards   │ │  Cards   │ │  Cards   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
└────────────────────────────────────────────────────────────────┘

After:
┌────────────────────────────────────────────────────────┐
│               max-width: 1280px                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  │Compact │ │Compact │ │Compact │ │Compact │ │Compact │
│  │ Cards  │ │ Cards  │ │ Cards  │ │ Cards  │ │ Cards  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
└────────────────────────────────────────────────────────┘
```

---

### Safety Notes

- All changes are purely visual/CSS adjustments
- No business logic or data fetching is affected
- Changes are localized to dashboard components only
- No impact on other pages or the live system

