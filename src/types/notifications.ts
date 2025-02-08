
export interface NotificationMessage {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'sent' | 'failed';
  scheduled_for?: string | null;
  stats: NotificationStats;
  url?: string;
  icon?: string;
  platform_data?: {
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
  };
}

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

export interface NotificationTracking {
  id: string;
  event_type: 'notification_sent' | 'received' | 'clicked' | 'failed';
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
  delivery_status?: 'pending' | 'delivered' | 'failed';
  error_details?: {
    code?: number;
    message: string;
    timestamp: string;
  };
  created_at: string;
  platform?: string;
  device_info?: {
    os?: string;
    browser?: string;
    version?: string;
  };
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  status: 'active' | 'expired' | 'retry';
  platform?: string;
  created_at: string;
  last_active?: string;
  error_count: number;
  device_info?: {
    os?: string;
    browser?: string;
    version?: string;
  };
  notification_preferences?: {
    enabled: boolean;
    categories: string[];
  };
}
