

## Problem: CV Upload Shows "Upload Failed"

### Root Cause

The `handleFileUpload` function in `Apply.tsx` (line 264-342) treats the **text extraction step** as mandatory. After successfully uploading the file to Supabase Storage, it calls the `extract-cv-text` edge function. If that function fails (timeout, large file, network issue), the entire upload is marked as failed — the file URL is cleared (line 329: `url: ''`), and the user sees "Upload Failed" even though the file is already in storage.

From the logs, the edge function processed a 3.5MB text extraction — for larger files or slower connections, this would easily time out.

### Fix — `src/pages/Apply.tsx`

Make the text extraction **non-blocking and non-fatal**:

1. **Lines 306-311**: Wrap the `extract-cv-text` call in its own try-catch. If it fails, still mark the upload as successful with a fallback text like `"Text extraction pending"`.

2. **Move the success state update** (lines 314-322) to run **after** the storage upload succeeds, regardless of whether text extraction works.

The updated flow:
```
Upload to storage → success? → set URL + mark complete
                  ↓ (in parallel or after)
         Extract text → success? → update text
                       → fail? → use fallback text, keep URL valid
```

**Before (current):**
```typescript
// If extract-cv-text fails, entire upload is marked failed
const { data, error } = await supabase.functions.invoke('extract-cv-text', ...);
if (error) throw error;  // ← This kills the upload
```

**After (proposed):**
```typescript
// Upload succeeded — set the real URL immediately
let extractedText = 'Text extraction pending';
try {
  const { data } = await supabase.functions.invoke('extract-cv-text', ...);
  if (data?.text) extractedText = data.text;
} catch (e) {
  console.warn('Text extraction failed, continuing with upload:', e);
}

// File is valid regardless of extraction result
setUploadedFiles(prev => prev.map((file, index) =>
  index === fileIndex ? { ...file, url: publicUrl, text: extractedText, isUploading: false, uploadProgress: 100 } : file
));
```

This is a single-file change in `src/pages/Apply.tsx`, ~15 lines modified in the `handleFileUpload` function.

