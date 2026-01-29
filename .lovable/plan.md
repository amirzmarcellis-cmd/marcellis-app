
## Goal
Fix the dashboard cards on **mobile** so they:
- Have a clear visible **card boundary** (left + right)
- Look **smaller/compact** (less height)
- Do **not change anything on desktop/laptop** (same look as now)

Your screenshot shows the KPI cards blend into the page because in dark mode:
- `--background` is pure black
- `--card` is also pure black  
So `bg-card` becomes visually identical to the page, making borders look “missing”.

---

## What I will change (mobile-only, desktop unchanged)

### 1) Make KPI cards visibly “card-like” only on mobile
**File:** `src/components/dashboard/SimpleMetricCard.tsx`

Update the card wrapper classes so that on **mobile** it uses:
- Slightly lighter background (e.g. `bg-white/5`) so it separates from black page
- A clearer border in dark mode (e.g. `border-white/10`)
- A subtle shadow to define the card edges
- Smaller padding and smaller value font size

And on **sm and above** (tablet/desktop/laptop) it keeps the existing styling by overriding back to:
- `sm:bg-card`
- `sm:border-border/60`
- `sm:shadow-none`
- `sm:text-xl` for the value

Concrete approach:
- Wrapper class becomes something like:
  - `bg-white/5 border-white/10 shadow-soft p-2`
  - plus `sm:bg-card sm:border-border/60 sm:shadow-none sm:p-2`
- Value text becomes:
  - `text-lg sm:text-xl`

This ensures:
- Mobile gets visible boundaries and more compact size
- Desktop keeps exactly the current visuals

---

### 2) Reduce KPI card height by making the sparkline shorter only on mobile
**File:** `src/components/ui/Sparkline.tsx`

The sparkline currently uses `h-12` which makes the KPI cards tall.
Change the sparkline container to:
- `h-8 sm:h-12`

So:
- Mobile KPI cards become shorter (smaller)
- Desktop stays the same height as before

---

### 3) Verify global spacing is not the real issue (no risky layout changes)
**File:** `src/components/dashboard/DashboardLayout.tsx`

We already added `px-4` on mobile in `<main>`, which should give the page left/right breathing room.
I will **not** change desktop spacing.
If needed, I’ll adjust only the mobile value slightly (e.g., `px-5`), but only if after the KPI fixes the boundary still appears flush.

Given your screenshot, the bigger issue is the KPI cards’ background equals the page background; fixing the KPI card styling should solve the “no boundaries” look without further layout changes.

---

## Why this will not affect desktop
All visual changes will be applied with Tailwind’s responsive pattern:
- Base classes = mobile behavior
- `sm:` classes = revert to existing desktop styling

That means laptop/desktop view retains:
- the current background (black card)
- the same border intensity
- the same spacing/size

---

## Acceptance checklist (what you should see after)
On mobile dashboard:
- Each KPI card has a clearly visible rounded boundary (left and right)
- KPI cards are shorter and more compact (not long/tall)
- No horizontal overflow / no clipped right side
- Desktop looks identical to before

---

## Files to edit
1. `src/components/dashboard/SimpleMetricCard.tsx`
2. `src/components/ui/Sparkline.tsx`
(Only if still needed after those: `src/components/dashboard/DashboardLayout.tsx` for mobile-only padding micro-adjust)

---

## Safety / Regression notes
- No business logic changes
- No routing changes
- No data changes
- Only mobile CSS adjustments with `sm:` overrides to preserve desktop visuals
