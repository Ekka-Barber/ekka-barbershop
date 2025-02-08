
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webPush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 100; // Process subscribers in batches of 100

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { subscriptions, message } = await req.json()
    
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!publicKey || !privateKey) {
      console.error('VAPID keys not configured')
      throw new Error('Push notification configuration not available')
    }

    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      publicKey,
      privateKey
    )

    // Process subscriptions in batches
    const processBatch = async (batch: any[]) => {
      console.log(`Processing batch of ${batch.length} subscriptions`);
      
      const notificationPromises = batch.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            }, 
            JSON.stringify(message)
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          console.error(`Error sending to ${subscription.endpoint}:`, error);
          return { 
            success: false, 
            endpoint: subscription.endpoint,
            error: error.message,
            statusCode: error.statusCode 
          };
        }
      });

      return Promise.all(notificationPromises);
    };

    // Start processing all batches in the background
    const processAllBatches = async () => {
      const results = {
        total: subscriptions.length,
        successful: 0,
        failed: 0,
        failures: [] as any[]
      };

      for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
        const batch = subscriptions.slice(i, i + BATCH_SIZE);
        const batchResults = await processBatch(batch);
        
        batchResults.forEach((result) => {
          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
            results.failures.push(result);
          }
        });
      }

      console.log('Notification sending completed:', results);
      return results;
    };

    // Use background processing for large batches
    if (subscriptions.length > BATCH_SIZE) {
      // Start processing in the background
      EdgeRuntime.waitUntil(processAllBatches());
      
      return new Response(
        JSON.stringify({ 
          message: `Processing ${subscriptions.length} notifications in background`,
          started: true 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      // For small batches, process immediately
      const results = await processBatch(subscriptions);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          results 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error in push notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorCode: error.statusCode 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    );
  }
});
