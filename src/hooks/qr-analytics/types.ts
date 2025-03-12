
import { QRCode } from '@/types/admin';

export interface QRScanData {
  qr_id: string;
  scan_count: number;
  device_breakdown: Record<string, number>;
  referrer_breakdown: Record<string, number>;
  daily_scans: {
    date: string;
    count: number;
  }[];
  recent_scans: {
    scanned_at: string;
    device_type: string;
    referrer: string;
    location?: string;
  }[];
  scan_locations: {
    lat: number;
    lng: number;
    count: number;
  }[];
}

export interface QRAnalyticsHookResult {
  selectedQrId: string | null;
  setSelectedQrId: (id: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
  analyticsData: QRScanData | null | undefined;
  isLoading: boolean;
}
