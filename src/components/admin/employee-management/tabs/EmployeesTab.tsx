
import React, { useState, useEffect } from 'react';
import { EmployeeList } from '../components/employee-list/EmployeeList';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { type EmployeesTabProps, type Employee } from '../types';
import { useToast } from '@/hooks/use-toast';
import { BranchSelector } from '../components/BranchSelector';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeeCard } from '../components/EmployeeCard';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

// Initial state for pagination
const INITIAL_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10
};

export const EmployeeTab: React.FC<EmployeesTabProps> = ({ initialBranchId }) => {
  // State for employees list
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(initialBranchId || null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  // Fetch employees data
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // Here would go the API call to fetch employees with pagination and filtering
      // For now, we'll simulate it
      setTimeout(() => {
        setEmployees([]); // Replace with actual API call
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          pageSize: 10
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedBranch]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleBranchChange = (branchId: string | null) => {
    setSelectedBranch(branchId);
  };

  const handleEmployeeSelect = (id: string) => {
    setSelectedEmployee(id);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
        <div className="flex items-center gap-2">
          <BranchSelector
            selectedBranch={selectedBranch}
            onChange={handleBranchChange}
          />
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          <Button size="sm">
            View Documents
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="flex gap-4">
          <div className="flex-1">
            <EmployeeList
              employees={employees}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onEmployeeSelect={handleEmployeeSelect}
              selectedEmployee={selectedEmployee}
            />
          </div>
          
          {selectedEmployee && isDetailOpen && (
            <div className="w-96 border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">Employee Details</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit Employee</DropdownMenuItem>
                    <DropdownMenuItem>View Documents</DropdownMenuItem>
                    <DropdownMenuItem>Manage Schedule</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Archive Employee</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Find employee object from employees array and pass it to EmployeeCard */}
              {employees.find(emp => emp.id === selectedEmployee) && (
                <EmployeeCard 
                  employee={employees.find(emp => emp.id === selectedEmployee)!} 
                />
              )}
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleCloseDetail}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Re-export EmployeeTab as EmployeesTab for backward compatibility
export { EmployeeTab as EmployeesTab };
