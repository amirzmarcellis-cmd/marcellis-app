import { supabase } from '@/integrations/supabase/client';

const WEBHOOK_URL = 'https://hook.eu2.make.com/ve6iu67a23g6xqi2irt973ywl182nzmq';

export async function savePushToken(userId: string): Promise<void> {
  console.log('savePushToken called for user:', userId);
  
  // Wait a brief moment for Twinr to inject the function
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check multiple ways the function might be exposed
  console.log('twinr_push_token_fetch type (global):', typeof twinr_push_token_fetch);
  console.log('twinr_push_token_fetch type (window):', typeof window.twinr_push_token_fetch);
  
  const twinrFunction = typeof twinr_push_token_fetch !== 'undefined' 
    ? twinr_push_token_fetch 
    : window.twinr_push_token_fetch;

  if (!twinrFunction) {
    console.log('Not in Twinr mobile app, skipping push token fetch');
    return;
  }

  try {
    console.log('Attempting to fetch push token from Twinr...');
    
    // Fetch the push token from Twinr
    const result = await twinrFunction();
    console.log('Push token result:', result);
    
    const { token, email_address, platform } = result;
    
    // Validate the data before proceeding
    if (!token || !platform) {
      console.error('Invalid push token data received:', { token: !!token, platform });
      return;
    }
    
    console.log('Push token fetched successfully:', { platform, email_address, tokenLength: token?.length });

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
    } else {
      console.log('Push token saved to database successfully');
    }

    // Send to webhook
    const webhookPayload = {
      user_id: userId,
      device_token: token,
      email_address: email_address,
      platform: platform,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending to webhook:', webhookPayload);
    
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
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
