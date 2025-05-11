
import { Bar, Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

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
      {selectedChartType === 'bar' ? (
        <Bar 
          options={chartOptions as ChartOptions<'bar'>} 
          data={chartData as ChartData<'bar'>} 
        />
      ) : (
        <Line 
          options={chartOptions as ChartOptions<'line'>} 
          data={chartData as ChartData<'line'>} 
        />
      )}
    </div>
  );
};
