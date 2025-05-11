
import React, { useState } from 'react';
import { useEmployeeManager } from '../hooks/useEmployeeManager';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import EmployeeList from '../components/employee-list/EmployeeList';
import BranchSelector from '../components/BranchSelector';
// Fix import path - importing from the correct location
import { EmployeeCard } from '../components/employee-card/EmployeeCard';
import { EmployeesTabProps } from '../types';

// Simple mock EmployeeDialog component
const EmployeeDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  return (
    <>
      {trigger}
    </>
  );
};

export const EmployeeTab: React.FC<EmployeesTabProps> = ({ initialBranchId }) => {
  const {
    employees,
    isLoading,
    error,
    pagination,
    setCurrentPage,
    filterByBranch,
    selectedBranch,
    branches,
    archiveFilter,
    setArchiveFilter
  } = useEmployeeManager(initialBranchId || null);
  
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const { toast } = useToast();
  const [isArchiveToggleLoading, setIsArchiveToggleLoading] = useState(false);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBranchChange = (branchId: string | null) => {
    filterByBranch(branchId);
    setSelectedEmployee(null);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const handleEmployeeClose = () => {
    setSelectedEmployee(null);
  };

  const handleArchiveToggle = async () => {
    setIsArchiveToggleLoading(true);
    try {
      if (archiveFilter === 'active') {
        setArchiveFilter('archived');
        toast({
          title: "Showing archived employees.",
        });
      } else {
        setArchiveFilter('active');
        toast({
          title: "Showing active employees.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to toggle archive status.",
        description: "Please try again.",
      });
    } finally {
      setIsArchiveToggleLoading(false);
    }
  };

  return (
    <div>
      <div className="md:flex items-start justify-between gap-4 mb-4">
        <div className="w-full md:w-1/3">
          <div className="mb-4">
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onChange={handleBranchChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Employee List</h3>
            <EmployeeDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              }
            />
          </div>
          {isLoading ? (
            <div className="space-y-2 mt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 opacity-60 animate-pulse">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500 mt-4">Error: {error.message}</p>
          ) : (
            <EmployeeList
              employees={employees}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onEmployeeSelect={handleEmployeeSelect}
              selectedEmployee={selectedEmployee}
            />
          )}
        </div>

        <div className="w-full md:w-2/3">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Archive Status <span className="opacity-60">({archiveFilter})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleArchiveToggle}
                  disabled={isArchiveToggleLoading}
                >
                  Toggle Archive View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedEmployee ? (
            <EmployeeCard
              employeeId={selectedEmployee}
              onClose={handleEmployeeClose}
            />
          ) : (
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Select an employee to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTab;
