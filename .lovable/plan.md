

## Update Job Difficulty Field

This plan updates the Job Difficulty dropdown to use new options (A Job, B Job, C Job) with numeric values stored in the database.

---

### Summary of Changes

1. **Database Migration**: Change `Job_difficulty` column from TEXT to INTEGER
2. **UI Updates**: Update dropdown options in both Add Job and Edit Job forms
3. **Value Mapping**: Convert display labels to/from numeric database values

---

### Database Changes

**File: New Migration**

Change the `Job_difficulty` column in the `Jobs` table:
- Convert from `text` to `integer` type
- Set default value to `75`
- Update all existing rows to `75`

```text
Migration SQL:
1. Update all existing values to 75 (as text first for compatibility)
2. Alter column type from text to integer
3. Set new default to 75
```

---

### Frontend Changes

**File: `src/pages/AddJob.tsx`**

1. Update form state default value:
   - Change `jobDifficulty: "HARD"` to `jobDifficulty: 75`

2. Update dropdown options (around line 765-781):
   - Replace `EASY`, `MEDIUM`, `HARD` with `A Job`, `B Job`, `C Job`
   - Map display values to numeric values:
     - A Job → 75
     - B Job → 80  
     - C Job → 85

3. Update the Select component to handle numeric values:
   - Store the numeric value in state
   - Display the label (A Job, B Job, C Job) to the user

4. Ensure the submit handler (around line 627) saves the numeric value directly

**File: `src/pages/EditJob.tsx`**

1. Update form state interface (line 140):
   - Change `Job_difficulty?: string` to `Job_difficulty?: number`

2. Update default value (line 188):
   - Change `Job_difficulty: "HARD"` to `Job_difficulty: 75`

3. Update dropdown options (around line 522-538):
   - Replace `EASY`, `MEDIUM`, `HARD` with `A Job`, `B Job`, `C Job`
   - Use same value mapping as AddJob

4. Update the fetchJob handler to convert existing text values:
   - Map legacy values: EASY → 75, MEDIUM → 80, HARD → 85
   - Handle existing numeric values directly

5. Update the submit handler (line 372):
   - Save numeric value directly (no conversion needed once state is numeric)

---

### Value Mapping Reference

```text
Display Label → Database Value
A Job         → 75
B Job         → 80
C Job         → 85
```

When loading existing jobs with old text values:
```text
EASY   → 75
MEDIUM → 80
HARD   → 85
```

---

### Technical Details

**Dropdown Implementation Pattern:**
```jsx
// Constants for mapping
const JOB_DIFFICULTY_OPTIONS = [
  { value: 75, label: "A Job" },
  { value: 80, label: "B Job" },
  { value: 85, label: "C Job" }
];

// In the Select component
<Select 
  value={formData.jobDifficulty?.toString()} 
  onValueChange={(val) => handleInputChange("jobDifficulty", parseInt(val))}
>
  <SelectTrigger>
    <SelectValue placeholder="Select difficulty" />
  </SelectTrigger>
  <SelectContent>
    {JOB_DIFFICULTY_OPTIONS.map(opt => (
      <SelectItem key={opt.value} value={opt.value.toString()}>
        {opt.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Legacy Value Handling (EditJob only):**
When fetching existing jobs, convert any legacy text values:
```jsx
// After fetching job data
let difficultyValue = data.Job_difficulty;
if (typeof difficultyValue === 'string') {
  const legacyMap = { 'EASY': 75, 'MEDIUM': 80, 'HARD': 85 };
  difficultyValue = legacyMap[difficultyValue] || 75;
}
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AddJob.tsx` | Update dropdown options, default value, and form state type |
| `src/pages/EditJob.tsx` | Update dropdown options, default value, interface, and add legacy value conversion |
| Database Migration | Change column type to INTEGER, set default to 75, update existing values |

---

### Safety Notes

- All changes are localized to the job form components
- Existing jobs will be migrated to value 75 (equivalent to "A Job")
- Legacy text values in the database will be handled gracefully during the transition
- No impact on other parts of the live system

