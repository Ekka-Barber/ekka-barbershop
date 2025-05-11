import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Employee } from '@/types/employee';
import { Separator } from '@/components/ui/separator';
import { useSalaryData } from './hooks/useSalaryData';
import { SalaryBreakdown } from './SalaryBreakdown';
/* import { SalaryFilters } from './SalaryFilters'; */
/* import { SalaryDashboardHeader } from './components/SalaryDashboardHeader'; */
/* import { SalaryDashboardStats } from './components/SalaryDashboardStats'; */
import { SalaryTable } from './components/SalaryTable';
/* import { useSalaryFiltering } from './hooks/useSalaryFiltering'; */
import { useDashboardStats } from './hooks/useDashboardStats';
import { Button } from '@/components/ui/button';
import { Download, Calculator, List, FileText, ChevronLeft, ChevronRight, Search, RefreshCw, Filter, Clock, History } from 'lucide-react';
import { EmployeeSalary } from './hooks/utils/salaryTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormulaSalaryPlanList from './components/FormulaSalaryPlanList';
import ExistingSalaryPlansList from './components/ExistingSalaryPlansList';
import PayslipTemplateViewer from './components/PayslipTemplateViewer';
import SalaryHistory from './components/SalaryHistory';
import { useSalaryHistorySnapshots } from './hooks/useSalaryHistorySnapshots';
import SalaryHistoryViewToggle from './components/SalaryHistoryViewToggle';

interface SalaryDashboardProps {
  employees: Employee[];
}

