
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeographicInsightsType } from './types';

interface GeographicInsightsProps {
  data?: GeographicInsightsType;
}

export const GeographicInsights = ({ data }: GeographicInsightsProps) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No geographic data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Branch Locations & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Map visualization temporarily unavailable</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

