import React, { useEffect, useState, useCallback } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MonthYearPicker } from '../components/monthly-sales/MonthYearPicker';
import { useEmployeeSales } from '../hooks/useEmployeeSales';
import { useEmployeeManager } from '../hooks/useEmployeeManager';
import { useBranchManager } from '../hooks/useBranchManager';
import { BranchFilter } from '../components/BranchFilter';
import { SalesGrid } from '../components/monthly-sales/SalesGrid';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Save, Loader2 } from 'lucide-react';
import { useUrlState } from '../hooks/useUrlState';

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
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => 
    initialDate || new Date(currentState.date)
  );
  
  const { 
    branches, 
    selectedBranch, 
    setSelectedBranch,
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
    handleSalesChange,
    submitSalesData
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
  
  // Handle branch change
  const handleBranchChange = useCallback((branchId: string | null) => {
    setSelectedBranch(branchId);
  }, [setSelectedBranch]);
  
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
  
  const isLoading = isBranchLoading || isEmployeeLoading;
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Monthly Sales</h2>
            <p className="text-muted-foreground">
              Track and manage employee sales for each month
            </p>
          </div>
          
          {/* Branch Filter Component */}
          <BranchFilter 
            branches={branches} 
            selectedBranch={selectedBranch} 
            onBranchChange={handleBranchChange} 
            isLoading={isBranchLoading} 
          />
        </div>
        
        {/* Sales Header with Date Picker */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg border">
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