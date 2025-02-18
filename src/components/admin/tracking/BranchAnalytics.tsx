
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BranchMetrics {
  branchId: string;
  branchName: string;
  totalVisits: number;
  conversionRate: number;
  averageTimeToSelect: number;
  peakHours: string[];
}

export const BranchAnalytics = () => {
  const [branchMetrics, setBranchMetrics] = useState<BranchMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranchAnalytics = async () => {
      const { data: events } = await supabase
        .from('branch_selection_events')
        .select(`
          *,
          branches!branch_id (
            name,
            name_ar
          )
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!events) return;

      const branchData = new Map<string, {
        visits: number;
        conversions: number;
        selectionTimes: number[];
        timeDistribution: Record<number, number>;
      }>();

      events.forEach(event => {
        if (!event.branch_id) return;

        if (!branchData.has(event.branch_id)) {
          branchData.set(event.branch_id, {
            visits: 0,
            conversions: 0,
            selectionTimes: [],
            timeDistribution: {}
          });
        }

        const data = branchData.get(event.branch_id)!;

        if (event.interaction_type === 'dialog_open') {
          data.visits++;
        }

        if (event.interaction_type === 'branch_select') {
          data.conversions++;
        }

        if (event.dialog_open_time && event.dialog_close_time) {
          const selectionTime = 
            new Date(event.dialog_close_time).getTime() - 
            new Date(event.dialog_open_time).getTime();
          data.selectionTimes.push(selectionTime);

          const hour = new Date(event.dialog_open_time).getHours();
          data.timeDistribution[hour] = (data.timeDistribution[hour] || 0) + 1;
        }
      });

      const metrics: BranchMetrics[] = Array.from(branchData.entries()).map(([branchId, data]) => {
        const peakHours = Object.entries(data.timeDistribution)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([hour]) => `${hour}:00`);

        return {
          branchId,
          branchName: events.find(e => e.branch_id === branchId)?.branches?.name || 'Unknown',
          totalVisits: data.visits,
          conversionRate: (data.conversions / data.visits) * 100,
          averageTimeToSelect: data.selectionTimes.reduce((a, b) => a + b, 0) / data.selectionTimes.length / 1000,
          peakHours
        };
      });

      setBranchMetrics(metrics);
      setIsLoading(false);
    };

    fetchBranchAnalytics();
  }, []);

  if (isLoading) {
    return <div>Loading branch analytics...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Branch Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Branch Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversionRate" fill="#C4A36F" name="Conversion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Branch Visits</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalVisits" fill="#C4A36F" name="Total Visits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branchMetrics.map(branch => (
              <div key={branch.branchId} className="p-4 bg-muted rounded-lg">
                <h3 className="font-bold text-lg mb-2">{branch.branchName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Visits</p>
                    <p className="font-medium">{branch.totalVisits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="font-medium">{branch.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Selection Time</p>
                    <p className="font-medium">{branch.averageTimeToSelect.toFixed(1)}s</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Hours</p>
                    <p className="font-medium">{branch.peakHours.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
