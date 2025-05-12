# Fix for Chart.js "Canvas is already in use" Error

## Problem Description

The application was experiencing the following error when navigating between tabs or when components re-rendered:

```
Error: Canvas is already in use. Chart with ID '1' must be destroyed before the canvas with ID '' can be reused.
```

This error occurs when a Chart.js instance attempts to reuse a canvas element that already has a chart rendered on it. In React applications, this typically happens when:

1. Components re-render or remount without properly cleaning up previous chart instances
2. Switching between tabs or routes that contain charts
3. Using charts in components that have conditional rendering

## Solution Implemented

We've implemented the following solutions to fix this issue:

### 1. Created a Reusable ChartWrapper Component

We created a `ChartWrapper` component that properly handles Chart.js lifecycle and cleanup:

```tsx
// src/components/admin/employee-management/components/performance/ChartWrapper.tsx
import { Bar, Line } from 'react-chartjs-2';
import { ChartData, ChartOptions, Chart } from 'chart.js';
import { useEffect, useRef, useState } from 'react';

interface ChartWrapperProps {
  chartData: ChartData<'bar' | 'line'>;
  chartOptions: ChartOptions<'bar' | 'line'>;
  chartType: 'bar' | 'line';
  id?: string;
}

export const ChartWrapper = ({ 
  chartData, 
  chartOptions,
  chartType,
  id
}: ChartWrapperProps) => {
  // Create a unique ID for this chart instance
  const chartIdRef = useRef<string>(id || `chart-${Math.random().toString(36).slice(2, 11)}`);
  const chartInstanceRef = useRef<Chart<'bar' | 'line'> | null>(null);
  
  // Force re-render when data changes
  const [key, setKey] = useState<number>(0);
  
  // Clean up chart instance when unmounting
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartType]);
  
  // Destroy and re-render when data changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    
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
```

### 2. Simplified the PerformanceChart Component

We refactored the `PerformanceChart` component to use the `ChartWrapper`:

```tsx
// src/components/admin/employee-management/components/performance/PerformanceChart.tsx
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
```

### 3. Updated Components Using Charts

We updated components that use charts to:

1. Use the `ChartWrapper` component instead of direct `Bar` or `Line` components
2. Add force-refresh keys that change when data changes
3. Remove manual chart cleanup code, since the `ChartWrapper` handles it

For example, in `TeamPerformanceComparison.tsx`, we:
- Added a key prop to the PerformanceChart component
- Implemented chart type switching
- Used an effect to force a chart re-render when data changes

### 4. Best Practices for Using Chart.js in React

For future chart implementations, follow these practices:

1. Always use the `ChartWrapper` component
2. Provide unique IDs for charts
3. When chart data changes, force a re-render by updating a key
4. Use one chart per canvas
5. Put each chart in its own component to encapsulate lifecycle management
6. Test chart components thoroughly, especially with route changes and data updates

## Related Files

The following files were updated as part of this fix:

1. `src/components/admin/employee-management/components/performance/ChartWrapper.tsx` (new)
2. `src/components/admin/employee-management/components/performance/PerformanceChart.tsx`
3. `src/components/admin/employee-management/components/TeamPerformanceComparison.tsx`
4. `src/components/admin/employee-management/EmployeeAnalyticsDashboard.tsx`
5. `src/docs/chartjs-error-fix.md` (new)

## Testing

After implementing these changes, charts render correctly and no longer produce the "Canvas is already in use" error when:

1. Switching between tabs
2. Re-rendering with new data
3. Changing chart types
4. Navigating away and back to chart components 