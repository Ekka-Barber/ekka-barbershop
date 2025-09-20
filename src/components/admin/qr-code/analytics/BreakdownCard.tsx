
import React, { lazy, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Lazy load charts bundle for better bundle optimization
const BreakdownCardCharts = lazy(() => import('./ChartsBundle').then(module => ({ default: module.BreakdownCardCharts })));

interface ChartData {
  name: string;
  value: number;
}

interface BreakdownCardProps {
  deviceData: ChartData[];
  referrerData: ChartData[];
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

export const BreakdownCard = ({ deviceData, referrerData }: BreakdownCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Breakdown</CardTitle>
        <CardDescription>Where and how your QR code is being scanned</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartsLoader />}>
          <BreakdownCardCharts
            deviceData={deviceData}
            referrerData={referrerData}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};
