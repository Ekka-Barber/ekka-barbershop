
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Track notification function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event, action, subscription, notification, error, deliveryStatus } = await req.json()
    console.log('Tracking notification event:', { event, action, deliveryStatus });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (subscription?.endpoint) {
      console.log(`Updating subscription status for endpoint: ${subscription.endpoint}`);
      const updateData: any = {
        last_active: new Date().toISOString(),
      }

      if (error) {
        console.log('Recording error for subscription:', error);
        updateData.error_count = error.increment('error_count', 1)
        updateData.last_error_at = new Date().toISOString()
        updateData.last_error_details = error
        updateData.status = 'active' // Keep it active until cleanup job runs
      } else {
        console.log('Resetting error count for successful delivery');
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

    console.log('Logging notification event to database');
    const { error: insertError } = await supabase
      .from('notification_events')
      .insert([{
        event_type: event,
        action: action,
        notification_data: notification,
        subscription_endpoint: subscription?.endpoint,
        error_details: error || null,
        delivery_status: deliveryStatus || 'pending'
      }])

    if (insertError) {
      throw insertError
    }

    console.log('Successfully tracked notification event');
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
