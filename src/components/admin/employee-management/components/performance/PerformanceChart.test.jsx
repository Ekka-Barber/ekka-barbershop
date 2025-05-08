/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { PerformanceChart } from './PerformanceChart';

// Mock chart.js and react-chartjs-2
jest.mock('chart.js', () => ({
  Chart: class MockChart {
    static register() {}
    destroy() {}
  },
}));

jest.mock('react-chartjs-2', () => ({
  Bar: ({ id, ref }) => {
    const mockChart = { id, destroy: jest.fn() };
    if (ref) ref(mockChart);
    return <canvas data-testid="bar-chart" id={id} />;
  },
  Line: ({ id, ref }) => {
    const mockChart = { id, destroy: jest.fn() };
    if (ref) ref(mockChart);
    return <canvas data-testid="line-chart" id={id} />;
  },
}));

let container = null;

beforeEach(() => {
  // Setup a DOM element as the test container
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // Cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

// Sample chart data and options
const chartData = {
  labels: ['Employee 1', 'Employee 2', 'Employee 3'],
  datasets: [
    {
      label: 'Performance',
      data: [75, 82, 68],
      backgroundColor: 'rgba(34, 139, 230, 0.5)',
      borderColor: 'rgba(34, 139, 230, 1)',
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Team Performance' },
  },
};

describe('PerformanceChart', () => {
  it('renders bar chart by default', () => {
    act(() => {
      render(
        <PerformanceChart 
          chartData={chartData} 
          chartOptions={chartOptions} 
        />, 
        container
      );
    });
    
    expect(container.querySelector('[data-testid="bar-chart"]')).not.toBeNull();
  });

  it('renders line chart when selectedChartType is line', () => {
    act(() => {
      render(
        <PerformanceChart 
          chartData={chartData} 
          chartOptions={chartOptions}
          selectedChartType="line"
        />, 
        container
      );
    });
    
    expect(container.querySelector('[data-testid="line-chart"]')).not.toBeNull();
  });

  it('switches chart type when selectedChartType changes', () => {
    // First render with bar chart
    act(() => {
      render(
        <PerformanceChart 
          chartData={chartData} 
          chartOptions={chartOptions}
        />, 
        container
      );
    });
    
    expect(container.querySelector('[data-testid="bar-chart"]')).not.toBeNull();
    
    // Then re-render with line chart
    act(() => {
      render(
        <PerformanceChart 
          chartData={chartData} 
          chartOptions={chartOptions}
          selectedChartType="line"
        />, 
        container
      );
    });
    
    expect(container.querySelector('[data-testid="line-chart"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="bar-chart"]')).toBeNull();
  });

  it('creates a new chart when data changes', () => {
    // First render
    act(() => {
      render(
        <PerformanceChart 
          chartData={chartData} 
          chartOptions={chartOptions}
        />, 
        container
      );
    });
    
    const initialChartId = container.querySelector('[data-testid="bar-chart"]').id;
    
    // Update with new data
    const newData = {
      ...chartData,
      datasets: [{
        ...chartData.datasets[0],
        data: [90, 85, 78] // Different data
      }]
    };
    
    act(() => {
      render(
        <PerformanceChart 
          chartData={newData} 
          chartOptions={chartOptions}
        />, 
        container
      );
    });
    
    const newChartId = container.querySelector('[data-testid="bar-chart"]').id;
    
    // The chart should be re-rendered with a new ID based on the key change
    expect(newChartId).not.toBe(initialChartId);
  });
}); 