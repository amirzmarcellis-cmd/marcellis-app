
## Reduce Dashboard Width While Preserving Live Candidate Feed Height

This plan reduces the overall width of the dashboard content area while keeping the live candidate feed item heights intact.

---

### Summary of Changes

1. **Reduce dashboard max-width** from `max-w-7xl` (1280px) to `max-w-6xl` (1152px)
2. **Keep live candidate feed heights unchanged** - no modifications to ScrollArea heights or card item heights
3. **Ensure content remains visible** - adjust internal spacing to accommodate narrower width

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Reduce main container max-width from `max-w-7xl` to `max-w-6xl` |

---

### Detailed Changes

**File: `src/pages/Index.tsx` (Line 633)**

Reduce the main dashboard container width:

```tsx
// From:
<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-7xl pb-20 w-full min-w-0">

// To:
<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-6xl pb-20 w-full min-w-0">
```

---

### What Stays Unchanged

The following elements will NOT be modified:

- **Live Candidate Feed ScrollArea height**: `h-[200px] sm:h-[240px] lg:h-[280px]`
- **Individual candidate card heights**: All padding, text sizes, and button dimensions remain the same
- **Button colors**: Already fixed to use dark theme colors (`bg-red-500/10`, `bg-green-500/10`)
- **Score/buttons section width**: Already set to `min-w-[70px] sm:min-w-[90px]`

---

### Visual Impact

```text
Before (max-w-7xl = 1280px):
┌──────────────────────────────────────────────────────────────────┐
│                         Dashboard Content                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────┐  │
│  │ Active Jobs │ Waiting     │ Shortlisted │ Rejected    │ Sub │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────┘  │
└──────────────────────────────────────────────────────────────────┘

After (max-w-6xl = 1152px):
┌────────────────────────────────────────────────────────────┐
│                      Dashboard Content                      │
│  ┌───────────┬───────────┬───────────┬───────────┬───────┐ │
│  │Active Jobs│ Waiting   │ Shortlist │ Rejected  │  Sub  │ │
│  └───────────┴───────────┴───────────┴───────────┴───────┘ │
└────────────────────────────────────────────────────────────┘
```

The dashboard will be approximately 128px narrower (10% reduction), creating a more compact layout while all content remains fully visible.

---

### Safety Notes

- This is a single CSS class change affecting only the max-width constraint
- No business logic or data fetching is affected
- All card content, buttons, and scores will remain visible
- Mobile responsive breakpoints are preserved
- No impact on other pages
