

## Remove Required Skills and Years of Experience from Add Job Page

### Changes in `src/pages/AddJob.tsx`:

1. **Remove UI sections** (lines 1293-1348): Delete the "Required Skills" input block and the "Required Years Experience" input block.

2. **Remove from form submission** (lines 842-843): Remove `required_skills` and `required_years_experience` from the insert payload (or set them to `null`).

3. **Clean up state**: Remove the `newSkill` state variable and `requiredSkills`/`requiredYearsExperience` from `formData` initial state if they're no longer needed anywhere.

This is a straightforward removal of two form fields and their associated submission logic.

