import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnipileAccountResponse {
  object: string;
  account_id: string;
  provider: string;
  email?: string;
  name?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Extract JWT token from Bearer header
    const jwt = authHeader.replace('Bearer ', '');
    if (!jwt) {
      throw new Error('No authorization token provided');
    }

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify JWT token explicitly
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(jwt);

    console.log('Auth verification:', { 
      hasUser: !!user, 
      userId: user?.id, 
      error: authError?.message 
    });

    if (authError || !user) {
      console.error('JWT verification failed:', authError);
      throw new Error('Invalid or expired session. Please log in again.');
    }

    console.log('User authenticated successfully:', user.id);

    const { action, code, state, targetUserId } = await req.json();
    const UNIPILE_API_KEY = Deno.env.get('UNIPILE_API_KEY');
    const UNIPILE_DSN = Deno.env.get('UNIPILE_DSN');

    if (!UNIPILE_API_KEY || !UNIPILE_DSN) {
      throw new Error('Unipile configuration missing');
    }

    // Ensure UNIPILE_DSN has proper protocol
    let unipileDsn = UNIPILE_DSN.trim();
    if (!unipileDsn.startsWith('http://') && !unipileDsn.startsWith('https://')) {
      unipileDsn = `https://${unipileDsn}`;
    }
    console.log('Using Unipile DSN:', unipileDsn);

    // Handle disconnect action
    if (action === 'disconnect') {
      let userIdToDisconnect = user.id;
      
      // If targetUserId is provided, check if current user is admin
      if (targetUserId && targetUserId !== user.id) {
        const { data: userRole, error: roleError } = await supabaseClient
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (roleError || userRole?.role !== 'ADMIN') {
          throw new Error('Only admins can disconnect other users');
        }
        
        userIdToDisconnect = targetUserId;
      }
      
      await supabaseClient
        .from('profiles')
        .update({ linkedin_id: null })
        .eq('user_id', userIdToDisconnect);

      return new Response(
        JSON.stringify({ success: true, message: 'LinkedIn disconnected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle initiate OAuth flow
    if (action === 'initiate') {
      // Fetch user's profile name
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.name) {
        console.error('Failed to fetch profile or name is missing:', profileError);
        throw new Error('Profile name is required. Please update your profile first.');
      }

      const connectionName = profile.name.trim();
      console.log('Using connection name:', connectionName);

      // Store the connection attempt in the database
      const { error: insertError } = await supabaseClient
        .from('linkedin_connection_attempts')
        .insert({
          user_id: user.id,
          connection_name: connectionName,
          status: 'pending'
        });

      if (insertError) {
        console.error('Failed to create connection attempt:', insertError);
        throw new Error('Failed to initialize connection. Please try again.');
      }

      console.log('Created connection attempt for:', connectionName);

      // Set expiration date to 1 year from now
      const expiresOn = new Date();
      expiresOn.setFullYear(expiresOn.getFullYear() + 1);

      // Build the webhook callback URL
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const notifyUrl = `${supabaseUrl}/functions/v1/linkedin-webhook`;

      console.log('Webhook URL:', notifyUrl);

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
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unipile API error:', errorText);
        
        // Clean up the failed attempt
        await supabaseClient
          .from('linkedin_connection_attempts')
          .update({ 
            status: 'failed',
            error_message: errorText,
            completed_at: new Date().toISOString()
          })
          .eq('connection_name', connectionName)
          .eq('user_id', user.id);
        
        throw new Error('Failed to initiate LinkedIn OAuth');
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

    // Handle status check
    if (action === 'check-status') {
      const { connectionName } = await req.json();
      
      if (!connectionName) {
        throw new Error('Connection name is required');
      }

      const { data: attempt, error: fetchError } = await supabaseClient
        .from('linkedin_connection_attempts')
        .select('*')
        .eq('connection_name', connectionName)
        .eq('user_id', user.id)
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

    throw new Error('Invalid action');
  } catch (error) {
    console.error('LinkedIn connect error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
