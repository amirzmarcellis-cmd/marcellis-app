

## Fix Pipeline Button Overflowing Outside Card

### Problem
The Submit, Reject, and Pipeline action buttons in the AI Shortlist candidate cards overflow outside the card boundary. The layout was originally designed for 2 buttons but now has 3, causing overflow on smaller screens.

### Root Cause
The button container at line 3158 uses `flex flex-col sm:flex-row` with each button having `sm:min-w-[120px]`. With 3 buttons, the combined minimum width exceeds the card width, pushing Pipeline outside.

### Fix: `src/pages/JobDetails.tsx` (line ~3158)

1. **Change the button container layout** from `flex flex-col sm:flex-row` to a wrapping grid/flex layout that accommodates 3 buttons:
   - Use `flex flex-wrap gap-2` so buttons wrap to a new row if needed
   - Remove `sm:min-w-[120px]` from all three buttons (Submit, Reject, Pipeline)
   - Use `flex-1 min-w-[90px]` instead so they share space evenly and wrap gracefully

2. **Update all 3 button groups** (lines ~3158-3248):
   - Submit button: change class from `w-full sm:flex-1 min-w-0 sm:min-w-[120px]` to `flex-1 min-w-[90px]`
   - Reject button: same change
   - Pipeline button: same change
   - The disabled/active variants of each button get the same class update

This ensures all 3 buttons fit within the card at all screen sizes, wrapping to a second row on very narrow screens.
