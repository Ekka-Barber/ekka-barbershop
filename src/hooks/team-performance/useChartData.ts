
import { useMemo } from 'react';
import { ChartData, ChartOptions } from 'chart.js';
import { EmployeePerformance, MetricType } from './useTeamPerformanceData';

export const useChartData = (
  sortedPerformanceData: EmployeePerformance[],
  selectedMetric: MetricType
) => {
  // Prepare chart data
  const chartData = useMemo(() => {
    return {
      labels: sortedPerformanceData.map(p => p.name),
      datasets: [
        {
          label: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`,
          data: sortedPerformanceData.map(p => p.metrics[selectedMetric]),
          backgroundColor: 'rgba(34, 139, 230, 0.5)',
          borderColor: 'rgba(34, 139, 230, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [sortedPerformanceData, selectedMetric]);

  // Chart options that work with both bar and line charts
  const chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Team ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Comparison`
      },
    },
  };

  return { chartData, chartOptions };
};
