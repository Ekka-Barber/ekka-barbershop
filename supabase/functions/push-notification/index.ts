
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webPush from 'npm:web-push';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get VAPID keys from environment
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!publicKey || !privateKey) {
      throw new Error('VAPID keys not configured')
    }

    // Set VAPID details
    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      publicKey,
      privateKey
    )

    try {
      // Check if subscription is still valid
      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select('status, error_count')
        .eq('endpoint', subscription.endpoint)
        .single()

      if (!subData || subData.status !== 'active') {
        throw new Error('Subscription not found or inactive')
      }

      console.log('Sending push notification to:', {
        endpoint: subscription.endpoint,
        status: subData.status,
        errorCount: subData.error_count,
        message
      })

      // Send push notification with stringified message
      await webPush.sendNotification(subscription, JSON.stringify(message))

      // Update last active timestamp and reset error count on success
      await supabase
        .from('push_subscriptions')
        .update({ 
          last_active: new Date().toISOString(),
          error_count: 0,
          last_error_at: null,
          last_error_details: null
        })
        .eq('endpoint', subscription.endpoint)

      // Track successful delivery
      await supabase
        .from('notification_events')
        .insert({
          event_type: 'notification_sent',
          action: 'send',
          subscription_endpoint: subscription.endpoint,
          notification_data: message,
          delivery_status: 'delivered'
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
      console.error('Push notification error:', pushError)

      // Update subscription error count
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({ 
          error_count: pushError.statusCode === 410 ? 999 : supabase.rpc('increment', { x: 1 }),
          last_error_at: new Date().toISOString(),
          last_error_details: {
            code: pushError.statusCode,
            message: pushError.message,
            stack: pushError.stack
          }
        })
        .eq('endpoint', subscription.endpoint)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
      }

      // Track delivery failure
      await supabase
        .from('notification_events')
        .insert({
          event_type: 'notification_failed',
          action: 'send',
          subscription_endpoint: subscription.endpoint,
          notification_data: message,
          delivery_status: 'failed',
          error_details: {
            code: pushError.statusCode,
            message: pushError.message,
            timestamp: new Date().toISOString()
          }
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
