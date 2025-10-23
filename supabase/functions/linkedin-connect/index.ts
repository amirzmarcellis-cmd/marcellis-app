import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user profile for name and linkedin_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('name, email, linkedin_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Failed to get user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to get user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the request body
    const body = await req.json();
    const { origin, action } = body;

    // Handle disconnect action
    if (action === 'disconnect') {
      console.log('Disconnecting LinkedIn account for user:', user.id);
      
      // Remove linkedin_id from profiles table
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ linkedin_id: null })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to disconnect LinkedIn account' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Optionally delete the account from Unipile if linkedin_id exists
      if (profile.linkedin_id) {
        try {
          const unipileDsn = Deno.env.get('UNIPILE_DSN');
          const deleteResponse = await fetch(`${unipileDsn}/api/v1/accounts/${profile.linkedin_id}`, {
            method: 'DELETE',
            headers: {
              'X-API-KEY': unipileApiKey,
            },
          });
          
          if (!deleteResponse.ok) {
            console.error('Failed to delete account from Unipile:', await deleteResponse.text());
            // Continue anyway as we've already removed it from our database
          } else {
            console.log('Successfully deleted account from Unipile');
          }
        } catch (error) {
          console.error('Error deleting from Unipile:', error);
          // Continue anyway
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
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
    const notifyUrl = `https://sofrxfgjptargppbepbi.supabase.co/functions/v1/linkedin-webhook`;
    
    console.log('Making request to Unipile API to create LinkedIn hosted account link');
    console.log('User:', profile.name, 'Email:', profile.email);
    console.log('Redirect URL:', successRedirectUrl);
    console.log('Notify URL:', notifyUrl);

    // Create connection attempt record
    const connectionName = `${profile.name || profile.email} - ${new Date().getTime()}`;
    const { data: connectionAttempt, error: attemptError } = await supabaseClient
      .from('linkedin_connection_attempts')
      .insert({
        user_id: user.id,
        connection_name: connectionName,
        status: 'pending'
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Failed to create connection attempt:', attemptError);
    }

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
        name: connectionName,
        api_url: 'https://api4.unipile.com:13494',
        expiresOn: '2030-12-22T12:00:00.701Z',
        success_redirect_url: successRedirectUrl,
        notify_url: notifyUrl
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
