
import { notificationRetryService } from './notification/notificationRetry';
import { notificationTrackingService } from './notification/notificationTracking';
import { notificationSubscriptionService } from './notification/notificationSubscriptionService';

export type PermissionState = 'pending' | 'granted' | 'denied' | 'prompt';
export type NotificationStatus = 'active' | 'inactive' | 'expired' | 'retry';

export class NotificationManager {
  private static instance: NotificationManager;
  private currentSubscription: PushSubscription | null = null;
  private batchSize = 100;

  private constructor() {
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
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('id', delivery.subscription_id)
        .single();

      if (subscription) {
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

  // Expose methods from services
  async getActiveSubscriptions() {
    return notificationSubscriptionService.getActiveSubscriptions();
  }

  async cleanupExpiredSubscriptions() {
    return notificationSubscriptionService.cleanupExpiredSubscriptions();
  }

  async getPlatformDetails() {
    return notificationSubscriptionService.getPlatformDetails();
  }

  async updateSubscriptionStatuses(results: { endpoint: string; success: boolean; error?: string }[]) {
    return notificationTrackingService.updateSubscriptionStatuses(results);
  }

  async retrySubscription(subscription: PushSubscription) {
    return notificationRetryService.retrySubscription(subscription);
  }
}

export const notificationManager = NotificationManager.getInstance();
