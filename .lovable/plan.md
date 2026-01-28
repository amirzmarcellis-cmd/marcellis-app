

## Fix Interview Call Page - Logo and Assistant Configuration

### Overview
Two issues need to be addressed:
1. The logo file is a placeholder, not an actual image
2. The job lacks a VAPI assistant configuration (data issue, not code)

---

### Issue 1: Logo Not Displaying

**Root Cause**: `src/assets/company-logo.png` contains text `placeholder_for_actual_logo` instead of an actual image.

**Solution**: Replace with an existing logo from the project.

**Available Options in Project:**
- `src/assets/ai-longlist-logo.png` - AI Longlist logo
- `src/assets/default-logo.png` - Default logo
- `public/lovable-uploads/79fc3415-a8cb-4486-9765-0907521e9cda.png` - Uploaded image

**Implementation**: Update the import in `InterviewCall.tsx` to use an existing logo:

```typescript
// Change from:
import companyLogo from '@/assets/company-logo.png';

// To (using the default logo):
import companyLogo from '@/assets/default-logo.png';
```

---

### Issue 2: "Interview Not Ready" Message

**Root Cause**: The job `me-j-0239` (Product Engineer) has `vapi_ai_assistant = NULL` in the database.

**This is expected behavior** - the page correctly shows this message when no assistant is configured.

**To Enable Interviews**: You need to:
1. Get your VAPI Assistant ID from the VAPI dashboard
2. Update the job with the assistant ID

**Database Update (run in Supabase SQL editor):**
```sql
UPDATE "Jobs" 
SET vapi_ai_assistant = 'your-vapi-assistant-id-here'
WHERE job_id = 'me-j-0239';
```

Alternatively, we can add a VAPI Assistant ID field to the Edit Job form for easier configuration.

---

### Files Changed

| File | Change |
|------|--------|
| `src/pages/InterviewCall.tsx` | Update logo import to use existing logo |

---

### Optional Enhancement

Add a field in the Edit Job form to configure `vapi_ai_assistant` so recruiters can easily set up interviews without SQL access.

