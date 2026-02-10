

## Capitalize First Letter of Candidate Names in CVs and Jobs_CVs

### What This Does
Automatically formats candidate names so the first letter is capitalized and the rest is lowercase (e.g., "JOHN" or "john" becomes "John") whenever a record is added or updated. Also fixes all existing records.

### Affected Columns
- **CVs table**: `Firstname`, `Lastname`, `name`
- **Jobs_CVs table**: `candidate_name`

### Current State
- **CVs**: ~158,572 records need formatting
- **Jobs_CVs**: ~15,003 records need formatting

### Implementation Steps

1. **Create a trigger function for CVs** that applies `INITCAP()` (capitalizes first letter of each word) on INSERT or UPDATE.

2. **Create a trigger function for Jobs_CVs** that does the same for `candidate_name`.

3. **Attach BEFORE INSERT OR UPDATE triggers** to both tables.

4. **Update all existing records** in both tables using the same formatting.

### Technical Details

**Migration SQL (schema changes):**

```sql
-- Trigger function for CVs table
CREATE OR REPLACE FUNCTION public.normalize_candidate_names_cvs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW."Firstname" IS NOT NULL THEN
    NEW."Firstname" = INITCAP(TRIM(NEW."Firstname"));
  END IF;
  IF NEW."Lastname" IS NOT NULL THEN
    NEW."Lastname" = INITCAP(TRIM(NEW."Lastname"));
  END IF;
  IF NEW.name IS NOT NULL THEN
    NEW.name = INITCAP(TRIM(NEW.name));
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function for Jobs_CVs table
CREATE OR REPLACE FUNCTION public.normalize_candidate_names_jobs_cvs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.candidate_name IS NOT NULL THEN
    NEW.candidate_name = INITCAP(TRIM(NEW.candidate_name));
  END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER trg_normalize_cvs_names
  BEFORE INSERT OR UPDATE ON "CVs"
  FOR EACH ROW
  EXECUTE FUNCTION normalize_candidate_names_cvs();

CREATE TRIGGER trg_normalize_jobs_cvs_names
  BEFORE INSERT OR UPDATE ON "Jobs_CVs"
  FOR EACH ROW
  EXECUTE FUNCTION normalize_candidate_names_jobs_cvs();
```

**Data update queries (for existing records):**

```sql
-- Update existing CVs records
UPDATE "CVs"
SET "Firstname" = INITCAP(TRIM("Firstname")),
    "Lastname" = INITCAP(TRIM("Lastname")),
    name = INITCAP(TRIM(name))
WHERE "Firstname" IS DISTINCT FROM INITCAP(TRIM("Firstname"))
   OR "Lastname" IS DISTINCT FROM INITCAP(TRIM("Lastname"))
   OR name IS DISTINCT FROM INITCAP(TRIM(name));

-- Update existing Jobs_CVs records
UPDATE "Jobs_CVs"
SET candidate_name = INITCAP(TRIM(candidate_name))
WHERE candidate_name IS DISTINCT FROM INITCAP(TRIM(candidate_name));
```

### How INITCAP Works
- `"john doe"` becomes `"John Doe"`
- `"JANE SMITH"` becomes `"Jane Smith"`
- `"mARY"` becomes `"Mary"`

### Important Note
The existing data update will affect ~158K records in CVs and ~15K in Jobs_CVs. The triggers will be created first so any new records arriving during the update are also formatted correctly. This update will also fire the audit triggers, so expect audit log entries for these changes.

