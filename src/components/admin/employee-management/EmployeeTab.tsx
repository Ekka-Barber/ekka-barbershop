import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
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
import { BaseEmployeeContextType } from './context/EmployeeContext';
import { DocumentProvider } from './context/DocumentContext';
import { useUrlState } from './hooks/useUrlState';
import { BranchFilter } from './components/BranchFilter';
import { EmployeeTabsNavigation } from './components/EmployeeTabsNavigation';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EmployeeGrid as OriginalEmployeeGrid } from './components/EmployeeGrid';
import { Employee } from '@/types/employee';
import { Branch, PaginationInfo } from './types';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Create a version of EmployeeGrid without sales inputs
// Define proper types for the wrapper component
type EmployeeGridProps = {
  isLoading: boolean;
  employees: Employee[];
  selectedBranch: string | null;
  refetchEmployees?: () => void;
  selectedDate?: Date;
  branches: Branch[]; // Use proper Branch type
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
};

const EmployeeGrid: React.FC<EmployeeGridProps> = (props) => (
  <OriginalEmployeeGrid
    {...props}
    salesInputs={{}} // Empty object as we don't need sales inputs here anymore
    onSalesChange={() => {}} // Empty function as we don't handle sales changes here anymore
  />
);

export const EmployeeTab = () => {
  const { currentState, syncUrlWithState } = useUrlState();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Keep date state for tabs that need it like analytics
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

  // Add real-time subscriptions for employees and branches
  useEffect(() => {
    // Set up subscription for employees table
    const employeesChannel = supabase
      .channel('employee_tab_employees_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees',
          ...(selectedBranch ? { filter: `branch_id=eq.${selectedBranch}` } : {})
        },
        (payload) => {
          console.log('Real-time employee update:', payload);
          // Invalidate employees query to trigger a refetch
          queryClient.invalidateQueries({
            queryKey: ['employees', selectedBranch, pagination.currentPage]
          });
          
          toast({
            title: "Employee Data Updated",
            description: "Employee information has been updated",
            duration: 3000,
          });
        }
      )
      .subscribe();

    // Set up subscription for branches table
    const branchesChannel = supabase
      .channel('employee_tab_branches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'branches'
        },
        (payload) => {
          console.log('Real-time branch update:', payload);
          // Invalidate branches query to trigger a refetch
          queryClient.invalidateQueries({
            queryKey: ['branches']
          });
          
          toast({
            title: "Branch Data Updated",
            description: "Branch information has been updated",
            duration: 3000,
          });
        }
      )
      .subscribe();
    
    // Cleanup subscriptions when component unmounts
    return () => {
      console.log('Cleaning up real-time subscriptions in EmployeeTab');
      supabase.removeChannel(employeesChannel);
      supabase.removeChannel(branchesChannel);
    };
  }, [queryClient, selectedBranch, pagination.currentPage, toast]);

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

  const isLoading = useMemo(() => 
    isBranchLoading || isEmployeeLoading, 
    [isBranchLoading, isEmployeeLoading]
  );

  // Use the new BaseEmployeeContextType without sales properties
  const contextValue = useMemo<BaseEmployeeContextType>(() => ({
    employees: employees || [],
    branches: branches || [],
    selectedBranch,
    selectedDate,
    isLoading,
    pagination,
    setSelectedBranch: handleBranchChange,
    setSelectedDate: handleDateChange,
    setCurrentPage: handlePageChange,
    fetchEmployees
  }), [
    employees,
    branches,
    selectedBranch,
    selectedDate,
    isLoading,
    pagination,
    handleBranchChange,
    handleDateChange,
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
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Employee Management</h2>
                      <p className="text-muted-foreground">Manage your employees and their settings</p>
                    </div>
                  </div>
                  
                  <EmployeeGrid
                    isLoading={isLoading}
                    employees={employees}
                    selectedBranch={selectedBranch}
                    refetchEmployees={fetchEmployees}
                    selectedDate={selectedDate}
                    branches={branches}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="employees">
                <Suspense fallback={<TabLoadingFallback />}>
                  <LazyEmployeesTab initialBranchId={selectedBranch} />
                </Suspense>
              </TabsContent>

              <TabsContent value="monthly-sales">
                <Suspense fallback={<TabLoadingFallback />}>
                  <LazyMonthlySalesTab 
                    initialDate={selectedDate}
                    initialBranchId={selectedBranch}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="analytics">
                <Suspense fallback={<TabLoadingFallback />}>
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Employee Analytics</h2>
                      <p className="text-muted-foreground">Visualize employee performance, sales data, and trends.</p>
                    </div>
                  </div>
                  <LazyEmployeeAnalyticsDashboard 
                    employees={employees}
                    selectedDate={selectedDate}
                    setSelectedDate={handleDateChange}
                    selectedBranch={selectedBranch}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="schedule">
                <Suspense fallback={<TabLoadingFallback />}>
                  <LazyScheduleInterface 
                    employees={employees}
                    selectedBranch={selectedBranch}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="salary">
                <Suspense fallback={<TabLoadingFallback />}>
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Salary Management</h2>
                      <p className="text-muted-foreground">Oversee employee compensation, salary structures, and payroll.</p>
                    </div>
                  </div>
                  <LazySalaryDashboard
                    employees={employees}
                    selectedDate={selectedDate}
                    setSelectedDate={handleDateChange}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="leave">
                <Suspense fallback={<TabLoadingFallback />}>
                  <LazyLeaveManagement 
                    employees={employees}
                    selectedBranch={selectedBranch}
                  />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </EmployeeProvider>
      </DocumentProvider>
    </ErrorBoundary>
  );
};
