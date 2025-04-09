
import { Bar, Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface PerformanceChartProps {
  chartData: ChartData<'bar'>;
  chartOptions: ChartOptions<'bar'>;
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
        <Bar options={chartOptions} data={chartData} />
      ) : (
        <Line options={chartOptions} data={chartData} />
      )}
    </div>
  );
};
