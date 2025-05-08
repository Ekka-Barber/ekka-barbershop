import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from 'lucide-react';
import { useEmployeeSales } from './hooks/useEmployeeSales';
import { useBranchManager } from './hooks/useBranchManager';
import { useEmployeeManager } from './hooks/useEmployeeManager';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  LazyEmployeesTab,
  LazyMonthlySalesTab,
  LazyEmployeeAnalyticsDashboard,
  LazyScheduleInterface,
  LazySalaryDashboard,
  LazyLeaveManagement,
  TabLoadingFallback
} from './lazy-loaded-tabs';
import { EmployeeProvider } from './context/EmployeeContext';
import { DocumentProvider } from './context/DocumentContext';
import { useUrlState } from './hooks/useUrlState';
import { BranchFilter } from './components/BranchFilter';
import { EmployeeTabsNavigation } from './components/EmployeeTabsNavigation';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmployeeSalesHeader } from './components/EmployeeSalesHeader';
import { EmployeeGrid } from './components/EmployeeGrid';

export const EmployeeTab = () => {
  const { toast } = useToast();
  const { currentState, syncUrlWithState } = useUrlState();
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => 
    new Date(currentState.date)
  );
  const [activeTab, setActiveTab] = useState<string>(currentState.tab);
  
  const { 
    branches, 
    selectedBranch, 
    setSelectedBranch,
    isLoading: isBranchLoading
  } = useBranchManager();
  
  const { 
    employees, 
    isLoading: isEmployeeLoading,
    fetchEmployees,
    pagination,
    setCurrentPage
  } = useEmployeeManager(selectedBranch);
  
  const {
    salesInputs,
    lastUpdated,
    isSubmitting,
    handleSalesChange,
    submitSalesData
  } = useEmployeeSales(selectedDate, employees);

  useEffect(() => {
    const currentDateStr = selectedDate.toISOString().slice(0, 7);
    if (
      activeTab !== currentState.tab ||
      selectedBranch !== currentState.branch ||
      currentDateStr !== currentState.date ||
      pagination.currentPage !== currentState.page
    ) {
      syncUrlWithState(
        activeTab,
        selectedBranch,
        selectedDate,
        pagination.currentPage
      );
    }
  }, [activeTab, selectedBranch, selectedDate, pagination.currentPage, syncUrlWithState, currentState]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleBranchChange = useCallback((branchId: string | null) => {
    setSelectedBranch(branchId);
    setCurrentPage(1);
  }, [setSelectedBranch, setCurrentPage]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

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

  const isLoading = useMemo(() => 
    isBranchLoading || isEmployeeLoading, 
    [isBranchLoading, isEmployeeLoading]
  );

  const contextValue = useMemo(() => ({
    employees,
    branches,
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
    fetchEmployees,
  }), [
    employees,
    branches,
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
    <ErrorBoundary>
      <DocumentProvider>
        <EmployeeProvider value={contextValue}>
          <div className="space-y-6">
            <BranchFilter 
              branches={branches} 
              selectedBranch={selectedBranch} 
              onBranchChange={handleBranchChange} 
              isLoading={isBranchLoading} 
            />
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <EmployeeTabsNavigation 
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />

              <TabsContent value="employee-grid" className="space-y-6">
                <ErrorBoundary>
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
                    branches={branches}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="employees" className="space-y-6">
                <Suspense fallback={<TabLoadingFallback />}>
                  <ErrorBoundary>
                    <LazyEmployeesTab
                      initialBranchId={selectedBranch}
                    />
                  </ErrorBoundary>
                </Suspense>
              </TabsContent>

              <TabsContent value="monthly-sales" className="space-y-6">
                <Suspense fallback={<TabLoadingFallback />}>
                  <ErrorBoundary>
                    <LazyMonthlySalesTab 
                      initialDate={selectedDate}
                      initialBranchId={selectedBranch}
                    />
                  </ErrorBoundary>
                </Suspense>
              </TabsContent>
              
              <TabsContent value="analytics">
                <Suspense fallback={<TabLoadingFallback />}>
                  <ErrorBoundary>
                    <LazyEmployeeAnalyticsDashboard 
                      employees={employees}
                      selectedBranch={selectedBranch}
                    />
                  </ErrorBoundary>
                </Suspense>
              </TabsContent>
              
              <TabsContent value="schedule">
                <Suspense fallback={<TabLoadingFallback />}>
                  <ErrorBoundary>
                    <LazyScheduleInterface 
                      selectedBranch={selectedBranch}
                      employees={employees}
                    />
                  </ErrorBoundary>
                </Suspense>
              </TabsContent>

              <TabsContent value="salary">
                <Suspense fallback={<TabLoadingFallback />}>
                  <ErrorBoundary>
                    <LazySalaryDashboard 
                      employees={employees}
                    />
                  </ErrorBoundary>
                </Suspense>
              </TabsContent>

              <TabsContent value="leave">
                <Suspense fallback={<TabLoadingFallback />}>
                  <ErrorBoundary>
                    <LazyLeaveManagement 
                      employees={employees}
                    />
                  </ErrorBoundary>
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </EmployeeProvider>
      </DocumentProvider>
    </ErrorBoundary>
  );
};
