
## Fix Dashboard Alignment on Laptop View

### Problem
The dashboard content appears right-aligned on laptop view because it uses `max-w-screen-2xl mx-auto` which centers content based on the remaining viewport width after the sidebar. This creates an asymmetric look where content appears shifted to the right.

---

### Root Cause

In `src/pages/Index.tsx` (line 633):
```typescript
return <div className="min-h-screen bg-background text-foreground relative overflow-hidden mx-auto max-w-screen-2xl pb-20">
```

The `mx-auto max-w-screen-2xl` constraint:
- Limits the maximum width to 1536px
- Centers the content within the available space
- But when sidebar is present, this centering happens within the sidebar-adjusted space, making it look off-center

---

### Solution

Remove `mx-auto max-w-screen-2xl` from the main container so content fills the available width naturally within the sidebar layout. The padding from `DashboardLayout.tsx` (`p-2 sm:p-4 md:p-6 lg:p-8`) already provides appropriate spacing.

---

### File Change

**`src/pages/Index.tsx`** - Line 633

| Before | After |
|--------|-------|
| `min-h-screen bg-background text-foreground relative overflow-hidden mx-auto max-w-screen-2xl pb-20` | `min-h-screen bg-background text-foreground relative overflow-hidden pb-20 w-full` |

---

### Technical Summary

| Change | Description |
|--------|-------------|
| Remove `mx-auto` | Stops artificial centering within remaining viewport space |
| Remove `max-w-screen-2xl` | Allows content to fill available width |
| Add `w-full` | Ensures container takes full width of parent |

This is a minimal CSS-only change that will properly align the dashboard content to use the full available width within the sidebar layout.
