
// Notification Messages
export interface NotificationMessage {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  created_at: string;
  updated_at: string;
  status: NotificationMessageStatus;
  scheduled_for?: string | null;
  stats: NotificationStats;
  url?: string;
  icon?: string;
  platform_data?: NotificationPlatformData;
}

export type NotificationMessageStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export interface NotificationStats {
  total_sent: number;
  delivered: number;
  user_actions: number;
  errors?: {
    count: number;
    last_error?: string;
    last_error_at?: string;
  };
}

// Platform-specific notification data
export interface NotificationPlatformData {
  ios?: {
    sound?: string;
    badge?: number;
    category?: string;
  };
  android?: {
    channelId?: string;
    sound?: string;
    priority?: 'default' | 'high' | 'max';
  };
  web?: {
    actions?: NotificationAction[];
    badge?: string;
    vibrate?: number[];
  };
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Subscription Management
export interface NotificationSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  status: NotificationSubscriptionStatus;
  platform?: string;
  created_at: string;
  last_active?: string;
  error_count: number;
  device_info: DeviceInfo;
  notification_preferences: NotificationPreferences;
  user_agent?: string;
}

export type NotificationSubscriptionStatus = 'active' | 'expired' | 'retry' | 'failed';

export interface DeviceInfo {
  os?: string;
  browser?: string;
  version?: string;
  platform?: string;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  categories: string[];
  quiet_hours?: {
    enabled: boolean;
    start?: string; // HH:mm format
    end?: string; // HH:mm format
  };
  frequency?: {
    max_per_day?: number;
    min_interval_minutes?: number;
  };
}

// Notification Tracking & Analytics
export interface NotificationTracking {
  id: string;
  event_type: NotificationEventType;
  action?: string;
  notification_data?: {
    message_id: string;
    title_en: string;
    title_ar: string;
    body_en: string;
    body_ar: string;
    url?: string;
  };
  subscription_endpoint?: string;
  delivery_status?: NotificationDeliveryStatus;
  error_details?: NotificationError;
  created_at: string;
  platform?: string;
  device_info?: DeviceInfo;
}

export type NotificationEventType = 
  | 'notification_sent' 
  | 'received' 
  | 'clicked' 
  | 'dismissed' 
  | 'failed' 
  | 'subscription_changed';

export type NotificationDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'expired';

export interface NotificationError {
  code?: number;
  message: string;
  timestamp: string;
  permanent?: boolean;
  retryable?: boolean;
}

// Rate Limiting
export interface NotificationRateLimit {
  id: string;
  subscription_endpoint: string;
  notification_count: number;
  reset_at: string;
  created_at: string;
  last_notification_time: string;
}

// Analytics
export interface NotificationAnalytics {
  total_subscriptions: number;
  active_subscriptions: number;
  delivery_rate: number;
  engagement_rate: number;
  platform_breakdown: {
    [key: string]: number;
  };
  error_breakdown: {
    [key: string]: number;
  };
  daily_stats: {
    date: string;
    sent: number;
    delivered: number;
    clicked: number;
    errors: number;
  }[];
}
