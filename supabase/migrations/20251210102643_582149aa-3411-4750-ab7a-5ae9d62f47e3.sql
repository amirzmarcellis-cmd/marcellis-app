-- Phase 1: Create campaign-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-documents', 'campaign-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for campaign-documents bucket
CREATE POLICY "Authenticated users can upload campaign documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view campaign documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-documents');

CREATE POLICY "Users can update their own campaign documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'campaign-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own campaign documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Phase 1: Create webhook trigger for new campaigns
CREATE OR REPLACE FUNCTION public.send_campaign_to_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_url TEXT := 'https://hook.eu2.make.com/es0w6i7s6i11hthnspyq74lh227uf3fk';
BEGIN
  -- Send campaign data to Make.com webhook
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'campaign_id', NEW.campaign_id,
      'campaign_name', NEW.campaign_name,
      'status', NEW.status,
      'keywords', NEW.keywords,
      'locations', NEW.locations,
      'industries', NEW.industries,
      'companies', NEW.companies,
      'campaign_created_by', NEW.campaign_created_by,
      'created_time', NEW.created_time
    )::text
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send campaign webhook: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on linkedin_campaigns table
DROP TRIGGER IF EXISTS trigger_send_campaign_to_webhook ON linkedin_campaigns;
CREATE TRIGGER trigger_send_campaign_to_webhook
  AFTER INSERT ON linkedin_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION send_campaign_to_webhook();