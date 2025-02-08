
import { supabase } from "@/integrations/supabase/client";

export class NotificationTrackingService {
  async trackEvent(
    endpoint: string,
    status: 'success' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      await supabase.functions.invoke('track-notification', {
        body: {
          event: status,
          subscription: { endpoint },
          error: error ? { message: error, timestamp: new Date().toISOString() } : undefined
        }
      });
    } catch (err) {
      console.error('Error tracking notification event:', err);
    }
  }

  async updateSubscriptionStatuses(
    results: { endpoint: string; success: boolean; error?: string }[]
  ): Promise<void> {
    const updates = results.map(async (result) => {
      const { data: currentData } = await supabase
        .from('push_subscriptions')
        .select('error_count')
        .eq('endpoint', result.endpoint)
        .single();

      const newErrorCount = result.success ? 0 : ((currentData?.error_count || 0) + 1);
      const now = new Date().toISOString();

      const updateData: any = {
        status: result.success ? 'active' : 'retry',
        error_count: newErrorCount,
        last_active: now,
        updated_at: now
      };

      if (!result.success) {
        updateData.last_error_at = now;
        updateData.last_error_details = { 
          message: result.error,
          timestamp: now
        };
      }

      await supabase
        .from('push_subscriptions')
        .update(updateData)
        .eq('endpoint', result.endpoint);
    });

    await Promise.all(updates);
  }
}

export const notificationTrackingService = new NotificationTrackingService();
