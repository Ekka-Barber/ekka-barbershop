import { useState, useMemo, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ChartWrapper } from './components/performance/ChartWrapper';

// Import team performance components and hooks
import { useTeamPerformanceData, MetricType, PeriodType } from '@/hooks/team-performance/useTeamPerformanceData';
import { useChartData } from '@/hooks/team-performance/useChartData';
import { usePerformanceExport } from '@/hooks/team-performance/usePerformanceExport';
import { TopPerformerCard } from './components/performance/TopPerformerCard';
import { PerformanceFilters } from './components/performance/PerformanceFilters';
import { PerformanceChart } from './components/performance/PerformanceChart';
import { PerformanceTable } from './components/performance/PerformanceTable';
import { ProgressView } from './components/performance/ProgressView';

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

  // Use a force-refresh key when needed
  const [forceRefreshKey, setForceRefreshKey] = useState<number>(0);
  
  // Team performance states
  const [teamMetric, setTeamMetric] = useState<MetricType>('sales');
  const [teamPeriod, setTeamPeriod] = useState<PeriodType>('3');
  const [teamChartType, setTeamChartType] = useState<'bar' | 'line'>('bar');
  const [teamChartKey, setTeamChartKey] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<'individual' | 'team'>('individual');
  const [showIndividualFilters, setShowIndividualFilters] = useState(true);
  
  // Get team performance data
  const { 
    sortDirection, 
    setSortDirection,
    filteredEmployees: teamFilteredEmployees,
    sortedPerformanceData,
    topPerformer,
    highestValue,
    isLoading: isTeamDataLoading
  } = useTeamPerformanceData({
    employees,
    selectedBranch,
    selectedMetric: teamMetric,
    selectedPeriod: teamPeriod
  });

  // Get team chart data
  const { chartData: teamChartData, chartOptions: teamChartOptions } = useChartData(
    sortedPerformanceData, 
    teamMetric
  );
  
  // Get export functionality for team data
  const { handleExportData: handleTeamExportData } = usePerformanceExport(
    sortedPerformanceData
  );

  // Force re-render with new key when team data changes
  useEffect(() => {
    setTeamChartKey(prevKey => prevKey + 1);
  }, [teamChartData, teamMetric, teamPeriod, teamChartType, sortedPerformanceData]);

  // Individual analytics updates
  useEffect(() => {
    setForceRefreshKey(prevKey => prevKey + 1);
  }, [selectedMetric, selectedPeriod, selectedChartType]);

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
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: selectedMetric === 'sales' 
          ? 'Monthly Sales Performance' 
          : 'Monthly Average Performance',
        font: {
          size: window.innerWidth < 640 ? 14 : 16
        }
      },
      tooltip: {
        titleFont: {
          size: window.innerWidth < 640 ? 12 : 14
        },
        bodyFont: {
          size: window.innerWidth < 640 ? 11 : 13
        },
        boxPadding: 6
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (SAR)',
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 9 : 11
          },
          maxRotation: 0
        }
      },
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 9 : 11
          },
          maxRotation: window.innerWidth < 640 ? 45 : 0
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
    <div className="space-y-8">
      {/* Section tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as 'individual' | 'team')}>
            <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
              <TabsTrigger 
                value="individual" 
                className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-sm font-medium flex items-center justify-center gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                <span>Individual Performance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Team Performance</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual" className="space-y-6">
              {/* Individual analytics content */}
              
              {/* Toggle Filters Button */}
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  onClick={() => setShowIndividualFilters(!showIndividualFilters)}
                  size="sm"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showIndividualFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>

              {/* Collapsible Filter Section */}
              {showIndividualFilters && (
                <Card className="mb-2 p-4 border">
                  <div className="space-y-4">
                    {/* Row 1: Employee, Time Period, Metric, Chart Type */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-end">
                      <div className="w-full sm:flex-1 min-w-[180px]">
                        <label htmlFor="individualEmployeeSelect" className="text-sm font-medium mb-1.5 block">Employee</label>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                          <SelectTrigger id="individualEmployeeSelect">
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
                      
                      <div className="w-full sm:flex-1 min-w-[180px]">
                        <label htmlFor="individualPeriodSelect" className="text-sm font-medium mb-1.5 block">Time Period</label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger id="individualPeriodSelect">
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">Last 3 Months</SelectItem>
                            <SelectItem value="6">Last 6 Months</SelectItem>
                            <SelectItem value="12">Last 12 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-full sm:flex-1 min-w-[180px]">
                        <label htmlFor="individualMetricSelect" className="text-sm font-medium mb-1.5 block">Metric</label>
                        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                          <SelectTrigger id="individualMetricSelect">
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Total Sales</SelectItem>
                            <SelectItem value="average">Average Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-full sm:flex-1 min-w-[180px]">
                        <label htmlFor="individualChartTypeSelect" className="text-sm font-medium mb-1.5 block">Chart Type</label>
                        <Select value={selectedChartType} onValueChange={(value: 'bar' | 'line') => setSelectedChartType(value)}>
                          <SelectTrigger id="individualChartTypeSelect">
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
                    </div>

                    {/* Row 2: Search Filter and Export Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                      <div className="flex-grow w-full sm:w-auto">
                        <label htmlFor="individualSearchEmployee" className="text-sm font-medium mb-1.5 block">Search Employee</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="individualSearchEmployee"
                            placeholder="Filter by employee name..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-auto sm:mt-auto">
                        <Button onClick={exportToCSV} className="w-full" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Summary Cards */}
              <div className="flex overflow-x-auto space-x-4 pb-4 pt-1">
                <Card className="min-w-[280px] flex-shrink-0">
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
                
                <Card className="min-w-[280px] flex-shrink-0">
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
                
                <Card className="min-w-[280px] flex-shrink-0">
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
                
                <Card className="min-w-[280px] flex-shrink-0">
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
                    <div className="h-60 sm:h-80">
                      <ChartWrapper
                        chartData={chartData}
                        chartOptions={chartOptions}
                        chartType={selectedChartType}
                        id={`analytics-${selectedMetric}-${selectedChartType}-${forceRefreshKey}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Month-over-Month Growth Chart */}
              {growthChartData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Month-over-Month Growth Rate (%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 sm:h-64">
                      <ChartWrapper
                        chartData={growthChartData}
                        chartOptions={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              display: true,
                              text: 'Monthly Growth Rate',
                              font: {
                                size: window.innerWidth < 640 ? 14 : 16
                              }
                            }
                          }
                        }}
                        chartType="bar"
                        id={`growth-chart-${forceRefreshKey}`}
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
            </TabsContent>
            
            <TabsContent value="team" className="space-y-6">
              {/* Team Performance Content */}
              {isTeamDataLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Performance Comparison
                    </h3>
                    
                    <PerformanceFilters 
                      selectedMetric={teamMetric}
                      setSelectedMetric={setTeamMetric}
                      selectedPeriod={teamPeriod}
                      setSelectedPeriod={setTeamPeriod}
                      sortDirection={sortDirection}
                      setSortDirection={setSortDirection}
                      handleExportData={handleTeamExportData}
                      isLoading={isTeamDataLoading}
                      performanceDataLength={sortedPerformanceData.length}
                    />
                  </div>
                  
                  {!teamFilteredEmployees.length ? (
                    <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">No employees found for the selected branch</p>
                    </div>
                  ) : (
                    <>
                      {topPerformer && (
                        <TopPerformerCard 
                          topPerformer={topPerformer} 
                          selectedMetric={teamMetric} 
                          selectedPeriod={teamPeriod} 
                        />
                      )}
                      
                      <div className="flex flex-col space-y-4">
                        <div className="flex justify-end">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant={teamChartType === 'bar' ? 'default' : 'outline'}
                              onClick={() => setTeamChartType('bar')}
                            >
                              <BarChart2 className="h-4 w-4 mr-1" />
                              Bar
                            </Button>
                            <Button
                              size="sm"
                              variant={teamChartType === 'line' ? 'default' : 'outline'}
                              onClick={() => setTeamChartType('line')}
                            >
                              <LineChart className="h-4 w-4 mr-1" />
                              Line
                            </Button>
                          </div>
                        </div>
                        
                        <PerformanceChart 
                          key={`team-performance-chart-${teamChartKey}`}
                          chartData={teamChartData} 
                          chartOptions={teamChartOptions}
                          selectedChartType={teamChartType}
                        />
                      </div>
                      
                      <Tabs defaultValue="table">
                        <div className="overflow-x-auto pb-2">
                          <TabsList className="mb-4 inline-flex">
                            <TabsTrigger value="table">Table View</TabsTrigger>
                            <TabsTrigger value="progress">Progress View</TabsTrigger>
                          </TabsList>
                        </div>
                        
                        <TabsContent value="table">
                          <PerformanceTable sortedPerformanceData={sortedPerformanceData} />
                        </TabsContent>
                        
                        <TabsContent value="progress">
                          <ProgressView 
                            sortedPerformanceData={sortedPerformanceData} 
                            selectedMetric={teamMetric}
                            highestValue={highestValue}
                          />
                        </TabsContent>
                      </Tabs>
                    </>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 
