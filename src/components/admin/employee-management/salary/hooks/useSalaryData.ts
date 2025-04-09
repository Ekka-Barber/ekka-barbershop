import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { getMonthDateRange } from '../SalaryUtils';
import { SalaryCalculatorFactory } from '@/lib/salary/calculators/CalculatorFactory';
import { SalaryPlanType, SalaryPlan } from '@/lib/salary/types/salary';

interface EmployeeSalary {
  id: string;
  name: string;
  baseSalary: number;
  commission: number;
  bonus: number;
  deductions: number;
  loans: number;
  total: number;
}

interface UseSalaryDataProps {
  employees: Employee[];
  selectedMonth: string;
}

export const useSalaryData = ({ employees, selectedMonth }: UseSalaryDataProps) => {
  const [salaryData, setSalaryData] = useState<EmployeeSalary[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Get date range for the selected month
  const { startDate, endDate } = getMonthDateRange(selectedMonth);
  
  // Fetch employee sales data for the selected month
  const salesQuery = useQuery({
    queryKey: ['employee-sales', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .gte('month', startDate)
        .lte('month', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch salary plans
  const { data: salaryPlans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ['salary-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch bonuses for the selected month
  const bonusesQuery = useQuery({
    queryKey: ['employee-bonuses', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch deductions for the selected month
  const deductionsQuery = useQuery({
    queryKey: ['employee-deductions', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch loans for the selected month
  const loansQuery = useQuery({
    queryKey: ['employee-loans', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Calculate salary data when dependencies change
  useEffect(() => {
    // Skip calculation if any data is still loading
    if (
      salesQuery.isLoading ||
      isPlansLoading ||
      bonusesQuery.isLoading ||
      deductionsQuery.isLoading ||
      loansQuery.isLoading ||
      employees.length === 0
    ) {
      return;
    }
    
    const calculateSalaries = async () => {
      setIsCalculating(true);
      
      try {
        // Create an instance of the calculator factory
        const factory = SalaryCalculatorFactory.getInstance();
        
        // Calculate salaries for each employee
        const salaries = await Promise.all(
          employees.map(async (employee) => {
            // Find employee's sales amount
            const employeeSales = salesQuery.data.find(
              sale => 'employee_id' in sale 
                ? sale.employee_id === employee.id
                : sale.employee_name === employee.name
            );
            const salesAmount = employeeSales ? employeeSales.sales_amount : 0;
            
            // Find employee's salary plan
            const salaryPlan = salaryPlans.find(plan => plan.id === employee.salary_plan_id);
            
            // Find employee's bonuses, deductions, and loans
            const employeeBonuses = bonusesQuery.data?.filter(bonus => bonus.employee_id === employee.id) || [];
            const employeeDeductions = deductionsQuery.data?.filter(deduction => deduction.employee_id === employee.id) || [];
            const employeeLoans = loansQuery.data?.filter(loan => loan.employee_id === employee.id) || [];
            
            // Calculate totals
            const bonusTotal = employeeBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
            const deductionsTotal = employeeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
            const loansTotal = employeeLoans.reduce((sum, loan) => sum + loan.amount, 0);
            
            // Default values if no salary plan
            let baseSalary = 0;
            let commission = 0;
            
            // Calculate salary if the employee has a salary plan
            if (salaryPlan) {
              try {
                const calculator = factory.getCalculator(salaryPlan.type as SalaryPlanType);
                
                const result = await calculator.calculate({
                  employee,
                  plan: salaryPlan as unknown as SalaryPlan,
                  salesAmount,
                  bonuses: employeeBonuses,
                  deductions: employeeDeductions,
                  loans: employeeLoans,
                  selectedMonth
                });
                
                baseSalary = result.baseSalary;
                commission = result.commission;
              } catch (error) {
                console.error(`Error calculating salary for ${employee.name}:`, error);
              }
            }
            
            // Calculate total salary
            const total = baseSalary + commission + bonusTotal - deductionsTotal - loansTotal;
            
            return {
              id: employee.id,
              name: employee.name,
              baseSalary,
              commission,
              bonus: bonusTotal,
              deductions: deductionsTotal,
              loans: loansTotal,
              total
            };
          })
        );
        
        setSalaryData(salaries);
      } catch (error) {
        console.error('Error calculating salaries:', error);
      } finally {
        setIsCalculating(false);
      }
    };
    
    calculateSalaries();
  }, [
    employees,
    selectedMonth,
    salesQuery.data,
    salaryPlans,
    bonusesQuery.data,
    deductionsQuery.data,
    loansQuery.data,
    isPlansLoading,
    bonusesQuery.isLoading,
    deductionsQuery.isLoading,
    loansQuery.isLoading
  ]);
  
  const isLoading = 
    salesQuery.isLoading || 
    isPlansLoading || 
    bonusesQuery.isLoading || 
    deductionsQuery.isLoading || 
    loansQuery.isLoading || 
    isCalculating;
  
  // Get bonuses, deductions, and loans for a specific employee
  const getEmployeeTransactions = (employeeId: string) => {
    const bonuses = (bonusesQuery.data || []);
    const deductions = (deductionsQuery.data || []);
    const loans = (loansQuery.data || []);
    const salesData = (salesQuery.data || []);
    
    return {
      bonuses: bonuses.filter(bonus => bonus.employee_id === employeeId),
      deductions: deductions.filter(deduction => deduction.employee_id === employeeId),
      loans: loans.filter(loan => loan.employee_id === employeeId),
      salesData: salesData.find(sale => 
        ('employee_id' in sale ? sale.employee_id === employeeId : 
         'employee_name' in sale && employees.find(e => e.id === employeeId)?.name === sale.employee_name))
    };
  };
  
  return {
    salaryData,
    isLoading,
    getEmployeeTransactions
  };
}; 
