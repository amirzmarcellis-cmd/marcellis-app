-- Update the webhook trigger function to use n8n webhook
CREATE OR REPLACE FUNCTION public.send_campaign_to_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_url TEXT := 'https://n8n.srv1158803.hstgr.cloud/webhook/0903e00d-05bb-445d-bdfd-bd5009f52930';
BEGIN
  -- Send campaign data to n8n webhook
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
      'opener_message', NEW.opener_message,
      'document_url', NEW.document_url,
      'enable_followups', NEW.enable_followups,
      'followup_days', NEW.followup_days,
      'followup_messages', NEW.followup_messages,
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