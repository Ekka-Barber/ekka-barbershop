
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceStats } from './types';

interface ServiceStatsCardProps {
  serviceStats: ServiceStats[];
}

export const ServiceStatsCard = ({ serviceStats }: ServiceStatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Selection Tracking</CardTitle>
        <CardDescription>Shows how many times services were added or removed from bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rtl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={serviceStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name"
                type="category"
                width={150}
                tick={{ 
                  fontSize: 12,
                  width: 140,
                  textAnchor: 'end'
                }}
              />
              <Tooltip />
              <Bar dataKey="added" fill="#4ade80" name="Added" />
              <Bar dataKey="removed" fill="#f87171" name="Removed" />
              <Bar dataKey="net" fill="#60a5fa" name="Net" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
