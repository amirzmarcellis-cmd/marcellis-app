-- Add RLS policies for linkedin_campaigns_leads table

-- Allow authenticated users to view all leads
CREATE POLICY "Authenticated users can view leads"
ON public.linkedin_campaigns_leads
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert leads
CREATE POLICY "Authenticated users can insert leads"
ON public.linkedin_campaigns_leads
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update leads (admins can update all, others can update their own)
CREATE POLICY "Users can update leads"
ON public.linkedin_campaigns_leads
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR has_org_role(auth.uid(), 'ADMIN'::org_role) OR has_org_role(auth.uid(), 'MANAGEMENT'::org_role));

-- Allow users to delete leads they created or admins can delete all
CREATE POLICY "Users can delete leads"
ON public.linkedin_campaigns_leads
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR has_org_role(auth.uid(), 'ADMIN'::org_role));