import { useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format, subMonths, parseISO, isAfter, subYears } from 'date-fns';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Filter, BarChart2, LineChart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface EmployeeAnalyticsDashboardProps {
  employees: Employee[];
  selectedBranch: string | null;
}

export const EmployeeAnalyticsDashboard = ({ 
  employees,
  selectedBranch
}: EmployeeAnalyticsDashboardProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6');
  const [selectedMetric, setSelectedMetric] = useState<string>('sales');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'line'>('bar');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch sales data for all employees or a specific employee
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['employee-sales-analytics', selectedBranch, selectedEmployee, selectedPeriod],
    queryFn: async () => {
      // Calculate the start date based on selected period (in months)
      const startDate = format(subMonths(new Date(), parseInt(selectedPeriod)), 'yyyy-MM-01');
      
      let query = supabase
        .from('employee_sales')
        .select('*')
        .gte('month', startDate)
        .order('month');
      
      if (selectedEmployee !== 'all') {
        // Filter by specific employee if selected
        const employee = employees.find(e => e.id === selectedEmployee);
        if (employee) {
          query = query.eq('employee_name', employee.name);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: employees.length > 0
  });

  // Fetch last year's data for comparison
  const { data: lastYearData = [] } = useQuery({
    queryKey: ['employee-sales-last-year', selectedBranch, selectedEmployee],
    queryFn: async () => {
      // Get date range for last year (same months as current query)
      const endDate = format(subMonths(new Date(), 0), 'yyyy-MM-01');
      const startDate = format(subMonths(new Date(), parseInt(selectedPeriod)), 'yyyy-MM-01');
      const lastYearStartDate = format(subYears(parseISO(startDate), 1), 'yyyy-MM-01');
      const lastYearEndDate = format(subYears(parseISO(endDate), 1), 'yyyy-MM-01');
      
      let query = supabase
        .from('employee_sales')
        .select('*')
        .gte('month', lastYearStartDate)
        .lte('month', lastYearEndDate)
        .order('month');
      
      if (selectedEmployee !== 'all') {
        // Filter by specific employee if selected
        const employee = employees.find(e => e.id === selectedEmployee);
        if (employee) {
          query = query.eq('employee_name', employee.name);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: employees.length > 0 && selectedPeriod !== '1' // Only fetch if looking at more than 1 month
  });

  // Filter employees by search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    
    const query = searchQuery.toLowerCase();
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(query) || 
      (employee.name_ar && employee.name_ar.toLowerCase().includes(query))
    );
  }, [employees, searchQuery]);

  // Process sales data for charts and analytics
  const processedData = useMemo(() => {
    if (!salesData.length) return null;
    
    // Group data by month
    const monthlyData: Record<string, { total: number; count: number }> = {};
    const employeeMonthlyData: Record<string, Record<string, number>> = {};
    
    salesData.forEach(record => {
      const month = format(parseISO(record.month), 'MMM yyyy');
      
      // Initialize month if not present
      if (!monthlyData[month]) {
        monthlyData[month] = { 
          total: 0, 
          count: 0 
        };
      }
      
      // Initialize employee-month if not present
      if (!employeeMonthlyData[record.employee_name]) {
        employeeMonthlyData[record.employee_name] = {};
      }
      
      if (!employeeMonthlyData[record.employee_name][month]) {
        employeeMonthlyData[record.employee_name][month] = 0;
      }
      
      // Update totals
      monthlyData[month].total += record.sales_amount;
      monthlyData[month].count += 1;
      employeeMonthlyData[record.employee_name][month] = record.sales_amount;
    });
    
    // Calculate year-over-year comparison if data available
    let yearOverYearChange = null;
    if (lastYearData.length > 0) {
      const currentYearTotal = salesData.reduce((sum, record) => sum + record.sales_amount, 0);
      const lastYearTotal = lastYearData.reduce((sum, record) => sum + record.sales_amount, 0);
      
      if (lastYearTotal > 0) {
        yearOverYearChange = ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100;
      }
    }
    
    // Month-over-month comparison
    let monthOverMonthChange = null;
    const sortedRecords = [...salesData].sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
    
    if (sortedRecords.length >= 2) {
      // Group by month
      const monthTotals: Record<string, number> = {};
      
      sortedRecords.forEach(record => {
        const monthKey = format(parseISO(record.month), 'yyyy-MM');
        if (!monthTotals[monthKey]) {
          monthTotals[monthKey] = 0;
        }
        monthTotals[monthKey] += record.sales_amount;
      });
      
      const monthKeys = Object.keys(monthTotals).sort();
      if (monthKeys.length >= 2) {
        const currentMonth = monthTotals[monthKeys[monthKeys.length - 1]];
        const previousMonth = monthTotals[monthKeys[monthKeys.length - 2]];
        
        if (previousMonth > 0) {
          monthOverMonthChange = ((currentMonth - previousMonth) / previousMonth) * 100;
        }
      }
    }
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => 
      isAfter(new Date(a), new Date(b)) ? 1 : -1
    );
    
    // Calculate top performers
    const employeeTotals: Record<string, number> = {};
    Object.keys(employeeMonthlyData).forEach(employeeName => {
      employeeTotals[employeeName] = Object.values(employeeMonthlyData[employeeName])
        .reduce((sum, amount) => sum + (amount || 0), 0);
    });
    
    const topPerformers = Object.entries(employeeTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    // Calculate month-over-month growth trend
    const monthlyGrowth: {month: string; growth: number}[] = [];
    
    if (sortedMonths.length >= 2) {
      for (let i = 1; i < sortedMonths.length; i++) {
        const currentMonth = sortedMonths[i];
        const previousMonth = sortedMonths[i - 1];
        
        const currentTotal = monthlyData[currentMonth].total;
        const previousTotal = monthlyData[previousMonth].total;
        
        let growthRate = 0;
        if (previousTotal > 0) {
          growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;
        }
        
        monthlyGrowth.push({
          month: currentMonth,
          growth: growthRate
        });
      }
    }
    
    return {
      months: sortedMonths,
      monthlyData,
      employeeMonthlyData,
      yearOverYearChange,
      monthOverMonthChange,
      topPerformers,
      monthlyGrowth
    };
  }, [salesData, lastYearData]);

  // Configure chart options
  const chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedMetric === 'sales' 
          ? 'Monthly Sales Performance' 
          : 'Monthly Average Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (SAR)'
        }
      }
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!processedData) return null;
    
    if (selectedEmployee === 'all') {
      // Show all employees or average
      if (selectedMetric === 'sales') {
        // Total sales by month
        return {
          labels: processedData.months,
          datasets: [{
            label: 'Total Sales',
            data: processedData.months.map(month => processedData.monthlyData[month].total),
            backgroundColor: 'rgba(75, 192, 192, 0.4)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          }]
        };
      } else {
        // Average sales by month
        return {
          labels: processedData.months,
          datasets: [{
            label: 'Average Sales',
            data: processedData.months.map(month => 
              processedData.monthlyData[month].count > 0 
              ? processedData.monthlyData[month].total / processedData.monthlyData[month].count 
              : 0
            ),
            backgroundColor: 'rgba(153, 102, 255, 0.4)',
            borderColor: 'rgb(153, 102, 255)',
            borderWidth: 1
          }]
        };
      }
    } else {
      // Show specific employee
      const employee = employees.find(e => e.id === selectedEmployee);
      if (!employee) return null;
      
      return {
        labels: processedData.months,
        datasets: [{
          label: `${employee.name}'s Sales`,
          data: processedData.months.map(month => 
            (processedData.employeeMonthlyData[employee.name]?.[month] || 0)
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      };
    }
  }, [processedData, selectedEmployee, selectedMetric, employees]);

  // Prepare growth chart data
  const growthChartData = useMemo(() => {
    if (!processedData || !processedData.monthlyGrowth || processedData.monthlyGrowth.length === 0) {
      return null;
    }
    
    return {
      labels: processedData.monthlyGrowth.map(item => item.month),
      datasets: [{
        label: 'Month-over-Month Growth (%)',
        data: processedData.monthlyGrowth.map(item => item.growth),
        backgroundColor: processedData.monthlyGrowth.map(item => 
          item.growth >= 0 ? 'rgba(75, 192, 75, 0.4)' : 'rgba(255, 99, 132, 0.4)'
        ),
        borderColor: processedData.monthlyGrowth.map(item => 
          item.growth >= 0 ? 'rgb(75, 192, 75)' : 'rgb(255, 99, 132)'
        ),
        borderWidth: 1
      }]
    };
  }, [processedData]);

  // Generate CSV export
  const exportToCSV = () => {
    if (!salesData.length) return;
    
    const headers = ['Employee Name', 'Month', 'Sales Amount'];
    const csvData = salesData.map(record => [
      record.employee_name,
      record.month,
      record.sales_amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employee_sales_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-1/4">
          <label className="text-sm font-medium mb-1.5 block">Employee</label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {filteredEmployees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/6">
          <label className="text-sm font-medium mb-1.5 block">Time Period</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/6">
          <label className="text-sm font-medium mb-1.5 block">Metric</label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Total Sales</SelectItem>
              <SelectItem value="average">Average Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/6">
          <label className="text-sm font-medium mb-1.5 block">Chart Type</label>
          <Select value={selectedChartType} onValueChange={(value: 'bar' | 'line') => setSelectedChartType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Bar Chart</span>
              </SelectItem>
              <SelectItem value="line" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span>Line Chart</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto mt-auto">
          <Button onClick={exportToCSV} className="w-full sm:w-auto" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Search Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search employees..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">
                {salesData.reduce((sum, record) => sum + record.sales_amount, 0).toLocaleString()} SAR
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground opacity-70" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Month-over-Month</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold">
                  {processedData?.monthOverMonthChange !== null 
                    ? `${Math.abs(processedData.monthOverMonthChange).toFixed(1)}%` 
                    : 'N/A'}
                </p>
                {processedData?.monthOverMonthChange !== null && (
                  processedData.monthOverMonthChange > 0 
                    ? <TrendingUp className="h-5 w-5 text-green-500" /> 
                    : <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            {processedData?.monthOverMonthChange !== null && (
              <div className={`${
                processedData.monthOverMonthChange > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              } px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                {processedData.monthOverMonthChange > 0 ? 'Increase' : 'Decrease'}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Year-over-Year</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold">
                  {processedData?.yearOverYearChange !== null 
                    ? `${Math.abs(processedData.yearOverYearChange).toFixed(1)}%` 
                    : 'N/A'}
                </p>
                {processedData?.yearOverYearChange !== null && (
                  processedData.yearOverYearChange > 0 
                    ? <TrendingUp className="h-5 w-5 text-green-500" /> 
                    : <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            {processedData?.yearOverYearChange !== null && (
              <div className={`${
                processedData.yearOverYearChange > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              } px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                {processedData.yearOverYearChange > 0 ? 'Increase' : 'Decrease'}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Active Employees</p>
              <p className="text-2xl font-bold">
                {new Set(salesData.map(record => record.employee_name)).size}
              </p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground opacity-70" />
          </CardContent>
        </Card>
      </div>
      
      {/* Sales Chart */}
      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedMetric === 'sales' ? 'Sales Performance' : 'Average Performance'}
              {selectedEmployee !== 'all' && ` - ${employees.find(e => e.id === selectedEmployee)?.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {selectedChartType === 'bar' ? (
                <Bar options={chartOptions} data={chartData} />
              ) : (
                <Line 
                  options={chartOptions} 
                  data={{
                    ...chartData,
                    datasets: chartData.datasets.map(dataset => ({
                      ...dataset,
                      tension: 0.3, // Add curve to the line
                      fill: true,  // Fill area under the line
                    }))
                  }} 
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Month-over-Month Growth Chart */}
      {growthChartData && growthChartData.labels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Month-over-Month Growth Rate (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: 'Monthly Growth Rate'
                    }
                  }
                }} 
                data={growthChartData} 
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Top Performers */}
      {processedData?.topPerformers && processedData.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedData.topPerformers.map(([name, total], index) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="font-bold w-6 text-center">{index + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{name}</div>
                    <div className="h-2 bg-muted rounded-full mt-1">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ 
                          width: `${Math.min(100, Number(total) / Number(processedData.topPerformers[0][1]) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{Number(total).toLocaleString()} SAR</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
