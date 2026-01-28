

## Fix Live Candidate Feed Layout and Button Colors

This plan addresses two issues visible in the dashboard:
1. Score and buttons are cut off on the right side of the Live Candidate Feed cards
2. Buttons have white/light backgrounds instead of matching the dark theme

---

### Summary of Changes

1. **Fix overflow cutting off content** - Remove `overflow-hidden` from card items and ensure content fits
2. **Fix button colors** - Change button backgrounds to match dark theme (transparent with dark hover states)
3. **Adjust container width** - Remove the restrictive `max-w-[96%]` that's cutting content
4. **Ensure proper spacing** - Give the score and buttons section adequate space

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardLayout.tsx` | Remove restrictive max-width that's cutting off content |
| `src/pages/Index.tsx` | Fix button colors for dark theme, remove overflow-hidden from cards, ensure proper width for buttons section |

---

### Detailed Changes

**File: `src/components/dashboard/DashboardLayout.tsx` (Line 51)**

Remove the `max-w-[98%] sm:max-w-[96%]` that's constraining the main content area:

```tsx
// From:
<main className="flex-1 p-1.5 sm:p-3 md:p-4 lg:p-6 w-full min-w-0 ml-auto max-w-[98%] sm:max-w-[96%]">

// To:
<main className="flex-1 p-1.5 sm:p-3 md:p-4 lg:p-6 w-full min-w-0">
```

**File: `src/pages/Index.tsx` (Lines 830, 860-873)**

1. Remove `overflow-hidden` from the card item:
```tsx
// From:
className={`bg-gradient-to-r rounded-lg p-1.5 border overflow-hidden ${index < 3...`

// To:
className={`bg-gradient-to-r rounded-lg p-1.5 border ${index < 3...`
```

2. Fix button styling to use dark-theme appropriate colors:
```tsx
// Reject Button - From:
className="bg-transparent border border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-300 dark:hover:text-red-300..."

// To:
className="bg-red-500/10 border border-red-400 text-red-400 hover:bg-red-500/20 hover:border-red-300 hover:text-red-300..."

// Submit Button - From:
className="bg-transparent border border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-300 dark:hover:text-green-300..."

// To:
className="bg-green-500/10 border border-green-400 text-green-400 hover:bg-green-500/20 hover:border-green-300 hover:text-green-300..."
```

3. Increase the minimum width for the score/buttons section to prevent cutoff:
```tsx
// From:
<div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[60px] sm:min-w-[80px]">

// To:
<div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[70px] sm:min-w-[90px]">
```

---

### Visual Impact

```text
Before:
┌───────────────────────────────────────────────────┐
│ (A) Ayan Das                    │ (cut off)  │
│     Lead Product Designer       │   Rej... │
│                                 │   Sub... │
└───────────────────────────────────────────────────┘

After:
┌───────────────────────────────────────────────────┐
│ (A) Ayan Das                    │  92  │
│     Lead Product Designer       │ [Reject] │
│     [UserID] [JobID]            │ [Submit] │
└───────────────────────────────────────────────────┘
```

---

### Safety Notes

- All changes are purely visual/CSS adjustments
- No business logic or data fetching is affected
- Changes are localized to the dashboard layout and Live Candidate Feed section
- No impact on other pages or components
- Existing dark/light mode support is preserved with simplified dark-mode-first colors

