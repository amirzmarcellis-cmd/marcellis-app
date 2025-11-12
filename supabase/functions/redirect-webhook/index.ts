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

    // Redirect to the Call Candidate page in the React app
    const appUrl = `https://marcellis.eezi.ai/call-candidate?user_id=${encodeURIComponent(user_id)}&job_id=${encodeURIComponent(job_id)}`;
    
    console.log('Redirecting to:', appUrl);

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': appUrl,
      },
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