export const SalaryDashboard = React.memo(({ 
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
  const filteredSalaryData = useMemo(() => 
    salaryData.filter(salary =>
      employees.some(emp => emp.id === salary.id)
    )
  , [salaryData, employees]);
  
  // Always call the hook at the top level
  const filteredStats = useDashboardStats(filteredSalaryData);
  
  // Calculate additional statistics not included in the DashboardStats interface
  const totalCommission = useMemo(() => 
    filteredSalaryData.reduce((sum, employee) => sum + (employee.commission || 0), 0)
  , [filteredSalaryData]);
  
  const totalBonus = useMemo(() => 
    filteredSalaryData.reduce((sum, employee) => 
      sum + (employee.bonus || 0) + (employee.targetBonus || 0), 0)
  , [filteredSalaryData]);
  
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
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
    if (!autoRefresh) {
      // Start with a refresh
      refreshData();
      setLastRefresh(new Date());
    }
  }, [autoRefresh, refreshData]);
  
  // Update history when month changes and data loads
  useEffect(() => {
    if (salaryData.length > 0 && !isLoading) {
      setHistoricalData(prev => ({
        ...prev,
        [selectedMonth]: salaryData
      }));
    }
  }, [salaryData, selectedMonth, isLoading]);
  
  const handleMonthChange = useCallback((date: Date) => {
    setPickerDate(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    setSelectedMonth(`${year}-${month.toString().padStart(2, '0')}`);
    setSelectedEmployeeId(null);
  }, []);
   
  const selectedEmployee = useMemo(() => 
    selectedEmployeeId 
      ? employees.find(emp => emp.id === selectedEmployeeId) 
      : null
  , [selectedEmployeeId, employees]);
  
  const selectedSalaryData = useMemo(() => 
    selectedEmployeeId 
      ? salaryData.find(salary => salary.id === selectedEmployeeId) 
      : null
  , [selectedEmployeeId, salaryData]);
  
  const transactions = useMemo(() => 
    selectedEmployeeId 
      ? getEmployeeTransactions(selectedEmployeeId) 
      : { bonuses: [], deductions: [], loans: [], salesData: null }
  , [selectedEmployeeId, getEmployeeTransactions]);
  
  const handleEmployeeSelect = useCallback((employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  }, []);
  
  const handleBack = useCallback(() => {
    setSelectedEmployeeId(null);
  }, []);

  /* const { filteredSalaryData } = useSalaryFiltering({
    salaryData,
    searchQuery,
    sortBy,
    minSalary,
    maxSalary
  }); */
  
  // Export salary data to CSV
  const exportSalaryData = useCallback(() => {
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
    // Clean up the URL object after download
    URL.revokeObjectURL(url);
  }, [salaryData, selectedMonth]);
  
  // Get previous month in YYYY-MM format
  const getPreviousMonth = useCallback((monthStr: string): string => {
    const [year, month] = monthStr.split('-').map(Number);
    const prevDate = new Date(year, month - 2); // Months are 0-indexed in Date
    return `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
  }, []);
  
  // Calculate month-over-month changes for an employee
  const getMonthlyChange = useCallback((employeeId: string): number | null => {
    const currentData = salaryData.find(s => s.id === employeeId);
    const prevMonth = getPreviousMonth(selectedMonth);
    const prevData = historicalData[prevMonth]?.find(s => s.id === employeeId);
    
    if (!currentData || !prevData) return null;
    return currentData.total - prevData.total;
  }, [salaryData, selectedMonth, historicalData, getPreviousMonth]);
  
  // Add state for search query (if not present)
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="space-y-6">
      {/* Unified Responsive Header */}
      <div className="space-y-4">
        {/* Month Selector with Visual Enhancement - Responsive */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-lg shadow-sm border border-slate-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1))}
            aria-label="Previous month"
            className="h-10 w-10 hover:bg-white/80"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center flex-1">
            <h2 className="font-semibold text-base md:text-xl">
              {pickerDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            {lastRefresh && (
              <p className="text-xs text-muted-foreground hidden md:block">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1))}
            aria-label="Next month"
            className="h-10 w-10 hover:bg-white/80"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Enhanced Stats Cards with Hierarchy Indicators - Responsive Grid */}
        <div className="flex overflow-x-auto pb-2 gap-3 snap-x scrollbar-thin scrollbar-thumb-muted overflow-y-hidden touch-pan-x">
          {/* Primary Metric - Total Payout */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 min-w-[180px] w-[180px] flex-shrink-0 shadow-sm border border-blue-200 snap-start relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-bl-md rounded-tr-md font-medium">
              Primary
            </div>
            <div className="text-xs text-blue-700 font-medium flex items-center mt-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
              Total Payout
            </div>
            <div className="text-lg font-bold mt-1 text-blue-900">{filteredStats.totalPayout.toLocaleString()} SAR</div>
            <div className="mt-1 text-xs text-blue-700 opacity-90">
              {filteredStats.totalSales > 0 && 
                `${((filteredStats.totalPayout / filteredStats.totalSales) * 100).toFixed(1)}% of sales`
              }
            </div>
          </div>
          
          {/* Secondary Metric - Employee Count */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 min-w-[180px] w-[180px] flex-shrink-0 shadow-sm border border-purple-200 snap-start">
            <div className="text-xs text-purple-700 font-medium flex items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>
              Employees
            </div>
            <div className="text-lg font-bold mt-1 text-purple-900">{filteredStats.employeeCount}</div>
            <div className="mt-1 text-xs text-purple-700 opacity-80">
              Avg: {filteredStats.avgSalary.toLocaleString()} SAR
            </div>
          </div>
          
          {/* Tertiary Metric - Sales Performance */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 min-w-[180px] w-[180px] flex-shrink-0 shadow-sm border border-green-200 snap-start">
            <div className="text-xs text-green-700 font-medium flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
              Total Sales
            </div>
            <div className="text-lg font-bold mt-1 text-green-900">{filteredStats.totalSales.toLocaleString()} SAR</div>
            <div className="mt-1 text-xs text-green-700 opacity-80">
              {filteredStats.employeeCount > 0 && 
                `Per employee: ${(filteredStats.totalSales / filteredStats.employeeCount).toFixed(0).toLocaleString()} SAR`
              }
            </div>
          </div>
          
          {/* Tertiary Metric - Commission Data */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 min-w-[180px] w-[180px] flex-shrink-0 shadow-sm border border-amber-200 snap-start">
            <div className="text-xs text-amber-700 font-medium flex items-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></div>
              Total Commission
            </div>
            <div className="text-lg font-bold mt-1 text-amber-900">
              {totalCommission.toLocaleString()} SAR
            </div>
            <div className="mt-1 text-xs text-amber-700 opacity-80">
              {filteredStats.totalPayout > 0 && 
                `${((totalCommission / filteredStats.totalPayout) * 100).toFixed(0)}% of payout`
              }
            </div>
          </div>
          
          {/* Quaternary Metric - Bonus Data */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 min-w-[180px] w-[180px] flex-shrink-0 shadow-sm border border-indigo-200 snap-start">
            <div className="text-xs text-indigo-700 font-medium flex items-center">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></div>
              Total Bonuses
            </div>
            <div className="text-lg font-bold mt-1 text-indigo-900">
              {totalBonus.toLocaleString()} SAR
            </div>
          </div>
        </div>
        
        {/* Mobile Indicator for Available Cards */}
        <div className="flex justify-center md:hidden">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <div className="w-2 h-2 rounded-full bg-muted opacity-50"></div>
            <div className="w-2 h-2 rounded-full bg-muted opacity-50"></div>
          </div>
          <div className="text-xs text-muted-foreground ml-1">Swipe for more</div>
        </div>
        
        {/* Enhanced Search with Better Visual Prominence */}
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="search"
            placeholder="Search employees by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-input bg-white rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      
      {/* Tabs and Content */}
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
              <TabsTrigger value="salary-history" className="flex items-center gap-1 min-w-max">
                <History className="h-4 w-4 mr-1" />
                Salary History
              </TabsTrigger>
            </TabsList>
            {salaryTab === "overview" && !isLoading && salaryData.length > 0 && !selectedEmployeeId && (
              <div className="hidden md:flex items-center gap-2">
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
              </div>
            )}
          </div>
        </div>
        
        <TabsContent value="overview">
          <Separator className="my-4" />
          
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
        
        <TabsContent value="salary-history">
          <SalaryHistory 
            selectedMonth={selectedMonth} 
            pickerDate={pickerDate} 
          />
        </TabsContent>
      </Tabs>
      
      {/* Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          <button 
            className="flex flex-col items-center justify-center w-16 h-16 text-xs"
            onClick={exportSalaryData}
            aria-label="Export data"
          >
            <Download className="h-5 w-5 mb-1" />
            <span>Export</span>
          </button>
          
          <button 
            className="flex flex-col items-center justify-center w-16 h-16 text-xs"
            onClick={() => refreshData()}
            aria-label="Refresh data"
          >
            <RefreshCw className="h-5 w-5 mb-1" />
            <span>Refresh</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center w-16 h-16 text-xs ${autoRefresh ? 'text-primary' : ''}`}
            onClick={toggleAutoRefresh}
            aria-label={autoRefresh ? "Turn off auto refresh" : "Turn on auto refresh"}
          >
            <Clock className={`h-5 w-5 mb-1 ${autoRefresh ? 'text-primary' : ''}`} />
            <span>Auto</span>
            {lastRefresh && autoRefresh && (
              <span className="text-[10px] text-muted-foreground">
                {lastRefresh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
          </button>
          
          <button 
            className="flex flex-col items-center justify-center w-16 h-16 text-xs"
            aria-label="Filter"
          >
            <Filter className="h-5 w-5 mb-1" />
            <span>Filter</span>
          </button>
        </div>
      </div>
      
      {/* Add padding at the bottom to prevent content from being hidden behind the mobile action bar */}
      <div className="h-16 md:h-0 block md:hidden" aria-hidden="true"></div>
    </div>
  );
});

SalaryDashboard.displayName = 'SalaryDashboard';
