
## Goal
Make the right-side border of SimpleMetricCard clearly visible on mobile without changing the desktop view.

## Root Cause Analysis
After reviewing the code, I found that:

1. **The SimpleMetricCard changes ARE in the file** - The code shows `w-[calc(100%-40px)] mx-auto` and the internal frame span
2. **The problem is multiple layers of clipping** - There are THREE nested `overflow-x-hidden` declarations:
   - `DashboardLayout.tsx` line 32: outer wrapper
   - `DashboardLayout.tsx` line 51: main content area (also has only `px-2` padding on mobile)
   - `Index.tsx` line 633: page wrapper

3. **The mobile horizontal padding is too tight** - The `<main>` element only has `px-2` (8px) on each side, which combined with the card's calc width, still pushes content close to the edge

## Fix Strategy (Mobile Only, Desktop Unchanged)

### Option A: Increase card breathing room (Preferred)
Change the card width calculation from `w-[calc(100%-40px)]` to `w-[calc(100%-56px)]` or even `w-[calc(100%-64px)]` to provide more visual margin on mobile. This is purely mobile-scoped via `sm:w-full`.

### Option B: Remove one layer of overflow-x-hidden on mobile
Keep `overflow-x-hidden` on desktop but use responsive class to remove it on mobile for the inner containers. However, this risks horizontal scroll on mobile which the user explicitly wants to avoid.

### Recommended Fix
1. **SimpleMetricCard.tsx**: Increase the mobile width reduction from `40px` to `56px`:
   - Change: `w-[calc(100%-40px)]` → `w-[calc(100%-56px)]`
   - This gives 28px breathing room on each side of the card
   - Desktop unchanged via `sm:w-full sm:mx-0`

2. **Ensure internal border is strong enough**: Increase the internal frame border opacity from `border-white/35` to `border-white/50` for better visibility

### Files to Change
- `src/components/dashboard/SimpleMetricCard.tsx`
  - Line 38: Change width calculation for more breathing room
  - Line 52: Increase internal border visibility

### Desktop Safety
All changes remain scoped to mobile via:
- `sm:w-full sm:mx-0` keeps desktop at full width
- `sm:hidden` keeps internal frame hidden on desktop

### Testing Checklist
1. **Hard refresh on iPhone Safari** (Settings → Safari → Clear History and Website Data, OR hold refresh button → "Reload Without Content Blockers")
2. Verify all 5 SimpleMetricCard right borders are visible
3. Check desktop dashboard is unchanged
4. Publish the changes and test on the live published site
