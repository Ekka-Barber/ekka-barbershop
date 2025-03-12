
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QRCode } from '@/types/admin';
import { useQRCodeAnalytics } from "@/hooks/useQRCodeAnalytics";
import { AnalyticsFilters } from "./analytics/AnalyticsFilters";
import { OverviewCard } from "./analytics/OverviewCard";
import { BreakdownCard } from "./analytics/BreakdownCard";
import { ScanDetailsCard } from "./analytics/ScanDetailsCard";
import { LocationMapCard } from "./analytics/LocationMapCard";

export const QRCodeAnalytics = ({ qrCodes }: { qrCodes: QRCode[] }) => {
  const {
    selectedQrId,
    setSelectedQrId,
    timeRange,
    setTimeRange,
    analyticsData,
    isLoading
  } = useQRCodeAnalytics(qrCodes);

  if (!qrCodes.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-8 text-muted-foreground">
            No QR codes found. Create a QR code first to view analytics.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for charts
  const deviceData = analyticsData?.device_breakdown ? 
    Object.entries(analyticsData.device_breakdown).map(([name, value]) => ({ name, value })) : 
    [];
    
  const referrerData = analyticsData?.referrer_breakdown ? 
    Object.entries(analyticsData.referrer_breakdown).map(([name, value]) => ({ name, value })) : 
    [];

  // Calculate average daily scans
  const avgDailyScans = analyticsData?.scan_count 
    ? Math.round(analyticsData.scan_count / (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90))
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">QR Code Analytics</h2>
        <p className="text-muted-foreground">
          Track how your QR codes are being used and measure their performance.
        </p>
      </div>

      <AnalyticsFilters
        qrCodes={qrCodes}
        selectedQrId={selectedQrId}
        timeRange={timeRange}
        onSelectQrId={setSelectedQrId}
        onTimeRangeChange={setTimeRange}
      />

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : analyticsData ? (
        <div className="grid gap-6 md:grid-cols-2">
          <OverviewCard 
            scanCount={analyticsData.scan_count}
            avgDailyScans={avgDailyScans}
            dailyScans={analyticsData.daily_scans}
          />

          <BreakdownCard 
            deviceData={deviceData}
            referrerData={referrerData}
          />
          
          <LocationMapCard 
            scanLocations={analyticsData.scan_locations || []}
            isLoading={isLoading}
          />

          <ScanDetailsCard 
            recentScans={analyticsData.recent_scans}
          />
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          Select a QR code to view analytics.
        </div>
      )}
    </div>
  );
};
