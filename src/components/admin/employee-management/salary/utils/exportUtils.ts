
import { EmployeeSalary } from "../components/SalaryTable";

export const exportSalaryDataToCSV = (salaryData: EmployeeSalary[], selectedMonth: string) => {
  if (!salaryData.length) return;
  
  // Create CSV content
  const headers = ['Name', 'Base Salary', 'Commission', 'Bonuses', 'Deductions', 'Loans', 'Total'];
  const rows = salaryData.map(employee => [
    employee.name,
    employee.baseSalary,
    employee.commission,
    employee.bonus,
    employee.deductions,
    employee.loans,
    employee.total
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set up download
  link.setAttribute('href', url);
  link.setAttribute('download', `salary_data_${selectedMonth}.csv`);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
