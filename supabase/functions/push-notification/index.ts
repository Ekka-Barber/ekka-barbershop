
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webPush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 100;

serve(async (req) => {
  console.log('Push notification function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    console.log('Received request body:', body);

    if (!body || !body.subscriptions || !Array.isArray(body.subscriptions)) {
      console.error('Invalid request body: subscriptions array is missing or invalid');
      throw new Error('Invalid request: subscriptions array is required');
    }

    const { subscriptions, message } = body;
    
    if (!message) {
      console.error('Invalid request body: message is missing');
      throw new Error('Invalid request: message is required');
    }

    console.log(`Processing notification request for ${subscriptions.length} subscriptions`);
    
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!publicKey || !privateKey) {
      console.error('VAPID keys not configured');
      throw new Error('Push notification configuration not available');
    }

    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      publicKey,
      privateKey
    );

    const processBatch = async (batch: any[]) => {
      console.log(`Processing batch of ${batch.length} subscriptions`);
      
      const notificationPromises = batch.map(async (subscription) => {
        if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
          console.error('Invalid subscription object:', subscription);
          return { 
            success: false, 
            endpoint: subscription.endpoint || 'unknown',
            error: 'Invalid subscription data',
            statusCode: 400
          };
        }

        console.log(`Attempting to send to endpoint: ${subscription.endpoint}`);
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
          console.log(`Successfully sent to ${subscription.endpoint}`);
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

    const processAllBatches = async () => {
      const results = {
        total: subscriptions.length,
        successful: 0,
        failed: 0,
        failures: [] as any[]
      };

      for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}`);
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

    if (subscriptions.length > BATCH_SIZE) {
      console.log(`Starting background processing for ${subscriptions.length} notifications`);
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
      const results = await processBatch(subscriptions);
      console.log('Small batch processing completed:', results);
      
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
