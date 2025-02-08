
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from '../platformDetection';
import type { NotificationSubscription } from '@/types/notifications';

export class NotificationSubscriptionService {
  async getActiveSubscriptions(): Promise<NotificationSubscription[]> {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('error_count', 5)
      .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching active subscriptions:', error);
      return [];
    }

    return (data || []).map(sub => ({
      id: sub.id,
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      },
      status: sub.status as 'active' | 'expired' | 'retry' | 'failed',
      platform: sub.platform,
      created_at: sub.created_at,
      last_active: sub.last_active,
      error_count: sub.error_count,
      device_info: (sub.device_info as { os?: string; browser?: string; version?: string; }) || {},
      notification_preferences: (sub.notification_preferences as { enabled: boolean; categories: string[]; }) || { enabled: true, categories: [] }
    }));
  }

  async cleanupExpiredSubscriptions(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ status: 'expired' })
        .lt('last_active', thirtyDaysAgo.toISOString())
        .eq('status', 'active');

      if (error) {
        console.error('Error cleaning up expired subscriptions:', error);
      }
    } catch (err) {
      console.error('Error in cleanup process:', err);
    }
  }

  async getPlatformDetails(): Promise<{ os: string; browser: string; version: string }> {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = getPlatformType();
    
    return {
      os: platform,
      browser: this.getBrowserInfo(),
      version: navigator.appVersion
    };
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    return 'other';
  }
}

export const notificationSubscriptionService = new NotificationSubscriptionService();
