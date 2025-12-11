import { supabase } from '@/integrations/supabase/client';

const WEBHOOK_URL = 'https://hook.eu2.make.com/ve6iu67a23g6xqi2irt973ywl182nzmq';

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

  try {
    let token: string | null = null;
    let email_address: string | null = userEmail || null;

    // If in Twinr app, try to fetch the actual push token
    if (isTwinrApp) {
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
    }

    // Send to webhook for ALL mobile logins (both Twinr app and mobile browser)
    const webhookPayload = {
      user_id: userId,
      device_token: token, // Will be null for mobile browser, actual token for Twinr
      email_address: email_address,
      platform: platform,
      source: isTwinrApp ? 'twinr_app' : 'mobile_browser',
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
    
    // Even if Twinr token fetch fails, still send mobile browser info to webhook
    if (!twinrFunction) {
      try {
        const fallbackPayload = {
          user_id: userId,
          device_token: null,
          email_address: userEmail || null,
          platform: platform,
          source: 'mobile_browser',
          timestamp: new Date().toISOString()
        };
        
        console.log('Sending fallback mobile browser payload to webhook:', fallbackPayload);
        
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fallbackPayload)
        });
      } catch (webhookError) {
        console.error('Failed to send fallback webhook:', webhookError);
      }
    }
  }
}
