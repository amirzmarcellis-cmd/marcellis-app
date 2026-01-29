
Goal
- Fix mobile so the SimpleMetricCard clearly shows the right-side border (and overall boundary) as in your screenshot.
- Keep desktop view unchanged.

What’s happening (based on code + screenshot)
- The SimpleMetricCard uses mobile-only “outer” effects: `ring-*` and `outline-*`.
- Your dashboard containers use `overflow-x-hidden` in multiple places (`DashboardLayout` main wrapper and `Index` page wrapper). That’s good for preventing horizontal scroll, but it can clip any visual effect that renders outside the element’s box (especially `outline` and sometimes `ring`).
- Result: the card’s “edge” looks cut off on the right in mobile even if the normal `border` exists, because the visible boundary you’re relying on is the clipped outer effect.

Fix strategy (mobile-only; desktop unchanged)
1) Make the border/ring “inset” (draw inside the card, not outside)
- Update the SimpleMetricCard mobile ring to use `ring-inset`.
- Remove the mobile `outline` (outline cannot be inset and is the most likely to be clipped).
- Keep desktop behavior exactly as-is via the existing `sm:*` overrides.

2) Add an internal “frame layer” inside the card (guaranteed visible)
- Add `overflow-hidden` to the card so the internal frame respects rounded corners.
- Add a `span` as the first child:
  - Positioned absolute: `absolute inset-0 rounded-xl`
  - Adds a subtle internal border/frame: `border border-white/35`
  - Mobile-only (hidden on desktop): `sm:hidden`
- This creates a real border that’s rendered inside the card, so it cannot be clipped by parent overflow and will always show on the right.

3) (Optional, only if you still can’t see it) Slightly increase mobile breathing room
- If the right edge still feels too tight visually, adjust width from `w-[calc(100%-28px)]` to something like `w-[calc(100%-40px)]`.
- This is purely mobile and won’t affect desktop due to `sm:w-full`.

Files to change
- src/components/dashboard/SimpleMetricCard.tsx
  - Change mobile ring to `ring-inset`
  - Remove mobile outline classes
  - Add `overflow-hidden`
  - Add internal frame `<span ... />` (mobile-only)
  - (Optional) tweak the mobile calc width if needed

Exact implementation notes (so desktop is not affected)
- Keep: `sm:bg-card sm:border-border/60 sm:ring-0 sm:shadow-none sm:p-2 sm:outline-none`
- Add internal frame only on mobile: `sm:hidden`
- Keep desktop width unchanged: `sm:w-full sm:mx-0`

Test checklist (must-do)
1) Mobile dashboard:
   - Confirm right-side border is clearly visible on all SimpleMetricCards (Active Jobs, Waiting Review, Shortlisted, Rejected, Submitted).
   - Scroll a little to ensure it stays correct as you move the page.
2) Desktop dashboard:
   - Confirm KPI grid looks exactly the same as before (no border/frame differences, no width differences).
3) Hard refresh on your phone (mobile browsers often cache CSS).

If it still doesn’t work after this
- Next step would be to stop using any “outside” effects on mobile (ring/shadows that expand) and rely only on a fully internal frame (a full inset border + inset shadow), which is 100% unclippable. We’ll only do that if needed, because it changes the mobile visual style more.
