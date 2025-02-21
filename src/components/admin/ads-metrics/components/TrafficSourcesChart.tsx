
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TrafficSource } from "../types";

interface TrafficSourcesChartProps {
  sourceData: TrafficSource[];
  isLoading?: boolean;
}

// Using a softer, more professional color palette
const COLORS = [
  '#8B5CF6', // Vibrant Purple for TikTok
  '#0EA5E9', // Ocean Blue
  '#F97316', // Bright Orange
  '#D946EF', // Magenta Pink
  '#E5DEFF', // Soft Purple
];

export const TrafficSourcesChart = ({ sourceData, isLoading }: TrafficSourcesChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900">{data.name}</p>
          <p className="text-gray-600">Visits: {data.value.toLocaleString()}</p>
          <p className="text-gray-600">Percentage: {data.percent.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Sort data by value to show largest segments first
  const sortedData = [...sourceData].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => 
                `${name} (${(percent).toFixed(1)}%)`
              }
              labelLine={{ strokeWidth: 1, stroke: '#666' }}
            >
              {sortedData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              align="right"
              verticalAlign="middle"
              formatter={(value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
