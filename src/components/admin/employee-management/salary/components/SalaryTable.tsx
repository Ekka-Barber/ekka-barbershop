import { Loader2 } from 'lucide-react';
import { formatCurrency } from '../SalaryUtils';
import { EmployeeSalary } from '../hooks/utils/salaryTypes'; // Ensure type import includes salesAmount

export interface SalaryTableProps {
  salaryData: EmployeeSalary[];
  isLoading: boolean;
  onEmployeeSelect: (employeeId: string) => void;
}

export const SalaryTable = ({ salaryData, isLoading, onEmployeeSelect }: SalaryTableProps) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg text-gray-500">Calculating Salary Data...</span>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-600 font-medium">
              <th className="text-left py-3 px-4">Employee</th>
              <th className="text-right py-3 px-4">Total Sales</th> 
              <th className="text-right py-3 px-4">Base Salary</th>
              <th className="text-right py-3 px-4">Commission</th>
              <th className="text-right py-3 px-4">Regular Bonuses</th>
              <th className="text-right py-3 px-4">Target Bonuses</th>
              <th className="text-right py-3 px-4">Deductions</th>
              <th className="text-right py-3 px-4">Loans</th>
              <th className="text-right py-3 px-4 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {salaryData.length > 0 ? (
              salaryData.map((salary, index) => (
                <tr 
                  key={salary.id} 
                  className={`hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
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
                  <td className="py-3 px-4 font-medium text-gray-800">{salary.name}</td>
                  {/* Add Sales Amount cell */}
                  <td className="text-right py-3 px-4 text-gray-700">
                    {formatCurrency(salary.salesAmount ?? 0)} 
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">{formatCurrency(salary.baseSalary)}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{formatCurrency(salary.commission)}</td>
                  <td className="text-right py-3 px-4 text-green-700">{formatCurrency(salary.bonus)}</td>
                  <td className="text-right py-3 px-4 text-green-700">{formatCurrency(salary.targetBonus)}</td>
                  <td className="text-right py-3 px-4 text-red-600">
                    {salary.deductions > 0 ? `-${formatCurrency(salary.deductions)}` : formatCurrency(0)}
                  </td>
                  <td className="text-right py-3 px-4 text-red-600">
                    {salary.loans > 0 ? `-${formatCurrency(salary.loans)}` : formatCurrency(0)}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-800">
                    {formatCurrency(salary.total)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500 italic">
                  No employees match the current filters or no salary data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
