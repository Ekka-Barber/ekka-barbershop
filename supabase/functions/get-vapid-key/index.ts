
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if VAPID keys exist in secrets
    let publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    let privateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!publicKey || !privateKey) {
      // Generate new VAPID keys if they don't exist
      console.log('Generating new VAPID keys...')
      const vapidKeys = webPush.generateVAPIDKeys()
      publicKey = vapidKeys.publicKey
      privateKey = vapidKeys.privateKey

      // Store generated keys in Supabase secrets
      // Note: This is just informational, actual key storage will be done manually
      console.log('New VAPID keys generated:', {
        publicKey,
        privateKeyLength: privateKey.length
      })
    }

    // Set VAPID details
    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      publicKey,
      privateKey
    )

    return new Response(
      JSON.stringify({ 
        vapidKey: publicKey,
        privateKey: privateKey 
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
    console.error('Error handling VAPID keys:', error)
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
