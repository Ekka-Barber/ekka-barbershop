import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Separator } from '@/components/ui/separator';
import { useSalaryData } from './hooks/useSalaryData';
import { SalaryBreakdown } from './SalaryBreakdown';
import { SalaryFilters } from './SalaryFilters';
import { SalaryDashboardHeader } from './components/SalaryDashboardHeader';
import { SalaryDashboardStats } from './components/SalaryDashboardStats';
import { SalaryTable } from './components/SalaryTable';
import { useSalaryFiltering } from './hooks/useSalaryFiltering';
import { useDashboardStats } from './hooks/useDashboardStats';

interface SalaryDashboardProps {
  employees: Employee[];
}

export const SalaryDashboard = ({ 
  employees, 
}: SalaryDashboardProps) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const [pickerDate, setPickerDate] = useState<Date>(new Date(currentYear, currentMonth));
  
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`
  );
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  const { salaryData, isLoading, getEmployeeTransactions, refreshData } = useSalaryData({
    employees,
    selectedMonth
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('salary_desc');
  const [minSalary, setMinSalary] = useState<number | null>(null);
  const [maxSalary, setMaxSalary] = useState<number | null>(null);
  
  const handleMonthChange = (date: Date) => {
    setPickerDate(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    setSelectedMonth(`${year}-${month.toString().padStart(2, '0')}`);
    setSelectedEmployeeId(null);
  };
   
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(emp => emp.id === selectedEmployeeId) 
    : null;
  
  const selectedSalaryData = selectedEmployeeId 
    ? salaryData.find(salary => salary.id === selectedEmployeeId) 
    : null;
  
  const transactions = selectedEmployeeId 
    ? getEmployeeTransactions(selectedEmployeeId) 
    : { bonuses: [], deductions: [], loans: [], salesData: null };
  
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };
  
  const handleBack = () => {
    setSelectedEmployeeId(null);
  };

  const { filteredSalaryData } = useSalaryFiltering({
    salaryData,
    searchQuery,
    sortBy,
    minSalary,
    maxSalary
  });
  
  const stats = useDashboardStats(salaryData);
  
  return (
    <div className="space-y-6">
      <SalaryDashboardHeader
        selectedMonth={selectedMonth}
        handleMonthChange={handleMonthChange}
        pickerDate={pickerDate}
        handleRefresh={refreshData}
        isLoading={isLoading}
      />
      
      <Separator />
      
      {!isLoading && salaryData.length > 0 && (
        <SalaryDashboardStats
          totalPayout={stats.totalPayout}
          avgSalary={stats.avgSalary}
          employeeCount={stats.employeeCount}
        />
      )}
      
      <SalaryFilters
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onMinSalaryChange={setMinSalary}
        onMaxSalaryChange={setMaxSalary}
      />

      <div className="mt-4">
        {selectedEmployeeId && selectedEmployee && selectedSalaryData ? (
          <SalaryBreakdown 
            selectedEmployeeId={selectedEmployeeId}
            employeeName={selectedEmployee.name}
            salaryData={selectedSalaryData}
            isLoading={isLoading}
            bonusTransactions={transactions.bonuses}
            deductionTransactions={transactions.deductions}
            loanTransactions={transactions.loans}
            salesData={transactions.salesData}
            onBack={handleBack}
            selectedMonth={selectedMonth}
          />
        ) : (
          <SalaryTable 
            salaryData={filteredSalaryData}
            isLoading={isLoading}
            onEmployeeSelect={handleEmployeeSelect}
          />
        )}
      </div>
    </div>
  );
};
