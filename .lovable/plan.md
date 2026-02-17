

## Add "Preferred Gender" Dropdown to Create Job and Edit Job

### What will change
A new required dropdown field called **Preferred Gender** will be added to both the Create Job and Edit Job forms. It will have three options: Male, Female, and Any. The default value will be "Any", and the selected value will be saved to the existing `gender_preference` column in the Jobs table.

Additionally, all existing jobs that currently have a null/empty `gender_preference` will be updated to "Any".

### Changes

#### 1. Update all existing jobs (data update)
- Set `gender_preference = 'Any'` for all jobs where the value is currently NULL or empty.

#### 2. AddJob.tsx
- Add `genderPreference: "Any"` to the `formData` state (default value).
- Add the Preferred Gender dropdown in the mandatory fields section, near the Notice Period / Currency / Job Type row.
- Add validation to ensure the field is filled before submission.
- Include `gender_preference: formData.genderPreference` in the insert payload.

#### 3. EditJob.tsx
- Add `gender_preference` to the `JobData` interface with default `"Any"`.
- Add the Preferred Gender dropdown in the details tab, near the Notice Period / Currency row.
- The field will be populated from the fetched job data (already handled by the spread `setFormData({ ...data })`).
- The value is already included in the update payload since EditJob spreads formData into the update object.

### Technical Details

**Files modified:**
- `src/pages/AddJob.tsx` -- add state field, dropdown UI, validation, and insert field
- `src/pages/EditJob.tsx` -- add to interface, add dropdown UI

**Database:**
- No schema changes needed (column `gender_preference` already exists in the Jobs table)
- Data update: `UPDATE "Jobs" SET gender_preference = 'Any' WHERE gender_preference IS NULL OR TRIM(gender_preference) = ''`

