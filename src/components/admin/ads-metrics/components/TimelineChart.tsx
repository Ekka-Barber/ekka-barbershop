
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimelineChartProps {
  timelineData: any[];
}

export const TimelineChart = ({ timelineData }: TimelineChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="visits" stroke="#8884d8" name="Total Visits" />
            <Line type="monotone" dataKey="tiktok_visits" stroke="#FE2C55" name="TikTok Visits" />
            <Line type="monotone" dataKey="conversions" stroke="#82ca9d" name="Conversions" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
