
import { Card } from "@/components/ui/card";
import { NotificationAnalytics } from "@/hooks/useNotificationAnalytics";
import { formatNumber } from "@/utils/formatters";

interface NotificationAnalyticsViewProps {
  analytics: NotificationAnalytics;
}

export const NotificationAnalyticsView = ({ analytics }: NotificationAnalyticsViewProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Sent</h3>
          <p className="text-2xl font-bold">{analytics.totalSent}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Delivery Rate</h3>
          <p className="text-2xl font-bold">{formatNumber(analytics.deliveryRate)}%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Click Rate</h3>
          <p className="text-2xl font-bold">{formatNumber(analytics.clickThroughRate)}%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Subscribers</h3>
          <p className="text-2xl font-bold">{analytics.activeSubscriptions}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
            <div key={platform} className="flex justify-between items-center">
              <span className="capitalize">{platform}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
