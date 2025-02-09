
export interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  url?: string;
  created_at: string;
  data?: Record<string, any>;
}

export interface NotificationTracking {
  id: string;
  event_type: string;
  created_at: string;
  subscription_id: string;
  notification_id: string;
  metadata?: Record<string, any>;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  status: 'active' | 'inactive';
  platform?: string;
  last_active: string;
}
