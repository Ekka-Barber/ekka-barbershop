
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { event, action, subscription, notification } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update last_active timestamp for the subscription
    if (subscription?.endpoint) {
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({ 
          last_active: new Date().toISOString(),
          status: 'active'
        })
        .eq('endpoint', subscription.endpoint)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
      }
    }

    // Log the notification event
    const { error: insertError } = await supabase
      .from('notification_events')
      .insert([{
        event_type: event,
        action: action,
        notification_data: notification,
        subscription_endpoint: subscription?.endpoint
      }])

    if (insertError) {
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
