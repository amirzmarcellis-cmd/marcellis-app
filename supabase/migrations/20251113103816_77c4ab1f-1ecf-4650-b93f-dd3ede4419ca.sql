-- Fix security: Set search_path for the email normalization function
CREATE OR REPLACE FUNCTION normalize_cvs_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(TRIM(NEW.email));
    IF LENGTH(NEW.email) > 254 THEN
      RAISE EXCEPTION 'Email too long (max 254 characters)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;