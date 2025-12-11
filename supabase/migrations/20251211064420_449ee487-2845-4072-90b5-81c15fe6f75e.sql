-- Drop and recreate the webhook function with correct pg_net syntax
CREATE OR REPLACE FUNCTION public.send_campaign_to_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Send campaign data to n8n webhook using correct pg_net syntax
  PERFORM net.http_post(
    url := 'https://n8n.srv1158803.hstgr.cloud/webhook/0903e00d-05bb-445d-bdfd-bd5009f52930',
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
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send campaign webhook: %', SQLERRM;
    RETURN NEW;
END;
$function$;