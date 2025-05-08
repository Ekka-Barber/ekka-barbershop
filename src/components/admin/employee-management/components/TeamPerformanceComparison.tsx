import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { Users, BarChart2, LineChart } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Hooks
import { useTeamPerformanceData, MetricType, PeriodType } from '@/hooks/team-performance/useTeamPerformanceData';
import { useChartData } from '@/hooks/team-performance/useChartData';
import { usePerformanceExport } from '@/hooks/team-performance/usePerformanceExport';

// Components
import { TopPerformerCard } from '@/components/admin/employee-management/components/performance/TopPerformerCard';
import { PerformanceFilters } from '@/components/admin/employee-management/components/performance/PerformanceFilters';
import { PerformanceChart } from '@/components/admin/employee-management/components/performance/PerformanceChart';
import { PerformanceTable } from '@/components/admin/employee-management/components/performance/PerformanceTable';
import { ProgressView } from '@/components/admin/employee-management/components/performance/ProgressView';

interface TeamPerformanceComparisonProps {
  employees: Employee[];
  selectedBranch: string | null;
}

export const TeamPerformanceComparison = ({ 
  employees,
  selectedBranch
}: TeamPerformanceComparisonProps) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('sales');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('3');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'line'>('bar');
  // Add key state to force re-render of chart
  const [chartKey, setChartKey] = useState<number>(0);
  
  // Get team performance data
  const { 
    sortDirection, 
    setSortDirection,
    filteredEmployees,
    sortedPerformanceData,
    topPerformer,
    highestValue,
    isLoading
  } = useTeamPerformanceData({
    employees,
    selectedBranch,
    selectedMetric,
    selectedPeriod
  });

  // Get chart data
  const { chartData, chartOptions } = useChartData(sortedPerformanceData, selectedMetric);
  
  // Get export functionality
  const { handleExportData } = usePerformanceExport(sortedPerformanceData);

  // Force chart re-render when data changes
  useEffect(() => {
    setChartKey(prevKey => prevKey + 1);
  }, [chartData, selectedMetric, selectedPeriod, selectedChartType, sortedPerformanceData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance Comparison
          </CardTitle>
          
          <PerformanceFilters 
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            handleExportData={handleExportData}
            isLoading={isLoading}
            performanceDataLength={sortedPerformanceData.length}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!filteredEmployees.length ? (
          <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No employees found for the selected branch</p>
          </div>
        ) : (
          <>
            {topPerformer && (
              <TopPerformerCard 
                topPerformer={topPerformer} 
                selectedMetric={selectedMetric} 
                selectedPeriod={selectedPeriod} 
              />
            )}
            
            <div className="flex flex-col space-y-4">
              <div className="flex justify-end">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={selectedChartType === 'bar' ? 'default' : 'outline'}
                    onClick={() => setSelectedChartType('bar')}
                  >
                    <BarChart2 className="h-4 w-4 mr-1" />
                    Bar
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedChartType === 'line' ? 'default' : 'outline'}
                    onClick={() => setSelectedChartType('line')}
                  >
                    <LineChart className="h-4 w-4 mr-1" />
                    Line
                  </Button>
                </div>
              </div>
              
              <PerformanceChart 
                key={`performance-chart-${chartKey}`}
                chartData={chartData} 
                chartOptions={chartOptions}
                selectedChartType={selectedChartType}
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
                  selectedMetric={selectedMetric}
                  highestValue={highestValue}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};
