import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Calendar, BarChart2, Users, Clock, DollarSign, Airplay } from 'lucide-react';
import { useEmployeeSales } from './hooks/useEmployeeSales';
import { useBranchManager } from './hooks/useBranchManager';
import { useEmployeeManager } from './hooks/useEmployeeManager';
import { EmployeeSalesHeader } from './components/EmployeeSalesHeader';
import { EmployeeGrid } from './components/EmployeeGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LazyEmployeeAnalyticsDashboard,
  LazyScheduleInterface,
  LazyTeamPerformanceComparison,
  LazySalaryDashboard,
  LazyLeaveManagement,
  TabLoadingFallback
} from './lazy-loaded-tabs';
import { EmployeeProvider } from './context/EmployeeContext';
import { useUrlState } from './hooks/useUrlState';

export const EmployeeTab = () => {
  const { toast } = useToast();
  const { currentState, syncUrlWithState } = useUrlState();
  
  // Initialize state from URL
  const [selectedDate, setSelectedDate] = useState<Date>(() => 
    new Date(currentState.date)
  );
  const [activeTab, setActiveTab] = useState<string>(currentState.tab);
  
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
    fetchEmployees,
    pagination,
    setCurrentPage
  } = useEmployeeManager(selectedBranch);
  
  // Sales management
  const {
    salesInputs,
    lastUpdated,
    isSubmitting,
    handleSalesChange,
    submitSalesData
  } = useEmployeeSales(selectedDate, employees);
  
  // Sync URL with component state
  useEffect(() => {
    syncUrlWithState(
      activeTab,
      selectedBranch,
      selectedDate,
      pagination.currentPage
    );
  }, [activeTab, selectedBranch, selectedDate, pagination.currentPage, syncUrlWithState]);
  
  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);
  
  // Handle branch change
  const handleBranchChange = useCallback((branchId: string | null) => {
    setSelectedBranch(branchId);
  }, [setSelectedBranch]);
  
  // Handle date change
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);
  
  // Memoize the handleSubmit function
  const handleSubmit = useCallback(async () => {
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
  }, [submitSalesData, toast]);

  // Memoize the loading state
  const isLoading = useMemo(() => 
    isBranchLoading || isEmployeeLoading, 
    [isBranchLoading, isEmployeeLoading]
  );

  // Memoize the branches array
  const memoizedBranches = useMemo(() => branches, [branches]);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    employees,
    branches: memoizedBranches,
    selectedBranch,
    selectedDate,
    isLoading,
    salesInputs,
    lastUpdated,
    isSubmitting,
    pagination,
    setSelectedBranch: handleBranchChange,
    setSelectedDate: handleDateChange,
    handleSalesChange,
    handleSubmit,
    setCurrentPage: handlePageChange,
    fetchEmployees
  }), [
    employees,
    memoizedBranches,
    selectedBranch,
    selectedDate,
    isLoading,
    salesInputs,
    lastUpdated,
    isSubmitting,
    pagination,
    handleBranchChange,
    handleDateChange,
    handleSalesChange,
    handleSubmit,
    handlePageChange,
    fetchEmployees
  ]);

  return (
    <EmployeeProvider value={contextValue}>
      <div className="space-y-6">
        {/* Branch filter buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant={selectedBranch === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleBranchChange(null)}
            aria-label="Show all branches"
            tabIndex={0}
          >
            All Branches
          </Button>
          {memoizedBranches.map(branch => (
            <Button
              key={branch.id}
              variant={selectedBranch === branch.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleBranchChange(branch.id)}
              aria-label={`Show ${branch.name} branch`}
              tabIndex={0}
            >
              {branch.name}
            </Button>
          ))}
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="pb-2 w-full">
              <TabsList className="w-full flex flex-wrap gap-2">
                <TabsTrigger value="employee-grid" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Employees</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Scheduling</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Team</span>
                </TabsTrigger>
                <TabsTrigger value="salary" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Salary</span>
                </TabsTrigger>
                <TabsTrigger value="leave" className="flex items-center gap-1">
                  <Airplay className="h-4 w-4" />
                  <span>Leave</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="employee-grid" className="space-y-6">
            <EmployeeSalesHeader
              selectedDate={selectedDate}
              setSelectedDate={handleDateChange}
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
              selectedDate={selectedDate}
              branches={memoizedBranches}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <Suspense fallback={<TabLoadingFallback />}>
              <LazyEmployeeAnalyticsDashboard 
                employees={employees}
                selectedBranch={selectedBranch}
              />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Suspense fallback={<TabLoadingFallback />}>
              <LazyScheduleInterface 
                employees={employees}
                selectedBranch={selectedBranch}
                onScheduleUpdate={fetchEmployees}
              />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="team">
            <Suspense fallback={<TabLoadingFallback />}>
              <LazyTeamPerformanceComparison
                employees={employees}
                selectedBranch={selectedBranch}
              />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="salary">
            <Suspense fallback={<TabLoadingFallback />}>
              <LazySalaryDashboard
                employees={employees}
              />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="leave" className="space-y-6">
            <Suspense fallback={<TabLoadingFallback />}>
              <LazyLeaveManagement employees={employees} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </EmployeeProvider>
  );
};
