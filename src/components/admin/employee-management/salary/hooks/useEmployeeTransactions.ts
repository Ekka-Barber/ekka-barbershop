
import { Transaction } from '@/lib/salary/types/salary';
import { SalesData } from '@/lib/salary/calculators/BaseCalculator';
import { Employee } from '@/types/employee';
import { transformSalesData, mapTransactions } from './utils/transformUtils';

interface UseEmployeeTransactionsProps {
  bonuses: any[];
  deductions: any[];
  loans: any[];
  salesData: any[];
  employees: Employee[];
}

interface EmployeeTransactions {
  bonuses: Transaction[];
  deductions: Transaction[];
  loans: Transaction[];
  salesData: SalesData;
}

export const useEmployeeTransactions = ({
  bonuses,
  deductions,
  loans,
  salesData,
  employees
}: UseEmployeeTransactionsProps) => {
  
  /**
   * Gets all transaction data for a specific employee
   */
  const getEmployeeTransactions = (employeeId: string): EmployeeTransactions => {
    // Filter transaction data for the employee
    const employeeBonuses = bonuses?.filter(bonus => bonus.employee_id === employeeId) || [];
    const employeeDeductions = deductions?.filter(deduction => deduction.employee_id === employeeId) || [];
    const employeeLoans = loans?.filter(loan => loan.employee_id === employeeId) || [];
    
    // Find sales data for the employee
    const employeeSales = salesData.find(
      sale => 
        (sale.employee_id === employeeId) || 
        (getEmployeeIdFromName(sale.employee_name, employees) === employeeId)
    ) || { sales_amount: 0, month: '' };
    
    return {
      bonuses: mapTransactions(employeeBonuses),
      deductions: mapTransactions(employeeDeductions),
      loans: mapTransactions(employeeLoans),
      salesData: transformSalesData(employeeSales)
    };
  };
  
  return {
    getEmployeeTransactions
  };
};

/**
 * Helper function to find employee ID from name
 */
const getEmployeeIdFromName = (name: string, employees: Employee[]): string | null => {
  if (!name || !employees?.length) return null;
  
  const employee = employees.find(emp => emp.name === name);
  return employee?.id || null;
};
