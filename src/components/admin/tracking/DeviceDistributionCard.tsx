
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Monitor } from "lucide-react";
import { COLORS } from './types';

interface DeviceDistributionCardProps {
  deviceStats: { mobile: number; desktop: number };
}

export const DeviceDistributionCard = ({ deviceStats }: DeviceDistributionCardProps) => {
  const deviceData = [
    { name: 'Mobile', value: deviceStats.mobile },
    { name: 'Desktop', value: deviceStats.desktop }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Device Distribution</CardTitle>
        <CardDescription>Shows how customers are accessing the booking system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center">
            <Smartphone className="mr-2 h-4 w-4 text-green-500" />
            <span>Mobile: {deviceStats.mobile}</span>
          </div>
          <div className="flex items-center">
            <Monitor className="mr-2 h-4 w-4 text-red-500" />
            <span>Desktop: {deviceStats.desktop}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
