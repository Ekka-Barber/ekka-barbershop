import { useMemo, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, isAfter, parseISO } from 'date-fns';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SalesStatisticsProps {
  employee: Employee;
}

export const SalesStatistics = ({ employee }: SalesStatisticsProps) => {
  const queryClient = useQueryClient();

  // Fetch sales data for the last 6 months
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['employee-sales-history', employee.id],
    queryFn: async () => {
      // Get date 6 months ago
      const sixMonthsAgo = subMonths(new Date(), 6);
      const formattedDate = format(sixMonthsAgo, 'yyyy-MM-01');
      
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('employee_name', employee.name)
        .gte('month', formattedDate)
        .order('month');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000 // Keep data in cache for 10 minutes
  });

  // Set up real-time subscription
  useEffect(() => {
    const sixMonthsAgo = subMonths(new Date(), 6);
    const formattedDate = format(sixMonthsAgo, 'yyyy-MM-01');

    const subscription = supabase
      .channel('employee-sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_sales',
          filter: `employee_name=eq.${employee.name} AND month>=${formattedDate}`
        },
        () => {
          // Invalidate and refetch when any change occurs
          queryClient.invalidateQueries({ queryKey: ['employee-sales-history', employee.id] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [employee.name, employee.id, queryClient]);

  // Calculate statistics from sales data
  const statistics = useMemo(() => {
    if (!salesData || salesData.length === 0) {
      return {
        currentMonth: { amount: 0, month: format(new Date(), 'MMM yyyy') },
        previousMonth: { amount: 0, month: format(subMonths(new Date(), 1), 'MMM yyyy') },
        percentChange: 0,
        trend: 'neutral',
        average: 0,
        highest: { amount: 0, month: '' },
        mostRecent: { amount: 0, month: '' }
      };
    }

    // Sort by date to ensure correct order
    const sortedData = [...salesData].sort((a, b) => 
      isAfter(parseISO(a.month), parseISO(b.month)) ? 1 : -1
    );
    
    // Get current month and previous month data
    const mostRecent = sortedData[sortedData.length - 1];
    const previousMonthData = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;
    
    const currentMonthAmount = mostRecent?.sales_amount || 0;
    const previousMonthAmount = previousMonthData?.sales_amount || 0;
    
    // Calculate percent change
    const percentChange = previousMonthAmount === 0 
      ? 100 // If previous month is 0, assume 100% increase
      : ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100;
    
    // Determine trend
    const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
    
    // Calculate average
    const totalSales = sortedData.reduce((sum, record) => sum + record.sales_amount, 0);
    const averageSales = sortedData.length > 0 ? totalSales / sortedData.length : 0;
    
    // Find highest month
    const highest = sortedData.reduce((max, record) => 
      record.sales_amount > max.amount 
        ? { amount: record.sales_amount, month: format(parseISO(record.month), 'MMM yyyy') }
        : max, 
      { amount: 0, month: '' }
    );

    return {
      currentMonth: { 
        amount: currentMonthAmount, 
        month: mostRecent ? format(parseISO(mostRecent.month), 'MMM yyyy') : format(new Date(), 'MMM yyyy')
      },
      previousMonth: { 
        amount: previousMonthAmount, 
        month: previousMonthData ? format(parseISO(previousMonthData.month), 'MMM yyyy') : format(subMonths(new Date(), 1), 'MMM yyyy')
      },
      percentChange,
      trend,
      average: averageSales,
      highest,
      mostRecent: { 
        amount: currentMonthAmount, 
        month: mostRecent ? format(parseISO(mostRecent.month), 'MMM yyyy') : format(new Date(), 'MMM yyyy')
      }
    };
  }, [salesData]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-1">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Current vs Previous Month</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold">{statistics.currentMonth.amount.toLocaleString()} SAR</p>
                <p className="text-xs text-muted-foreground">{statistics.currentMonth.month}</p>
              </div>
              
              <div className="flex items-center">
                {statistics.trend === 'up' && (
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                )}
                {statistics.trend === 'down' && (
                  <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                {statistics.trend === 'neutral' && (
                  <ArrowRight className="h-4 w-4 text-gray-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  statistics.trend === 'up' ? 'text-green-500' : 
                  statistics.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {Math.abs(Math.round(statistics.percentChange))}%
                </span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Previous: {statistics.previousMonth.amount.toLocaleString()} SAR ({statistics.previousMonth.month})</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Monthly Sales</h3>
            <p className="text-2xl font-bold">{Math.round(statistics.average).toLocaleString()} SAR</p>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Highest: {statistics.highest.amount.toLocaleString()} SAR ({statistics.highest.month})</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Performance Relative to Highest Month</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Current: {statistics.currentMonth.amount.toLocaleString()} SAR</span>
              <span>Highest: {statistics.highest.amount.toLocaleString()} SAR</span>
            </div>
            <Progress 
              value={statistics.highest.amount > 0 
                ? (statistics.currentMonth.amount / statistics.highest.amount) * 100 
                : 0} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 