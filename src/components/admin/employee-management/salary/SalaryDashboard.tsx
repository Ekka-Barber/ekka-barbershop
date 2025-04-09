import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MonthYearPicker } from '../MonthYearPicker';
import { useSalaryData } from './hooks/useSalaryData';
import { formatCurrency, getMonthDisplayName } from './SalaryUtils';
import { Loader2 } from 'lucide-react';
import { SalaryBreakdown } from './SalaryBreakdown';

interface SalaryDashboardProps {
  employees: Employee[];
  // These props are kept for future implementation phases
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedBranch: string | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refetchEmployees: () => void;
}

export const SalaryDashboard = ({ 
  employees, 
  // These props are kept for future implementation phases
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedBranch,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refetchEmployees
}: SalaryDashboardProps) => {
  // Get current date for the default month selection
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // State for the date object for the month picker
  const [pickerDate, setPickerDate] = useState<Date>(new Date(currentYear, currentMonth));
  
  // State for selected month (in YYYY-MM format)
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`
  );
  
  // State for the selected employee
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  // Fetch salary data using the hook
  const { salaryData, isLoading, getEmployeeTransactions } = useSalaryData({
    employees,
    selectedMonth
  });
  
  // Handle month selection change
  const handleMonthChange = (date: Date) => {
    setPickerDate(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    setSelectedMonth(`${year}-${month.toString().padStart(2, '0')}`);
    // Reset selected employee when month changes
    setSelectedEmployeeId(null);
  };
  
  // Get selected employee data
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(emp => emp.id === selectedEmployeeId) 
    : null;
  
  const selectedSalaryData = selectedEmployeeId 
    ? salaryData.find(salary => salary.id === selectedEmployeeId) 
    : null;
  
  // Get transaction data for the selected employee
  const transactions = selectedEmployeeId 
    ? getEmployeeTransactions(selectedEmployeeId) 
    : { bonuses: [], deductions: [], loans: [], salesData: null };
  
  // Handle click on an employee row
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };
  
  // Handle back button click
  const handleBack = () => {
    setSelectedEmployeeId(null);
  };
  
  // If an employee is selected, show their detailed breakdown
  if (selectedEmployeeId) {
    return (
      <SalaryBreakdown 
        selectedEmployeeId={selectedEmployeeId}
        employeeName={selectedEmployee?.name || ''}
        salaryData={selectedSalaryData}
        selectedMonth={selectedMonth}
        onBack={handleBack}
        isLoading={isLoading}
        bonusTransactions={transactions.bonuses}
        deductionTransactions={transactions.deductions}
        loanTransactions={transactions.loans}
        salesData={transactions.salesData}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Salary Management</h2>
          <p className="text-muted-foreground">
            View and manage employee compensation for {getMonthDisplayName(selectedMonth)}
          </p>
        </div>
        
        <MonthYearPicker 
          selectedDate={pickerDate}
          onChange={handleMonthChange}
        />
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 gap-6">
        {/* Summary Dashboard */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Employee Salary Summary</h3>
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
                      <th className="text-right py-2 px-2">Bonuses</th>
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
                          onClick={() => handleEmployeeSelect(salary.id)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleEmployeeSelect(salary.id);
                              e.preventDefault();
                            }
                          }}
                          aria-label={`View ${salary.name}'s salary details`}
                        >
                          <td className="py-3 px-2">{salary.name}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(salary.baseSalary)}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(salary.commission)}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(salary.bonus)}</td>
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
                        <td colSpan={7} className="text-center py-4 text-muted-foreground">
                          No salary data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Salary Breakdown placeholder for Phase 2 */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Salary Breakdown</h3>
            <p className="text-muted-foreground">Coming soon in Phase 2</p>
          </CardContent>
        </Card>
        
        {/* Data Visualizations placeholder for Phase 3 */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Visualizations</h3>
            <p className="text-muted-foreground">Coming soon in Phase 3</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 
