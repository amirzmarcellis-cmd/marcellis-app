

## Add Religion Field to Job Forms and Backfill Data

### Overview
Add a "Religion" dropdown (options: "Muslim", "Any") to the Add Job and Edit Job forms, and update all existing jobs with null/empty religion to "Any".

### Changes

#### 1. Database: Backfill null/empty religion values
Run a SQL update to set all Jobs where `religion` is null or empty to `'Any'`. The column already exists with a default of `'Any'`, so no schema change is needed.

```sql
UPDATE "Jobs" SET religion = 'Any' WHERE religion IS NULL OR TRIM(religion) = '';
```

#### 2. `src/pages/AddJob.tsx`
- Add `religion: "Any"` to the form state (alongside `genderPreference`)
- Include `religion: formData.religion` in the job data object sent to Supabase
- Add a Religion `<Select>` field next to the Preferred Gender field (change grid from `grid-cols-3` to include the new field, or add it as a sibling)
  - Options: "Muslim", "Any"
  - Default: "Any"

#### 3. `src/pages/EditJob.tsx`
- Add `religion: "Any"` to the form state interface and default values
- Load `religion` from fetched job data
- Include `religion` in the update payload
- Add a Religion `<Select>` field next to the Preferred Gender field
  - Options: "Muslim", "Any"
  - Default: "Any"

### Technical Notes
- The `religion` column already exists on the `Jobs` table with default `'Any'`
- No schema migration needed, only a data backfill
- Pattern follows the existing `gender_preference` field exactly
