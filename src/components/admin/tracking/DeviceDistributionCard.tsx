
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Monitor, Tablet } from "lucide-react";

interface DeviceDistributionCardProps {
  deviceStats: { mobile: number; desktop: number; tablet?: number };
}

export const DeviceDistributionCard = ({ deviceStats }: DeviceDistributionCardProps) => {
  const deviceData = [
    { name: 'Mobile', value: deviceStats.mobile, icon: Smartphone },
    { name: 'Desktop', value: deviceStats.desktop, icon: Monitor },
    ...(deviceStats.tablet ? [{ name: 'Tablet', value: deviceStats.tablet, icon: Tablet }] : [])
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Distribution</CardTitle>
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
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {deviceData.map((device, index) => (
            <div key={device.name} className="flex items-center">
              <device.icon className={`mr-2 h-4 w-4 text-${COLORS[index]}`} />
              <span>{device.name}: {device.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
