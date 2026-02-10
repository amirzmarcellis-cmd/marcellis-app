

## Fix: Trigger Webhook for Returning Applicants

### Problem
When a candidate with an existing email re-applies for a job, the `submit_application` edge function updates their record and returns early **without triggering any webhook notification**. Only new applicants (INSERT) trigger the webhook. This means your team doesn't get notified about returning applicants.

### Solution
After updating the existing applicant's record, call the `send-push-webhook` edge function (which forwards to Make.com) with the application details -- the same way it would be triggered for a new applicant.

### Technical Details

**File: `supabase/functions/submit_application/index.ts`**

In the existing-email branch (around lines 60-98), after updating the CV record and before returning the response, add a fetch call to the `send-push-webhook` function with the applicant's details:

```
// After updating existing CV record, trigger webhook
const webhookPayload = {
  user_id: existingCV.user_id,
  Firstname: clean(body.Firstname),
  Lastname: clean(body.Lastname) || null,
  email: normalizedEmail,
  phone_number: clean(body.phone_number),
  job_id: clean(body.job_id),
  existing: true
};

try {
  await fetch(`${SUPABASE_URL}/functions/v1/send-push-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE}`
    },
    body: JSON.stringify(webhookPayload)
  });
} catch (webhookError) {
  console.error("Webhook trigger failed (non-blocking):", webhookError);
}
```

This same pattern will also be added for **new applicants** (after the INSERT on line 140) to ensure the webhook fires consistently for all submissions, not just relying on database triggers.

The webhook call is wrapped in a try-catch so that if it fails, the application submission still succeeds -- the webhook is a notification, not a critical step.

### Deployment
The `submit_application` edge function will be redeployed after the change.

