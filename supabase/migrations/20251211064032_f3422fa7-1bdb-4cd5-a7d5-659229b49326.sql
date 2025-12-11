-- Create trigger to call webhook function on new campaign inserts
CREATE TRIGGER on_campaign_insert
AFTER INSERT ON public.linkedin_campaigns
FOR EACH ROW
EXECUTE FUNCTION send_campaign_to_webhook();