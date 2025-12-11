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

    // Verify user is authenticated
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const keywords = url.searchParams.get('keywords') || '';
    const type = url.searchParams.get('type') || 'INDUSTRY'; // INDUSTRY, LOCATION, COMPANY

    if (!keywords.trim()) {
      return new Response(
        JSON.stringify({ items: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Unipile credentials
    const UNIPILE_API_KEY = Deno.env.get('UNIPILE_API_KEY');
    const UNIPILE_DSN = Deno.env.get('UNIPILE_DSN');

    if (!UNIPILE_API_KEY || !UNIPILE_DSN) {
      console.error('Missing Unipile configuration');
      return new Response(
        JSON.stringify({ error: 'Unipile configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's LinkedIn account ID for the search
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('linkedin_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.linkedin_id) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn account not connected', items: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search LinkedIn via Unipile API
    const searchUrl = `https://${UNIPILE_DSN}/api/v1/linkedin/search/parameters?keywords=${encodeURIComponent(keywords)}&type=${type}&account_id=${profile.linkedin_id}`;
    
    console.log('Searching LinkedIn:', searchUrl);

    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': UNIPILE_API_KEY,
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Unipile search error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to search LinkedIn', items: [] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    console.log('LinkedIn search results:', JSON.stringify(searchData, null, 2));

    // Transform results to standard format
    const items = (searchData.items || searchData || []).map((item: any) => ({
      id: item.id || item.urn || item.value,
      title: item.title || item.name || item.label || item.text,
    }));

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in linkedin-search:', error);
    return new Response(
      JSON.stringify({ error: error.message, items: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
