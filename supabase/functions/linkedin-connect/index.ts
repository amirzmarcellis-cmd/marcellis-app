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
    const UNIPILE_API_KEY = Deno.env.get('UNIPILE_API_KEY');
    if (!UNIPILE_API_KEY) {
      throw new Error('UNIPILE_API_KEY not configured');
    }

    const unipileDsn = 'https://api4.unipile.com:13494';

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const { action } = await req.json();
    console.log(`Action: ${action} for user: ${user.id}`);

    // ======================
    // ACTION: initiate
    // ======================
    if (action === 'initiate') {
      console.log('=== Initiating LinkedIn OAuth ===');

      // Fetch user's profile name
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.name) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Profile name is required. Please update your profile in Settings.');
      }

      const connectionName = profile.name.trim();
      console.log('Connection name:', connectionName);

      // Check for existing pending connection
      const { data: existingAttempt } = await supabaseClient
        .from('linkedin_connection_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingAttempt) {
        // Delete old pending attempt
        await supabaseClient
          .from('linkedin_connection_attempts')
          .delete()
          .eq('id', existingAttempt.id);
      }

      // Create new connection attempt
      const { error: insertError } = await supabaseClient
        .from('linkedin_connection_attempts')
        .insert({
          user_id: user.id,
          connection_name: connectionName,
          status: 'pending'
        });

      if (insertError) {
        console.error('Failed to create connection attempt:', insertError);
        throw new Error('Failed to initialize connection');
      }

      console.log('Created connection attempt');

      // Build webhook callback URL
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const notifyUrl = `${supabaseUrl}/functions/v1/linkedin-webhook`;

      // Set expiration to 1 year from now
      const expiresOn = new Date();
      expiresOn.setFullYear(expiresOn.getFullYear() + 1);

      console.log('Calling Unipile API...');
      console.log('Webhook URL:', notifyUrl);

      // Call Unipile hosted accounts link API
      const response = await fetch(`${unipileDsn}/api/v1/hosted/accounts/link`, {
        method: 'POST',
        headers: {
          'X-API-KEY': UNIPILE_API_KEY,
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'create',
          providers: ['LINKEDIN'],
          api_url: unipileDsn,
          expiresOn: expiresOn.toISOString(),
          notify_url: notifyUrl,
          name: connectionName,
          success_redirect_url: 'https://marcellis.eezi.ai/settings'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unipile API error:', response.status, errorText);
        
        // Clean up failed attempt
        await supabaseClient
          .from('linkedin_connection_attempts')
          .update({ 
            status: 'failed',
            error_message: errorText,
            completed_at: new Date().toISOString()
          })
          .eq('connection_name', connectionName)
          .eq('user_id', user.id);
        
        throw new Error(`Unipile API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Unipile response:', data);
      
      return new Response(JSON.stringify({ 
        url: data.hosted_link || data.url,
        connectionName: connectionName
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ======================
    // ACTION: check-status
    // ======================
    if (action === 'check-status') {
      const { data: attempt, error: fetchError } = await supabaseClient
        .from('linkedin_connection_attempts')
        .select('status, account_id, error_message')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Failed to fetch connection status:', fetchError);
        throw new Error('Failed to check connection status');
      }

      return new Response(JSON.stringify({ 
        status: attempt.status,
        account_id: attempt.account_id,
        error_message: attempt.error_message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ======================
    // ACTION: disconnect
    // ======================
    if (action === 'disconnect') {
      console.log('=== Disconnecting LinkedIn ===');

      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ linkedin_id: null })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to disconnect:', updateError);
        throw new Error('Failed to disconnect LinkedIn account');
      }

      console.log('✅ LinkedIn disconnected');

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
