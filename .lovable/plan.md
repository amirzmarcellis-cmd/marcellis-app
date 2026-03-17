
Goal: fix the CV upload + application submit issue without affecting the live working system.

What the screenshot shows:
- The page says `1 file(s) uploaded`.
- But on submit it shows: `No CVs were successfully uploaded`.
- That means the UI is keeping a file entry in state, but that file is not considered a valid uploaded CV at submit time.

Most likely cause:
- In `src/pages/Apply.tsx`, the submit logic only accepts files where:
  - `file.url` starts with `https://`
  - `file.isUploading` is false
- But the upload flow first stores a temporary `blob:` URL, then later tries to replace it with the real Supabase URL using array-index-based updates.
- That is fragile. If the later state update misses, or a file gets marked failed/unfinished, the UI still shows “1 uploaded” while submit sees `0 valid files`.

Why this is happening:
1. `uploadedFiles.length > 0` is being used for display/button state.
2. A stricter `validFiles` filter is being used for submission.
3. Those two rules are out of sync.
4. The file state model is too weak:
   - one `url` field is used for both temporary preview and permanent storage URL
   - upload success/failure is inferred indirectly
   - file updates rely on array indexes instead of stable IDs

Plan to fix:
1. Refactor the uploaded file state in `src/pages/Apply.tsx`
   - Add a stable local file ID.
   - Split fields clearly:
     - `previewUrl` for temporary `blob:` display
     - `storageUrl` for the real Supabase file URL
     - `status` = `uploading | uploaded | failed`
   - Stop using one mixed `url` field for everything.

2. Replace index-based updates with ID-based updates
   - When a file is added, create a unique local ID.
   - Every progress/success/failure update should target that file by ID, not by array position.
   - This removes the main source of silent mismatches.

3. Make submit validation use upload status, not URL string guessing
   - Only submit files with:
     - `status === "uploaded"`
     - a real `storageUrl`
   - This is safer than checking `startsWith("https://")`.

4. Keep CV text extraction non-blocking
   - Upload success should be finalized immediately after storage upload succeeds.
   - Extraction should only enrich the record later.
   - If extraction fails, the CV must still remain submittable.

5. Improve the UI so it reflects real status
   - Show per-file states like:
     - Uploading
     - Uploaded
     - Upload failed
   - Change the summary text so it does not say “uploaded” for failed/incomplete files.
   - Disable or warn on submit only if there are zero successfully uploaded files.

6. Keep the change isolated and low-risk
   - Only update `src/pages/Apply.tsx` and, if needed, lightly improve `src/components/upload/FileUpload.tsx`.
   - No database schema changes.
   - No changes to `submit_application`.
   - No storage policy changes.

Expected result after implementation:
- A CV that reaches Supabase Storage is always treated as a valid uploaded file.
- The submit button will no longer reject a file that visually appears uploaded.
- Failed files will be clearly shown as failed instead of being counted as uploaded.
- Existing live submission logic remains unchanged except for making the upload state reliable.

Technical scope:
- Primary file: `src/pages/Apply.tsx`
- Optional minor support cleanup: `src/components/upload/FileUpload.tsx`
