

## Add Market Intel Section to Call Log Details

### Overview
Add a new "Market Intel" section under the existing "Salary Note" section in the Call Log Details page. This will be a read-only field similar to Salary Note, designed to display market intelligence extracted from call transcripts.

---

### Current State
- The Salary Note section exists at lines 747-753 in `src/pages/CallLogDetails.tsx`
- The `Jobs_CVs` table does NOT have a `market_intel` column yet
- The `CallLogDetail` interface includes `salary_note` but not `market_intel`

---

### Implementation Steps

#### Step 1: Add Database Column
Create a migration to add the `market_intel` text column to the `Jobs_CVs` table:

```sql
ALTER TABLE "Jobs_CVs" ADD COLUMN market_intel text;
```

#### Step 2: Update Interface
Add `market_intel` to the `CallLogDetail` interface in `src/pages/CallLogDetails.tsx`:

```typescript
interface CallLogDetail {
  // ... existing fields
  salary_note: string | null
  market_intel: string | null  // NEW
  // ... rest of fields
}
```

#### Step 3: Fetch the New Field
Update the enriched data mapping to include `market_intel`:

```typescript
const enrichedData: CallLogDetail = {
  // ... existing mappings
  salary_note: data.salary_note,
  market_intel: data.market_intel,  // NEW
  // ...
}
```

#### Step 4: Add UI Section
Add the Market Intel section immediately after the Salary Note section in the Salary & Notice card:

```tsx
{/* Salary Note section - existing */}
<div className="pt-2 border-t border-border/30">
  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Salary Note</label>
  <p className="text-sm sm:text-base text-foreground/90 mt-1 leading-relaxed break-words">
    {callLog.salary_note?.trim() || <span className="italic text-muted-foreground">Not generated yet</span>}
  </p>
</div>

{/* Market Intel section - NEW */}
<div className="pt-2 border-t border-border/30">
  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Market Intel</label>
  <p className="text-sm sm:text-base text-foreground/90 mt-1 leading-relaxed break-words">
    {callLog.market_intel?.trim() || <span className="italic text-muted-foreground">Not generated yet</span>}
  </p>
</div>
```

---

### Files Changed

| File | Change |
|------|--------|
| Database migration | Add `market_intel` text column to `Jobs_CVs` |
| `src/pages/CallLogDetails.tsx` | Add field to interface, fetch mapping, and UI display |

---

### Behavior After Implementation
- The "Market Intel" section will appear below "Salary Note" in the Salary & Notice card
- Initially shows "Not generated yet" placeholder (same as Salary Note)
- When populated (via external AI system or future edge function), displays the market intelligence content
- Mobile-responsive with proper text wrapping

---

### No Impact on Existing System
- This is an additive change only
- New column defaults to NULL, no effect on existing records
- No changes to existing fields or functionality

