
import { EmployeeSalary } from '../hooks/utils/salaryTypes';

/**
 * Exports salary data to CSV format
 */
export const exportToCSV = (salaryData: EmployeeSalary[], monthLabel: string): void => {
  // Create CSV content
  const headers = ["Name", "Sales", "Base Salary", "Commission", "Bonuses", "Deductions", "Loans", "Total"];
  const csvContent = [
    headers.join(","),
    ...salaryData.map(employee => [
      `"${employee.name}"`, // Add quotes to handle names with commas
      employee.salesAmount || 0,
      employee.baseSalary,
      employee.commission,
      (employee.bonus || 0) + (employee.targetBonus || 0),
      employee.deductions,
      employee.loans,
      employee.total
    ].join(","))
  ].join("\n");
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `salary-data-${monthLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
