
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationAnalytics } from "@/hooks/useNotificationAnalytics";

interface NotificationAnalyticsProps {
  analytics: NotificationAnalytics;
}

export const NotificationAnalyticsView = ({ analytics }: NotificationAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Active push notification subscribers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalSent}</div>
          <p className="text-xs text-muted-foreground">Total notifications sent</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Received</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalReceived}</div>
          <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clicked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalClicked}</div>
          <p className="text-xs text-muted-foreground">User interactions</p>
        </CardContent>
      </Card>
    </div>
  );
};
