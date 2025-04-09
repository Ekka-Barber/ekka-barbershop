
import { Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeePerformance, MetricType, PeriodType } from '@/hooks/team-performance/useTeamPerformanceData';
import { formatMetricValue } from '@/components/admin/employee-management/components/performance/performanceUtils';

interface TopPerformerCardProps {
  topPerformer: EmployeePerformance;
  selectedMetric: MetricType;
  selectedPeriod: PeriodType;
}

export const TopPerformerCard = ({ 
  topPerformer, 
  selectedMetric, 
  selectedPeriod 
}: TopPerformerCardProps) => {
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center justify-center p-4 bg-primary/10 rounded-full">
            <Award className="h-8 w-8 text-primary" />
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold">Top Performer: {topPerformer.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedMetric === 'sales' && 'Highest sales amount'}
              {selectedMetric === 'appointments' && 'Most appointments handled'}
              {selectedMetric === 'revenue' && 'Highest revenue generated'}
            </p>
          </div>
          
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold">
              {formatMetricValue(selectedMetric, topPerformer.metrics[selectedMetric])}
            </div>
            <div className="text-xs text-muted-foreground">
              in the last {selectedPeriod === '1' ? 'month' : `${selectedPeriod} months`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
