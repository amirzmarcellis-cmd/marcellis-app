
## Goal (mobile only)
Make the Dashboard KPI cards on mobile:
- Clearly separated from the page (visible boundaries on left + right)
- More compact (shorter height)
- 100% unchanged on laptop/desktop

Your latest screenshot shows that the cards still blend into the page because the current “boundary” styles are too subtle in a very dark UI. Also, the card shadow is currently being clipped by `overflow-hidden`, which makes the boundary look even weaker.

---

## What I will change (and why it will work)

### A) Make the card boundary “unmissable” on mobile (without touching desktop)
**File:** `src/components/dashboard/SimpleMetricCard.tsx`

**Changes (mobile base classes only):**
1. **Stop clipping the shadow on mobile**
   - Change `overflow-hidden` to `overflow-visible` on mobile
   - Keep `sm:overflow-hidden` so desktop remains identical

2. **Use stronger mobile-only boundary tools**
   - Increase border opacity: `border-white/20` (instead of `/10`)
   - Add a mobile-only ring outline: `ring-1 ring-white/10`
   - Use a slightly stronger mobile background: `bg-white/10` (or `bg-white/8` via Tailwind arbitrary if needed)
   - Add a clearer mobile shadow using an arbitrary value (more visible on black):
     - Example: `shadow-[0_8px_24px_rgba(0,0,0,0.45)]`
   - Keep your existing desktop styling exactly via:
     - `sm:bg-card sm:border-border/60 sm:ring-0 sm:shadow-none`

3. **Make the card smaller on mobile**
   - Reduce padding a bit more: keep `p-2` but tighten internal spacing:
     - reduce sparkline top margin (`mt-1` instead of `mt-1.5`)
     - reduce title font slightly (`text-[9px] sm:text-[10px]`)
     - reduce value size slightly (`text-base sm:text-xl` or `text-[17px] sm:text-xl`)

**Why this solves it:**
- Border + ring + shadow together create a clear card edge even when background and card colors are close.
- Removing `overflow-hidden` on mobile allows the shadow to render outside the rounded corners (right now it gets clipped, which makes the boundary look “missing”).
- Desktop view is preserved by `sm:` overrides.

---

### B) Make KPI cards shorter on mobile by shrinking the sparkline further
**File:** `src/components/ui/Sparkline.tsx`

You already have: `h-8 sm:h-12`. If cards still feel tall, I’ll reduce mobile further:
- Change to `h-7 sm:h-12` (or `h-6 sm:h-12` if needed)

Desktop remains unchanged because `sm:h-12` stays the same.

---

### C) Keep mobile page padding as-is (already correct)
**File:** `src/components/dashboard/DashboardLayout.tsx`

We already use `px-4` on mobile in the `<main>` container, which ensures cards don’t touch the screen edges. No desktop changes.

---

## Important stability fix (unrelated accidental change)
In your last diff, `src/integrations/supabase/types.ts` was modified with two new fields:
- `"Browser call - email"`
- `"Browser call - phone"`

This looks unrelated to the UI request and can cause confusion/type drift if those columns don’t exist in the DB. I will revert this change to keep your live system stable and avoid unexpected typing issues.

---

## Acceptance checklist (what you should see after)
On mobile dashboard:
- KPI cards have obvious visible boundaries (you can clearly see the rounded card edges)
- Cards are noticeably shorter/compact
- No horizontal overflow, and right side edges are visible
- Desktop/laptop view looks exactly the same as before

---

## Files to update
1. `src/components/dashboard/SimpleMetricCard.tsx` (stronger mobile-only boundary + more compact spacing)
2. `src/components/ui/Sparkline.tsx` (optionally reduce mobile height further)
3. `src/integrations/supabase/types.ts` (revert accidental type additions)

---

## Testing steps (to confirm quickly)
1. Open dashboard on mobile (or devtools iPhone width ~390px).
2. Compare: cards should now have visible edges (border + ring) and a shadow that is not clipped.
3. Verify desktop (>= sm breakpoint): KPI cards look unchanged from your current laptop view.
