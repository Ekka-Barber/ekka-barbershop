
export interface NotificationMessage {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'sent' | 'failed';
  scheduled_for?: string;
  stats: NotificationStats;
  url?: string;
  icon?: string;
}

export interface NotificationStats {
  total_sent: number;
  delivered: number;
  user_actions: number;
}

export interface NotificationTracking {
  id: string;
  event_type: 'notification_sent' | 'received' | 'clicked';
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
}

