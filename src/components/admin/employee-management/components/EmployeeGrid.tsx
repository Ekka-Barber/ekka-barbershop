import { Employee } from '@/types/employee';
import { EmployeeCard } from '../EmployeeCard';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Branch, PaginationInfo } from '../types';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmployeeGridProps {
  isLoading: boolean;
  employees: Employee[];
  salesInputs: Record<string, string>;
  selectedBranch: string | null;
  onSalesChange: (employeeId: string, value: string) => void;
  refetchEmployees?: () => void;
  selectedDate?: Date;
  branches: Branch[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export const EmployeeGrid = ({
  isLoading,
  employees,
  salesInputs,
  selectedBranch,
  onSalesChange,
  refetchEmployees,
  selectedDate,
  branches,
  pagination,
  onPageChange
}: EmployeeGridProps) => {
  console.log('EmployeeGrid render:', { 
    isLoading, 
    employeesCount: employees.length,
    pagination 
  });
  
  const renderPaginationControls = () => {
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 1) return null;
    
    // Desktop pagination
    return (
      <div className="hidden sm:flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderMobilePagination = () => {
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 1) return null;
    
    // Mobile fixed bottom pagination
    return (
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background shadow-md border-t p-3 flex justify-between items-center z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <span className="text-sm font-medium">
          {currentPage} / {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {renderPaginationControls()}
        {renderMobilePagination()}
      </div>
    );
  }
  
  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {selectedBranch 
              ? "No employees found for the selected branch. Add employees to record sales." 
              : "No employees found. Please select a branch or add employees to record sales."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6 pb-16 sm:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(employee => (
          <EmployeeCard 
            key={employee.id}
            employee={employee}
            salesValue={salesInputs[employee.id] || ''}
            onSalesChange={(value) => onSalesChange(employee.id, value)}
            refetchEmployees={refetchEmployees}
            selectedDate={selectedDate}
            branches={branches}
          />
        ))}
      </div>
      {renderPaginationControls()}
      {renderMobilePagination()}
    </div>
  );
};
