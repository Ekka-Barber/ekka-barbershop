
import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            
            <PerformanceChart chartData={chartData} chartOptions={chartOptions} />
            
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
