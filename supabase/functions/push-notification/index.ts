
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

    // Get VAPID keys from environment
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!publicKey || !privateKey) {
      throw new Error('VAPID keys not configured')
    }

    // Set VAPID details using stored keys
    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      publicKey,
      privateKey
    )

    console.log('Sending push notification with subscription:', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh?.substring(0, 10) + '...',
        auth: subscription.keys.auth?.substring(0, 5) + '...'
      }
    })

    try {
      // Send push notification
      await webPush.sendNotification(subscription, message)

      // Track successful delivery
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/track-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'notification_sent',
          action: 'send',
          subscription,
          notification: { message },
          deliveryStatus: 'delivered'
        })
      })

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (pushError) {
      // Track delivery failure
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/track-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'notification_failed',
          action: 'send',
          subscription,
          notification: { message },
          deliveryStatus: 'failed',
          error: {
            code: pushError.statusCode,
            message: pushError.message,
            timestamp: new Date().toISOString()
          }
        })
      })

      throw pushError
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
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
