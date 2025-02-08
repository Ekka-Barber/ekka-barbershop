
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from './platformDetection';
import { Json } from "@/integrations/supabase/types";

export type PermissionState = 'pending' | 'granted' | 'denied' | 'prompt';
export type NotificationStatus = 'active' | 'inactive' | 'expired' | 'retry';

interface PlatformDetails {
  os: string;
  browser: string;
  version: string;
  [key: string]: string; // Add index signature to make it compatible with Json type
}

export class NotificationManager {
  private static instance: NotificationManager;
  private currentSubscription: PushSubscription | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 5;

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

  async updateSubscriptionStatus(
    subscription: PushSubscription, 
    status: NotificationStatus,
    error?: Error
  ): Promise<void> {
    const platformDetails = await this.getPlatformDetails();
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({
        status,
        platform_details: platformDetails as Json,
        last_active: new Date().toISOString(),
        error_count: error ? await supabase.rpc('increment', { x: 1 }).then(result => result.data || 0) : 0,
        last_error_at: error ? new Date().toISOString() : null,
        last_error_details: error ? { message: error.message } : null
      })
      .eq('endpoint', subscription.endpoint);

    if (updateError) {
      console.error('Error updating subscription status:', updateError);
    }
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
