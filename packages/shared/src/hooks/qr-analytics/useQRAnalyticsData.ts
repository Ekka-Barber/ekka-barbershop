
import { useQuery } from "@tanstack/react-query";

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';

import { QRScanData } from "./types";
import { fetchDailyScans, fetchTotalScanCount } from "./useDailyScans";
import { fetchDeviceBreakdown, fetchReferrerBreakdown } from "./useDeviceBreakdown";
import { fetchRecentScans } from "./useRecentScans";
import { fetchScanLocations } from "./useScanLocations";

export function useQRAnalyticsData(selectedQrId: string | null, timeRange: string) {
  // Realtime: auto-refetch when new scans arrive
  useRealtimeSubscription({
    table: 'qr_scans',
    queryKeys: [['qrAnalytics', selectedQrId, timeRange]],
    enabled: !!selectedQrId,
  });

  return useQuery({
    queryKey: ["qrAnalytics", selectedQrId, timeRange],
    queryFn: async () => {
      if (!selectedQrId) return null;
      
      let daysLookback = 7;
      if (timeRange === '30days') daysLookback = 30;
      if (timeRange === '90days') daysLookback = 90;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysLookback);
      
      // Fetch all data in parallel to avoid waterfall (async-parallel pattern)
      const [scanCount, dailyScans, deviceBreakdown, referrerBreakdown, recentScans, scanLocations] = 
        await Promise.all([
          fetchTotalScanCount(selectedQrId, startDate),
          fetchDailyScans(selectedQrId, startDate, endDate),
          fetchDeviceBreakdown(selectedQrId, startDate),
          fetchReferrerBreakdown(selectedQrId, startDate),
          fetchRecentScans(selectedQrId),
          fetchScanLocations(selectedQrId, startDate),
        ]);
      
      return {
        qr_id: selectedQrId,
        scan_count: scanCount,
        device_breakdown: deviceBreakdown,
        referrer_breakdown: referrerBreakdown,
        daily_scans: dailyScans,
        recent_scans: recentScans,
        scan_locations: scanLocations
      } as QRScanData;
    },
    enabled: !!selectedQrId,
  });
}
