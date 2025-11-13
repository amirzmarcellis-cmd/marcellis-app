-- Step 1: Set all oversized/invalid emails to NULL
UPDATE "CVs"
SET email = NULL
WHERE email IS NOT NULL 
  AND (
    LENGTH(email) > 254
    OR email LIKE '%{%'
    OR email LIKE '%[%'
    OR LENGTH(TRIM(email)) = 0
  );

-- Step 2: Normalize valid emails
UPDATE "CVs"
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL
  AND LENGTH(email) <= 254;

-- Step 3: Delete duplicates (keep lowest user_id)
DELETE FROM "CVs" c1
WHERE email IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM "CVs" c2
    WHERE c2.email = c1.email
      AND c2.user_id < c1.user_id
  );

-- Step 4: Create normalization function
CREATE OR REPLACE FUNCTION normalize_cvs_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(TRIM(NEW.email));
    IF LENGTH(NEW.email) > 254 THEN
      RAISE EXCEPTION 'Email too long (max 254 characters)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger
CREATE TRIGGER normalize_cvs_email_trigger
BEFORE INSERT OR UPDATE ON "CVs"
FOR EACH ROW
EXECUTE FUNCTION normalize_cvs_email();

-- Step 6: Use MD5 hash for uniqueness to avoid size limits
CREATE UNIQUE INDEX cvs_email_unique 
ON "CVs" (MD5(email))
WHERE email IS NOT NULL;