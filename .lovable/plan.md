

## Fix Live Candidate Feed Layout on Dashboard

The Live Candidate Feed section on the dashboard is cutting off the candidate score and action buttons on the right side. This plan fixes the layout to ensure all content is visible.

---

### Root Cause Analysis

The issue is in the candidate card layout within the Live Candidate Feed section. The current layout has:
1. Candidate info taking too much horizontal space
2. Score and buttons on the right side getting pushed out of view
3. The parent container not properly constraining content width
4. Missing `overflow-hidden` on key containers

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Fix the candidate card layout in the Live Candidate Feed section |

---

### Detailed Changes

**File: `src/pages/Index.tsx` (Lines 830-893)**

1. **Fix the main card layout** (Line 830-832):
   - Change the flex layout from `flex-col sm:flex-row` to always use a proper responsive structure
   - Ensure the candidate info section has proper max-width constraints

2. **Constrain the left info section** (Lines 832-856):
   - Add `min-w-0` to the candidate info container to allow text truncation
   - Change `flex-1` to have a max-width so the right section (score + buttons) has guaranteed space
   - Ensure text truncation works properly on nested elements

3. **Ensure right section visibility** (Lines 857-879):
   - Give the right section (score + buttons) a minimum width of `min-w-[100px] sm:min-w-[140px]`
   - Add `flex-shrink-0` to prevent the score/button section from shrinking
   - Reduce button text on small screens to just icons

4. **Reduce overall padding and spacing** (Lines 830-893):
   - Reduce card padding from `p-3 sm:p-4 md:p-6` to `p-2 sm:p-3`
   - Reduce gaps between elements
   - Make buttons smaller

---

### Specific Code Changes

**Fix card structure (around line 830)**:
```jsx
// Current structure causes overflow
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
  <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
    ...
  </div>
  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
    ...
  </div>
</div>

// Fixed structure - ensure score section has fixed width
<div className="flex items-start justify-between gap-2 mb-2 w-full">
  <div className="flex items-start space-x-2 min-w-0 flex-1 overflow-hidden">
    ...info section (truncated text)
  </div>
  <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-[80px] sm:min-w-[100px]">
    ...score + buttons (guaranteed width)
  </div>
</div>
```

**Reduce button sizes and make them icon-only on mobile**:
```jsx
<Button size="xs" className="text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-1">
  <XCircle className="w-3 h-3" />
  <span className="hidden sm:inline ml-1">Reject</span>
</Button>
```

**Reduce overall card padding**:
```jsx
// From: p-3 sm:p-4 lg:p-6
// To: p-2 sm:p-3 lg:p-4
<CardContent className="p-2 sm:p-3 lg:p-4">
```

---

### Visual Impact

```text
Before (current - score cut off):
┌──────────────────────────────────────────────────┐
│ Live Candidate Feed                        [LIVE]│
│ ┌──────────────────────────────────────────────┐ │
│ │ (A) Ayan Das                            │ 9X │ │  <- Score cut off
│ │     Lead Product Designer - (Unassigned)│    │ │
│ │     User ID: 297250  Job ID: me-j-0211  │[Re]│ │  <- Buttons cut off
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘

After (fixed - all visible):
┌──────────────────────────────────────────────────┐
│ Live Candidate Feed                        [LIVE]│
│ ┌──────────────────────────────────────────────┐ │
│ │ (A) Ayan Das                           │ 92 │ │  <- Score visible
│ │     Lead Product Designer...           │    │ │
│ │     User ID: 297250  Job ID: me-j..    │[X] │ │  <- Icon buttons
│ │                                        │[✓] │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

### Safety Notes

- Changes are purely layout/CSS adjustments
- No business logic or data fetching is affected
- Changes are localized to the Live Candidate Feed section in Index.tsx
- No impact on other pages or components
- The standalone LiveCandidateFeed page remains unchanged

