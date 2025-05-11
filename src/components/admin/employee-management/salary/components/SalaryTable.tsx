import { Loader2, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../SalaryUtils';
import { EmployeeSalary } from '../hooks/utils/salaryTypes'; // Ensure type import includes salesAmount

export interface SalaryTableProps {
  salaryData: EmployeeSalary[];
  isLoading: boolean;
  onEmployeeSelect: (employeeId: string) => void;
  getMonthlyChange?: (employeeId: string) => number | null;
}

export const SalaryTable = ({ 
  salaryData, 
  isLoading, 
  onEmployeeSelect,
  getMonthlyChange
}: SalaryTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg text-gray-500">Calculating Salary Data...</span>
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="md:block hidden overflow-x-auto">
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
                  {getMonthlyChange && <th className="text-right py-3 px-4">Change</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salaryData.length > 0 ? (
                  salaryData.map((salary, index) => {
                    const monthlyChange = getMonthlyChange ? getMonthlyChange(salary.id) : null;
                    
                    return (
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
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {salary.name}
                          {salary.calculationError && (
                            <span 
                              className="ml-2 text-red-500 cursor-help inline-flex items-center" 
                              title={salary.calculationError}
                              aria-label={`Error: ${salary.calculationError}`}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Salary plan issue</span>
                            </span>
                          )}
                        </td>
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
                        {getMonthlyChange && (
                          <td className="text-right py-3 px-4">
                            {monthlyChange !== null ? (
                              <div className="flex items-center justify-end">
                                {monthlyChange > 0 ? (
                                  <>
                                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                    <span className="text-green-600">
                                      {formatCurrency(monthlyChange)}
                                    </span>
                                  </>
                                ) : monthlyChange < 0 ? (
                                  <>
                                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                    <span className="text-red-600">
                                      {formatCurrency(Math.abs(monthlyChange))}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-gray-500">No change</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">–</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={getMonthlyChange ? 10 : 9} className="text-center py-8 text-gray-500 italic">
                      No employees match the current filters or no salary data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Mobile view */}
          <div className="md:hidden block">
            {salaryData.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {salaryData.map(salary => {
                  const monthlyChange = getMonthlyChange ? getMonthlyChange(salary.id) : null;
                  
                  return (
                    <div 
                      key={salary.id}
                      className="p-4 hover:bg-blue-50 cursor-pointer"
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
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-gray-800 flex items-center">
                          {salary.name}
                          {salary.calculationError && (
                            <span 
                              className="ml-2 text-red-500 cursor-help inline-flex items-center" 
                              title={salary.calculationError}
                              aria-label={`Error: ${salary.calculationError}`}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Salary plan issue</span>
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-gray-800">
                          {formatCurrency(salary.total)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base:</span>
                          <span>{formatCurrency(salary.baseSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission:</span>
                          <span>{formatCurrency(salary.commission)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bonuses:</span>
                          <span className="text-green-700">
                            {formatCurrency(salary.bonus + (salary.targetBonus || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deductions:</span>
                          <span className="text-red-600">
                            {(salary.deductions > 0 || salary.loans > 0) ? 
                              `-${formatCurrency(salary.deductions + salary.loans)}` : 
                              formatCurrency(0)}
                          </span>
                        </div>
                        
                        {getMonthlyChange && monthlyChange !== null && (
                          <div className="col-span-2 mt-1 flex justify-between border-t pt-1">
                            <span className="text-gray-600">Monthly Change:</span>
                            <div className="flex items-center">
                              {monthlyChange > 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                  <span className="text-green-600">
                                    {formatCurrency(monthlyChange)}
                                  </span>
                                </>
                              ) : monthlyChange < 0 ? (
                                <>
                                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                  <span className="text-red-600">
                                    {formatCurrency(Math.abs(monthlyChange))}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-500">No change</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 italic">
                No employees match the current filters or no salary data available.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
