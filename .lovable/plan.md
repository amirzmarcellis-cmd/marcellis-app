

## Fix: Add Empty Line Between Pros/Cons Items

### Problem
The `{{newline}}` separator is currently replaced with a single newline (`\n`), but the user wants a blank line between each item for better readability.

### Solution
Change the replacement string from `'\n'` to `'\n\n'` in both files. The `whitespace-pre-wrap` CSS class already handles rendering multiple newlines.

### Changes

#### 1. `src/pages/CallLogDetails.tsx`
- **Line 926**: Change `.replace(/\{\{newline\}\}/g, '\n')` to `.replace(/\{\{newline\}\}/g, '\n\n')`
- **Line 935**: Same change for cons

#### 2. `src/pages/CallLogDetailPage.tsx`
- **Line 419**: Change `.replace(/\{\{newline\}\}/g, '\n')` to `.replace(/\{\{newline\}\}/g, '\n\n')`
- **Line 430**: Same change for cons

### No other changes needed
- No new dependencies
- No database changes
- CSS already supports multi-line rendering via `whitespace-pre-wrap`

