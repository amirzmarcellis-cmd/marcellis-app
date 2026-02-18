

## Remove Webhook Calls from submit_application and Use Supabase Database Webhook Instead

### What Changes
The notification webhook will no longer be triggered from the `submit_application` edge function code. Instead, you'll set up a **Supabase Database Webhook** on the `CVs` table (on INSERT) that sends the full record directly to n8n. The payload will be in the Supabase database webhook format you shared.

### Important Note
A Supabase Database Webhook on INSERT will only fire for **new** applicants (inserts). Returning applicants (where the email already exists) trigger an UPDATE, not an INSERT. If you also need notifications for returning applicants, you'd need to add an UPDATE webhook as well, or we can keep the edge function call just for the returning-applicant case. Let me know if you want both INSERT and UPDATE, or just INSERT.

### Code Changes

**File: `supabase/functions/submit_application/index.ts`**
- Remove the webhook call block for returning applicants (lines 91-113)
- Remove the webhook call block for new applicants (lines 173-195)
- Everything else stays the same (validation, dedup, insert logic)

**File: `supabase/functions/send-push-webhook/index.ts`**
- Can be deleted entirely since nothing will call it anymore (the database webhook sends directly to n8n)

**File: `supabase/config.toml`**
- Remove the `[functions.send-push-webhook]` section

### Manual Step (Supabase Dashboard)
After the code changes, you'll need to create a Database Webhook in the Supabase dashboard:
1. Go to **Database > Webhooks** in the Supabase dashboard
2. Create a new webhook on the `CVs` table for `INSERT` events
3. Set the URL to: `https://n8n.srv1158803.hstgr.cloud/webhook/050985a0-7a33-457b-a57b-715b56fb570a`
4. Set method to POST with Content-Type: application/json

This will automatically send the full record payload in the format you showed.

