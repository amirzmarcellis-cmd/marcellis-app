import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const unipileApiKey = Deno.env.get('UNIPILE_API_KEY');
    
    if (!unipileApiKey) {
      console.error('UNIPILE_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the authorization header to verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the origin from the request body
    const { origin } = await req.json();
    
    if (!origin) {
      return new Response(
        JSON.stringify({ error: 'Origin is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const successRedirectUrl = `${origin}/linkedin-callback`;
    console.log('Making request to Unipile API to create LinkedIn hosted account link with redirect:', successRedirectUrl);

    const response = await fetch('https://api4.unipile.com:13494/api/v1/hosted/accounts/link', {
      method: 'POST',
      headers: {
        'X-API-KEY': unipileApiKey,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'create',
        providers: ['LINKEDIN'],
        api_url: 'https://api4.unipile.com:13494',
        expiresOn: '2030-12-22T12:00:00.701Z',
        success_redirect_url: successRedirectUrl
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unipile API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create LinkedIn connection link',
          details: errorText 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Successfully created LinkedIn hosted account link');

    return new Response(
      JSON.stringify({ 
        url: data.url,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in linkedin-connect function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
