
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid } from 'recharts';

interface ServiceHeatmapProps {
  serviceData: Array<{
    serviceName: string;
    viewCount: number;
    conversionRate: number;
    averageViewDuration: number;
  }>;
}

export const ServiceHeatmapCard = ({ serviceData }: ServiceHeatmapProps) => {
  const data = serviceData.map(service => ({
    x: service.viewCount,
    y: service.conversionRate,
    z: service.averageViewDuration,
    name: service.serviceName,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Discovery Patterns</CardTitle>
        <CardDescription>View count vs conversion rate analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Views" 
                unit=" views"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Conversion" 
                unit="%" 
              />
              <ZAxis 
                type="number" 
                dataKey="z" 
                range={[100, 1000]} 
                name="Avg. Duration" 
                unit="s"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))'
                }}
                wrapperStyle={{ zIndex: 100 }}
              />
              <Scatter 
                name="Services" 
                data={data} 
                fill="hsl(var(--primary))"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
