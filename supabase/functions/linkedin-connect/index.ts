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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { action, code, state } = await req.json();
    const UNIPILE_API_KEY = Deno.env.get('UNIPILE_API_KEY');
    const UNIPILE_DSN = Deno.env.get('UNIPILE_DSN');

    if (!UNIPILE_API_KEY || !UNIPILE_DSN) {
      throw new Error('Unipile configuration missing');
    }

    // Handle disconnect action
    if (action === 'disconnect') {
      await supabaseClient
        .from('profiles')
        .update({ linkedin_id: null })
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ success: true, message: 'LinkedIn disconnected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle initiate OAuth flow
    if (action === 'initiate') {
      const response = await fetch(`${UNIPILE_DSN}/api/v1/hosted/accounts/link`, {
        method: 'POST',
        headers: {
          'X-API-KEY': UNIPILE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'linkedin',
          success_redirect_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/linkedin-connect`,
          failure_redirect_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/linkedin-connect`,
          expirity: 600,
          notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/linkedin-connect`,
          state: JSON.stringify({ user_id: user.id }),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate LinkedIn OAuth');
      }

      const data = await response.json();
      return new Response(JSON.stringify({ url: data.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle OAuth callback
    if (action === 'callback' && code && state) {
      const stateData = JSON.parse(state);
      
      // Get account details from Unipile
      const response = await fetch(`${UNIPILE_DSN}/api/v1/accounts/${code}`, {
        headers: {
          'X-API-KEY': UNIPILE_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify LinkedIn account');
      }

      const accountData: UnipileAccountResponse = await response.json();

      // Update user profile with LinkedIn account ID
      await supabaseClient
        .from('profiles')
        .update({ 
          linkedin_id: accountData.account_id,
        })
        .eq('user_id', stateData.user_id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          account_id: accountData.account_id,
          name: accountData.name,
          email: accountData.email,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
