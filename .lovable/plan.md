

## Fix: Nationality Matching for "Portuguese" / "Portugal"

### Problem
The `matchesPreferredNationality` function in `JobDetails.tsx` has a mapping table that converts between country names and demonyms (e.g., "Egypt" <-> "Egyptian"). However, **Portugal is not in this mapping**, so "Portuguese" (the candidate's nationality) does not match "Portugal" (the job's preferred nationality).

### Solution
Add Portugal and other missing European/common countries to the `nationalityMap` in `JobDetails.tsx` (around line 3241).

### Changes

**File: `src/pages/JobDetails.tsx`**

Add the following entries to the `nationalityMap` object (after the existing entries, before the closing `}`):

- `'portugal': ['portuguese', 'portugal']`
- `'spain': ['spanish', 'spain']`
- `'france': ['french', 'france']`
- `'germany': ['german', 'germany']`
- `'italy': ['italian', 'italy']`
- `'netherlands': ['dutch', 'netherlands', 'holland']`
- `'belgium': ['belgian', 'belgium']`
- `'switzerland': ['swiss', 'switzerland']`
- `'austria': ['austrian', 'austria']`
- `'greece': ['greek', 'greece']`
- `'ireland': ['irish', 'ireland']`
- `'sweden': ['swedish', 'sweden']`
- `'norway': ['norwegian', 'norway']`
- `'denmark': ['danish', 'denmark']`
- `'finland': ['finnish', 'finland']`
- `'poland': ['polish', 'poland']`
- `'czech republic': ['czech', 'czech republic', 'czechia']`
- `'romania': ['romanian', 'romania']`
- `'hungary': ['hungarian', 'hungary']`
- `'turkey': ['turkish', 'turkey']`
- `'brazil': ['brazilian', 'brazil']`
- `'mexico': ['mexican', 'mexico']`
- `'colombia': ['colombian', 'colombia']`
- `'argentina': ['argentinian', 'argentine', 'argentina']`
- `'nigeria': ['nigerian', 'nigeria']`
- `'kenya': ['kenyan', 'kenya']`
- `'ghana': ['ghanaian', 'ghana']`
- `'ethiopia': ['ethiopian', 'ethiopia']`
- `'china': ['chinese', 'china']`
- `'japan': ['japanese', 'japan']`
- `'south korea': ['south korean', 'korean', 'south korea']`
- `'thailand': ['thai', 'thailand']`
- `'vietnam': ['vietnamese', 'vietnam']`
- `'sri lanka': ['sri lankan', 'sri lanka']`
- `'nepal': ['nepalese', 'nepali', 'nepal']`
- `'iran': ['iranian', 'persian', 'iran']`
- `'russia': ['russian', 'russia']`
- `'ukraine': ['ukrainian', 'ukraine']`

This will immediately fix the Portuguese/Portugal mismatch and prevent similar issues for many other nationalities.

### Technical Details
- Only one file is modified: `src/pages/JobDetails.tsx`
- The change is additive (adding entries to an existing map) with zero risk of breaking existing functionality
- The matching logic itself is already correct -- it just needs more entries in the lookup table
