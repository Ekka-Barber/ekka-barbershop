import { Bar, Line } from 'react-chartjs-2';
import { ChartData, ChartOptions, Chart } from 'chart.js';
import { useEffect, useRef, useState } from 'react';

interface ChartWrapperProps {
  chartData: ChartData<'bar' | 'line'>;
  chartOptions: ChartOptions<'bar' | 'line'>;
  chartType: 'bar' | 'line';
  id?: string;
}

/**
 * A reusable chart wrapper component that properly handles Chart.js lifecycle
 * and cleanup to prevent "Canvas is already in use" errors.
 */
export const ChartWrapper = ({ 
  chartData, 
  chartOptions,
  chartType,
  id
}: ChartWrapperProps) => {
  // Create a unique ID for this chart instance if not provided
  const chartIdRef = useRef<string>(id || `chart-${Math.random().toString(36).slice(2, 11)}`);
  const chartInstanceRef = useRef<Chart<'bar' | 'line'> | null>(null);
  
  // Force re-render the chart when data changes
  const [key, setKey] = useState<number>(0);
  
  // Clean up chart instance when component unmounts or when chart type changes
  useEffect(() => {
    return () => {
      // Clean up chart instance when component unmounts
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartType]);
  
  // When chart data or options change, force a new canvas render
  useEffect(() => {
    // Ensure the previous chart is destroyed
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    
    // Force re-render with new key
    setKey(prevKey => prevKey + 1);
  }, [chartData, chartType, chartOptions]);
  
  const getChartRef = (instance: Chart<'bar' | 'line'> | null) => {
    if (instance) {
      chartInstanceRef.current = instance;
    }
  };

  return (
    <div className="h-full w-full">
      {chartType === 'bar' ? (
        <Bar 
          key={`bar-chart-${key}`}
          options={chartOptions as ChartOptions<'bar'>} 
          data={chartData as ChartData<'bar'>}
          id={`${chartIdRef.current}-bar`}
          ref={getChartRef}
        />
      ) : (
        <Line 
          key={`line-chart-${key}`}
          options={chartOptions as ChartOptions<'line'>} 
          data={chartData as ChartData<'line'>}
          id={`${chartIdRef.current}-line`}
          ref={getChartRef}
        />
      )}
    </div>
  );
}; 