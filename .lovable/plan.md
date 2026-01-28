
## Scale Dashboard to 80% - Implementation Plan

### What We'll Do
Apply an 80% zoom/scale to the dashboard page content, making everything proportionally smaller so all 5 KPI cards (Active Jobs, Waiting Review, Shortlisted, Rejected, Submitted) fit on the screen without being clipped.

### Technical Approach
We will use CSS `transform: scale(0.8)` on the main dashboard container. This scales all content uniformly without changing any individual card sizes, layouts, or removing any elements.

**Key considerations:**
- Use `transform-origin: top left` so content scales from the top-left corner
- Add `width: 125%` to compensate for the 80% scale (since 1/0.8 = 1.25 = 125%) so the scaled content fills the available space properly
- Apply this only to the Index (dashboard) page content, not the sidebar or header

### File Changes

**File: `src/pages/Index.tsx`**

Update the main wrapper div (line 633) to include the scale transform:

```text
Current:
<div className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto max-w-screen-2xl pb-20 w-full min-w-0 max-w-full">

Updated:
<div 
  className="min-h-screen bg-background text-foreground relative overflow-x-hidden mx-auto pb-20 min-w-0"
  style={{ 
    transform: 'scale(0.8)', 
    transformOrigin: 'top left',
    width: '125%'
  }}
>
```

### What This Changes
- All dashboard content (KPIs, Advanced Metrics, Job Funnels, Candidates list) will appear at 80% of their current size
- All 5 KPI cards will now fit in the visible area without clipping
- The sidebar and top header remain unchanged (full size)
- No cards, elements, or functionality are removed

### What Stays The Same
- All card components (SimpleMetricCard, AdvancedMetricCard)
- All data and functionality
- Grid layouts and breakpoints
- Sidebar and navigation
- Other pages in the application
