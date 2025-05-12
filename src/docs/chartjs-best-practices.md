# Chart.js Best Practices in React

## Common Issues and Solutions

### "Canvas is already in use" Error

One of the most common errors when using Chart.js with React is the following:

```
Error: Canvas is already in use. Chart with ID '[id]' must be destroyed before the canvas with ID '[id]' can be reused.
```

This error occurs when:

1. A Chart.js instance tries to reuse a canvas element that already has a chart rendered on it
2. The previous chart instance was not properly destroyed
3. The component is re-rendering without cleaning up previous chart instances

This is particularly common in React because of how components re-render, and it can happen in these scenarios:

- When switching between routes/tabs and returning to a chart component
- When a chart component re-renders due to prop changes
- When the parent component re-renders and remounts the chart component
- When using chart components in conditional rendering

## Proper Implementation Pattern

To avoid the "Canvas is already in use" error, follow these best practices:

### 1. Track Chart Instances with Refs

Always maintain a reference to the chart instance so you can destroy it when needed:

```jsx
import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js';
import { Bar } from 'react-chartjs-2';

const ChartComponent = ({ data }) => {
  const chartRef = useRef(null);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);
  
  return <Bar ref={(instance) => chartRef.current = instance} data={data} />;
};
```

### 2. Generate Unique IDs for Each Chart

Give each chart a unique ID to help Chart.js distinguish between different canvases:

```jsx
const chartId = useRef(`chart-${Math.random().toString(36).slice(2, 11)}`);

// Then in render:
<Bar id={chartId.current} ... />
```

### 3. Force Re-renders with Key Props

Use React keys to force a complete remount of the chart component when data changes:

```jsx
const [chartKey, setChartKey] = useState(0);

// When data changes:
useEffect(() => {
  setChartKey(prev => prev + 1);
}, [data]);

// In render:
<Bar key={`chart-${chartKey}`} ... />
```

### 4. Handle Component Updates

When props like data or options change, destroy the previous chart instance:

```jsx
useEffect(() => {
  if (chartRef.current) {
    chartRef.current.destroy();
    chartRef.current = null;
  }
  
  // Force re-render with new key
  setChartKey(prev => prev + 1);
}, [data, options]);
```

## Complete Example Implementation

Here's a complete example of a reusable, error-free Chart component:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, ChartData, ChartOptions } from 'chart.js';

interface ChartComponentProps {
  type: 'bar' | 'line';
  data: ChartData<'bar' | 'line'>;
  options: ChartOptions<'bar' | 'line'>;
}

export const ChartComponent = ({ type, data, options }: ChartComponentProps) => {
  // Create a unique ID for this chart instance
  const chartIdRef = useRef<string>(`chart-${Math.random().toString(36).slice(2, 11)}`);
  const chartInstanceRef = useRef<Chart<'bar' | 'line'> | null>(null);
  
  // Force re-render the chart when data changes
  const [key, setKey] = useState<number>(0);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);
  
  // When data changes, force a new canvas render
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    
    setKey(prevKey => prevKey + 1);
  }, [data, type]);
  
  const getChartRef = (instance: Chart<'bar' | 'line'> | null) => {
    if (instance) {
      chartInstanceRef.current = instance;
    }
  };

  return (
    <div className="chart-container">
      {type === 'bar' ? (
        <Bar 
          key={`bar-chart-${key}`}
          options={options as ChartOptions<'bar'>} 
          data={data as ChartData<'bar'>}
          id={`${chartIdRef.current}-bar`}
          ref={getChartRef}
        />
      ) : (
        <Line 
          key={`line-chart-${key}`}
          options={options as ChartOptions<'line'>} 
          data={data as ChartData<'line'>}
          id={`${chartIdRef.current}-line`}
          ref={getChartRef}
        />
      )}
    </div>
  );
};
```

## Testing Chart.js Components

When testing Chart.js components, consider:

1. Mocking Chart.js to avoid canvas rendering issues in Jest
2. Testing that chart instances are properly cleaned up when unmounting
3. Verifying that the component reacts correctly to prop changes

Example test setup:

```jsx
// Mock chart.js
jest.mock('chart.js', () => ({
  Chart: class MockChart {
    static register() {}
    destroy() {}
  },
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: ({ id, ref }) => {
    const mockChart = { id, destroy: jest.fn() };
    if (ref) ref(mockChart);
    return <canvas data-testid="bar-chart" id={id} />;
  },
}));

// Then test mounting/unmounting and prop changes
```

## Conclusion

By following these practices, you can avoid the "Canvas is already in use" error and ensure your Chart.js components work correctly in a React application, even when dealing with frequent re-renders, route changes, or complex UIs.

Remember that the key concepts are:
1. Maintaining refs to chart instances
2. Proper cleanup when unmounting or updating
3. Using keys to force re-renders when needed
4. Using unique IDs for chart canvases 