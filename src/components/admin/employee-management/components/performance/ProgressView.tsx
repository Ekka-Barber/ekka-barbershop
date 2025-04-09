
import { Progress } from '@/components/ui/progress';
import { EmployeePerformance, MetricType } from '@/hooks/team-performance/useTeamPerformanceData';
import { formatMetricValue } from '@/components/admin/employee-management/components/performance/performanceUtils';

interface ProgressViewProps {
  sortedPerformanceData: EmployeePerformance[];
  selectedMetric: MetricType;
  highestValue: number;
}

export const ProgressView = ({ 
  sortedPerformanceData, 
  selectedMetric,
  highestValue 
}: ProgressViewProps) => {
  return (
    <div className="space-y-4">
      {sortedPerformanceData.map(employee => (
        <div key={employee.id} className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="font-medium text-sm">{employee.name}</div>
            <div className="text-sm">{formatMetricValue(selectedMetric, employee.metrics[selectedMetric])}</div>
          </div>
          <Progress 
            value={highestValue > 0 ? (employee.metrics[selectedMetric] / highestValue) * 100 : 0} 
            className="h-2" 
          />
        </div>
      ))}
    </div>
  );
};
