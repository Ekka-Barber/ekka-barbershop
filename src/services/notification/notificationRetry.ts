
import { supabase } from "@/integrations/supabase/client";
import type { NotificationStatus } from '@/types/notifications';

export class NotificationRetryService {
  private maxRetries = 5;
  private retryDelayBase = 1000;
  private retryTimeout: NodeJS.Timeout | null = null;

  async retrySubscription(subscription: PushSubscription): Promise<void> {
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('error_count, status')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (!subData || (subData.error_count || 0) >= this.maxRetries) {
      await this.updateSubscriptionStatus(
        subscription.endpoint,
        false,
        'Max retries exceeded'
      );
      return;
    }

    try {
      const newSubscription = await this.resubscribe(subscription);
      if (newSubscription) {
        await this.updateSubscriptionStatus(newSubscription.endpoint, true);
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
      30 * 60 * 1000
    );
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      this.retrySubscription(subscription);
    }, retryDelay);
  }

  private async updateSubscriptionStatus(
    endpoint: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    const status: NotificationStatus = success ? 'active' : 'retry';
    const now = new Date().toISOString();

    const { data: currentData } = await supabase
      .from('push_subscriptions')
      .select('error_count')
      .eq('endpoint', endpoint)
      .single();

    const newErrorCount = success ? 0 : ((currentData?.error_count || 0) + 1);

    const updateData: any = {
      status,
      error_count: newErrorCount,
      last_active: now,
      updated_at: now
    };

    if (!success) {
      updateData.last_error_at = now;
      updateData.last_error_details = { 
        message: error,
        timestamp: now
      };
    }

    await supabase
      .from('push_subscriptions')
      .update(updateData)
      .eq('endpoint', endpoint);
  }
}

export const notificationRetryService = new NotificationRetryService();
