
Goal
- Stop KPI + Advanced Metric cards from being clipped on the right on https://marcellis.eezi.ai/ (custom domain), without introducing horizontal scrolling and without breaking the live system.

What we know from your answers + code review
- Issue reproduces only on the custom domain (marcellis.eezi.ai), not on the lovable.app domain.
- Sidebar is collapsed when it happens (so the content area should be wider, yet it’s still clipping).
- There is no horizontal scrollbar; content is clipped. That almost always means an ancestor has overflow hidden AND at least one child is still wider than the available width.
- In the dashboard page (src/pages/Index.tsx), the top-level wrapper uses `overflow-hidden` (line ~633). KPI grid containers also use overflow-hidden. So if anything inside has an “intrinsic min width” (charts/SVGs/text), it will get cut off instead of forcing a wrap or shrink.

Likely root cause (most probable)
- One or more dashboard cards (or chart/SVG inside them) is creating a minimum width larger than its grid cell, and because we have `overflow-hidden` at multiple levels, the UI gets clipped.
- The reason it shows “only on custom domain” can be subtle differences in computed viewport width, font rendering, or any extra injected styles/scripts by the custom domain/CDN layer. Even a small width difference can push the last card over the edge when min-width is not allowed to shrink.

Fix strategy (robust, responsive, minimal regression risk)
We’ll make the dashboard resilient by ensuring:
1) Grid items are allowed to shrink (min-w-0/max-w-full).
2) The KPI and Advanced Metrics grids use more conservative breakpoints (so columns don’t get forced too early).
3) We remove or reduce “clipping” overflow-hidden at the exact places where it hides layout bugs, while still preventing horizontal scrolling globally.

Implementation plan (code changes)
A) Make the dashboard containers “shrink-safe”
- File: src/pages/Index.tsx
  - Update the main page wrapper at the return root:
    - Keep overall page from horizontally scrolling (handled already in DashboardLayout outer container with `overflow-x-hidden`), but avoid clipping critical content.
    - Change `overflow-hidden` to `overflow-x-hidden` (so vertical effects still work, but horizontal clipping is limited and more predictable).
    - Add `w-full min-w-0 max-w-full` to ensure the page content truly respects the available width inside SidebarInset.
  - Rationale: This prevents silent clipping while keeping your “no horizontal scroll” requirement.

B) Make KPI grid breakpoints even more conservative + shrink-safe
- File: src/components/dashboard/BentoKpis.tsx
  - Ensure the grid container always has `w-full min-w-0 max-w-full`.
  - For 5-column mode, use a more gradual ramp that delays 4 columns until the viewport is truly large:
    - Proposed (more conservative than current):
      - `grid-cols-1`
      - `sm:grid-cols-2`
      - `lg:grid-cols-3`
      - `xl:grid-cols-4`
      - `2xl:grid-cols-5`
  - Rationale: Even if custom domain is effectively narrower (fonts, zoom, etc.), this prevents 4 columns from being forced too early and avoids that last card getting clipped.

C) Make KPI cards themselves shrink-safe
- File: src/components/dashboard/SimpleMetricCard.tsx
  - Add `min-w-0 max-w-full` to the card root.
  - Ensure internal flex rows have `min-w-0` where needed (especially the left text block) and that long text cannot force width (use `truncate` where appropriate).
  - Rationale: If any child tries to be wider than its cell, min-w-0 ensures it can shrink instead of pushing the grid wider.

D) Advanced metrics grid: same shrink-safe rules + breakpoint adjustment
- File: src/pages/Index.tsx
  - The Advanced Metrics grid already uses `xl:grid-cols-4`. We will:
    - Add `w-full max-w-full` and ensure the grid items can shrink.
    - If needed, make it more conservative on the step before `xl` (e.g., keep it 2 columns until xl).
  - Rationale: Prevent the “Fill Rate” card from being clipped, even if custom domain width is slightly smaller.

E) Verify no other container is forcing width
- Quick audit (read-only already suggests likely culprits, but we will confirm during implementation):
  - Any `max-w-*` or `w-[...]` wrappers around the dashboard sections
  - Any charts/SVGs with fixed widths (AdvancedMetricCard uses `w-full`; Sparkline uses ResponsiveContainer width 100%, so should be OK, but we’ll ensure their parents have min-w-0)

How we’ll validate (no regressions)
- Test in preview and published:
  1) Desktop widths: 1280, 1366, 1440, 1536+.
  2) Sidebar collapsed and expanded.
  3) Confirm: no KPI/Advanced cards cut off; no horizontal scroll on dashboard.
- Specifically re-check your “no horizontal scrolling on mobile” constraint:
  - Test mobile widths (390/414) on the dashboard.
- Confirm other pages are unaffected:
  - Because changes are localized to Index page layout + KPI card components, regression risk is low.

Why this should fix your custom domain specifically
- Even if marcellis.eezi.ai has slightly different effective width (or an injected style), the combination of:
  - more conservative column breakpoints,
  - min-w-0 on grid items and card internals,
  - and removing “hard clipping” overflow-hidden at the wrong layer
  makes the layout adapt instead of cutting off the last cards.

Files we expect to change
- src/pages/Index.tsx
- src/components/dashboard/BentoKpis.tsx
- src/components/dashboard/SimpleMetricCard.tsx
(Optionally, if we find a specific internal element forcing width:)
- src/components/dashboard/AdvancedMetricCard.tsx

Notes about the live system constraint
- We are not changing business logic or data fetching—only layout CSS classes and shrink behavior—so this is safe and low-risk for a live system.

Rollout
- Implement in Test.
- You publish.
- You verify on marcellis.eezi.ai with a normal refresh (hard refresh should not be required once the layout no longer depends on near-threshold widths).
