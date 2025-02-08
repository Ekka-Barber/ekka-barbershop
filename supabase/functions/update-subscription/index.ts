
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
    const { oldSubscription, newSubscription } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Mark old subscription as expired
    if (oldSubscription?.endpoint) {
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({ status: 'expired' })
        .eq('endpoint', oldSubscription.endpoint)

      if (updateError) {
        console.error('Error updating old subscription:', updateError)
      }
    }

    // Create or update new subscription
    if (newSubscription?.endpoint) {
      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: newSubscription.endpoint,
          p256dh: newSubscription.keys.p256dh,
          auth: newSubscription.keys.auth,
          status: 'active',
          last_active: new Date().toISOString()
        })

      if (upsertError) {
        throw upsertError
      }
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
