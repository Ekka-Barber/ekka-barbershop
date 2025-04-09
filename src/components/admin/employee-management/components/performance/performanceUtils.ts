
import { MetricType } from '@/hooks/team-performance/useTeamPerformanceData';

export const formatMetricValue = (metric: MetricType, value: number) => {
  switch (metric) {
    case 'sales':
    case 'revenue':
      return `${value.toLocaleString()} SAR`;
    case 'appointments':
      return value.toString();
    default:
      return value.toString();
  }
};
