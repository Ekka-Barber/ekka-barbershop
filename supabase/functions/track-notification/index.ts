
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('[Track Notification] Function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event, action, subscription, notification, error, deliveryStatus } = await req.json()
    console.log('[Track Notification] Processing event:', { event, action, deliveryStatus });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update subscription status
    if (subscription?.endpoint) {
      console.log(`[Track Notification] Updating subscription for endpoint: ${subscription.endpoint}`);
      const updateData: any = {
        last_active: new Date().toISOString(),
      }

      if (error) {
        console.log('[Track Notification] Recording error:', error);
        updateData.error_count = error.increment('error_count', 1)
        updateData.last_error_at = new Date().toISOString()
        updateData.last_error_details = error
        
        // If error is fatal (e.g. unsubscribed), mark as expired
        if (error.fatal) {
          updateData.status = 'expired'
        } else if (updateData.error_count >= 3) {
          updateData.status = 'retry'
        } else {
          updateData.status = 'active'
        }
      } else {
        console.log('[Track Notification] Successful delivery, resetting error count');
        updateData.error_count = 0
        updateData.last_error_at = null
        updateData.last_error_details = null
        updateData.status = 'active'
      }

      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update(updateData)
        .eq('endpoint', subscription.endpoint)

      if (updateError) {
        console.error('[Track Notification] Error updating subscription:', updateError)
      }
    }

    // Log notification event
    console.log('[Track Notification] Logging notification event');
    const { error: insertError } = await supabase
      .from('notification_events')
      .insert([{
        event_type: event,
        action: action,
        notification_data: notification,
        subscription_endpoint: subscription?.endpoint,
        error_details: error || null,
        delivery_status: deliveryStatus || 'pending',
        timestamp: new Date().toISOString()
      }])

    if (insertError) {
      throw insertError
    }

    console.log('[Track Notification] Successfully tracked event');
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
    console.error('[Track Notification] Error:', error)
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
