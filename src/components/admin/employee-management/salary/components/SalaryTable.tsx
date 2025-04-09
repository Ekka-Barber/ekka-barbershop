
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '../SalaryUtils';

export interface EmployeeSalary {
  id: string;
  name: string;
  baseSalary: number;
  commission: number;
  bonus: number;
  targetBonus: number;
  deductions: number;
  loans: number;
  total: number;
}

interface SalaryTableProps {
  salaryData: EmployeeSalary[];
  isLoading: boolean;
  onEmployeeSelect: (employeeId: string) => void;
}

export const SalaryTable = ({ salaryData, isLoading, onEmployeeSelect }: SalaryTableProps) => {
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Calculating salary data...</span>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Employee</th>
              <th className="text-right py-2 px-2">Base Salary</th>
              <th className="text-right py-2 px-2">Commission</th>
              <th className="text-right py-2 px-2">Regular Bonuses</th>
              <th className="text-right py-2 px-2">Target Bonuses</th>
              <th className="text-right py-2 px-2">Deductions</th>
              <th className="text-right py-2 px-2">Loans</th>
              <th className="text-right py-2 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.length > 0 ? (
              salaryData.map((salary) => (
                <tr 
                  key={salary.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer" 
                  onClick={() => onEmployeeSelect(salary.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onEmployeeSelect(salary.id);
                      e.preventDefault();
                    }
                  }}
                  aria-label={`View ${salary.name}'s salary details`}
                >
                  <td className="py-3 px-2">{salary.name}</td>
                  <td className="text-right py-3 px-2">{formatCurrency(salary.baseSalary)}</td>
                  <td className="text-right py-3 px-2">{formatCurrency(salary.commission)}</td>
                  <td className="text-right py-3 px-2">{formatCurrency(salary.bonus)}</td>
                  <td className="text-right py-3 px-2">{formatCurrency(salary.targetBonus)}</td>
                  <td className="text-right py-3 px-2 text-red-600">
                    {salary.deductions > 0 ? `-${formatCurrency(salary.deductions)}` : formatCurrency(0)}
                  </td>
                  <td className="text-right py-3 px-2 text-red-600">
                    {salary.loans > 0 ? `-${formatCurrency(salary.loans)}` : formatCurrency(0)}
                  </td>
                  <td className="text-right py-3 px-2 font-semibold">
                    {formatCurrency(salary.total)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4 text-muted-foreground">
                  No employees match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
