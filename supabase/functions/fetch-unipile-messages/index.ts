import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UNIPILE_API_KEY = Deno.env.get('UNIPILE_API_KEY') || '';
const UNIPILE_BASE_URL = 'https://api4.unipile.com:13494/api/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, chatId, threadId, message } = await req.json();

    console.log(`fetch-unipile-messages called with action: ${action}, chatId: ${chatId}`);

    if (!UNIPILE_API_KEY) {
      console.error('UNIPILE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Unipile API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: 'chatId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_messages') {
      // Fetch messages from Unipile
      console.log(`Fetching messages for chat: ${chatId}`);
      
      const response = await fetch(`${UNIPILE_BASE_URL}/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': UNIPILE_API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unipile get messages error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch messages', details: errorText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.items?.length || 0} messages`);

      // Transform messages to standard format
      const items = data.items || data.messages || data || [];
      const messages = items.map((msg: any) => ({
        id: msg.id,
        chat_id: msg.chat_id || chatId,
        sender_id: msg.sender_id || msg.from_attendee_id,
        text: msg.text || msg.body || msg.content || '',
        created_at: msg.created_at || msg.timestamp,
        is_sender: msg.is_sender ?? msg.from_me ?? false,
        attachments: msg.attachments || [],
      }));

      return new Response(
        JSON.stringify({ messages }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'send_message') {
      if (!message) {
        return new Response(
          JSON.stringify({ error: 'message is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Sending message to chat: ${chatId}`);

      const response = await fetch(`${UNIPILE_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': UNIPILE_API_KEY,
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unipile send message error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to send message', details: errorText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Message sent successfully');

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "get_messages" or "send_message"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in fetch-unipile-messages:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
