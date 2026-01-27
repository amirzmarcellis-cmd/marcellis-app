
Goal
- Make “Salary Note” visible in Call Log Details under “Salary & Notice” without affecting any existing working functionality.

What’s happening now (why you can’t see it)
- The UI currently renders Salary Note only when `callLog.salary_note` is truthy:
  - If the database value is `NULL`, `''` (empty string), or just whitespace, React treats it as “falsey”, so the whole section is hidden.
- Your network request shows the page is correctly fetching `Jobs_CVs?select=*&recordid=eq.18504`, so the field is coming through if it exists. The issue is display logic + missing/empty data.

Plan (safe, minimal change)
1) Confirm the data (so we know if it’s a UI-hide issue or missing value)
- In Supabase SQL Editor (same environment you’re testing), run:
  - `SELECT recordid, salary_note FROM "Jobs_CVs" WHERE recordid = 18504;`
- Expected:
  - If it returns `NULL` or empty, the UI won’t show it with the current condition.

2) Update the UI to always show the Salary Note section (no behavior changes to other fields)
- In `src/pages/CallLogDetails.tsx`, replace the conditional block:
  - From: `{callLog.salary_note && ( ... )}`
  - To: always render the section, and display:
    - the note if present (`salary_note?.trim()`),
    - otherwise a neutral placeholder like “Not generated yet”.
- This guarantees the section is visible even before your external transcript analyzer populates the value.
- Also handle whitespace-only values by using `.trim()` so it won’t silently hide.

3) Optional (recommended for quick verification): add a temporary test value
- If you want to visually confirm immediately, update just that record:
  - `UPDATE "Jobs_CVs" SET salary_note = 'Mohammed''s current salary is 30,000 AED per month, and his expected salary is 40,000–45,000 AED per month.' WHERE recordid = 18504;`
- Then refresh `/call-log-details?...callid=18504`.

4) Validation checklist (to ensure we don’t affect current working system)
- Confirm “Salary & Notice” card still shows Notice Period / Current Salary / Expected Salary exactly as before.
- Confirm Salary Note appears:
  - When salary_note is NULL → shows placeholder
  - When salary_note has text → shows the text
  - When salary_note is empty string/whitespace → shows placeholder
- No database logic changes beyond reading an existing column; no changes to currency conversion logic.

Notes about “system must generate Salary Note”
- With the current architecture, Salary Note generation is not happening in the frontend; it must be written into `Jobs_CVs.salary_note` by your external transcript analysis process (as you described).
- The change above ensures the UI section is always present and ready, and it clearly indicates when the note hasn’t been generated yet.

Files involved
- `src/pages/CallLogDetails.tsx`
  - Only change: Salary Note rendering logic (always render + fallback text)
- No additional schema changes needed (column already exists).

Risks / mitigations
- Risk: None to existing flow; this is a display-only change inside the same card.
- Mitigation: Keep all existing salary fields untouched and only adjust the Salary Note block.

Acceptance criteria
- On `/call-log-details?candidate=272888&job=me-j-0238&callid=18504&fromTab=shortlist`:
  - “Salary Note” label is visible under Expected Salary.
  - If salary_note is empty → shows “Not generated yet” (or “N/A”).
  - If salary_note is set → shows the note text exactly.

