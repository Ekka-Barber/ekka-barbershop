
import { Employee } from '@/types/employee';
import { Transaction } from '@/lib/salary/types/salary';
import { SalesData } from '@/lib/salary/calculators/BaseCalculator';

interface UseEmployeeTransactionsProps {
  bonuses: any[];
  deductions: any[];
  loans: any[];
  salesData: any[];
  employees: Employee[];
}

/**
 * Hook to manage and retrieve employee transactions
 */
export const useEmployeeTransactions = ({
  bonuses, 
  deductions, 
  loans, 
  salesData,
  employees
}: UseEmployeeTransactionsProps) => {
  
  const getEmployeeTransactions = (employeeId: string) => {
    const filteredBonuses = (bonuses || [])
      .filter(bonus => bonus.employee_id === employeeId) as Transaction[];
      
    const filteredDeductions = (deductions || [])
      .filter(deduction => deduction.employee_id === employeeId) as Transaction[];
      
    const filteredLoans = (loans || [])
      .filter(loan => loan.employee_id === employeeId) as Transaction[];
      
    const sale = (salesData || []).find(sale => 
      ('employee_id' in sale ? sale.employee_id === employeeId : 
       'employee_name' in sale && employees.find(e => e.id === employeeId)?.name === sale.employee_name));
    
    // Convert the sales data to match the SalesData type
    const formattedSalesData: SalesData | null = sale ? {
      sales_amount: Number(sale.sales_amount),
      date: sale.month
    } : null;
    
    return {
      bonuses: filteredBonuses,
      deductions: filteredDeductions,
      loans: filteredLoans,
      salesData: formattedSalesData
    };
  };
  
  return { getEmployeeTransactions };
};
