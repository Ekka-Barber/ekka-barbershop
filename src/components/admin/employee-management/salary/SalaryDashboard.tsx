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
import { Download, Calculator, List, FileText, ChevronLeft, ChevronRight, Search, RefreshCw, Filter, Clock } from 'lucide-react';
import { EmployeeSalary } from './hooks/utils/salaryTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormulaSalaryPlanList from './components/FormulaSalaryPlanList';
import ExistingSalaryPlansList from './components/ExistingSalaryPlansList';
import PayslipTemplateViewer from './components/PayslipTemplateViewer';

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
  
  // Filter salaryData to only include employees in the current employees prop
  const filteredSalaryData = salaryData.filter(salary =>
    employees.some(emp => emp.id === salary.id)
  );
  
  // Always call the hook at the top level
  const filteredStats = useDashboardStats(filteredSalaryData);
  
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
  
  // Add state for search query (if not present)
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="block sm:hidden space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1))}
            aria-label="Previous month"
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h2 className="font-semibold text-base">
              {pickerDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1))}
            aria-label="Next month"
            className="h-10 w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Total Payout</div>
            <div className="text-lg font-bold">{filteredStats.totalPayout.toLocaleString()} SAR</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Employees</div>
            <div className="text-lg font-bold">{filteredStats.employeeCount}</div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search employees..."
            className="pl-8 h-11 w-full rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search employees"
          />
        </div>
      </div>
      {/* Desktop Tabs and Content */}
      <Tabs defaultValue="overview" value={salaryTab} onValueChange={setSalaryTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <div className="flex flex-nowrap items-center justify-between gap-2 px-2 min-w-max">
            <TabsList className="mb-4 flex flex-nowrap gap-2 min-w-max">
              <TabsTrigger value="overview" className="flex items-center gap-1 min-w-max">
                Overview
              </TabsTrigger>
              <TabsTrigger value="existing-plans" className="flex items-center gap-1 min-w-max">
                <List className="h-4 w-4 mr-1" />
                Existing Salary Plans
              </TabsTrigger>
              <TabsTrigger value="formula-plans" className="flex items-center gap-1 min-w-max">
                <Calculator className="h-4 w-4 mr-1" />
                Formula Salary Plans
              </TabsTrigger>
              <TabsTrigger value="payslip-template" className="flex items-center gap-1 min-w-max">
                <FileText className="h-4 w-4 mr-1" />
                Payslip Template
              </TabsTrigger>
            </TabsList>
            {salaryTab === "overview" && !isLoading && salaryData.length > 0 && !selectedEmployeeId && (
              <>
                <Button 
                  variant={autoRefresh ? "default" : "outline"} 
                  className="flex items-center gap-1 min-w-max"
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
                  className="flex items-center gap-1 min-w-max"
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
          
          {!isLoading && filteredSalaryData.length > 0 && (
            <SalaryDashboardStats
              totalPayout={filteredStats.totalPayout}
              avgSalary={filteredStats.avgSalary}
              employeeCount={filteredStats.employeeCount}
              totalSales={filteredStats.totalSales}
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
                salaryData={filteredSalaryData}
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
        
        <TabsContent value="payslip-template">
          {typeof window !== 'undefined' && (
            <PayslipTemplateViewer 
              payslipData={{
                companyName: 'Ekka Barbershop',
                companyLogoUrl: '/lovable-uploads/2ea1f72e-efd2-4345-bf4d-957efd873986.png',
                payPeriod: selectedMonth,
                issueDate: new Date().toISOString().slice(0, 10),
                employee: {
                  nameAr: 'Sample Employee',
                  branch: 'Main Branch',
                  role: 'Barber',
                  email: 'sample@ekka.com',
                  salary_plan_id: 'sample-plan-id',
                  salaryPlan: {
                    id: 'sample-plan-id',
                    name: 'Sample Plan',
                    type: 'fixed',
                    config: {
                      name: 'Sample Salary Plan',
                      type: 'fixed',
                      blocks: [
                        {
                          id: '1',
                          type: 'fixed_amount',
                          config: {
                            amount: 3000
                          }
                        }
                      ],
                      description: 'Sample salary plan for demonstration'
                    }
                  }
                },
                bonuses: [],
                deductions: [],
                loans: [],
                totalSales: 0,
                summary: {
                  totalEarnings: 0,
                  totalDeductions: 0,
                  netSalary: 0,
                },
              }}
            />
          )}
        </TabsContent>
      </Tabs>
      {/* Mobile Action Bar */}
      <div className="block sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <div className="flex items-center justify-around p-2">
          <Button variant="ghost" size="icon" onClick={refreshData} className="h-10 w-10" aria-label="Refresh">
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {}} className="h-10 w-10" aria-label="Filter">
            <Filter className="h-5 w-5" />
          </Button>
          <div className="w-14"></div> {/* Space for FAB */}
          <Button variant="ghost" size="icon" onClick={toggleAutoRefresh} className="h-10 w-10" aria-label="Auto Refresh">
            <Clock className={autoRefresh ? 'h-5 w-5 text-primary' : 'h-5 w-5'} />
          </Button>
          <Button variant="ghost" size="icon" onClick={exportSalaryData} className="h-10 w-10" aria-label="Export">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Add bottom padding to avoid overlap */}
      <div className="block sm:hidden pb-20"></div>
    </div>
  );
};
