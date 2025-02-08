
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

// Enhanced logging function
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[Push Notification ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Error logging function
const logError = (message: string, error: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[Push Notification Error ${timestamp}] ${message}`, error);
  if (error?.stack) {
    console.error('Stack trace:', error.stack);
  }
};

serve(async (req) => {
  log('Function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let body;
    try {
      body = await req.json();
      log('Received request body:', body);
    } catch (error) {
      logError('Error parsing request body:', error);
      throw new Error('Invalid request: Could not parse JSON body');
    }

    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request: Request body must be a JSON object');
    }

    if (!Array.isArray(body.subscriptions)) {
      logError('Invalid subscriptions array:', body.subscriptions);
      throw new Error('Invalid request: subscriptions must be an array');
    }

    if (!body.message || typeof body.message !== 'object') {
      logError('Invalid message:', body.message);
      throw new Error('Invalid request: message must be an object');
    }

    const { subscriptions, message } = body;
    log(`Processing ${subscriptions.length} subscriptions`);

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
      log(`Processing batch of ${batch.length} subscriptions`);
      
      const notificationPromises = batch.map(async (subscription) => {
        if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
          logError('Invalid subscription:', subscription);
          return { success: false, endpoint: subscription.endpoint || 'unknown', error: 'Invalid subscription data' };
        }

        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        // Get platform details from subscription
        const { data: subData } = await supabase
          .from('push_subscriptions')
          .select('platform_details, device_type')
          .eq('endpoint', subscription.endpoint)
          .single();

        const platform = subData?.device_type || 'unknown';
        log('Detected platform:', { platform, details: subData?.platform_details });

        let attempt = 0;
        while (attempt < MAX_RETRIES) {
          try {
            const retryDelay = Math.pow(2, attempt) * INITIAL_BACKOFF;
            log(`Sending to ${subscription.endpoint} (attempt ${attempt + 1}/${MAX_RETRIES})`, {
              platform,
              messageId: message.message_id
            });
            
            // Track notification attempt
            await supabase.functions.invoke('track-notification', {
              body: {
                event: 'notification_sent',
                subscription: {
                  endpoint: subscription.endpoint,
                  platform
                },
                notification: message,
                deliveryStatus: 'pending'
              }
            });

            await webPush.sendNotification(pushSubscription, JSON.stringify({
              ...message,
              platform,
              timestamp: new Date().toISOString()
            }));
            
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

            // Track successful delivery
            await supabase.functions.invoke('track-notification', {
              body: {
                event: 'delivered',
                subscription: {
                  endpoint: subscription.endpoint,
                  platform
                },
                notification: message,
                deliveryStatus: 'delivered'
              }
            });

            log(`Successfully sent to ${subscription.endpoint}`, {
              platform,
              messageId: message.message_id
            });
            
            return { success: true, endpoint: subscription.endpoint, platform };
          } catch (error: any) {
            attempt++;
            logError(`Error sending to ${subscription.endpoint} (attempt ${attempt}):`, error);
            
            const isPermanentError = error.statusCode === 410 || error.statusCode === 404;
            
            if (isPermanentError || attempt === MAX_RETRIES) {
              // Track failed delivery
              await supabase.functions.invoke('track-notification', {
                body: {
                  event: 'failed',
                  subscription: {
                    endpoint: subscription.endpoint,
                    platform
                  },
                  notification: message,
                  deliveryStatus: 'failed',
                  error: {
                    code: error.statusCode,
                    message: error.message,
                    permanent: isPermanentError
                  }
                }
              });

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
                platform,
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
          platform,
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
      retriableFailures: 0,
      platformStats: {} as Record<string, { success: number; failed: number }>
    };

    // Process subscriptions in smaller batches
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);
      const batchResults = await processBatch(batch);
      
      batchResults.forEach((result) => {
        // Initialize platform stats if not exist
        if (!results.platformStats[result.platform]) {
          results.platformStats[result.platform] = { success: 0, failed: 0 };
        }

        if (result.success) {
          results.successful++;
          results.platformStats[result.platform].success++;
        } else {
          results.failed++;
          results.platformStats[result.platform].failed++;
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
        log(`Progress: ${Math.min((i + BATCH_SIZE), subscriptions.length)}/${subscriptions.length} processed`);
      }
    }

    // Log notification event with detailed stats
    await supabase
      .from('notification_events')
      .insert({
        event_type: 'batch_completed',
        delivery_status: results.failed === 0 ? 'success' : 'partial',
        notification_data: {
          message_id: message.message_id,
          stats: results,
          platformStats: results.platformStats
        }
      });

    log('Completed sending notifications:', results);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logError('Error in push notification function:', error);
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
