
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { SummaryMetrics } from "../types";

interface MetricsSummaryCardsProps {
  summaryData: SummaryMetrics | null;
  isLoading?: boolean;
}

export const MetricsSummaryCards = ({ summaryData, isLoading }: MetricsSummaryCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-4 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <TooltipProvider>
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
            <div className="text-2xl font-bold flex items-center gap-2">
              {summaryData?.total_conversions || 0}
              <Tooltip>
                <TooltipTrigger>
                  {Number(summaryData?.overall_conversion_rate) > 2 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Conversion Rate: {summaryData?.overall_conversion_rate || 0}%</p>
                </TooltipContent>
              </Tooltip>
            </div>
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
            <div className="text-2xl font-bold flex items-center gap-2">
              {summaryData?.tiktok_conversions || 0}
              <Tooltip>
                <TooltipTrigger>
                  {Number(summaryData?.tiktok_conversion_rate) > 2 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Conversion Rate: {summaryData?.tiktok_conversion_rate || 0}%</p>
                </TooltipContent>
              </Tooltip>
            </div>
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
            <div className="text-2xl font-bold text-[#FE2C55]">TikTok</div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.tiktok_percentage || 0}% of traffic
            </p>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
};
