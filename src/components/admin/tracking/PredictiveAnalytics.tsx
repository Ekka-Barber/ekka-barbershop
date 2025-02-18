
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PredictiveAnalytics as PredictiveAnalyticsType } from './types';

interface PredictiveAnalyticsProps {
  data: PredictiveAnalyticsType;
}

export const PredictiveAnalytics = ({ data }: PredictiveAnalyticsProps) => {
  const revenueData = data.revenueForecasts.map(forecast => ({
    date: forecast.date,
    predicted: forecast.predictedRevenue,
    lower: forecast.lowerBound,
    upper: forecast.upperBound,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="lower" 
                  stroke="#94a3b8" 
                  strokeDasharray="3 3"
                />
                <Line 
                  type="monotone" 
                  dataKey="upper" 
                  stroke="#94a3b8" 
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Busy Periods Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.busyPeriods.map((period, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {period.startTime} - {period.endTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Predicted Bookings: {period.predictedBookings}
                  </div>
                </div>
                <div className="text-sm">
                  {period.confidence.toFixed(1)}% confidence
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
