
## Fix Dashboard Alignment Issue Between Preview and Custom Domain

### Root Cause Analysis

The alignment difference occurs because:

1. **Sidebar State Cookie**: The sidebar persists its expanded/collapsed state in a cookie (`sidebar:state`). On your custom domain, the sidebar is likely expanded (taking up 16rem/256px), while in preview it may be collapsed or the viewport is slightly different.

2. **5-Column Grid Squeeze**: With `lg:grid-cols-5` on the BentoKpis component, when the sidebar is expanded on larger screens, the 5 cards get squeezed and the last card overflows.

3. **Missing Width Constraint**: The main content area doesn't have explicit `max-width` or `overflow-hidden` constraints to contain the grid properly.

---

### Solution

Add explicit overflow handling and ensure the grid container respects its available width:

#### File: `src/components/dashboard/BentoKpis.tsx`

Add `overflow-hidden` and `min-w-0` to prevent the grid from overflowing:

```typescript
export function BentoKpis({ children, className, columns = 4 }: BentoKpisProps) {
  const gridCols = columns === 5 
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" 
    : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
  
  return (
    <div className={cn("grid gap-3 sm:gap-4 min-w-0 overflow-hidden", gridCols, className)}>
      {children}
    </div>
  )
}
```

---

#### File: `src/pages/Index.tsx`

Ensure the parent container of the dashboard content also respects width constraints. Wrap the main content section with `min-w-0` and `overflow-hidden`:

Around line 618-620, update the wrapper div:

```typescript
<div className="space-y-4 sm:space-y-6 relative z-10 w-full min-w-0 overflow-hidden">
```

---

#### File: `src/components/ui/sidebar.tsx`

The SidebarInset component should ensure content doesn't overflow. Check that it has proper flex constraints.

---

### Additional Fix for Immediate Relief

Add responsive breakpoint for the 5-column grid to handle the sidebar-expanded scenario better:

```typescript
const gridCols = columns === 5 
  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5" 
  : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
```

This ensures:
- Mobile (< 640px): 2 columns
- Small (640px+): 3 columns  
- Medium (768px+): 4 columns
- XL (1280px+): 5 columns (only when there's enough space)

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/dashboard/BentoKpis.tsx` | Add `min-w-0 overflow-hidden` to grid, adjust breakpoints to `xl:grid-cols-5` |
| `src/pages/Index.tsx` | Add `min-w-0 overflow-hidden` to dashboard content wrapper |

---

### Why This Works

1. **`min-w-0`**: Overrides the default `min-width: auto` on flex/grid children, allowing them to shrink below their content size
2. **`overflow-hidden`**: Prevents content from visually overflowing its container
3. **`xl:grid-cols-5` instead of `lg:grid-cols-5`**: Delays the 5-column layout until there's truly enough space (1280px viewport), accounting for the sidebar width

This ensures consistent layout regardless of sidebar state or environment.
