
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsSummaryCardsProps {
  summaryData: {
    total_visits: number;
    total_conversions: number;
    overall_conversion_rate: string;
    tiktok_visits: number;
    tiktok_conversions: number;
    tiktok_conversion_rate: string;
    tiktok_percentage: string;
  } | null;
}

export const MetricsSummaryCards = ({ summaryData }: MetricsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData?.total_visits || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData?.total_conversions || 0}</div>
          <p className="text-xs text-muted-foreground">
            Rate: {summaryData?.overall_conversion_rate || 0}%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TikTok Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData?.tiktok_visits || 0}</div>
          <p className="text-xs text-muted-foreground">
            ({summaryData?.tiktok_percentage || 0}% of total)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TikTok Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData?.tiktok_conversions || 0}</div>
          <p className="text-xs text-muted-foreground">
            Rate: {summaryData?.tiktok_conversion_rate || 0}%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">TikTok</div>
        </CardContent>
      </Card>
    </div>
  );
};
