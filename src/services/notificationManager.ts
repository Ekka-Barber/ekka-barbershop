import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from './platformDetection';
import { Json } from "@/integrations/supabase/types";

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

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!this.instance) {
      this.instance = new NotificationManager();
    }
    return this.instance;
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
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          status,
          error_count: result.success ? 0 : supabase.rpc('increment', { x: 1 }),
          last_error_at: result.success ? null : new Date().toISOString(),
          last_error_details: result.success ? null : { message: result.error }
        })
        .eq('endpoint', result.endpoint);

      if (error) {
        console.error('Error updating subscription status:', error);
      }
    });

    await Promise.all(updates);
  }

  async handlePermissionChange(state: NotificationPermission): Promise<void> {
    if (!this.currentSubscription) return;

    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        permission_state: state,
        updated_at: new Date().toISOString()
      })
      .eq('endpoint', this.currentSubscription.endpoint);

    if (error) {
      console.error('Error updating permission state:', error);
    }
  }

  async getActiveSubscriptions(): Promise<any[]> {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('status', 'active')
      .lt('error_count', 3)
      .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching active subscriptions:', error);
      return [];
    }

    return data || [];
  }

  async retrySubscription(subscription: PushSubscription): Promise<void> {
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('retry_count')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (!subData || subData.retry_count >= this.maxRetries) {
      await this.updateSubscriptionStatus(subscription, 'expired');
      return;
    }

    try {
      // Attempt to resubscribe
      const newSubscription = await this.resubscribe(subscription);
      if (newSubscription) {
        await this.updateSubscriptionStatus(newSubscription, 'active');
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
    const retryDelay = Math.pow(2, (subscription as any).retry_count || 0) * 1000 * 60; // Exponential backoff
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      this.retrySubscription(subscription);
    }, retryDelay);
  }
}

export const notificationManager = NotificationManager.getInstance();
