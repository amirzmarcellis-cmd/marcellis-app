
## Plan: Apply 80% Zoom on Custom Domain Dashboard

### Goal
Scale the dashboard page to 80% (equivalent to browser zoom at 80%) **only** when accessed on `marcellis.eezi.ai`, so all KPI and Advanced Metric cards fit properly without clipping.

---

### Technical Approach

We will use CSS `transform: scale(0.8)` with width compensation. This approach:
- Works in all browsers (unlike CSS `zoom` which has Firefox issues)
- Does not affect other pages
- Only activates on your custom domain

**How it works:**
```text
+------------------+       +------------------+
|  Original 100%   |  -->  |  Scaled to 80%   |
|  Content clips   |       |  + width: 125%   |
|  on right edge   |       |  = Perfect fit   |
+------------------+       +------------------+
```

When you scale content to 80%, it becomes 20% smaller. To compensate, we set the container width to `125%` (1 / 0.8 = 1.25), so the scaled content fills the available viewport.

---

### Files to Change

**1. `src/pages/Index.tsx`**

Add domain detection and conditional scaling:

```tsx
// At the top of the component, detect custom domain
const isCustomDomain = typeof window !== 'undefined' && 
  window.location.hostname === 'marcellis.eezi.ai';

// On the main wrapper div, add conditional classes
return (
  <div 
    className={cn(
      "min-h-screen bg-background text-foreground relative ...",
      isCustomDomain && "origin-top-left scale-[0.8] w-[125%]"
    )}
  >
    ...
  </div>
);
```

**Why `origin-top-left`?**
- The transform scales from the top-left corner, keeping the content aligned with the page
- Combined with `width: 125%`, the content expands to fill the viewport before being scaled back to 80%

---

### Expected Result

| Before | After |
|--------|-------|
| Cards clipped on right edge at 100% zoom | All 5 KPI cards visible |
| Had to manually set browser zoom to 80% | Automatic 80% scaling on custom domain only |
| Issue only on marcellis.eezi.ai | lovable.app remains unaffected |

---

### Rollback Safety

- This change is isolated to the dashboard page only
- Other pages (Jobs, Candidates, Settings, etc.) are completely unaffected
- If any issues arise, the single conditional class can be removed instantly
- No database or backend changes involved

---

### Technical Details

| Aspect | Value |
|--------|-------|
| Scale factor | `0.8` (80%) |
| Width compensation | `125%` (1 / 0.8) |
| Transform origin | `top left` |
| Domain check | `window.location.hostname === 'marcellis.eezi.ai'` |
| Affected route | `/` (dashboard only) |

---

### Verification Steps

After publishing:
1. Open `https://marcellis.eezi.ai/` - dashboard should show all cards without clipping
2. Open `https://marcellis-app.lovable.app/` - dashboard should render at normal 100% (no scaling)
3. Navigate to `/jobs` on custom domain - should NOT be scaled (only dashboard is affected)
4. Test with sidebar expanded and collapsed - both states should work correctly
