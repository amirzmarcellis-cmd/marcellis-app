

## Treat "Internal Database" as "Itris" Source

### Summary
Wherever the source field is checked against "itris", also match "internal database" so both are treated identically throughout the AI Longlist, Similar Jobs, and Shortlist tabs.

---

### Technical Changes

**File: `src/pages/JobDetails.tsx`**

All source comparison logic will be updated to match both "itris" and "internal database". The affected locations are:

1. **Export CSV filter** (~line 1667-1670) -- source filter matching
2. **Source type display** (~line 2517-2522) -- the "(cv)" label logic
3. **Longlist candidate rendering filter** (~line 2575-2578) -- source filter
4. **Shortlist source filter** (~line 3190-3193) -- source filter
5. **Candidate count** (~line 4019-4022) -- counting candidates by source
6. **Longlist card rendering filter** (~line 4297-4301) -- source filter

For each location, any check like:
```typescript
source.includes("itris")
```
Will become:
```typescript
source.includes("itris") || source.includes("internal database")
```

And the source filter matching (when `longListSourceFilter === "Itris"`) will also match "internal database":
```typescript
const sourceFilterMatch =
  !longListSourceFilter ||
  longListSourceFilter === "all" ||
  (longListSourceFilter.toLowerCase() === "itris"
    ? source.includes("itris") || source.includes("internal database")
    : source.includes(longListSourceFilter.toLowerCase()));
```

The display label for "Internal Database" sources will show "(cv)" just like Itris sources.

No database or schema changes needed -- this is purely a front-end display/filter normalization.

