import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from './platformDetection';
import type { NotificationStats, NotificationSubscription } from '@/types/notifications';

export type PermissionState = 'pending' | 'granted' | 'denied' | 'prompt';
export type NotificationStatus = 'active' | 'inactive' | 'expired' | 'retry';

interface PlatformDetails {
  os: string;
  browser: string;
  version: string;
  [key: string]: string;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private currentSubscription: PushSubscription | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 5;
  private batchSize = 100;
  private retryDelayBase = 1000; // Base delay in milliseconds

  private constructor() {
    // Initialize offline support
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleNetworkChange.bind(this));
      window.addEventListener('offline', this.handleNetworkChange.bind(this));
    }
  }

  static getInstance(): NotificationManager {
    if (!this.instance) {
      this.instance = new NotificationManager();
    }
    return this.instance;
  }

  private async handleNetworkChange(event: Event): Promise<void> {
    if (event.type === 'online') {
      await this.processPendingNotifications();
    }
  }

  private async processPendingNotifications(): Promise<void> {
    try {
      const { data: pendingDeliveries } = await supabase
        .from('notification_deliveries')
        .select('*')
        .eq('status', 'pending')
        .limit(this.batchSize);

      if (pendingDeliveries) {
        for (const delivery of pendingDeliveries) {
          await this.retryDelivery(delivery);
        }
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  private async retryDelivery(delivery: any): Promise<void> {
    try {
      // Implement retry logic here
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('id', delivery.subscription_id)
        .single();

      if (subscription) {
        // Retry the notification delivery
        await supabase.functions.invoke('push-notification', {
          body: { 
            subscription,
            message: delivery.notification_data
          }
        });
      }
    } catch (error) {
      console.error('Error retrying delivery:', error);
    }
  }

  async getPlatformDetails(): Promise<PlatformDetails> {
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

  async updateSubscriptionStatuses(
    results: { endpoint: string; success: boolean; error?: string }[]
  ): Promise<void> {
    const updates = results.map(async (result) => {
      const status: NotificationStatus = result.success ? 'active' : 'retry';
      const { data: currentData } = await supabase
        .from('push_subscriptions')
        .select('error_count')
        .eq('endpoint', result.endpoint)
        .single();

      const newErrorCount = result.success ? 0 : ((currentData?.error_count || 0) + 1);
      const now = new Date().toISOString();

      const updateData: any = {
        status,
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

      const { error } = await supabase
        .from('push_subscriptions')
        .update(updateData)
        .eq('endpoint', result.endpoint);

      if (error) {
        console.error('Error updating subscription status:', error);
      }

      // Track the event
      await this.trackNotificationEvent(result.endpoint, result.success ? 'success' : 'failed', result.error);
    });

    await Promise.all(updates);
  }

  private async trackNotificationEvent(
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

  async getActiveSubscriptions(): Promise<NotificationSubscription[]> {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('error_count', this.maxRetries)
      .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching active subscriptions:', error);
      return [];
    }

    return (data || []).map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      },
      status: sub.status as 'active' | 'expired' | 'retry',
      platform: sub.platform,
      created_at: sub.created_at,
      last_active: sub.last_active,
      error_count: sub.error_count,
      device_info: sub.device_info,
      notification_preferences: sub.notification_preferences
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

  async retrySubscription(subscription: PushSubscription): Promise<void> {
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('error_count, status')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (!subData || (subData.error_count || 0) >= this.maxRetries) {
      await this.updateSubscriptionStatuses([
        { 
          endpoint: subscription.endpoint, 
          success: false, 
          error: 'Max retries exceeded' 
        }
      ]);
      return;
    }

    try {
      const newSubscription = await this.resubscribe(subscription);
      if (newSubscription) {
        await this.updateSubscriptionStatuses([
          { 
            endpoint: newSubscription.endpoint, 
            success: true 
          }
        ]);
      }
    } catch (error) {
      console.error('Error retrying subscription:', error);
      await this.scheduleRetry(subscription);
    }
  }

  private async resubscribe(oldSubscription: PushSubscription): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await this.getVapidPublicKey()
      });
      
      return newSubscription;
    } catch (error) {
      console.error('Resubscription failed:', error);
      return null;
    }
  }

  private async getVapidPublicKey(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('get-vapid-key');
    if (error || !data?.vapidKey) {
      throw new Error('Failed to get VAPID key');
    }
    return data.vapidKey;
  }

  private async scheduleRetry(subscription: PushSubscription): Promise<void> {
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('error_count')
      .eq('endpoint', subscription.endpoint)
      .single();

    const retryCount = (subData?.error_count || 0);
    const retryDelay = Math.min(
      Math.pow(2, retryCount) * this.retryDelayBase,
      30 * 60 * 1000 // Max 30 minutes
    );
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      this.retrySubscription(subscription);
    }, retryDelay);
  }
}

export const notificationManager = NotificationManager.getInstance();
