import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from './SalaryUtils';

// Define component props
interface SalaryVisualizationsProps {
  salaryData: {
    id: string;
    name: string;
    baseSalary: number;
    commission: number;
    bonus: number;
    deductions: number;
    loans: number;
    total: number;
  }[];
  isLoading: boolean;
}

// Custom tooltip types for recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload?: {
      name: string;
    };
  }>;
}

export const SalaryVisualizations = ({ salaryData, isLoading }: SalaryVisualizationsProps) => {
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare data for top earners bar chart
  const topEarnersData = useMemo(() => {
    if (!salaryData.length) return [];
    
    // Get top 5 earners sorted by total salary
    return [...salaryData]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(item => ({
        name: item.name.split(' ')[0], // Use first name only for brevity
        salary: item.total
      }));
  }, [salaryData]);

  // Prepare data for salary composition (averages)
  const salaryComposition = useMemo(() => {
    if (!salaryData.length) return [];
    
    // Calculate total for each salary component
    const totals = salaryData.reduce(
      (acc, curr) => {
        acc.baseSalary += curr.baseSalary;
        acc.commission += curr.commission;
        acc.bonus += curr.bonus;
        acc.deductions += curr.deductions;
        acc.loans += curr.loans;
        return acc;
      },
      { baseSalary: 0, commission: 0, bonus: 0, deductions: 0, loans: 0 }
    );

    // Convert to array for pie chart
    return [
      { name: 'Base Salary', value: totals.baseSalary },
      { name: 'Commission', value: totals.commission },
      { name: 'Bonuses', value: totals.bonus },
      { name: 'Deductions', value: -totals.deductions },
      { name: 'Loans', value: -totals.loans }
    ].filter(item => item.value !== 0); // Filter out zero values
  }, [salaryData]);

  // Custom tooltip for the bar chart
  const CustomBarTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload?.name || ''}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Skip if still loading or no data
  if (isLoading || !salaryData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salary Visualizations</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            {isLoading ? 'Loading data...' : 'No salary data available for visualization'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render the visualizations
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Visualizations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Earners Bar Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Top Earners</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEarnersData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value).replace('SAR', '')}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="salary" fill="#8884d8" name="Total Salary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Composition Pie Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Overall Salary Composition</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salaryComposition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salaryComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
