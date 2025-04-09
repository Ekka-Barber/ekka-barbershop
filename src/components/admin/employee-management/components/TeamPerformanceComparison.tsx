import { useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths } from 'date-fns';
import { Users, ArrowUpDown, Download, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TeamPerformanceComparisonProps {
  employees: Employee[];
  selectedBranch: string | null;
}

type MetricType = 'sales' | 'appointments' | 'revenue';
type PeriodType = '1' | '3' | '6' | '12';

interface EmployeePerformance {
  id: string;
  name: string;
  photoUrl?: string;
  metrics: {
    sales: number;
    appointments: number;
    revenue: number;
  };
}

export const TeamPerformanceComparison = ({ 
  employees,
  selectedBranch
}: TeamPerformanceComparisonProps) => {
  const { toast } = useToast();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('sales');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('3');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter employees by selected branch
  const filteredEmployees = employees.filter(employee => 
    !selectedBranch || employee.branch_id === selectedBranch
  );

  // Fetch sales data for all employees in the branch
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['team-performance', selectedBranch, selectedPeriod],
    queryFn: async () => {
      // Calculate the start date based on selected period (in months)
      const startDate = format(subMonths(new Date(), parseInt(selectedPeriod)), 'yyyy-MM-01');
      
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .gte('month', startDate)
        .order('month');
      
      if (error) throw error;
      return data || [];
    },
    enabled: filteredEmployees.length > 0
  });

  // Fetch appointment data (mock for now but would connect to real data)
  const { data: appointmentData = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['team-appointments', selectedBranch, selectedPeriod],
    queryFn: async () => {
      // In a real implementation, this would fetch from an appointments table
      // For now, we'll generate mock data based on employees
      return filteredEmployees.map(employee => ({
        employee_id: employee.id,
        employee_name: employee.name,
        appointment_count: Math.floor(Math.random() * 100) + 20
      }));
    },
    enabled: filteredEmployees.length > 0
  });

  // Process performance data
  const performanceData = useMemo((): EmployeePerformance[] => {
    if (isLoadingSales || isLoadingAppointments || !filteredEmployees.length) {
      return [];
    }

    // Build performance metrics for each employee
    const employeeMetrics: Record<string, EmployeePerformance> = {};
    
    // Initialize with employee details
    filteredEmployees.forEach(employee => {
      employeeMetrics[employee.id] = {
        id: employee.id,
        name: employee.name,
        photoUrl: employee.photo_url,
        metrics: {
          sales: 0,
          appointments: 0,
          revenue: 0
        }
      };
    });
    
    // Add sales data
    salesData.forEach(record => {
      const employee = filteredEmployees.find(e => e.name === record.employee_name);
      if (employee && employeeMetrics[employee.id]) {
        employeeMetrics[employee.id].metrics.sales += record.sales_amount;
        // Estimate revenue (in a real system, this would be actual revenue)
        employeeMetrics[employee.id].metrics.revenue += record.sales_amount * 0.15;
      }
    });
    
    // Add appointment data
    appointmentData.forEach(record => {
      const employee = filteredEmployees.find(e => e.id === record.employee_id);
      if (employee && employeeMetrics[employee.id]) {
        employeeMetrics[employee.id].metrics.appointments += record.appointment_count;
      }
    });
    
    // Convert to array and sort by selected metric
    return Object.values(employeeMetrics);
  }, [filteredEmployees, salesData, appointmentData, isLoadingSales, isLoadingAppointments]);

  // Sort and filter the performance data
  const sortedPerformanceData = useMemo(() => {
    return [...performanceData].sort((a, b) => {
      const aValue = a.metrics[selectedMetric];
      const bValue = b.metrics[selectedMetric];
      
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });
  }, [performanceData, selectedMetric, sortDirection]);

  // Find top performer for the selected metric
  const topPerformer = useMemo(() => {
    if (!sortedPerformanceData.length) return null;
    
    return sortDirection === 'desc' 
      ? sortedPerformanceData[0] 
      : sortedPerformanceData[sortedPerformanceData.length - 1];
  }, [sortedPerformanceData, sortDirection]);

  // Calculate the highest value for the selected metric (for progress bars)
  const highestValue = useMemo(() => {
    if (!performanceData.length) return 0;
    
    return Math.max(...performanceData.map(p => p.metrics[selectedMetric]));
  }, [performanceData, selectedMetric]);

  // Prepare chart data
  const chartData = {
    labels: sortedPerformanceData.map(p => p.name),
    datasets: [
      {
        label: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`,
        data: sortedPerformanceData.map(p => p.metrics[selectedMetric]),
        backgroundColor: 'rgba(34, 139, 230, 0.5)',
        borderColor: 'rgba(34, 139, 230, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Team ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Comparison`
      },
    },
  };

  // Helper function to format metric values
  const formatMetricValue = (metric: MetricType, value: number) => {
    switch (metric) {
      case 'sales':
      case 'revenue':
        return `${value.toLocaleString()} SAR`;
      case 'appointments':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const handleExportData = () => {
    try {
      // Create CSV content
      const headers = ['Employee Name', 'Sales (SAR)', 'Appointments', 'Revenue (SAR)'];
      const rows = sortedPerformanceData.map(p => [
        p.name,
        p.metrics.sales.toString(),
        p.metrics.appointments.toString(),
        p.metrics.revenue.toFixed(2)
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `team_performance_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Team performance data has been exported as CSV",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the performance data",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingSales || isLoadingAppointments;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance Comparison
          </CardTitle>
          
          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedMetric}
              onValueChange={(value: MetricType) => setSelectedMetric(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedPeriod}
              onValueChange={(value: PeriodType) => setSelectedPeriod(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last Month</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={isLoading || !performanceData.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !filteredEmployees.length ? (
          <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No employees found for the selected branch</p>
          </div>
        ) : (
          <>
            {topPerformer && (
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center justify-center p-4 bg-primary/10 rounded-full">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-semibold">Top Performer: {topPerformer.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedMetric === 'sales' && 'Highest sales amount'}
                        {selectedMetric === 'appointments' && 'Most appointments handled'}
                        {selectedMetric === 'revenue' && 'Highest revenue generated'}
                      </p>
                    </div>
                    
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold">
                        {formatMetricValue(selectedMetric, topPerformer.metrics[selectedMetric])}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        in the last {selectedPeriod === '1' ? 'month' : `${selectedPeriod} months`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="h-[300px]">
              <Bar options={chartOptions} data={chartData} />
            </div>
            
            <Tabs defaultValue="table">
              <div className="overflow-x-auto pb-2">
                <TabsList className="mb-4 inline-flex">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="progress">Progress View</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPerformanceData.map(employee => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.metrics.sales.toLocaleString()} SAR</TableCell>
                        <TableCell>{employee.metrics.appointments}</TableCell>
                        <TableCell>{employee.metrics.revenue.toLocaleString()} SAR</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="progress">
                <div className="space-y-4">
                  {sortedPerformanceData.map(employee => (
                    <div key={employee.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">{employee.name}</div>
                        <div className="text-sm">{formatMetricValue(selectedMetric, employee.metrics[selectedMetric])}</div>
                      </div>
                      <Progress 
                        value={highestValue > 0 ? (employee.metrics[selectedMetric] / highestValue) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 