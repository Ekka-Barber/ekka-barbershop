import { ChartData, ChartOptions } from 'chart.js';
import { ChartWrapper } from './ChartWrapper';

interface PerformanceChartProps {
  chartData: ChartData<'bar' | 'line'>;
  chartOptions: ChartOptions<'bar' | 'line'>;
  selectedChartType?: 'bar' | 'line';
}

export const PerformanceChart = ({ 
  chartData, 
  chartOptions,
  selectedChartType = 'bar'
}: PerformanceChartProps) => {
  return (
    <div className="h-[300px]">
      <ChartWrapper
        chartData={chartData}
        chartOptions={chartOptions}
        chartType={selectedChartType}
        id={`performance-chart-${selectedChartType}`}
      />
    </div>
  );
};
