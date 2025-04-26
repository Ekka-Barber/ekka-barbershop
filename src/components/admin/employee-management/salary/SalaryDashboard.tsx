
import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { Separator } from '@/components/ui/separator';
import { useSalaryData } from './hooks/useSalaryData';
import { SalaryBreakdown } from './SalaryBreakdown';
/* import { SalaryFilters } from './SalaryFilters'; */
import { SalaryDashboardHeader } from './components/SalaryDashboardHeader';
import { SalaryDashboardStats } from './components/SalaryDashboardStats';
import { SalaryTable } from './components/SalaryTable';
/* import { useSalaryFiltering } from './hooks/useSalaryFiltering'; */
import { useDashboardStats } from './hooks/useDashboardStats';
import { Button } from '@/components/ui/button';
import { Download, Calculator, List } from 'lucide-react';
import { EmployeeSalary } from './hooks/utils/salaryTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormulaSalaryPlanList from './components/FormulaSalaryPlanList';
import { ExistingSalaryPlansList } from './components/ExistingSalaryPlansList';

interface SalaryDashboardProps {
  employees: Employee[];
}

export const SalaryDashboard = ({ 
  employees
}: SalaryDashboardProps) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const [pickerDate, setPickerDate] = useState<Date>(new Date(currentYear, currentMonth));
  const [salaryTab, setSalaryTab] = useState<string>("overview");
  
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`
  );
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  // Auto-refresh settings
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Check URL for view=formula-plans parameter when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      
      if (viewParam === 'formula-plans') {
        setSalaryTab('formula-plans');
        
        // Update the URL to remove the view parameter to avoid sticking on formula plans tab
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('view');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);
  
  const { salaryData, isLoading, getEmployeeTransactions, refreshData } = useSalaryData({
    employees,
    selectedMonth
  });
  
  // Track historical data for comparison
  const [historicalData, setHistoricalData] = useState<Record<string, EmployeeSalary[]>>({});
  
  // Set up auto-refresh
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh && !selectedEmployeeId) {
      intervalId = setInterval(() => {
        refreshData();
        setLastRefresh(new Date());
      }, 300000); // Every 5 minutes
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refreshData, selectedEmployeeId]);

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    if (!autoRefresh) {
      // Start with a refresh
      refreshData();
      setLastRefresh(new Date());
    }
  };
  
  // Update history when month changes and data loads
  useEffect(() => {
    if (salaryData.length > 0 && !isLoading) {
      setHistoricalData(prev => ({
        ...prev,
        [selectedMonth]: salaryData
      }));
    }
  }, [salaryData, selectedMonth, isLoading]);
  
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

  /* const { filteredSalaryData } = useSalaryFiltering({
    salaryData,
    searchQuery,
    sortBy,
    minSalary,
    maxSalary
  }); */
  
  // Export salary data to CSV
  const exportSalaryData = () => {
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
    link.setAttribute('download', `salary-data-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Get previous month in YYYY-MM format
  const getPreviousMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-').map(Number);
    const prevDate = new Date(year, month - 2); // Months are 0-indexed in Date
    return `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
  };
  
  // Calculate month-over-month changes for an employee
  const getMonthlyChange = (employeeId: string): number | null => {
    const currentData = salaryData.find(s => s.id === employeeId);
    const prevMonth = getPreviousMonth(selectedMonth);
    const prevData = historicalData[prevMonth]?.find(s => s.id === employeeId);
    
    if (!currentData || !prevData) return null;
    return currentData.total - prevData.total;
  };
  
  const stats = useDashboardStats(salaryData);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" value={salaryTab} onValueChange={setSalaryTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="existing-plans" className="flex items-center gap-1">
                <List className="h-4 w-4 mr-1" />
                Existing Salary Plans
              </TabsTrigger>
              <TabsTrigger value="formula-plans" className="flex items-center gap-1">
                <Calculator className="h-4 w-4 mr-1" />
                Formula Salary Plans
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex items-center gap-2">
            {salaryTab === "overview" && !isLoading && salaryData.length > 0 && !selectedEmployeeId && (
              <>
                <Button 
                  variant={autoRefresh ? "default" : "outline"} 
                  className="flex items-center gap-1"
                  onClick={toggleAutoRefresh}
                >
                  {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
                  {lastRefresh && autoRefresh && (
                    <span className="text-xs ml-1">
                      (Last: {lastRefresh.toLocaleTimeString()})
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={exportSalaryData}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </>
            )}
          </div>
        </div>
        
        <TabsContent value="overview">
          <div className="flex justify-between items-center">
            <SalaryDashboardHeader
              selectedMonth={selectedMonth}
              handleMonthChange={handleMonthChange}
              pickerDate={pickerDate}
              handleRefresh={refreshData}
              isLoading={isLoading}
            />
          </div>
          
          <Separator className="my-4" />
          
          {!isLoading && salaryData.length > 0 && (
            <SalaryDashboardStats
              totalPayout={stats.totalPayout}
              avgSalary={stats.avgSalary}
              employeeCount={stats.employeeCount}
            />
          )}
          
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
                salaryData={salaryData}
                isLoading={isLoading}
                onEmployeeSelect={handleEmployeeSelect}
                getMonthlyChange={getMonthlyChange}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="existing-plans">
          <ExistingSalaryPlansList />
        </TabsContent>
        
        <TabsContent value="formula-plans">
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">Formula Salary Plans</h2>
              <p className="text-muted-foreground ml-4">
                Create and manage formula-based salary plans
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">🆕 Enhanced Formula Builder</h3>
              <p className="text-blue-700 mb-3">
                The Formula Salary Plan builder has been upgraded with powerful new features:
              </p>
              <ul className="list-disc pl-6 text-blue-600 space-y-1">
                <li>Interactive employee property selection with searchable paths</li>
                <li>Real-time step dependency visualization to prevent circular references</li>
                <li>Enhanced simulation with importable/exportable sample data</li>
                <li>Improved step-by-step calculation preview with detailed execution breakdown</li>
              </ul>
            </div>
            
            <Separator className="my-4" />
            <FormulaSalaryPlanList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
