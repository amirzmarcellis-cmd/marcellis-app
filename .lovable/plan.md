
## Objective (mobile only)
Make the 9 dashboard cards visually “smaller in width” and aligned to the left on mobile so the **right border is always visible**, without changing card height and without changing anything on desktop.

Cards to target (as you listed):
1) Active Jobs  
2) Waiting Review  
3) Shortlisted  
4) Rejected  
5) Submitted  
6) Pipeline Velocity  
7) Avg Time to Hire  
8) Shortlist Rate  
9) Fill Rate  

## What’s causing your issue (from the current code)
- On mobile, your grids are `grid-cols-1`, which makes each card stretch to the full column width.
- If anything in the layout is slightly offset/cropped (device/browser quirks, overflow rules, container rounding, etc.), the **right edge is the first thing to get clipped**.
- Making borders stronger didn’t help consistently because the cards are still trying to be “full width”.

So instead of fighting clipping, we’ll **intentionally reduce card width on mobile** and **align them left**, leaving a small right-side breathing space that guarantees the right border can be seen.

## Solution approach
We will do two things (mobile only):
1) Tell the grid containers to **not force children to stretch** (align items to start).
2) Give these card components a **slightly reduced width on mobile** (example: `calc(100% - 12px)`), while keeping desktop `w-full`.

This preserves height because we will not change padding, font sizes, or vertical spacing.

## Implementation details (exact code strategy)

### A) KPI grid (first 5 cards) should allow “non-stretched” children on mobile
**File:** `src/components/dashboard/BentoKpis.tsx`

Update the wrapper classes:
- Add: `justify-items-start` on mobile so cards can be narrower than the column
- Add: `sm:justify-items-stretch` to keep desktop behavior identical (cards fill their column)

Result:
- Mobile: items align left and do not stretch
- Desktop: unchanged

### B) Make KPI cards slightly narrower on mobile (but full width on desktop)
**File:** `src/components/dashboard/SimpleMetricCard.tsx`

Add mobile-only width + alignment:
- `w-[calc(100%-12px)]` (or 10–16px; we’ll pick a value that clearly exposes the right border)
- `mr-auto` so it stays aligned to the left
- `sm:w-full sm:mr-0` to preserve desktop exactly

Important:
- We will NOT change `p-*`, typography, icon size, or sparkline spacing in this step, so card height stays the same.

### C) Advanced metrics grid (4 cards) should also allow non-stretched children on mobile
These 4 cards are NOT in `BentoKpis`. They’re in a separate grid in `Index.tsx`:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 ...">
  <AdvancedMetricCard ... />
  ...
</div>
```

**File:** `src/pages/Index.tsx`

Update that grid container to:
- Add: `justify-items-start sm:justify-items-stretch`

This ensures the AdvancedMetricCard can also be narrower on mobile, left-aligned.

### D) Make AdvancedMetricCard slightly narrower on mobile (but full width on desktop)
**File:** `src/components/dashboard/AdvancedMetricCard.tsx`

Add mobile-only width + alignment on the top-level `<Card />`:
- `w-[calc(100%-12px)] mr-auto`
- `sm:w-full sm:mr-0`

Again, no vertical changes, so height remains consistent.

## Why this will fix what you’re seeing
- Even if the page/container has some subtle offset or clipping, the cards will no longer be “flush” to the right edge.
- The right border will always have space to render and be visible.
- Desktop stays unchanged because all of this is constrained to mobile via `sm:` overrides.

## Files that will be changed
1) `src/components/dashboard/BentoKpis.tsx`  
   - Add mobile left alignment behavior for grid items (`justify-items-start sm:justify-items-stretch`)

2) `src/components/dashboard/SimpleMetricCard.tsx`  
   - Add mobile-only reduced width + left alignment (`w-[calc(100%-12px)] mr-auto`, restore `sm:w-full`)

3) `src/pages/Index.tsx`  
   - Add `justify-items-start sm:justify-items-stretch` to the Advanced Metrics grid container

4) `src/components/dashboard/AdvancedMetricCard.tsx`  
   - Add mobile-only reduced width + left alignment on the card container, restore desktop width at `sm`

## Testing checklist (end-to-end)
1) On mobile dashboard: verify all 9 cards have visible right borders and are aligned to the left.
2) Verify card heights did not change (compare before/after; padding and typography remain the same).
3) On desktop: verify KPI row + Advanced Metrics look exactly as they did previously (no spacing/width changes).
4) Hard refresh on phone after Publish → Update (mobile browsers can cache heavily).

## Rollback safety
These are className-only changes. If you dislike the look, we can revert just the mobile `w-[calc(...)]` additions and keep desktop untouched.
