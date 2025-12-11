-- Drop the duplicate trigger to prevent webhook being called twice
DROP TRIGGER IF EXISTS trigger_send_campaign_to_webhook ON linkedin_campaigns;