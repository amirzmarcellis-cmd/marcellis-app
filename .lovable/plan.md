

## Add Required Skills and Required Years Experience to Job Forms and Details

### Overview
The database already has `required_skills` (ARRAY) and `required_years_experience` (ARRAY) columns on the Jobs table. We need to add UI inputs for these in three places: AddJob, EditJob, and JobDetails.

### Changes

#### 1. `src/pages/AddJob.tsx`
- **Form state** (~line 444): Add `requiredSkills: [] as string[]` and `requiredYearsExperience: [] as string[]` to formData
- **Save logic** (~line 802): Include `required_skills` and `required_years_experience` in the insert payload
- **UI** (~line 1256, near gender/religion section): Add two new input fields:
  - **Required Skills**: A text input with an "Add" button pattern (type a skill, click add, shows as removable tags). Similar to how headhunting companies URLs work.
  - **Required Years Experience**: Same tag-input pattern (e.g., "5+ years", "3-5 years", etc.)

#### 2. `src/pages/EditJob.tsx`
- **Interface** (~line 432): Add `required_skills?: string[]` and `required_years_experience?: string[]` to JobData interface
- **Form state** (~line 485): Add defaults `required_skills: []` and `required_years_experience: []`
- **Data loading** (~line 609): The `setFormData({ ...data })` spread already picks up these fields from the DB
- **Save logic** (~line 679): Include both fields in `jobDataToUpdate`
- **UI** (~line 1091, near gender/religion): Add the same tag-input fields as AddJob

#### 3. `src/pages/JobDetails.tsx`
- **Display** (~line 3819, after Religion row): Add two new rows:
  - **Required Skills**: Display as comma-separated or "N/A"
  - **Required Years Experience**: Display as comma-separated or "N/A"

#### 4. `src/components/jobs/JobDialog.tsx`
- Add both fields to formData state, useEffect population, save logic, and UI (in the Requirements card)

### No database changes needed
Both columns already exist as ARRAY types on the Jobs table.

