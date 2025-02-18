
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PathOptimization } from "@/services/tracking/types";

interface PathOptimizationProps {
  optimizations: PathOptimization[];
}

export const PathOptimizationCard = ({ optimizations }: PathOptimizationProps) => {
  const sortedOptimizations = [...optimizations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Path Optimization Suggestions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>
          Recommendations to improve conversion rates and reduce drop-offs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {sortedOptimizations.map((optimization, index) => (
              <div
                key={index}
                className="p-4 bg-muted/50 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge
                      variant={
                        optimization.priority === 'high'
                          ? 'destructive'
                          : optimization.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {optimization.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {optimization.reasoning}
                    </p>
                  </div>
                  {optimization.priority === 'high' && (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-1 text-muted-foreground">
                    {optimization.currentPath.join(' → ')}
                  </div>
                  <ArrowRight className="h-4 w-4" />
                  <div className="flex-1 font-medium">
                    {optimization.suggestedPath.join(' → ')}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Conversion Impact</p>
                    <p className="font-medium">
                      +{optimization.potentialImpact.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time Saved</p>
                    <p className="font-medium">
                      {Math.round(optimization.potentialImpact.timeToBook / 60)} min
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Drop-off Reduction</p>
                    <p className="font-medium">
                      {optimization.potentialImpact.dropOffReduction.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
