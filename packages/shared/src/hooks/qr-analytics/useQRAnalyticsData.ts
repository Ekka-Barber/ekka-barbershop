
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
      
      // Fetch total scan count
      const scanCount = await fetchTotalScanCount(selectedQrId, startDate);
      
      // Fetch daily scan counts
      const dailyScans = await fetchDailyScans(selectedQrId, startDate, endDate);
      
      // Fetch device breakdown
      const deviceBreakdown = await fetchDeviceBreakdown(selectedQrId, startDate);
      
      // Fetch referrer breakdown
      const referrerBreakdown = await fetchReferrerBreakdown(selectedQrId, startDate);
      
      // Fetch recent scans
      const recentScans = await fetchRecentScans(selectedQrId);

      // Fetch scan locations
      const scanLocations = await fetchScanLocations(selectedQrId, startDate);
      
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
