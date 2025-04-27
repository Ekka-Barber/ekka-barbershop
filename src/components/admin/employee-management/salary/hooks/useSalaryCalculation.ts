import { useState } from 'react';
import { Employee } from '@/types/employee';
import {
  SalaryPlanType,
  SalaryPlan,
  Transaction,
  EmployeeBonus,
  EmployeeDeduction,
  EmployeeLoan
} from '@/lib/salary/types/salary';
import { SalaryCalculatorFactory } from '@/lib/salary/calculators/CalculatorFactory';
import { EmployeeSalary, SalaryCalculationError } from './utils/salaryTypes';

// Define a more specific type for sales data items
interface MonthlySalesDataItem {
  employee_name?: string;
  id?: string;
  sales_amount?: string | number; // Allow string or number, will be converted
  // Add other relevant fields if they exist in your sales data
}

interface CalculateSalariesProps {
  employees: Employee[];
  selectedMonth: string;
  salesData: MonthlySalesDataItem[]; // Use specific type
  salaryPlans: SalaryPlan[]; // Use imported type
  bonuses: EmployeeBonus[]; // Use imported type
  deductions: EmployeeDeduction[]; // Use imported type
  loans: EmployeeLoan[]; // Use imported type
}

/**
 * Handles the logic for calculating salaries for all employees
 */
export const useSalaryCalculation = () => {
  const [calculationErrors, setCalculationErrors] = useState<SalaryCalculationError[]>([]);

  const calculateSalaries = async ({
    employees,
    selectedMonth,
    salesData,
    salaryPlans,
    bonuses,
    deductions,
    loans
  }: CalculateSalariesProps): Promise<EmployeeSalary[]> => {
    setCalculationErrors([]);
    
    try {
      const factory = SalaryCalculatorFactory.getInstance();
      
      const salaries = await Promise.all(
        employees.map(async (employee) => {
          const employeeSales = salesData.find(
            sale => 
              sale.id === employee.id || 
              (sale.employee_name === employee.name && !salesData.some(s => s.id === employee.id))
          );
          
          const salesAmount = employeeSales ? Number(employeeSales.sales_amount || 0) : 0;
          
          const salaryPlan = salaryPlans.find(plan => plan.id === employee.salary_plan_id);
          
          const employeeBonuses = bonuses?.filter(bonus => bonus.employee_id === employee.id) || [];
          const employeeDeductions = deductions?.filter(deduction => deduction.employee_id === employee.id) || [];
          const employeeLoans = loans?.filter(loan => loan.employee_id === employee.id) || [];
          
          const bonusTotal = employeeBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
          const deductionsTotal = employeeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
          const loansTotal = employeeLoans.reduce((sum, loan) => sum + loan.amount, 0);
          
          let baseSalary = 0;
          let commission = 0;
          let targetBonus = 0;
          let calculationError = undefined;
          
          if (salaryPlan) {
            try {
              // Check if plan type is undefined
              if (!salaryPlan.type) {
                calculationError = 'Salary plan has no defined type';
                
                setCalculationErrors(prev => [
                  ...prev,
                  {
                    employeeId: employee.id,
                    employeeName: employee.name,
                    error: 'Salary plan has no defined type',
                    details: { 
                      plan_id: salaryPlan.id,
                      plan_name: salaryPlan.name || 'Unnamed Plan'
                    }
                  }
                ]);
              } else {
                const calculator = factory.getCalculator(salaryPlan.type as SalaryPlanType);
                
                const result = await calculator.calculate({
                  employee,
                  plan: salaryPlan as unknown as SalaryPlan,
                  salesAmount,
                  bonuses: employeeBonuses as unknown as Transaction[],
                  deductions: employeeDeductions as unknown as Transaction[],
                  loans: employeeLoans as unknown as Transaction[],
                  selectedMonth
                });
                
                baseSalary = result.baseSalary;
                commission = result.commission;
                targetBonus = result.targetBonus || 0;
                
                if (result.calculationStatus && !result.calculationStatus.success) {
                  calculationError = result.calculationStatus.error;
                  
                  setCalculationErrors(prev => [
                    ...prev,
                    {
                      employeeId: employee.id,
                      employeeName: employee.name,
                      error: result.calculationStatus.error || 'Unknown calculation error',
                      details: result.calculationStatus.details
                    }
                  ]);
                }
              }
            } catch (error) {
              console.error(`Error calculating salary for ${employee.name}:`, error);
              
              calculationError = error instanceof Error 
                ? error.message 
                : 'Unknown calculation error';
              
              setCalculationErrors(prev => [
                ...prev,
                {
                  employeeId: employee.id,
                  employeeName: employee.name,
                  error: calculationError,
                  details: { error }
                }
              ]);
            }
          } else {
            calculationError = 'No salary plan assigned';
            
            setCalculationErrors(prev => [
              ...prev,
              {
                employeeId: employee.id,
                employeeName: employee.name,
                error: 'No salary plan assigned',
                details: { 
                  salary_plan_id: employee.salary_plan_id,
                  available_plans: salaryPlans.length
                }
              }
            ]);
          }
          
          // Include both bonuses in the total calculation
          const total = baseSalary + commission + targetBonus + bonusTotal - deductionsTotal - loansTotal;
          
          return {
            id: employee.id,
            name: employee.name,
            salesAmount,
            baseSalary,
            commission,
            bonus: bonusTotal, // Ensure this is always a number, not optional
            targetBonus,
            deductions: deductionsTotal,
            loans: loansTotal,
            total,
            calculationError
          };
        })
      );
      
      return salaries;
    } catch (error) {
      console.error('Error calculating salaries:', error);
      return [];
    }
  };

  return {
    calculateSalaries,
    calculationErrors
  };
};
