
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, TrendingUp, Clock } from "lucide-react";

interface CoreMetric {
  title: string;
  value: string | number;
  change: number;
  description: string;
  icon: React.ReactNode;
}

interface CoreMetricsGridProps {
  metrics: {
    activeUsers: number;
    conversionRate: number;
    avgSessionDuration: number;
    totalInteractions: number;
  };
}

export const CoreMetricsGrid = ({ metrics }: CoreMetricsGridProps) => {
  const coreMetrics: CoreMetric[] = [
    {
      title: "Active Users",
      value: metrics.activeUsers,
      change: 12.5,
      description: "Unique users in selected period",
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      change: 4.3,
      description: "Users who completed booking",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Avg. Session Duration",
      value: `${Math.round(metrics.avgSessionDuration / 60)} min`,
      change: -2.1,
      description: "Time spent per session",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Total Interactions",
      value: metrics.totalInteractions,
      change: 8.7,
      description: "User actions tracked",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {coreMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={metric.change > 0 ? "text-green-600" : "text-red-600"}>
                {metric.change > 0 ? "+" : ""}{metric.change}%
              </span>
              {" "}from last period
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
