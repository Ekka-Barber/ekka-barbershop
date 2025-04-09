
import { useMemo } from 'react';
import { EmployeeSalary } from '../components/SalaryTable';

export interface DashboardStats {
  totalPayout: number;
  avgSalary: number;
  employeeCount: number;
}

export const useDashboardStats = (salaryData: EmployeeSalary[]): DashboardStats => {
  return useMemo(() => {
    if (!salaryData.length) {
      return { totalPayout: 0, avgSalary: 0, employeeCount: 0 };
    }
    
    const totalPayout = salaryData.reduce((sum, employee) => sum + employee.total, 0);
    const avgSalary = totalPayout / salaryData.length;
    
    return {
      totalPayout,
      avgSalary,
      employeeCount: salaryData.length
    };
  }, [salaryData]);
};
