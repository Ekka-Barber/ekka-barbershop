import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webPush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Generate VAPID keys if they don't exist
    const vapidKeys = webPush.generateVAPIDKeys();
    
    // Set VAPID details
    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    console.log('Generated new VAPID keys:', {
      publicKey: vapidKeys.publicKey,
      privateKeyLength: vapidKeys.privateKey.length
    });

    return new Response(
      JSON.stringify({ 
        vapidKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error generating VAPID keys:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    )
  }
})