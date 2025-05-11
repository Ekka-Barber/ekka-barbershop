import { useMemo } from 'react';
import { EmployeeSalary } from './utils/salaryTypes';

export interface DashboardStats {
  totalPayout: number;
  avgSalary: number;
  employeeCount: number;
  totalSales: number;
}

export const useDashboardStats = (salaryData: EmployeeSalary[]): DashboardStats => {
  return useMemo(() => {
    if (!salaryData.length) {
      return { totalPayout: 0, avgSalary: 0, employeeCount: 0, totalSales: 0 };
    }
    
    const totalPayout = salaryData.reduce((sum, employee) => sum + employee.total, 0);
    const avgSalary = totalPayout / salaryData.length;
    const totalSales = salaryData.reduce((sum, employee) => sum + (employee.salesAmount || 0), 0);
    
    return {
      totalPayout,
      avgSalary,
      employeeCount: salaryData.length,
      totalSales
    };
  }, [salaryData]);
};
