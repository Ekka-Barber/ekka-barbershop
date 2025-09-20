
import React, { lazy, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Lazy load charts bundle for better bundle optimization
const OverviewCardCharts = lazy(() => import('./ChartsBundle').then(module => ({ default: module.OverviewCardCharts })));

interface OverviewCardProps {
  scanCount: number;
  avgDailyScans: number;
  dailyScans: {
    date: string;
    count: number;
  }[];
}

// Loading component for charts
const ChartsLoader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="flex flex-col items-center space-y-2">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-muted-foreground">Loading charts...</p>
    </div>
  </div>
);

export const OverviewCard = ({ scanCount, avgDailyScans, dailyScans }: OverviewCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Overview</CardTitle>
        <CardDescription>Summary of QR code performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Scans</p>
              <p className="text-3xl font-bold">{scanCount}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg. Daily</p>
              <p className="text-3xl font-bold">{avgDailyScans}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Daily Scans</h3>
            <Suspense fallback={<ChartsLoader />}>
              <OverviewCardCharts
                scanCount={scanCount}
                avgDailyScans={avgDailyScans}
                dailyScans={dailyScans}
              />
            </Suspense>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
