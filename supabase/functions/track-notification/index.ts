
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event, action, subscription, notification, error, delivery_status } = await req.json()
    console.log('Received tracking request:', { event, action, notification, delivery_status });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update subscription status if provided
    if (subscription?.endpoint) {
      const updateData: any = {
        last_active: new Date().toISOString(),
      }

      if (error) {
        updateData.error_count = error.increment('error_count', 1)
        updateData.last_error_at = new Date().toISOString()
        updateData.last_error_details = error
        updateData.status = 'active'
      } else {
        updateData.error_count = 0
        updateData.status = 'active'
      }

      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update(updateData)
        .eq('endpoint', subscription.endpoint)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
      }
    }

    // Map event types to database values
    const eventType = event === 'received' ? 'received' :
                     event === 'clicked' ? 'clicked' :
                     'notification_sent';

    // Enhanced event tracking with message_id
    const eventData = {
      event_type: eventType,
      action: action || null,
      notification_data: notification,
      subscription_endpoint: subscription?.endpoint,
      error_details: error || null,
      delivery_status: delivery_status || 'pending'
    }

    console.log('Tracking notification event:', eventData)

    const { error: insertError } = await supabase
      .from('notification_events')
      .insert([eventData])

    if (insertError) {
      console.error('Error inserting notification event:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error tracking notification:', error)
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
