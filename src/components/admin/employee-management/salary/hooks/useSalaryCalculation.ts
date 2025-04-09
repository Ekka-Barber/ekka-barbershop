
import { useState } from 'react';
import { Employee } from '@/types/employee';
import { SalaryPlanType, SalaryPlan, Transaction } from '@/lib/salary/types/salary';
import { SalaryCalculatorFactory } from '@/lib/salary/calculators/CalculatorFactory';
import { SalesData } from '@/lib/salary/calculators/BaseCalculator';
import { EmployeeSalary, SalaryCalculationError } from './utils/salaryTypes';

interface CalculateSalariesProps {
  employees: Employee[];
  selectedMonth: string;
  salesData: any[];
  salaryPlans: any[];
  bonuses: any[];
  deductions: any[];
  loans: any[];
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
              (sale.employee_name === employee.name) || 
              (sale.id === employee.id)
          );
          
          const salesAmount = employeeSales ? Number(employeeSales.sales_amount) : 0;
          
          console.log(`Sales lookup for ${employee.name}:`, {
            found: !!employeeSales,
            salesAmount,
            employeeId: employee.id,
            employeeName: employee.name,
            salesRecord: employeeSales
          });
          
          const salaryPlan = salaryPlans.find(plan => plan.id === employee.salary_plan_id);
          
          const employeeBonuses = bonuses?.filter(bonus => bonus.employee_id === employee.id) || [];
          const employeeDeductions = deductions?.filter(deduction => deduction.employee_id === employee.id) || [];
          const employeeLoans = loans?.filter(loan => loan.employee_id === employee.id) || [];
          
          const bonusTotal = employeeBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
          const deductionsTotal = employeeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
          const loansTotal = employeeLoans.reduce((sum, loan) => sum + loan.amount, 0);
          
          let baseSalary = 0;
          let commission = 0;
          let calculationError = undefined;
          
          if (salaryPlan) {
            try {
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
          
          const total = baseSalary + commission + bonusTotal - deductionsTotal - loansTotal;
          
          return {
            id: employee.id,
            name: employee.name,
            baseSalary,
            commission,
            bonus: bonusTotal,
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
