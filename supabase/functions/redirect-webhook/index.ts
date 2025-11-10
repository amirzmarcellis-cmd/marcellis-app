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
    // Extract query parameters from URL
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');
    const job_id = url.searchParams.get('job_id');

    console.log('Redirect webhook called with:', { user_id, job_id });

    // Validate parameters
    if (!user_id || !job_id) {
      console.error('Missing required parameters:', { user_id, job_id });
      
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Missing Parameters</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #e53e3e;
              margin: 0 0 1rem 0;
              font-size: 1.5rem;
            }
            p {
              color: #4a5568;
              margin: 0.5rem 0;
              line-height: 1.6;
            }
            .missing-params {
              background: #fed7d7;
              padding: 1rem;
              border-radius: 0.5rem;
              margin: 1rem 0;
              color: #742a2a;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">⚠️</div>
            <h1>Missing Required Parameters</h1>
            <p>The webhook requires both <strong>user_id</strong> and <strong>job_id</strong> parameters.</p>
            <div class="missing-params">
              <p><strong>Received:</strong></p>
              <p>user_id: ${user_id || '❌ missing'}</p>
              <p>job_id: ${job_id || '❌ missing'}</p>
            </div>
            <p>Please provide both parameters in the URL.</p>
          </div>
        </body>
        </html>
      `;

      return new Response(errorHtml, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    // Send to Make.com webhook in array format
    const makeWebhookUrl = 'https://hook.eu2.make.com/nta7gsjxjiqsfxe6yyz2vv3ct9qchh4t';
    const payload = [{ user_id, job_id }];

    console.log('Sending to Make.com webhook:', payload);

    try {
      const webhookResponse = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Make.com webhook response status:', webhookResponse.status);
      
      if (!webhookResponse.ok) {
        console.error('Make.com webhook error:', await webhookResponse.text());
      }
    } catch (webhookError) {
      console.error('Failed to send to Make.com webhook:', webhookError);
      // Continue to show success page even if webhook fails
    }

    // Return success HTML page with auto-redirect
    const successHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Processing Request</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
            animation: slideIn 0.5s ease-out;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .success-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: bounce 1s ease-in-out infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          h1 {
            color: #2d3748;
            margin: 0 0 1rem 0;
            font-size: 1.75rem;
          }
          p {
            color: #4a5568;
            margin: 0.5rem 0;
            line-height: 1.6;
          }
          .details {
            background: #edf2f7;
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            text-align: left;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: white;
            border-radius: 0.25rem;
          }
          .label {
            font-weight: 600;
            color: #2d3748;
          }
          .value {
            color: #667eea;
            font-family: monospace;
          }
          .countdown {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin: 1rem 0;
          }
          .redirect-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
          }
          .redirect-link:hover {
            text-decoration: underline;
          }
          .spinner {
            border: 3px solid #edf2f7;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 1rem auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Request Processed Successfully</h1>
          <p>Your information has been received and is being processed.</p>
          
          <div class="details">
            <div class="details-row">
              <span class="label">User ID:</span>
              <span class="value">${user_id}</span>
            </div>
            <div class="details-row">
              <span class="label">Job ID:</span>
              <span class="value">${job_id}</span>
            </div>
          </div>

          <div class="spinner"></div>
          
          <p>Redirecting in <span class="countdown" id="countdown">3</span> seconds...</p>
          
          <p>
            <a href="https://www.marc-ellis.com/" class="redirect-link">
              Click here if you are not redirected automatically
            </a>
          </p>
        </div>

        <script>
          let seconds = 3;
          const countdownElement = document.getElementById('countdown');
          
          const countdown = setInterval(() => {
            seconds--;
            countdownElement.textContent = seconds;
            
            if (seconds <= 0) {
              clearInterval(countdown);
              window.location.href = 'https://www.marc-ellis.com/';
            }
          }, 1000);

          // Fallback redirect in case JavaScript fails
          setTimeout(() => {
            window.location.href = 'https://www.marc-ellis.com/';
          }, 3000);
        </script>
      </body>
      </html>
    `;

    return new Response(successHtml, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Error in redirect-webhook function:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
          }
          h1 {
            color: #e53e3e;
            margin: 0 0 1rem 0;
          }
          p {
            color: #4a5568;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Error</h1>
          <p>An unexpected error occurred while processing your request.</p>
          <p>Please try again or contact support if the problem persists.</p>
        </div>
      </body>
      </html>
    `;

    return new Response(errorHtml, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });
  }
});
