
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webPush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

serve(async (req) => {
  console.log('[Push Notification] Function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    console.log('[Push Notification] Request body:', JSON.stringify(body, null, 2));

    if (!body?.subscriptions || !Array.isArray(body.subscriptions) || body.subscriptions.length === 0) {
      console.error('[Push Notification] Invalid request: subscriptions array is missing or empty');
      throw new Error('Invalid request: subscriptions array is required and must not be empty');
    }

    if (!body.message) {
      console.error('[Push Notification] Invalid request: message is missing');
      throw new Error('Invalid request: message is required');
    }

    const { subscriptions, message } = body;
    console.log(`[Push Notification] Processing ${subscriptions.length} subscriptions`);
    
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!publicKey || !privateKey) {
      console.error('[Push Notification] VAPID keys not configured');
      throw new Error('Push notification configuration not available');
    }

    webPush.setVapidDetails(
      'mailto:ekka.barber@gmail.com',
      publicKey,
      privateKey
    );

    const processBatch = async (batch: any[]) => {
      console.log(`[Push Notification] Processing batch of ${batch.length} subscriptions`);
      
      const notificationPromises = batch.map(async (subscription) => {
        if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
          console.error('[Push Notification] Invalid subscription:', subscription);
          return { 
            success: false, 
            endpoint: subscription.endpoint || 'unknown',
            error: 'Invalid subscription data'
          };
        }

        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        let attempt = 0;
        while (attempt < MAX_RETRIES) {
          try {
            console.log(`[Push Notification] Sending to ${subscription.endpoint} (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await webPush.sendNotification(
              pushSubscription,
              JSON.stringify(message)
            );
            console.log(`[Push Notification] Successfully sent to ${subscription.endpoint}`);
            return { success: true, endpoint: subscription.endpoint };
          } catch (error: any) {
            attempt++;
            console.error(`[Push Notification] Error sending to ${subscription.endpoint} (attempt ${attempt}):`, error);
            
            if (attempt === MAX_RETRIES || error.statusCode === 410) { // 410 = Gone (subscription expired)
              return { 
                success: false, 
                endpoint: subscription.endpoint,
                error: error.message,
                statusCode: error.statusCode,
                permanent: error.statusCode === 410
              };
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
        
        return { 
          success: false, 
          endpoint: subscription.endpoint,
          error: 'Max retries exceeded'
        };
      });

      return Promise.all(notificationPromises);
    };

    // Process all subscriptions
    const results = {
      successful: 0,
      failed: 0,
      failures: [] as any[],
      total: subscriptions.length,
      permanentFailures: 0
    };

    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);
      const batchResults = await processBatch(batch);
      
      batchResults.forEach((result) => {
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          if (result.permanent) {
            results.permanentFailures++;
          }
          results.failures.push(result);
        }
      });

      // Log progress for large batches
      if (subscriptions.length > BATCH_SIZE) {
        console.log(`[Push Notification] Progress: ${Math.min((i + BATCH_SIZE), subscriptions.length)}/${subscriptions.length} processed`);
      }
    }

    console.log('[Push Notification] Completed:', JSON.stringify(results, null, 2));
    
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

  } catch (error) {
    console.error('[Push Notification] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
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
