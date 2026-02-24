

## Display Religion and Gender in Job Details + Fix Case Mismatch

### Problem
1. The Job Details overview page does not show the Religion or Preferred Gender fields.
2. In EditJob, the religion value "muslim" (lowercase in DB) doesn't match the Select option value "Muslim" (capitalized), so the dropdown appears blank when editing a job with religion set to "muslim".

### Changes

#### 1. `src/pages/JobDetails.tsx` (~line 3807-3811, in the "Job Information" card)
Add two new rows after the "Industry" row (before "Headhunting Companies"):

- **Preferred Gender**: Display `job.gender_preference || "N/A"`
- **Religion**: Display `job.religion` with capitalization fix -- if the value is "muslim", display "Muslim"; otherwise show the value or "N/A"

#### 2. `src/pages/EditJob.tsx` (~line 1115, religion Select value)
Fix the value mapping so lowercase "muslim" from the DB maps to the Select option "Muslim":

- Change `value={formData.religion || "Any"}` to normalize: if `formData.religion?.toLowerCase() === "muslim"` use `"Muslim"`, else use the value or `"Any"`

#### 3. `src/pages/AddJob.tsx` (same pattern check)
Verify and apply the same normalization if needed for the religion Select component.

### Technical Details
- The DB stores "muslim" (lowercase) but the `<SelectItem value="Muslim">` expects capitalized "Muslim"
- The fix normalizes the display value so lowercase DB values correctly match the UI options
- No database changes needed

