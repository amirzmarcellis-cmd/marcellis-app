

## Make Live Candidate Feed Section More Compact

This plan will significantly reduce the size of the Live Candidate Feed section so that all content (scores, buttons) fits properly without being cut off.

---

### Summary of Changes

1. **Reduce ScrollArea height** - Make the feed area shorter
2. **Make candidate cards more compact** - Reduce padding and spacing
3. **Simplify the card layout** - Stack score and buttons more efficiently
4. **Reduce header size** - Make the section header more compact
5. **Show fewer candidates** - Display only 3 candidates instead of 5

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Reduce heights, padding, fonts, and show fewer candidates |

---

### Detailed Changes

**File: `src/pages/Index.tsx`**

**1. Make CardHeader more compact (Lines 803-822)**

```tsx
// From:
<CardHeader className="p-2 sm:p-3 lg:p-4">

// To:
<CardHeader className="p-1.5 sm:p-2 lg:p-3">
```

Also reduce the title font size:
```tsx
// From:
<CardTitle className="text-base sm:text-lg lg:text-xl text-cyan-300...">

// To:
<CardTitle className="text-sm sm:text-base lg:text-lg text-cyan-300...">
```

**2. Reduce ScrollArea height (Line 825)**

```tsx
// From:
<ScrollArea className="h-[200px] sm:h-[240px] lg:h-[280px]">

// To:
<ScrollArea className="h-[150px] sm:h-[180px] lg:h-[200px]">
```

**3. Show only 3 candidates instead of 5 (Line 827)**

```tsx
// From:
{enrichedCandidates.slice(0, 5).map((candidate, index) => {

// To:
{enrichedCandidates.slice(0, 3).map((candidate, index) => {
```

**4. Reduce spacing between candidate cards (Line 826)**

```tsx
// From:
<div className="space-y-1.5">

// To:
<div className="space-y-1">
```

**5. Make candidate cards more compact (Line 830)**

```tsx
// From:
className={`bg-gradient-to-r rounded-lg p-1.5 border ${index < 3...`

// To:
className={`bg-gradient-to-r rounded-md p-1 border ${index < 3...`
```

**6. Make avatar smaller (Lines 836-838)**

```tsx
// From:
<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br...">

// To:
<div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br...">
```

**7. Make score/buttons section narrower (Line 855)**

```tsx
// From:
<div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[70px] sm:min-w-[90px]">

// To:
<div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[55px] sm:min-w-[70px]">
```

**8. Make score text smaller (Line 856)**

```tsx
// From:
<div className={`text-base sm:text-lg font-bold ${getScoreColor(score)}`}>

// To:
<div className={`text-sm sm:text-base font-bold ${getScoreColor(score)}`}>
```

**9. Make buttons even smaller (Lines 860-873)**

```tsx
// From (Reject button):
className="bg-red-500/10 border border-red-400 text-red-400 hover:bg-red-500/20 hover:border-red-300 hover:text-red-300 transition-all duration-200 text-[8px] px-1 py-0 h-5 w-full"

// To (Reject button):
className="bg-red-500/10 border border-red-400 text-red-400 hover:bg-red-500/20 hover:border-red-300 hover:text-red-300 transition-all duration-200 text-[7px] px-0.5 py-0 h-4 w-full"

// Same change for Submit button
```

**10. Remove the footer section from cards (Lines 878-885)**

Remove or hide the footer with date and badge to make cards more compact:
```tsx
// Remove this section entirely:
{/* Footer - compact */}
<div className="flex items-center justify-between gap-1 mt-1">
  <div className="text-[9px] text-gray-400">
    {new Date(candidate.lastcalltime || Date.now()).toLocaleDateString()}
  </div>
  <Badge className="...">📞 Done</Badge>
</div>
```

---

### Visual Impact

```text
Before (tall, content cut off):
┌──────────────────────────────────────────────────────┐
│ [Icon] Live Candidate Feed [LIVE]    [Active] [Open] │
├──────────────────────────────────────────────────────┤
│ (A) Candidate 1 - Position        │ (cut off)        │
│     [badges]                      │ Rej... Sub...    │
│     Date | 📞 Done                                   │
│ (A) Candidate 2...                                   │
│ (A) Candidate 3...                                   │
│ (A) Candidate 4...                                   │
│ (A) Candidate 5...                                   │
└──────────────────────────────────────────────────────┘

After (compact, everything visible):
┌────────────────────────────────────────────────────┐
│ [Icon] Live Candidate Feed [LIVE]  [Active] [Open] │
├────────────────────────────────────────────────────┤
│ (A) Candidate 1 - Position   │ 92   [Rej] [Sub]    │
│ (A) Candidate 2 - Position   │ 88   [Rej] [Sub]    │
│ (A) Candidate 3 - Position   │ 85   [Rej] [Sub]    │
└────────────────────────────────────────────────────┘
```

---

### Safety Notes

- All changes are purely visual/CSS adjustments
- No business logic or data fetching is affected
- Users can still click "View All" or "Open Feed" to see all candidates
- Existing functionality remains intact
- The section will be approximately 40% smaller in height

