import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const WEBHOOK_URL = 'https://n8n.srv1158803.hstgr.cloud/webhook/050985a0-7a33-457b-a57b-715b56fb570a';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('send-push-webhook called');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload));

    // Forward to Make.com webhook (server-side, no CORS issues)
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Make.com response status:', webhookResponse.status);
    const responseText = await webhookResponse.text();
    console.log('Make.com response:', responseText);

    return new Response(
      JSON.stringify({ success: true, makeStatus: webhookResponse.status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error forwarding webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
