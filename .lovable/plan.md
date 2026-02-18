

## Update Webhook URL in send-push-webhook Edge Function

### Change
Update the webhook destination URL in `supabase/functions/send-push-webhook/index.ts` from the current Make.com URL to the new n8n webhook URL.

### Technical Details

**File:** `supabase/functions/send-push-webhook/index.ts`

- **Old URL:** `https://hook.eu2.make.com/ve6iu67a23g6xqi2irt973ywl182nzmq`
- **New URL:** `https://n8n.srv1158803.hstgr.cloud/webhook/050985a0-7a33-457b-a57b-715b56fb570a`

Single line change, the edge function will be redeployed automatically.

