-- Update the normalize_cvs_email trigger function to handle invalid emails
CREATE OR REPLACE FUNCTION public.normalize_cvs_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(TRIM(NEW.email));
    
    -- Convert invalid emails to NULL
    IF NEW.email = '' 
       OR LOWER(NEW.email) IN ('not found', 'n/a', 'none', 'unknown')
       OR NEW.email LIKE '{%'
       OR LENGTH(NEW.email) > 254 THEN
      NEW.email = NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Clean up existing invalid emails in the CVs table
UPDATE "CVs"
SET email = NULL
WHERE email IS NOT NULL 
  AND (
    TRIM(email) = ''
    OR LOWER(TRIM(email)) IN ('not found', 'n/a', 'none', 'unknown')
    OR email LIKE '{%'
    OR LENGTH(email) > 254
  );