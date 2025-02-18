
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserBehaviorMetrics } from "./types";
import { Activity, ArrowDown, Clock, UserCheck } from "lucide-react";

interface BehaviorMetricsProps {
  metrics: UserBehaviorMetrics;
}

export const BehaviorMetricsCard = ({ metrics }: BehaviorMetricsProps) => {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>User Behavior Analysis</CardTitle>
        <CardDescription>Overview of user journey patterns and engagement metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {Math.round(metrics.averageSessionDuration)}s
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Avg. Session Duration</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {metrics.bounceRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Bounce Rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {metrics.completionRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {metrics.commonPaths.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Common Paths</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Common User Paths</h3>
            <div className="space-y-4">
              {metrics.commonPaths.map((path, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{path.path.join(' → ')}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(path.averageDuration)}s avg. duration
                    </div>
                  </div>
                  <div className="text-sm font-medium">{path.frequency} users</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Drop-off Points</h3>
            <div className="space-y-4">
              {metrics.dropOffPoints.map((point, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{point.page}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(point.averageTimeBeforeExit)}s before exit
                    </div>
                  </div>
                  <div className="text-sm font-medium">{point.exitRate.toFixed(1)}% exit rate</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
