
import { useQRSelection } from "./qr-analytics/useQRSelection";
import { useQRAnalyticsData } from "./qr-analytics/useQRAnalyticsData";
import { QRCode } from '@/types/admin';
import { QRAnalyticsHookResult } from "./qr-analytics/types";

export { QRScanData } from "./qr-analytics/types";

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
