import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Unipile webhook received:', JSON.stringify(payload, null, 2));

    // Extract data from the webhook payload
    const accountId = payload.account_id || payload.id;
    const status = payload.status;
    const accountName = payload.name;
    
    console.log('Processing webhook - Status:', status, 'Account:', accountName, 'ID:', accountId);
    
    if (accountId && status === 'CREATION_SUCCESS') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // Find the connection attempt by name
      const { data: attempt, error: attemptError } = await supabaseClient
        .from('linkedin_connection_attempts')
        .select('user_id, id')
        .eq('connection_name', accountName)
        .eq('status', 'pending')
        .single();

      if (attemptError || !attempt) {
        console.error('Could not find connection attempt:', attemptError);
        return new Response(
          JSON.stringify({ success: false, error: 'Connection attempt not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the user's profile with the LinkedIn account ID
      const { data: updatedProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .update({ linkedin_id: accountId })
        .eq('user_id', attempt.user_id)
        .select()
        .single();

      if (profileError) {
        console.error('Error updating profile:', profileError);
      } else {
        console.log('Successfully updated profile with LinkedIn ID:', updatedProfile);
        
        // Send webhook to Make.com
        try {
          const makeWebhookUrl = 'https://hook.eu2.make.com/qeth4g2ejmbxgoamgtkewvtcbrc5a7lx';
          const webhookPayload = [{
            linkedin_id: accountId,
            name: updatedProfile.name || ''
          }];
          
          const webhookResponse = await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          });
          
          if (webhookResponse.ok) {
            console.log('Successfully sent webhook to Make.com');
          } else {
            console.error('Failed to send webhook to Make.com:', await webhookResponse.text());
          }
        } catch (webhookError) {
          console.error('Error sending webhook to Make.com:', webhookError);
        }
      }

      // Update connection attempt status
      await supabaseClient
        .from('linkedin_connection_attempts')
        .update({ 
          status: profileError ? 'failed' : 'completed',
          account_id: accountId,
          completed_at: new Date().toISOString(),
          error_message: profileError?.message
        })
        .eq('id', attempt.id);
    }

    return new Response(
      JSON.stringify({ success: true, received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
