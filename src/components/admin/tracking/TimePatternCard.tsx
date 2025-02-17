
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TimePattern {
  hour: number;
  count: number;
  label: string;
}

interface TimePatternCardProps {
  timePatterns: TimePattern[];
}

export const TimePatternCard = ({ timePatterns }: TimePatternCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Time Patterns</CardTitle>
        <CardDescription>Shows when customers are most likely to book</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timePatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
