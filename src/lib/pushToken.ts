import { supabase } from '@/integrations/supabase/client';

const WEBHOOK_URL = 'https://hook.eu2.make.com/ve6iu67a23g6xqi2irt973ywl182nzmq';

export async function savePushToken(userId: string): Promise<void> {
  // Check if twinr_push_token_fetch exists (only available in mobile app)
  if (typeof twinr_push_token_fetch === 'undefined') {
    console.log('Not in Twinr mobile app, skipping push token fetch');
    return;
  }

  try {
    // Fetch the push token from Twinr
    const { token, email_address, platform } = await twinr_push_token_fetch();
    
    console.log('Push token fetched:', { platform, email_address });

    // Save to database
    const { error: dbError } = await supabase
      .from('push_device_tokens')
      .upsert({
        user_id: userId,
        device_token: token,
        platform: platform,
        email_address: email_address,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_token'
      });

    if (dbError) {
      console.error('Failed to save push token to database:', dbError);
    }

    // Send to webhook
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        device_token: token,
        email_address: email_address,
        platform: platform,
        timestamp: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      console.error('Failed to send push token to webhook:', webhookResponse.status);
    } else {
      console.log('Push token sent to webhook successfully');
    }

  } catch (error) {
    console.error('Failed to fetch/save push token:', error);
  }
}
