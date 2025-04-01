import { useState, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from 'lucide-react';
import { useEmployeeSales } from './hooks/useEmployeeSales';
import { useBranchManager } from './hooks/useBranchManager';
import { useEmployeeManager } from './hooks/useEmployeeManager';
import { EmployeeSalesHeader } from './components/EmployeeSalesHeader';
import { EmployeeGrid } from './components/EmployeeGrid';

export const EmployeeTab = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Branch management
  const { 
    branches, 
    selectedBranch, 
    setSelectedBranch, 
    isLoading: isBranchLoading
  } = useBranchManager();
  
  // Employee management
  const { 
    employees, 
    isLoading: isEmployeeLoading,
    fetchEmployees
  } = useEmployeeManager(selectedBranch);
  
  // Sales management
  const {
    salesInputs,
    lastUpdated,
    isSubmitting,
    handleSalesChange,
    submitSalesData
  } = useEmployeeSales(selectedDate, employees);
  
  const handleSubmit = async () => {
    try {
      await submitSalesData();
      
      toast({
        title: "Success",
        description: "Employee sales data saved successfully",
      });
    } catch (error: any) {
      console.error('Error submitting sales data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save sales data",
        variant: "destructive",
      });
    }
  };

  // Memoize the loading state to prevent unnecessary re-renders
  const isLoading = useMemo(() => 
    isBranchLoading || isEmployeeLoading, 
    [isBranchLoading, isEmployeeLoading]
  );

  return (
    <div className="space-y-6">
      <EmployeeSalesHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branches={branches}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      
      {lastUpdated && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      )}
      
      <EmployeeGrid
        isLoading={isLoading}
        employees={employees}
        salesInputs={salesInputs}
        selectedBranch={selectedBranch}
        onSalesChange={handleSalesChange}
        refetchEmployees={fetchEmployees}
      />
    </div>
  );
};
