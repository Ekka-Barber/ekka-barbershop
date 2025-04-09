
import { useMemo } from 'react';
import { EmployeeSalary } from '../components/SalaryTable';

interface UseSalaryFilteringParams {
  salaryData: EmployeeSalary[];
  searchQuery: string;
  sortBy: string;
  minSalary: number | null;
  maxSalary: number | null;
}

export const useSalaryFiltering = ({
  salaryData,
  searchQuery,
  sortBy,
  minSalary,
  maxSalary
}: UseSalaryFilteringParams) => {
  
  // Apply filters and sort to the salary data
  const filteredSalaryData = useMemo(() => {
    if (!salaryData.length) return [];
    
    return salaryData
      .filter(employee => {
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (!employee.name.toLowerCase().includes(query)) {
            return false;
          }
        }
        
        // Apply salary range filter
        if (minSalary !== null && employee.total < minSalary) {
          return false;
        }
        
        if (maxSalary !== null && employee.total > maxSalary) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        switch (sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'salary_desc':
            return b.total - a.total;
          case 'salary_asc':
            return a.total - b.total;
          case 'commission_desc':
            return b.commission - a.commission;
          case 'base_desc':
            return b.baseSalary - a.baseSalary;
          default:
            return 0;
        }
      });
  }, [salaryData, searchQuery, sortBy, minSalary, maxSalary]);
  
  return { filteredSalaryData };
};
