
## Auto-Generate Salary Note from Transcript using AI

This plan adds an AI-powered system to automatically analyze call transcripts and generate the `salary_note` field with the candidate's exact salary and currency as stated during the call.

---

### Current State Analysis

From the database record (recordid: 18504):
- **Transcript EXISTS** - Full call recording with salary discussion
- **`current_salary: 30000`** and **`salary_expectations: "40000 to 45000"`** - Already extracted (by external system)
- **`salary_note: NULL`** - Not being generated

**Salary mentioned in transcript:**
- Current: "30k" AED per month (line 60)
- Expected: "40 to 45" thousand AED per month (line 64-66)

---

### Solution Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    TRIGGER OPTIONS                          │
├─────────────────────────────────────────────────────────────┤
│  Option A: Button in UI (manual trigger per record)         │
│  Option B: Auto-trigger when transcript is saved (webhook)  │
│  Option C: Batch process existing records                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Edge Function: generate-salary-note               │
├─────────────────────────────────────────────────────────────┤
│  1. Receive recordid                                        │
│  2. Fetch transcript from Jobs_CVs                          │
│  3. Call Lovable AI (Gemini) to analyze transcript          │
│  4. Extract: current_salary, expected_salary, currencies    │
│  5. Generate formatted salary note                          │
│  6. Update Jobs_CVs.salary_note                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT EXAMPLE                           │
├─────────────────────────────────────────────────────────────┤
│  "Mohammed's current salary is 30,000 AED per month, and    │
│   his expected salary is 40,000-45,000 AED per month."      │
└─────────────────────────────────────────────────────────────┘
```

---

### Implementation Steps

#### 1. Create Edge Function: `generate-salary-note`

**File:** `supabase/functions/generate-salary-note/index.ts`

```typescript
// Edge function that:
// - Takes a recordid
// - Fetches the transcript from Jobs_CVs
// - Calls Lovable AI to extract salary info
// - Updates the salary_note field
```

**AI Prompt for extraction:**
```text
Analyze this call transcript and extract salary information.

Return a JSON object with:
- candidate_name: string (the person being interviewed)
- current_salary: { amount: string, currency: string }
- expected_salary: { amount: string, currency: string }

Then generate a natural language note like:
"[Name]'s current salary is [amount] [currency] per month, 
and his/her expected salary is [amount] [currency] per month."

Important:
- Use the EXACT currency mentioned by the candidate
- Do NOT convert currencies
- If currency not explicitly stated, infer from context (AED for UAE, SAR for Saudi, etc.)
```

#### 2. Update supabase/config.toml

Add the new function configuration:
```toml
[functions.generate-salary-note]
verify_jwt = true
```

#### 3. Add "Generate Salary Note" Button in UI (Optional but Recommended)

**File:** `src/pages/CallLogDetails.tsx`

Add a small button next to "Salary Note" label that allows manual regeneration:
- Only visible when transcript exists
- Shows loading state while processing
- Refreshes the page after successful generation

---

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/generate-salary-note/index.ts` | Create | Edge function with Lovable AI integration |
| `supabase/config.toml` | Modify | Add function configuration |
| `src/pages/CallLogDetails.tsx` | Modify | Add optional "Generate" button |

---

### Technical Details

**Lovable AI Configuration:**
- Model: `google/gemini-3-flash-preview` (fast, accurate for extraction)
- Endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Auth: Uses `LOVABLE_API_KEY` (auto-provisioned)

**Database Update:**
```sql
UPDATE "Jobs_CVs" 
SET salary_note = 'Generated note...' 
WHERE recordid = ?
```

---

### Risk Mitigation

- **No changes to existing fields** - Only populates the new `salary_note` field
- **No effect on existing transcript analysis** - This runs independently
- **Optional manual trigger** - Can be used selectively, not auto-applied to all records
- **Graceful error handling** - If AI fails, shows error toast but doesn't break anything

---

### Expected Output for Record 18504

Based on the transcript analysis, the generated salary note would be:

**"Mohammed's current salary is 30,000 AED per month, and his expected salary is 40,000-45,000 AED per month."**

---

### Alternative: Bulk Generate for Existing Records

If you want to generate salary notes for all existing records with transcripts:
```sql
-- Find records with transcripts but no salary_note
SELECT recordid, candidate_name 
FROM "Jobs_CVs" 
WHERE transcript IS NOT NULL 
AND (salary_note IS NULL OR salary_note = '');
```

Then call the edge function for each record.
