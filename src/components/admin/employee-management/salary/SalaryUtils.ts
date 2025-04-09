import { Employee } from '@/types/employee';

/**
 * Formats a numeric value as a price string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Gets the formatted month string from YYYY-MM format
 */
export const getMonthDisplayName = (monthString: string): string => {
  const [year, month] = monthString.split('-').map(Number);
  
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return 'Invalid date';
  }
  
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Gets the first and last day of a month
 */
export const getMonthDateRange = (monthString: string): { startDate: string; endDate: string } => {
  const [year, month] = monthString.split('-').map(Number);
  
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    const today = new Date();
    return {
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  }
  
  // First day of month
  const startDate = new Date(year, month - 1, 1);
  
  // Last day of month
  const endDate = new Date(year, month, 0);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * Create a filter function for employees by branch
 */
export const filterEmployeesByBranch = (
  employees: Employee[], 
  branchId: string | null
): Employee[] => {
  if (!branchId) return employees;
  return employees.filter(employee => employee.branch_id === branchId);
};

/**
 * Sort employees by salary
 */
export const sortEmployeesBySalary = (
  employees: Employee[], 
  salaryData: Record<string, number>
): Employee[] => {
  return [...employees].sort((a, b) => {
    const salaryA = salaryData[a.id] || 0;
    const salaryB = salaryData[b.id] || 0;
    return salaryB - salaryA; // Sort by descending order
  });
}; 
