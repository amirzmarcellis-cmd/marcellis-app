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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's current profile with LinkedIn ID
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('linkedin_id, name')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const linkedinId = profile?.linkedin_id;
    const userName = profile?.name || '';

    if (!linkedinId) {
      return new Response(
        JSON.stringify({ error: 'No LinkedIn account connected', disconnected: true }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Disconnecting LinkedIn account:', { linkedinId, userName });

    // Send disconnect webhook to Make.com BEFORE disconnecting
    const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/6tcohrskfdrm24z4pnt3a21ui5um1k32';
    
    try {
      const webhookPayload = [{
        linkedin_id: linkedinId,
        name: userName
      }];

      console.log('Sending disconnect webhook to Make.com:', webhookPayload);

      const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        console.log('Successfully sent disconnect webhook to Make.com');
      } else {
        console.error('Failed to send disconnect webhook to Make.com:', await webhookResponse.text());
      }
    } catch (webhookError) {
      console.error('Error sending disconnect webhook to Make.com:', webhookError);
      // Continue with disconnect even if webhook fails
    }

    // Update profile to remove LinkedIn ID using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ linkedin_id: null })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to disconnect LinkedIn account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('LinkedIn account disconnected successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        disconnected: true,
        message: 'LinkedIn account disconnected successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in disconnect-linkedin-account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
