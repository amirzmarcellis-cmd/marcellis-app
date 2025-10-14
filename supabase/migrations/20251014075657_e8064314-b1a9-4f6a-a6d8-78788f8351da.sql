-- Insert existing clients from Jobs table into clients table
INSERT INTO public.clients (name, description)
SELECT DISTINCT 
  COALESCE(NULLIF(TRIM(client_name), ''), 'Unnamed Client') as name,
  client_description
FROM "Jobs"
WHERE client_name IS NOT NULL OR client_description IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update Jobs table to link to the new client records
UPDATE "Jobs" j
SET client_id = c.id
FROM public.clients c
WHERE COALESCE(NULLIF(TRIM(j.client_name), ''), 'Unnamed Client') = c.name
  AND (j.client_description = c.description OR (j.client_description IS NULL AND c.description IS NULL))
  AND j.client_id IS NULL;