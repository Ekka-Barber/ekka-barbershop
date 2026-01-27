
import { QRCode } from '@shared/types/admin';

import { QRAnalyticsHookResult } from "./qr-analytics/types";
import { useQRAnalyticsData } from "./qr-analytics/useQRAnalyticsData";
import { useQRSelection } from "./qr-analytics/useQRSelection";

// Change to export type syntax for re-exporting types
export type { QRScanData } from "./qr-analytics/types";

export function useQRCodeAnalytics(qrCodes: QRCode[]): QRAnalyticsHookResult {
  const {
    selectedQrId,
    setSelectedQrId,
    timeRange,
    setTimeRange
  } = useQRSelection(qrCodes);

  const { data: analyticsData, isLoading } = useQRAnalyticsData(selectedQrId, timeRange);

  return {
    selectedQrId,
    setSelectedQrId,
    timeRange,
    setTimeRange,
    analyticsData,
    isLoading
  };
}
