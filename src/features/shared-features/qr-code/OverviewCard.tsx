
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@shared/ui/components/card";

interface OverviewCardProps {
  scanCount: number;
  avgDailyScans: number;
  dailyScans: {
    date: string;
    count: number;
  }[];
}

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
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyScans}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
