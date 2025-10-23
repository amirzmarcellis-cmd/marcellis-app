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
    console.log('LinkedIn webhook received');
    
    const payload = await req.json();
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract connection details from webhook
    const { name, account_id, provider } = payload;

    if (!name || !account_id) {
      console.error('Missing required fields in webhook:', payload);
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing webhook for connection: ${name}, account: ${account_id}`);

    // Find the pending connection attempt by name
    const { data: attempt, error: fetchError } = await supabaseClient
      .from('linkedin_connection_attempts')
      .select('*')
      .eq('connection_name', name)
      .eq('status', 'pending')
      .single();

    if (fetchError || !attempt) {
      console.error('Connection attempt not found:', name, fetchError);
      return new Response(JSON.stringify({ error: 'Connection attempt not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Found connection attempt for user:', attempt.user_id);

    // Update the profiles table with the LinkedIn account ID
    const { error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({ linkedin_id: account_id })
      .eq('user_id', attempt.user_id);

    if (updateProfileError) {
      console.error('Failed to update profile:', updateProfileError);
      
      // Mark attempt as failed
      await supabaseClient
        .from('linkedin_connection_attempts')
        .update({ 
          status: 'failed',
          error_message: updateProfileError.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', attempt.id);

      throw updateProfileError;
    }

    // Mark attempt as completed
    const { error: updateAttemptError } = await supabaseClient
      .from('linkedin_connection_attempts')
      .update({ 
        status: 'completed',
        account_id: account_id,
        completed_at: new Date().toISOString()
      })
      .eq('id', attempt.id);

    if (updateAttemptError) {
      console.error('Failed to update attempt status:', updateAttemptError);
    }

    console.log('LinkedIn connection completed successfully for user:', attempt.user_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
