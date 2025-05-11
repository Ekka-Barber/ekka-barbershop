import { useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, isAfter, parseISO } from 'date-fns';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SalesStatisticsProps {
  employee: Employee;
}

export const SalesStatistics = ({ employee }: SalesStatisticsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch sales data for the last 6 months
  const { data: salesData } = useQuery({
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
      setIsLoading(false);
      return data || [];
    }
  });

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Format number to display with thousands separator
  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  return (
    <div className="space-y-4 p-1">
      {/* Top Cards - Stacked on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current vs Previous Month Card */}
        <Card className="overflow-hidden bg-card hover:bg-card/80 transition-colors">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Current vs Previous Month</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xl sm:text-2xl font-bold">{formatNumber(statistics.currentMonth.amount)} SAR</p>
                <p className="text-xs text-muted-foreground mt-1">{statistics.currentMonth.month}</p>
              </div>
              
              <div className="flex items-center">
                {statistics.trend === 'up' && (
                  <div className="flex items-center justify-center bg-green-50 h-10 w-10 rounded-full">
                    <ArrowUp className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {statistics.trend === 'down' && (
                  <div className="flex items-center justify-center bg-red-50 h-10 w-10 rounded-full">
                    <ArrowDown className="h-5 w-5 text-red-500" />
                  </div>
                )}
                {statistics.trend === 'neutral' && (
                  <div className="flex items-center justify-center bg-gray-50 h-10 w-10 rounded-full">
                    <ArrowRight className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                statistics.trend === 'up' ? 'bg-green-100 text-green-700' : 
                statistics.trend === 'down' ? 'bg-red-100 text-red-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {Math.abs(Math.round(statistics.percentChange))}%
              </span>
              <p className="text-xs text-muted-foreground ml-2">
                from {formatNumber(statistics.previousMonth.amount)} SAR
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Average Monthly Sales Card */}
        <Card className="bg-card hover:bg-card/80 transition-colors">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Average Monthly Sales</h3>
            <p className="text-xl sm:text-2xl font-bold">{formatNumber(statistics.average)} SAR</p>
            <div className="mt-3">
              <div className="flex items-center">
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Highest</span>
                <p className="text-xs ml-2 text-muted-foreground">
                  {formatNumber(statistics.highest.amount)} SAR ({statistics.highest.month})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Progress Card */}
      <Card className="bg-card hover:bg-card/80 transition-colors">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Performance Relative to Highest Month</h3>
          
          {/* Current as percentage of highest */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium">Current Month</span>
              <span>{Math.round(statistics.highest.amount > 0 
                ? (statistics.currentMonth.amount / statistics.highest.amount) * 100 
                : 0)}%</span>
            </div>
            <Progress 
              value={statistics.highest.amount > 0 
                ? (statistics.currentMonth.amount / statistics.highest.amount) * 100 
                : 0} 
              className="h-3 rounded-full" 
            />
          </div>
          
          {/* Amounts */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-muted/40 p-2 rounded">
              <span className="text-xs text-muted-foreground">Current</span>
              <p className="text-sm font-semibold">{formatNumber(statistics.currentMonth.amount)} SAR</p>
            </div>
            <div className="bg-muted/40 p-2 rounded">
              <span className="text-xs text-muted-foreground">Highest</span>
              <p className="text-sm font-semibold">{formatNumber(statistics.highest.amount)} SAR</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
