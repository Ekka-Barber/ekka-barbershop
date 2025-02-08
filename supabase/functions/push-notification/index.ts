
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as webPush from 'npm:web-push';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

serve(async (req) => {
  console.log('[Push Notification] Function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let body;
    try {
      body = await req.json();
      console.log('[Push Notification] Received request body:', JSON.stringify(body, null, 2));
    } catch (error) {
      console.error('[Push Notification] Error parsing request body:', error);
      throw new Error('Invalid request: Could not parse JSON body');
    }

    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request: Request body must be a JSON object');
    }

    if (!Array.isArray(body.subscriptions)) {
      console.error('[Push Notification] Invalid subscriptions array:', body.subscriptions);
      throw new Error('Invalid request: subscriptions must be an array');
    }

    if (!body.message || typeof body.message !== 'object') {
      console.error('[Push Notification] Invalid message:', body.message);
      throw new Error('Invalid request: message must be an object');
    }

    const { subscriptions, message } = body;
    console.log(`[Push Notification] Processing ${subscriptions.length} subscriptions`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!publicKey || !privateKey) {
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
          return { success: false, endpoint: subscription.endpoint || 'unknown', error: 'Invalid subscription data' };
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
            const retryDelay = Math.pow(2, attempt) * INITIAL_BACKOFF;
            console.log(`[Push Notification] Sending to ${subscription.endpoint} (attempt ${attempt + 1}/${MAX_RETRIES})`);
            
            await webPush.sendNotification(pushSubscription, JSON.stringify(message));
            
            // Update subscription stats on success
            await supabase
              .from('push_subscriptions')
              .update({
                last_successful_delivery: new Date().toISOString(),
                last_attempted_delivery: new Date().toISOString(),
                delivery_success_count: increment('delivery_success_count'),
                error_count: 0,
                status: 'active',
                last_active: new Date().toISOString()
              })
              .eq('endpoint', subscription.endpoint);

            console.log(`[Push Notification] Successfully sent to ${subscription.endpoint}`);
            return { success: true, endpoint: subscription.endpoint };
          } catch (error: any) {
            attempt++;
            console.error(`[Push Notification] Error sending to ${subscription.endpoint} (attempt ${attempt}):`, error);
            
            const isPermanentError = error.statusCode === 410 || error.statusCode === 404;
            
            if (isPermanentError || attempt === MAX_RETRIES) {
              // Update subscription status for permanent failure
              await supabase
                .from('push_subscriptions')
                .update({
                  status: isPermanentError ? 'expired' : 'retry',
                  last_attempted_delivery: new Date().toISOString(),
                  delivery_failure_count: increment('delivery_failure_count'),
                  error_count: increment('error_count'),
                  last_error_at: new Date().toISOString(),
                  last_error_details: {
                    statusCode: error.statusCode,
                    message: error.message,
                    timestamp: new Date().toISOString()
                  }
                })
                .eq('endpoint', subscription.endpoint);

              return { 
                success: false, 
                endpoint: subscription.endpoint,
                error: error.message,
                statusCode: error.statusCode,
                permanent: isPermanentError
              };
            }
            
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, retryDelay));
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

    const results = {
      successful: 0,
      failed: 0,
      failures: [] as any[],
      total: subscriptions.length,
      permanentFailures: 0,
      retriableFailures: 0
    };

    // Process subscriptions in smaller batches
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
          } else {
            results.retriableFailures++;
          }
          results.failures.push(result);
        }
      });

      // Log progress for large batches
      if (subscriptions.length > BATCH_SIZE) {
        console.log(`[Push Notification] Progress: ${Math.min((i + BATCH_SIZE), subscriptions.length)}/${subscriptions.length} processed`);
      }
    }

    // Log notification event
    await supabase
      .from('notification_events')
      .insert({
        event_type: 'batch_completed',
        delivery_status: results.failed === 0 ? 'success' : 'partial',
        notification_data: {
          message_id: message.message_id,
          stats: results
        }
      });

    console.log('[Push Notification] Completed:', JSON.stringify(results, null, 2));
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Push Notification] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }
});

// Helper function to generate increment SQL
const increment = (column: string) => {
  return `COALESCE(${column}, 0) + 1`;
};

