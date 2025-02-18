
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { COLORS } from "./types";

interface TimePattern {
  hour: number;
  total: number;
  mobile: number;
  tablet: number;
  desktop: number;
}

interface TimePatternCardProps {
  timePatterns: TimePattern[];
}

export const TimePatternCard = ({ timePatterns }: TimePatternCardProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Booking Time Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={timePatterns}>
            <XAxis 
              dataKey="hour"
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="mobile" name="Mobile" fill={COLORS[0]} stackId="a" />
            <Bar dataKey="tablet" name="Tablet" fill={COLORS[1]} stackId="a" />
            <Bar dataKey="desktop" name="Desktop" fill={COLORS[2]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
