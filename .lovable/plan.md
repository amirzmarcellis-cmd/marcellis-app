

## Goal
Make the SimpleMetricCard even smaller on mobile to ensure the right-side border is fully visible, without affecting the desktop view.

## Current Mobile Settings
- **Width**: `w-[calc(100%-32px)]` (32px narrower than container)
- **Left Margin**: `ml-0` (flush-left)
- **Right Margin**: `mr-8` (32px)

## Requested Changes (Mobile Only)
- **Width**: `w-[calc(100%-42px)]` (42px narrower than container)
- **Right Margin**: `mr-8` (unchanged)

## Desktop Settings (Unchanged)
- `sm:w-full` - full width on desktop
- `sm:mr-0` - no right margin on desktop
- `sm:p-2` - 8px padding on desktop

## File to Modify
**`src/components/dashboard/SimpleMetricCard.tsx`** (Line 38)

### Change
```
// Before
"w-[calc(100%-32px)] ml-0 mr-8 sm:w-full sm:mr-0"

// After
"w-[calc(100%-42px)] ml-0 mr-8 sm:w-full sm:mr-0"
```

## Testing Checklist
1. Hard refresh on iPhone Safari
2. Verify all SimpleMetricCard right borders are visible
3. Confirm desktop dashboard is unchanged

