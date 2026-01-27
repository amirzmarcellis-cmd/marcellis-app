
## Add Salary Note Section to Call Log Details

This plan adds a new "Salary Note" section under the "Salary & Notice Period" card that displays a transcript-analyzed summary of the candidate's current and expected salary with their original currencies.

---

### Overview

The Salary Note is a read-only field that captures salary information in the candidate's original currency as mentioned during the call. This differs from the existing Current Salary and Expected Salary fields which are converted to the job's currency.

**Example Output:**
- "Amir's current salary is 5 lakhs INR per month, and his expected salary is 4,000 AED per month."

---

### Changes Required

#### 1. Database: Add salary_note Column

Add a new text column to the `Jobs_CVs` table to store the salary note.

```sql
ALTER TABLE "Jobs_CVs" 
ADD COLUMN IF NOT EXISTS salary_note TEXT;
```

---

#### 2. Frontend: Update CallLogDetail Interface

**File:** `src/pages/CallLogDetails.tsx`

Add the new field to the interface:

```typescript
interface CallLogDetail {
  // ... existing fields ...
  salary_note: string | null  // NEW
}
```

---

#### 3. Frontend: Map salary_note in Data Fetching

**File:** `src/pages/CallLogDetails.tsx`

Update the `enrichedData` mapping in `fetchCallLogDetail`:

```typescript
const enrichedData: CallLogDetail = {
  // ... existing mappings ...
  salary_note: data.salary_note,  // NEW
}
```

---

#### 4. Frontend: Display Salary Note Section

**File:** `src/pages/CallLogDetails.tsx`

Add a new section inside the "Salary & Notice" card, after the Expected Salary field:

```tsx
{/* Salary Note - NEW SECTION */}
{callLog.salary_note && (
  <div className="pt-2 border-t border-border/30">
    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
      Salary Note
    </label>
    <p className="text-sm sm:text-base text-foreground/90 mt-1 leading-relaxed break-words">
      {callLog.salary_note}
    </p>
  </div>
)}
```

---

### Visual Layout

The Salary Note will appear as the last item in the "Salary & Notice" card:

```text
┌─────────────────────────────────────┐
│ 💵 Salary & Notice                  │
├─────────────────────────────────────┤
│ Notice Period                       │
│ 30 days                             │
│                                     │
│ Current Salary                      │
│ SAR 30,000                          │
│                                     │
│ Expected Salary                     │
│ SAR 40,000 - 45,000                 │
│─────────────────────────────────────│
│ Salary Note                         │ ← NEW
│ Mohammed's current salary is        │
│ 30,000 AED per month, and his       │
│ expected salary is 40,000-45,000    │
│ AED per month.                      │
└─────────────────────────────────────┘
```

---

### Technical Notes

- **Data Population:** The `salary_note` field will be populated by the external AI system that processes call transcripts (same system that populates `current_salary`, `salary_expectations`, `after_call_score`, etc.)
- **Read-Only Display:** This is a display-only field - no editing capability in the UI
- **Conditional Rendering:** The section only appears when `salary_note` has content
- **No Impact on Existing Fields:** The existing Current Salary and Expected Salary fields remain unchanged and continue to work with currency conversion logic

---

### Files to Modify

| File | Change |
|------|--------|
| Database Migration | Add `salary_note TEXT` column to `Jobs_CVs` |
| `src/pages/CallLogDetails.tsx` | Add to interface, data mapping, and UI display |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |
