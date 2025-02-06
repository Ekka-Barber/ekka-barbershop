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
    const { subscription, message } = await req.json()

    // Get VAPID keys from get-vapid-key function
    const vapidResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-vapid-key`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!vapidResponse.ok) {
      throw new Error('Failed to get VAPID keys');
    }

    const { vapidKey: vapidPublicKey } = await vapidResponse.json();

    // Generate new VAPID keys for this notification
    const vapidKeys = webPush.generateVAPIDKeys();

    // Set VAPID details
    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      vapidPublicKey,
      vapidKeys.privateKey
    );

    console.log('Sending push notification with subscription:', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh?.substring(0, 10) + '...',
        auth: subscription.keys.auth?.substring(0, 5) + '...'
      }
    });

    // Send push notification
    await webPush.sendNotification(subscription, message);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})