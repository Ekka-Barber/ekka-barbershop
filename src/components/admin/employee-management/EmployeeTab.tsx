import { useState, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Calendar, BarChart2, Users } from 'lucide-react';
import { useEmployeeSales } from './hooks/useEmployeeSales';
import { useBranchManager } from './hooks/useBranchManager';
import { useEmployeeManager } from './hooks/useEmployeeManager';
import { EmployeeSalesHeader } from './components/EmployeeSalesHeader';
import { EmployeeGrid } from './components/EmployeeGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeAnalyticsDashboard } from './EmployeeAnalyticsDashboard';

export const EmployeeTab = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>('employee-grid');
  
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
    } catch (error) {
      console.error('Error submitting sales data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save sales data",
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="employee-grid" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="employee-grid" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="analytics">
          <EmployeeAnalyticsDashboard 
            employees={employees}
            selectedBranch={selectedBranch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
