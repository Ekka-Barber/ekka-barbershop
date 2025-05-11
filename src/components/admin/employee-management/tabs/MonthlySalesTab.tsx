import React, { useEffect, useState, useCallback } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MonthYearPicker } from '../components/monthly-sales/MonthYearPicker';
import { useEmployeeSales } from '../hooks/useEmployeeSales';
import { useEmployeeManager } from '../hooks/useEmployeeManager';
import { useBranchManager } from '../hooks/useBranchManager';
import { SalesGrid } from '../components/monthly-sales/SalesGrid';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Save, Loader2, TrendingUp, User, DollarSign, AlertTriangle } from 'lucide-react';
import { useUrlState } from '../hooks/useUrlState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MonthlySalesTabProps {
  initialDate?: Date;
  initialBranchId?: string | null;
}

export const MonthlySalesTab: React.FC<MonthlySalesTabProps> = ({
  initialDate = new Date(),
  initialBranchId = null
}) => {
  const { toast } = useToast();
  const { currentState, syncUrlWithState } = useUrlState();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => 
    initialDate || new Date(currentState.date)
  );
  
  const { 
    selectedBranch, 
    isLoading: isBranchLoading
  } = useBranchManager(initialBranchId);
  
  const { 
    employees, 
    isLoading: isEmployeeLoading
  } = useEmployeeManager(selectedBranch);
  
  const {
    salesInputs,
    lastUpdated,
    isSubmitting,
    isLoading: isSalesLoading,
    error: salesError,
    salesAnalytics,
    handleSalesChange,
    submitSalesData,
    hasUnsavedChanges,
    fetchSalesData
  } = useEmployeeSales(selectedDate, employees);
  
  // Keep URL in sync with component state
  useEffect(() => {
    if (
      selectedBranch !== currentState.branch ||
      selectedDate.toISOString().slice(0, 7) !== currentState.date
    ) {
      syncUrlWithState(
        'monthly-sales', // Use the new tab name
        selectedBranch,
        selectedDate,
        1 // Default page
      );
    }
  }, [selectedBranch, selectedDate, syncUrlWithState, currentState]);
  
  // Set up real-time subscription for employee sales data
  useEffect(() => {
    const formattedMonth = format(selectedDate, 'yyyy-MM');
    
    // Set up subscription for employee_sales table
    const salesChannel = supabase
      .channel(`monthly_sales_${formattedMonth}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_sales',
          filter: `month=eq.${formattedMonth}`
        },
        (payload) => {
          console.log('Real-time sales update:', payload);
          
          // Invalidate queries related to sales data for this month
          queryClient.invalidateQueries({
            queryKey: ['employee-sales', formattedMonth, selectedBranch]
          });
          
          // Refresh the sales data
          fetchSalesData();
          
          toast({
            title: "Sales Data Updated",
            description: `Sales data for ${format(selectedDate, 'MMMM yyyy')} has been updated`,
            duration: 3000,
          });
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts or when month/branch changes
    return () => {
      console.log(`Removing subscription for sales in ${formattedMonth}`);
      supabase.removeChannel(salesChannel);
    };
  }, [selectedDate, selectedBranch, queryClient, toast, fetchSalesData]);
  
  // Force re-fetch sales data when branch changes
  useEffect(() => {
    // This will trigger a refresh of the sales data specifically for the selected branch
    fetchSalesData();
  }, [selectedBranch, fetchSalesData]);
  
  // Handle date change
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);
  
  // Handle submit
  const handleSubmit = async () => {
    try {
      await submitSalesData();
      toast({
        title: "Success",
        description: "Employee sales data saved successfully",
      });
    } catch (error) {
      console.error('Error submitting sales data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save sales data",
        variant: "destructive",
      });
    }
  };
  
  // Check if we should show save button prompt
  const shouldPromptToSave = hasUnsavedChanges();
  
  const isLoading = isBranchLoading || isEmployeeLoading || isSalesLoading;
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Title and Description Block */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Monthly Sales</h2>
            <p className="text-muted-foreground">
              Track and manage employee sales for each month
            </p>
          </div>
        </div>
        
        {/* Analytics Cards */}
        <div className="flex overflow-x-auto space-x-4 pb-4 pt-1">
          {/* Total Sales Card */}
          <Card className="min-w-[280px] flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sales
              </CardTitle>
              <CardDescription>
                All sales for {format(selectedDate, 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                <div className="text-2xl font-bold">
                  {salesAnalytics.totalSales.toLocaleString()}
                </div>
                
                {salesAnalytics.previousMonthComparison !== null && (
                  <div 
                    className={cn(
                      "ml-2 text-xs flex items-center",
                      salesAnalytics.previousMonthComparison > 0 
                        ? "text-green-500" 
                        : "text-red-500"
                    )}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {salesAnalytics.previousMonthComparison > 0 ? '+' : ''}
                    {salesAnalytics.previousMonthComparison.toFixed(1)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Average Sales Card */}
          <Card className="min-w-[280px] flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average per Employee
              </CardTitle>
              <CardDescription>
                Average sales amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salesAnalytics.averageSales ? salesAnalytics.averageSales.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }) : '0'}
              </div>
            </CardContent>
          </Card>
          
          {/* Top Performer Card */}
          <Card className="min-w-[280px] flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Top Performer
              </CardTitle>
              <CardDescription>
                Highest sales this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesAnalytics.topPerformer ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <div className="font-medium">{salesAnalytics.topPerformer.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {salesAnalytics.topPerformer.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Error Display */}
        {salesError && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>{salesError.message}</span>
          </div>
        )}
        
        {/* Unsaved changes warning */}
        {shouldPromptToSave && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  You have unsaved changes. Don't forget to save your data.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Sales Header with Date Picker */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <MonthYearPicker
              selectedDate={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="flex items-center text-sm text-muted-foreground mr-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Last updated: {lastUpdated}</span>
              </div>
            )}
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isLoading}
              variant={shouldPromptToSave ? "default" : "outline"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Sales Data
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Sales Grid Component */}
        <ErrorBoundary>
          <SalesGrid
            employees={employees}
            salesInputs={salesInputs}
            onSalesChange={handleSalesChange}
            selectedDate={selectedDate}
            isLoading={isLoading}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default MonthlySalesTab; 