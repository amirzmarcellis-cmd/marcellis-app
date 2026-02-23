

## Fix `{{newline}}` Display in Pros/Cons on Call Log Details Pages

### Problem
The `after_call_pros` and `after_call_cons` fields from the database contain the literal string `{{newline}}` as a separator. Both call log detail pages render this text as-is instead of converting it to actual line breaks.

### Solution
Replace all occurrences of `{{newline}}` with `\n` before rendering. Since both pages already use `whitespace-pre-wrap` or `leading-relaxed` styles, converting to real newlines will display them correctly.

### Changes

#### 1. `src/pages/CallLogDetails.tsx` (2 lines)
- **Line 926**: Replace `{callLog.after_call_pros || ...}` with `{(callLog.after_call_pros || 'No pros available').replace(/\{\{newline\}\}/g, '\n')}`
- **Line 935**: Replace `{callLog.after_call_cons || ...}` with `{(callLog.after_call_cons || 'No cons available').replace(/\{\{newline\}\}/g, '\n')}`

#### 2. `src/pages/CallLogDetailPage.tsx` (2 lines)
- **Line 419**: Replace `{record.after_call_pros}` with `{record.after_call_pros.replace(/\{\{newline\}\}/g, '\n')}`
- **Line 430**: Replace `{record.after_call_cons}` with `{record.after_call_cons.replace(/\{\{newline\}\}/g, '\n')}`
- Also add `whitespace-pre-wrap` to the `<p>` className on these lines so newlines render visually.

### What stays the same
- No database changes
- No new dependencies
- All other sections on both pages remain untouched

