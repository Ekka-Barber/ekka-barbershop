
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TimelineDataPoint } from "../types";

interface TimelineChartProps {
  timelineData: TimelineDataPoint[];
  isLoading?: boolean;
}

export const TimelineChart = ({ timelineData, isLoading }: TimelineChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  // Format data for better readability
  const formattedData = timelineData.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString(),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              label={{ 
                value: 'Number of Visits',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{
                value: 'Conversions',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px'
              }}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="visits"
              name="Total Visits"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="tiktok_visits"
              name="TikTok Visits"
              fill="#F97316"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="conversions"
              name="Conversions"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
