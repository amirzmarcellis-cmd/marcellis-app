
## Fix Mobile Dashboard UI - Card Alignment, Boundaries, and Live Candidate Feed Actions

This plan addresses all the mobile UI issues while keeping the laptop/desktop view completely unchanged.

---

### Issues Identified

| Issue | Root Cause |
|-------|------------|
| Cards not aligned properly | Missing horizontal padding on main container for mobile |
| Right side boundary missing on cards | Cards extend to viewport edge without margin |
| Live Candidate Feed actions (reject, submit, score) not visible | The score and buttons column is too compressed on mobile |
| Cards appear too large | Need smaller padding and gaps on mobile |

---

### Summary of Changes

1. **Add horizontal padding to main container** for mobile to create proper card boundaries
2. **Improve Live Candidate Feed card items** to show score and action buttons clearly on mobile
3. **Reduce card padding and gaps** on mobile for a more compact layout
4. **Ensure all content stays within viewport** - no overflow or cut-off

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add mobile padding to main container, improve Live Candidate Feed item layout |

---

### Detailed Changes

**1. Add horizontal padding to main container (Line 633)**

Add horizontal padding for mobile so cards don't touch viewport edges:

```tsx
// From:
<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-6xl pb-20 w-full min-w-0">

// To:
<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-6xl pb-20 w-full min-w-0 px-3 sm:px-4 lg:px-0">
```

This adds:
- `px-3` - 12px horizontal padding on mobile (creates visible boundaries)
- `sm:px-4` - 16px padding on tablets
- `lg:px-0` - No extra padding on desktop (unchanged layout)

---

**2. Improve Live Candidate Feed card item layout for mobile (Lines 830-876)**

Restructure the card items to show score and buttons more clearly on mobile:

```tsx
// Current structure has issues on mobile:
// - Score and buttons are in a narrow column that gets compressed
// - Buttons only show icons on mobile (text hidden)

// Improved structure:
// - Show score inline with candidate info
// - Stack buttons horizontally at bottom on mobile
// - Keep current layout on desktop (sm+)
```

Specific changes to the candidate card items:

**Line 832** - Change the main row layout:
```tsx
// From:
<div className="flex items-start justify-between gap-1.5 w-full">

// To:
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 w-full">
```

**Lines 855-875** - Restructure score and buttons section:
```tsx
// From:
<div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[70px] sm:min-w-[90px]">
  <div className={`text-base sm:text-lg font-bold ${getScoreColor(score)}`}>
    {score}
  </div>
  <div className="flex flex-col gap-0.5 w-full">
    // Reject button
    // Submit button
  </div>
</div>

// To:
<div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5 sm:flex-shrink-0 sm:min-w-[90px] w-full sm:w-auto">
  <div className={`text-base sm:text-lg font-bold ${getScoreColor(score)}`}>
    {score}
  </div>
  <div className="flex gap-1 sm:flex-col sm:gap-0.5 flex-1 sm:flex-none sm:w-full">
    // Reject button (visible text on mobile now)
    // Submit button (visible text on mobile now)
  </div>
</div>
```

**Lines 860-873** - Update button styling to show text on mobile:
```tsx
// From (Reject button):
<span className="hidden sm:inline ml-0.5">Reject</span>

// To:
<span className="ml-0.5">Reject</span>

// From (Submit button):
<span className="hidden sm:inline ml-0.5">Submit</span>

// To:
<span className="ml-0.5">Submit</span>
```

---

**3. Adjust card info section layout (Lines 834-852)**

Make the candidate info section work better with the new mobile layout:

```tsx
// From:
<div className="flex items-start space-x-1.5 min-w-0 flex-1 overflow-hidden">

// To:
<div className="flex items-start space-x-1.5 min-w-0 flex-1 overflow-hidden sm:flex-1">
```

And add score display inline for mobile:

```tsx
// Add after candidate name on mobile:
<div className="flex items-center gap-2">
  <h4 className="...truncate">{candidate.candidate_name}</h4>
  <span className={`sm:hidden text-sm font-bold ${getScoreColor(score)}`}>
    {score}
  </span>
</div>
```

---

### Visual Impact on Mobile

```text
Before (Mobile):
┌────────────────────────────────┐
│  Card touches edges            │ ← No boundary
│ ┌────────────────────────────┐ │
│ │ Avatar │ Name + Job        │ │
│ │        │ Badges            │S│ ← Score barely visible
│ │        │                   │?│ ← Buttons cut off
│ └────────────────────────────┘ │
└────────────────────────────────┘

After (Mobile):
┌──────────────────────────────────┐
│   ← padding →                    │
│  ┌────────────────────────────┐  │
│  │ Avatar │ Name    │ Score 85│  │ ← Score visible
│  │        │ Job Title         │  │
│  │        │ Badges            │  │
│  │ [Reject] [Submit]          │  │ ← Full buttons visible
│  └────────────────────────────┘  │
│   ← visible boundaries →         │
└──────────────────────────────────┘
```

---

### Desktop View (Unchanged)

All changes use responsive prefixes that only apply to mobile:
- `px-3 sm:px-4 lg:px-0` - No change at lg+ screens
- `flex-col sm:flex-row` - Desktop stays as row layout
- `sm:hidden` / `hidden sm:inline` - Desktop shows original elements
- All existing lg: and xl: classes preserved

---

### Safety Notes

- All changes are CSS-only using Tailwind responsive prefixes
- No business logic or data fetching is affected
- Desktop/laptop view is preserved using `sm:` and `lg:` prefixes
- No impact on other pages or components
- Live production system remains stable
