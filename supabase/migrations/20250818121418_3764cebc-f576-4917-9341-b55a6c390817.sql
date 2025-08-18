-- Add RLS policy for deleted_jobs_cvs_audit table
CREATE POLICY "Admins can view deleted jobs cvs audit" 
ON deleted_jobs_cvs_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));