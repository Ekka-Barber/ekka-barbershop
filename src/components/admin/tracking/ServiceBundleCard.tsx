
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

interface ServiceBundle {
  name: string;
  frequency: number;
  averageValue: number;
  conversionRate: number;
}

interface ServiceBundleProps {
  bundles: ServiceBundle[];
}

export const ServiceBundleCard = ({ bundles }: ServiceBundleProps) => {
  const sortedBundles = [...bundles].sort((a, b) => b.frequency - a.frequency);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Bundle Analysis</CardTitle>
        <CardDescription>
          Most popular service combinations and their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedBundles}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                className="text-xs"
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar
                yAxisId="left"
                dataKey="frequency"
                fill="hsl(var(--primary))"
                opacity={0.8}
              />
              <Bar
                yAxisId="right"
                dataKey="conversionRate"
                fill="hsl(var(--secondary))"
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ScrollArea className="h-[200px] mt-4">
          <div className="space-y-2">
            {sortedBundles.map((bundle, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{bundle.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Average value: ${bundle.averageValue.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{bundle.frequency} bookings</p>
                  <p className="text-sm text-muted-foreground">
                    {bundle.conversionRate.toFixed(1)}% conversion
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
