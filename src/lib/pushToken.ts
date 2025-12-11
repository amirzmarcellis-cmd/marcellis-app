import { supabase } from '@/integrations/supabase/client';

const EDGE_FUNCTION_URL = 'https://sofrxfgjptargppbepbi.supabase.co/functions/v1/send-push-webhook';

// Detect mobile platform from user agent
function getMobilePlatform(): 'android' | 'ios' | null {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/i.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  return null;
}

export async function savePushToken(userId: string, userEmail?: string): Promise<void> {
  console.log('savePushToken called for user:', userId);
  
  // Detect mobile platform
  const platform = getMobilePlatform();
  
  // Skip entirely for desktop browsers
  if (!platform) {
    console.log('Not on mobile device, skipping push token flow');
    return;
  }
  
  // Wait a brief moment for Twinr to inject the function
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check multiple ways the function might be exposed
  console.log('twinr_push_token_fetch type (global):', typeof twinr_push_token_fetch);
  console.log('twinr_push_token_fetch type (window):', typeof window.twinr_push_token_fetch);
  
  const twinrFunction = typeof twinr_push_token_fetch !== 'undefined' 
    ? twinr_push_token_fetch 
    : window.twinr_push_token_fetch;

  // Check if we're in Twinr app
  const isTwinrApp = !!twinrFunction;
  
  console.log('Mobile platform detected:', platform);
  console.log('Is Twinr app:', isTwinrApp);

  let token: string | null = null;
  let email_address: string | null = userEmail || null;

  // If in Twinr app, try to fetch the actual push token
  if (isTwinrApp) {
    try {
      console.log('Attempting to fetch push token from Twinr...');
      
      const result = await twinrFunction();
      console.log('Push token result:', result);
      
      token = result.token || null;
      email_address = result.email_address || userEmail || null;
      
      // Validate the token before saving to database
      if (token && platform) {
        console.log('Push token fetched successfully:', { platform, email_address, tokenLength: token?.length });

        // Save to database (only for Twinr app with actual token)
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
      }
    } catch (twinrError) {
      console.error('Failed to fetch push token from Twinr:', twinrError);
      // Continue to webhook call even if Twinr fails
    }
  }

  // Send to webhook for ALL mobile logins (both Twinr app and mobile browser)
  try {
    const webhookPayload = {
      user_id: userId,
      device_token: token, // Will be null for mobile browser or Twinr failure
      email_address: email_address,
      platform: platform,
      source: isTwinrApp ? 'twinr_app' : 'mobile_browser',
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending to webhook:', webhookPayload);
    
    const webhookResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZnJ4ZmdqcHRhcmdwcGJlcGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDMxNzYsImV4cCI6MjA2OTg3OTE3Nn0._xVCMGu8VY2_JSs38wOdL7nG7EKpl3996heMiu33j9A'
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      console.error('Failed to send push token to webhook:', webhookResponse.status);
    } else {
      console.log('Push token sent to webhook successfully');
    }
  } catch (webhookError) {
    console.error('Failed to send webhook:', webhookError);
  }
}
