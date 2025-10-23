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

    // Extract account_id from the webhook payload
    const accountId = payload.account_id || payload.id;
    const provider = payload.provider;
    
    if (accountId && provider === 'LINKEDIN') {
      // Update the user's profile with the LinkedIn account ID
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // Find profile by the name from the webhook and update with linkedin_id
      const { data: updatedProfile, error } = await supabaseClient
        .from('profiles')
        .update({ linkedin_id: accountId })
        .is('linkedin_id', null)
        .limit(1)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        console.log('Successfully updated profile with LinkedIn ID:', updatedProfile);
      }
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
