-- Add RLS policies to linkedin_campaigns table

-- INSERT Policy - Allow authenticated users to create campaigns
CREATE POLICY "Authenticated users can create campaigns"
ON public.linkedin_campaigns
FOR INSERT
TO authenticated
WITH CHECK (campaign_created_by = auth.uid());

-- SELECT Policy - Allow authenticated users to view all campaigns
CREATE POLICY "Authenticated users can view campaigns"
ON public.linkedin_campaigns
FOR SELECT
TO authenticated
USING (true);

-- UPDATE Policy - Allow users to update their own campaigns or admins/management to update all
CREATE POLICY "Users can update their own campaigns or admins can update all"
ON public.linkedin_campaigns
FOR UPDATE
TO authenticated
USING (
  campaign_created_by = auth.uid()
  OR has_org_role(auth.uid(), 'ADMIN'::org_role)
  OR has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

-- DELETE Policy - Allow users to delete their own campaigns or admins to delete all
CREATE POLICY "Users can delete their own campaigns or admins can delete all"
ON public.linkedin_campaigns
FOR DELETE
TO authenticated
USING (
  campaign_created_by = auth.uid()
  OR has_org_role(auth.uid(), 'ADMIN'::org_role)
);