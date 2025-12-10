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

    // Fetch all accounts from Unipile
    const unipileUrl = `https://${UNIPILE_DSN}/api/v1/accounts`;
    console.log('Fetching accounts from Unipile:', unipileUrl);

    const accountsResponse = await fetch(unipileUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': UNIPILE_API_KEY,
      },
    });

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('Unipile API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch accounts from Unipile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accountsData = await accountsResponse.json();
    console.log('Unipile accounts response:', JSON.stringify(accountsData, null, 2));

    // Find LinkedIn account - look in items array
    const accounts = accountsData.items || accountsData;
    const linkedInAccount = Array.isArray(accounts) 
      ? accounts.find((acc: any) => acc.type === 'LINKEDIN' || acc.provider === 'LINKEDIN')
      : null;

    if (!linkedInAccount) {
      console.log('No LinkedIn account found in Unipile');
      return new Response(
        JSON.stringify({ error: 'No LinkedIn account found', connected: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const linkedinId = linkedInAccount.id || linkedInAccount.account_id;
    const accountName = linkedInAccount.name || linkedInAccount.display_name || '';

    console.log('Found LinkedIn account:', { linkedinId, accountName });

    // Update user's profile with LinkedIn ID using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ linkedin_id: linkedinId })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile updated successfully:', updatedProfile);

    // Send webhook to Make.com
    const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/435lxz0ojcwmzczaplg55m2vfwvhoui1';
    
    try {
      const webhookPayload = [{
        linkedin_id: linkedinId,
        name: updatedProfile?.name || accountName || ''
      }];

      console.log('Sending webhook to Make.com:', webhookPayload);

      const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        console.log('Successfully sent webhook to Make.com');
      } else {
        console.error('Failed to send webhook to Make.com:', await webhookResponse.text());
      }
    } catch (webhookError) {
      console.error('Error sending webhook to Make.com:', webhookError);
      // Don't fail the request if webhook fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        connected: true,
        linkedin_id: linkedinId,
        name: accountName 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-linkedin-account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
