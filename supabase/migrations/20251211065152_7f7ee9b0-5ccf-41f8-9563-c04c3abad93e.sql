-- Add unique constraint on campaign_name
ALTER TABLE public.linkedin_campaigns
ADD CONSTRAINT linkedin_campaigns_name_unique UNIQUE (campaign_name);