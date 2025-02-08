
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event, action, subscription, notification, delivery_status } = await req.json()
    console.log('Received tracking request:', { event, action, notification, delivery_status });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update subscription status if provided
    if (subscription?.endpoint) {
      const { data: existingSub } = await supabase
        .from('push_subscriptions')
        .select('status, error_count')
        .eq('endpoint', subscription.endpoint)
        .single();

      if (existingSub) {
        const updateData = {
          last_active: new Date().toISOString(),
          status: 'active',
          error_count: 0
        };

        const { error: updateError } = await supabase
          .from('push_subscriptions')
          .update(updateData)
          .eq('endpoint', subscription.endpoint);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }
      }
    }

    // Track event
    const eventData = {
      event_type: event,
      action: action || null,
      notification_data: notification,
      subscription_endpoint: subscription?.endpoint,
      delivery_status: delivery_status || 'pending'
    }

    console.log('Tracking notification event:', eventData);

    const { error: insertError } = await supabase
      .from('notification_events')
      .insert([eventData]);

    if (insertError) {
      console.error('Error inserting notification event:', insertError);
      throw insertError;
    }

    // Update message stats if it's a received or clicked event
    if (notification?.message_id && (event === 'received' || event === 'clicked')) {
      const { data: message } = await supabase
        .from('notification_messages')
        .select('stats')
        .eq('id', notification.message_id)
        .single();

      if (message) {
        const stats = message.stats || { total_sent: 0, delivered: 0, user_actions: 0 };
        
        if (event === 'received' && delivery_status === 'delivered') {
          stats.delivered = (stats.delivered || 0) + 1;
        } else if (event === 'clicked') {
          stats.user_actions = (stats.user_actions || 0) + 1;
        }

        const { error: statsError } = await supabase
          .from('notification_messages')
          .update({ stats })
          .eq('id', notification.message_id);

        if (statsError) {
          console.error('Error updating message stats:', statsError);
        }
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
    console.error('Error tracking notification:', error);
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
