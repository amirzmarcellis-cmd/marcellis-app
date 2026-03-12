

## Fix Hardcoded Supabase Credentials

### Problem
The `.env` file has been updated to point to a new self-hosted Supabase instance, but the codebase has the old Supabase URL and key **hardcoded** in multiple files. The app is failing to connect ("Failed to fetch" error on sign-in).

### Changes Required

**1. `src/integrations/supabase/client.ts`** - Read from env variables instead of hardcoded values:
```ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**2. `src/lib/pushToken.ts`** (line 3) - Replace hardcoded edge function URL:
```ts
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-webhook`;
```

**3. `src/hooks/outreach/useLinkedInSearch.ts`** (line 27) - Replace hardcoded search URL:
```ts
const searchUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-search?...`;
```

**4. `src/pages/EditJob.tsx`** (line 1000) - Replace hardcoded REST API URL:
```ts
apiEndpoint={`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/clients?...`}
```
Also update the `apiHeaders` `apikey` value to use `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`.

**5. `supabase/functions/linkedin-connect/index.ts`** (line 147) - Replace hardcoded webhook URL:
```ts
const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/linkedin-webhook`;
```

### Important Note
The edge functions use `Deno.env.get('SUPABASE_URL')` and `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` -- these Supabase secrets will also need to be updated in the Supabase dashboard to match the new instance. I will flag this after implementation.

