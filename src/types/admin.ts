
export interface FileMetadata {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  category: 'menu' | 'offers';
  is_active: boolean;
  branch_name: string | null;
  end_date: string | null;
  created_at: string;
  display_order: number;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  whatsapp_number: string | null;
}

export interface QRCode {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  created_at: string;
  status: 'sent' | 'failed' | 'pending';
  recipients_count: number;
}

export interface AnalyticsData {
  total_subscribers: number;
  active_subscribers: number;
  messages_sent: number;
  click_rate: number;
}
