
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeriodComparisonProps {
  title: string;
  current: number;
  previous: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
  format?: (value: number) => string;
}

export const PeriodComparison = ({
  title,
  current,
  previous,
  percentageChange,
  trend,
  format = (value) => value.toFixed(1)
}: PeriodComparisonProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendIcon className={cn(
          "h-4 w-4",
          trend === 'up' ? "text-green-500" : 
          trend === 'down' ? "text-red-500" : 
          "text-gray-500"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{format(current)}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className={cn(
            "mr-1",
            trend === 'up' ? "text-green-500" : 
            trend === 'down' ? "text-red-500" : 
            "text-gray-500"
          )}>
            {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
          </span>
          vs previous period
        </div>
        <div className="text-xs text-muted-foreground">
          Previous: {format(previous)}
        </div>
      </CardContent>
    </Card>
  );
};
