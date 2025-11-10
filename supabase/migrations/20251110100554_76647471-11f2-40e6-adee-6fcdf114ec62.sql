-- Remove Jobs_CVs records that don't have a corresponding linkedin_boolean_search record
DELETE FROM public."Jobs_CVs" jc
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.linkedin_boolean_search lbs
  WHERE lbs.user_id = jc.user_id 
    AND lbs.job_id = jc.job_id
);