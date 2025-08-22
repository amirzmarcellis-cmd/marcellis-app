-- Enable RLS on the deleted_jobs_cvs_audit table
ALTER TABLE public.deleted_jobs_cvs_audit ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert audit records when they delete from their company's Jobs_CVs
CREATE POLICY "Users can create audit records for their company deletions" 
ON public.deleted_jobs_cvs_audit 
FOR INSERT 
WITH CHECK (
  -- Check if the user has permission to work with this company by checking the original record
  EXISTS (
    SELECT 1 
    FROM public.get_user_companies(auth.uid()) uc
    WHERE uc = (original_record->>'company_id')::uuid
  )
);

-- Create policy to allow users to view audit records for their companies
CREATE POLICY "Users can view audit records for their companies" 
ON public.deleted_jobs_cvs_audit 
FOR SELECT 
USING (
  -- Check if the user has permission to work with this company
  EXISTS (
    SELECT 1 
    FROM public.get_user_companies(auth.uid()) uc
    WHERE uc = (original_record->>'company_id')::uuid
  )
);