
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Update subscription function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { oldSubscription, newSubscription, deviceType } = await req.json()
    console.log('Processing subscription update:', { 
      oldEndpoint: oldSubscription?.endpoint,
      newEndpoint: newSubscription?.endpoint,
      deviceType 
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (oldSubscription?.endpoint) {
      console.log('Marking old subscription as expired:', oldSubscription.endpoint);
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({ 
          status: 'expired',
          last_active: new Date().toISOString()
        })
        .eq('endpoint', oldSubscription.endpoint)

      if (updateError) {
        console.error('Error updating old subscription:', updateError)
      }
    }

    if (newSubscription?.endpoint) {
      console.log('Processing new subscription:', newSubscription.endpoint);
      const { data: existingSub } = await supabase
        .from('push_subscriptions')
        .select('status, error_count')
        .eq('endpoint', newSubscription.endpoint)
        .single()

      console.log('Existing subscription status:', existingSub);

      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: newSubscription.endpoint,
          p256dh: newSubscription.keys.p256dh,
          auth: newSubscription.keys.auth,
          status: 'active',
          last_active: new Date().toISOString(),
          device_type: deviceType || 'unknown',
          error_count: existingSub?.status === 'expired' ? 0 : (existingSub?.error_count ?? 0),
          last_error_at: null,
          last_error_details: null
        })

      if (upsertError) {
        throw upsertError
      }

      console.log('Logging subscription update event');
      await supabase
        .from('notification_events')
        .insert({
          event_type: 'subscription_updated',
          action: existingSub ? 'update' : 'create',
          subscription_endpoint: newSubscription.endpoint,
          notification_data: {
            device_type: deviceType,
            previous_status: existingSub?.status
          }
        })
    }

    console.log('Subscription update completed successfully');
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
    console.error('Error updating subscription:', error)
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
