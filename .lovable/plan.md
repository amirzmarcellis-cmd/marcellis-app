
Goal: fix the CV upload error without affecting the live working submission flow.

What I found:
- The `cvs` storage bucket is public and has permissive upload/read policies, so this is not a bucket-permission problem.
- A recent uploaded PDF is already present in `storage.objects` (`cv-1773734597117-b4is.pdf`), which proves the file upload itself succeeded.
- The `extract-cv-text` edge function also ran for that uploaded file, so the failure toast is being triggered by the client-side upload flow, not by missing storage access.
- In `src/pages/Apply.tsx`, the upload handler still treats too much of the post-upload work as part of one failure path. If anything after storage upload goes wrong, the code can still mark the file as failed and clear its usable URL.

Plan:
1. Isolate the storage upload from all post-processing in `src/pages/Apply.tsx`.
   - As soon as `supabase.storage.from('cvs').upload(...)` succeeds and `publicUrl` is available, immediately mark the file as uploaded:
     - keep the real `publicUrl`
     - set `isUploading: false`
     - set `uploadProgress: 100`
     - set fallback text like `Text extraction pending`
   - This guarantees a successful storage upload never shows as “Upload Failed”.

2. Move CV text extraction into a second, non-fatal step.
   - Run `extract-cv-text` only after the upload state is already marked successful.
   - If extraction succeeds, update only the `text` field.
   - If extraction fails, keep the uploaded file valid and only log a warning.

3. Tighten the catch logic so it only handles true upload failures.
   - The outer `catch` should only clear the file and show the destructive toast if the storage upload itself fails.
   - It should no longer wipe out a valid uploaded file because of later processing.

4. Improve debugging visibility without changing business logic.
   - Log the exact failing stage (`storage upload`, `public URL`, `text extraction`) in `Apply.tsx`.
   - Surface a more accurate toast message when the real upload fails, while keeping extraction failures silent/non-blocking.

5. Keep the change low-risk and isolated.
   - Only touch `src/pages/Apply.tsx`.
   - Do not modify the `submit_application` edge function, DB schema, storage policies, or existing application submission logic.
   - This avoids impact on the live working system.

Technical details:
- Main file: `src/pages/Apply.tsx`
- Current weak point: `handleFileUpload`
- Safe target flow:

```text
Select file
  -> upload to storage
      -> if upload fails: show "Upload Failed"
      -> if upload succeeds: save public URL immediately
          -> then try text extraction
              -> if extraction fails: keep file usable
```

Expected result after implementation:
- Applicants can upload CVs successfully even if text extraction is slow or fails.
- The uploaded file remains attached and submittable.
- Existing submission behavior remains unchanged except that valid uploads are no longer incorrectly rejected.
