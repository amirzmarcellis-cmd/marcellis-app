

## Fix: WhatsApp History Page Shows No Data

### Problem
The `message history WA` table has Row Level Security (RLS) enabled but **no policies defined**. This means all queries return empty results, even though the table contains 115 rows.

### Solution
Add an RLS policy that allows authenticated users to read from the table. This follows the same pattern used by other tables in the project (e.g., `Jobs_CVs`, `CVs`).

### Database Change
A single SQL migration to add a SELECT policy:

```sql
CREATE POLICY "Authenticated users can view message history"
  ON "message history WA"
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

### No Code Changes Needed
The page code (`src/pages/WhatsAppHistory.tsx`) is already correct -- once the policy is added, the existing query will return data and the page will display contacts and messages.

