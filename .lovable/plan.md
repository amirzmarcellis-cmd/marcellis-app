
## What I found (why the right edge still looks “missing”)
From the code, the KPI cards themselves already have mobile-only border/ring/shadow, and the KPI grid (`BentoKpis`) already has a small mobile padding (`px-1`). So if the **right edge is still cut off**, the most likely cause is **the overall dashboard content container is slightly wider than the mobile viewport**, or it is being **centered with `mx-auto` + max-width** in a way that results in the content appearing shifted right on some devices/browsers.

In `src/pages/Index.tsx`, the dashboard page wrapper is:

- `mx-auto max-w-6xl w-full ... overflow-x-hidden`

This is great for desktop, but on mobile (and especially on iOS Safari / some Android WebViews), the combination of:
- a centered container (`mx-auto`),
- nested padding from the layout (`DashboardLayout` main has `px-4`),
- and other nested blocks,
can lead to the **content rendering a few pixels off** (appearing shifted), which makes the **right boundary of full-width cards** look like it’s “missing.”

## Goal (mobile only)
- Shift the dashboard content slightly left / normalize it so KPI cards never get clipped on the right.
- Ensure KPI cards look compact and have visible boundaries on mobile.
- Desktop/laptop must remain 100% unchanged.

## Implementation approach (safe + minimal, mobile-only)
### A) Fix the “page shifted right” at the source: the dashboard wrapper container (mobile only)
**File:** `src/pages/Index.tsx`

Change the outermost dashboard wrapper classes so that on mobile it does NOT use a centered max-width container, and instead uses true full-width with explicit padding.

Planned adjustments:
1) Replace:
   - `mx-auto max-w-6xl`
   with responsive equivalents:
   - `mx-0 max-w-full sm:mx-auto sm:max-w-6xl`

2) Add explicit mobile padding directly on the Index wrapper (so the page is always “inside” the screen):
   - `px-3 sm:px-0`
   (Desktop remains as-is because padding is removed at `sm`.)

Why this works:
- On mobile, removing `mx-auto` and `max-w-6xl` eliminates centering math that can cause subtle right-shift.
- Adding `px-3` ensures a guaranteed left/right gutter so the right edge is always visible.
- Desktop remains identical because `sm:mx-auto sm:max-w-6xl` restores the original behavior.

### B) Keep KPI grid breathing room (already done) but make it slightly more robust (mobile only)
**File:** `src/components/dashboard/BentoKpis.tsx`

Currently it has `px-1 sm:px-0`. If the right edge still feels tight on real devices, increase slightly:
- `px-2 sm:px-0`

This is mobile-only and does not change desktop.

### C) Ensure the KPI cards’ boundary is visible even if parent containers clip
**File:** `src/components/dashboard/SimpleMetricCard.tsx`

You already have an inset boundary shadow (good). I will ensure two extra safeguards:
1) Add a mobile-only `outline` (outlines are not part of layout and remain visible even when borders blend):
   - `outline outline-1 outline-white/10 outline-offset-0 sm:outline-none`

2) Keep the inset boundary shadow as the primary boundary, since it can’t be “lost” at the right edge due to overflow clipping.

Desktop remains unchanged with `sm:` overrides.

### D) Confirm there is no global horizontal overflow on mobile
**Files:** `src/components/dashboard/DashboardLayout.tsx`, `src/components/layout/MissionBackground.tsx`

I will **not** change desktop behavior, but I will add a safe mobile-only clamp to prevent any accidental horizontal overflow from any child element:
- Add `overflow-x-hidden` specifically on the main content wrapper for mobile, while keeping existing desktop behavior unchanged.

(You already have `overflow-x-hidden` in `DashboardLayout` outer wrapper; this step just ensures the content area itself can’t create a wider scroll width.)

## Deployment / verification (important for custom domain)
Because you’re testing via **custom domain**, you will only see changes after **Publish → Update**, and sometimes mobile browsers cache aggressively.

Verification steps:
1) Publish → Update.
2) On your phone browser: hard refresh (or open in private/incognito) to bypass cache.
3) Confirm the dashboard no longer appears shifted right and KPI right borders are visible.

## Acceptance checklist (what you should see)
On mobile dashboard:
- KPI cards show a visible right boundary (not clipped).
- Page content is aligned (no “shifted right” look).
- KPI cards are compact (shorter).
- Desktop/laptop view looks exactly the same as before.

## Exact files to change (no backend risk)
1) `src/pages/Index.tsx` (main fix: mobile wrapper alignment; desktop preserved via `sm:`)
2) `src/components/dashboard/BentoKpis.tsx` (optional: slightly more mobile padding)
3) `src/components/dashboard/SimpleMetricCard.tsx` (add mobile-only outline safeguard)
4) `src/components/dashboard/DashboardLayout.tsx` (optional: mobile-only overflow-x clamp)

## Risk management (to protect the live system)
- These changes are CSS/className-only.
- No database, auth, or business logic changes.
- Desktop is protected via `sm:` overrides so it remains unchanged.
