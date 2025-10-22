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

    // Get user's LinkedIn account ID
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('linkedin_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.linkedin_id) {
      throw new Error('No LinkedIn account connected');
    }

    const UNIPILE_API_KEY = Deno.env.get('UNIPILE_API_KEY');
    const UNIPILE_DSN = Deno.env.get('UNIPILE_DSN');

    if (!UNIPILE_API_KEY || !UNIPILE_DSN) {
      throw new Error('Unipile configuration missing');
    }

    // Test the connection by fetching account details
    const response = await fetch(`${UNIPILE_DSN}/api/v1/accounts/${profile.linkedin_id}`, {
      headers: {
        'X-API-KEY': UNIPILE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LinkedIn test failed:', errorData);
      throw new Error('LinkedIn connection test failed');
    }

    const accountData = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'connected',
        account: {
          id: accountData.account_id,
          provider: accountData.provider,
          email: accountData.email,
          name: accountData.name,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('LinkedIn test connection error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        status: 'failed',
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
