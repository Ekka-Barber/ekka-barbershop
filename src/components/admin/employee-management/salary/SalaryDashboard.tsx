import { useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MonthYearPicker } from '../MonthYearPicker';
import { useSalaryData } from './hooks/useSalaryData';
import { formatCurrency, getMonthDisplayName } from './SalaryUtils';
import { Loader2, Download, CreditCard, Bug, AlertCircle, Wrench, RefreshCw } from 'lucide-react';
import { SalaryBreakdown } from './SalaryBreakdown';
import { SalaryVisualizations } from './SalaryVisualizations';
import { SalaryFilters } from './SalaryFilters';
import { Button } from '@/components/ui/button';
import { PaymentConfirmation } from './PaymentConfirmation';
import { QuickFixDialog } from './QuickFixDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { salaryData, isLoading, getEmployeeTransactions, calculationErrors, refreshData } = useSalaryData({
    employees,
    selectedMonth
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('salary_desc');
  const [minSalary, setMinSalary] = useState<number | null>(null);
  const [maxSalary, setMaxSalary] = useState<number | null>(null);
  
  // Payment confirmation dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Debug mode
  const [debugMode, setDebugMode] = useState(false);
  const [selectedFixEmployee, setSelectedFixEmployee] = useState<{
    id: string;
    name: string;
    salaryPlanId: string | null;
  } | null>(null);
  
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
  
  // Apply filters and sort to the salary data
  const filteredSalaryData = useMemo(() => {
    if (!salaryData.length) return [];
    
    return salaryData
      .filter(employee => {
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (!employee.name.toLowerCase().includes(query)) {
            return false;
          }
        }
        
        // Apply salary range filter
        if (minSalary !== null && employee.total < minSalary) {
          return false;
        }
        
        if (maxSalary !== null && employee.total > maxSalary) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        switch (sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'salary_desc':
            return b.total - a.total;
          case 'salary_asc':
            return a.total - b.total;
          case 'commission_desc':
            return b.commission - a.commission;
          case 'base_desc':
            return b.baseSalary - a.baseSalary;
          default:
            return 0;
        }
      });
  }, [salaryData, searchQuery, sortBy, minSalary, maxSalary]);
  
  // Calculate statistics for quick info
  const stats = useMemo(() => {
    if (!salaryData.length) {
      return { totalPayout: 0, avgSalary: 0, employeeCount: 0 };
    }
    
    const totalPayout = salaryData.reduce((sum, employee) => sum + employee.total, 0);
    const avgSalary = totalPayout / salaryData.length;
    
    return {
      totalPayout,
      avgSalary,
      employeeCount: salaryData.length
    };
  }, [salaryData]);
  
  // Export salary data to CSV
  const exportToCSV = () => {
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
  
  // Handle process payments
  const handleProcessPayments = () => {
    setIsPaymentDialogOpen(true);
  };
  
  // Simulate payment processing
  const confirmPayments = async (): Promise<boolean> => {
    // Simulating API call
    return new Promise((resolve) => {
      // Simulate a delay
      setTimeout(() => {
        // Return success
        resolve(true);
      }, 2000);
    });
  };
  
  // Debug zero salary issues
  const zeroSalaryEmployees = useMemo(() => {
    if (!salaryData.length || !employees.length) return [];
    
    return salaryData
      .filter(emp => emp.total === 0)
      .map(emp => {
        const employeeDetails = employees.find(e => e.id === emp.id);
        return {
          id: emp.id,
          name: emp.name,
          hasSalaryPlanId: !!employeeDetails?.salary_plan_id,
          salaryPlanId: employeeDetails?.salary_plan_id || 'Not assigned'
        };
      });
  }, [salaryData, employees]);
  
  // Refresh data after fixing salary plan
  const handleFixSuccess = () => {
    refetchEmployees();
  };
  
  // Refresh data manually
  const handleRefresh = () => {
    refreshData();
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
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh salary data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <MonthYearPicker 
            selectedDate={pickerDate}
            onChange={handleMonthChange}
          />
          
          {!isLoading && salaryData.length > 0 && (
            <Button 
              onClick={handleProcessPayments}
              className="flex items-center gap-1"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Process Payments
            </Button>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Debug Toggle */}
      <div className="flex items-center justify-end space-x-2">
        <span className="text-sm text-muted-foreground">Debug Mode</span>
        <Switch 
          checked={debugMode} 
          onCheckedChange={setDebugMode} 
          aria-label="Toggle debug mode"
        />
        
        {calculationErrors.length > 0 && (
          <Badge variant="destructive" className="ml-2">
            {calculationErrors.length} Error{calculationErrors.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      {/* Debug Panel */}
      {debugMode && (
        <Card className="border-dashed border-yellow-500">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bug className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium">Salary Calculation Debug</h3>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh Data
              </Button>
            </div>
            
            {/* Calculation Errors Section */}
            {calculationErrors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Calculation Errors</h4>
                <div className="rounded-lg bg-red-50 p-3 space-y-3">
                  {calculationErrors.map((error, index) => (
                    <div key={index} className="text-sm space-y-1">
                      <p className="font-medium text-red-800">
                        {error.employeeName}: {error.error}
                      </p>
                      {error.details && (
                        <pre className="text-xs bg-white/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(error.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Zero Salary Employees Section */}
            {zeroSalaryEmployees.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Employees with Zero Salary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Employee</th>
                        <th className="text-left py-2 px-2">Has Salary Plan ID</th>
                        <th className="text-left py-2 px-2">Salary Plan ID</th>
                        <th className="text-right py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zeroSalaryEmployees.map(emp => (
                        <tr key={emp.id} className="border-b">
                          <td className="py-2 px-2">{emp.name}</td>
                          <td className="py-2 px-2">
                            {emp.hasSalaryPlanId ? 
                              <span className="text-green-600">Yes</span> : 
                              <span className="text-red-600">No</span>
                            }
                          </td>
                          <td className="py-2 px-2">{emp.salaryPlanId}</td>
                          <td className="py-2 px-2 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedFixEmployee({
                                id: emp.id,
                                name: emp.name,
                                salaryPlanId: emp.hasSalaryPlanId ? 
                                  String(emp.salaryPlanId) : null
                              })}
                              className="flex items-center gap-1"
                            >
                              <Wrench className="h-3 w-3" />
                              Fix
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800">Troubleshooting Steps:</p>
                      <ol className="list-decimal ml-5 space-y-1 mt-1 text-yellow-700">
                        <li>Click the "Fix" button to assign a valid salary plan to the employee</li>
                        <li>Ensure the salary plan exists in the database</li>
                        <li>Verify the salary plan has the correct configuration (base amount, commission rates, etc.)</li>
                        <li>Check if the correct calculator is being used for the plan type</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            ) : calculationErrors.length === 0 ? (
              <p className="text-sm">
                No issues found. All salary calculations appear to be working correctly.
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
      
      {/* Quick Stats */}
      {!isLoading && salaryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Payout</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalPayout)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgSalary)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Employee Count</p>
                <p className="text-2xl font-bold">{stats.employeeCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filters */}
      <SalaryFilters
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onMinSalaryChange={setMinSalary}
        onMaxSalaryChange={setMaxSalary}
      />
      
      <div className="grid grid-cols-1 gap-6">
        {/* Summary Dashboard */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Employee Salary Summary</h3>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                disabled={isLoading || salaryData.length === 0}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
            
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
                    {filteredSalaryData.length > 0 ? (
                      filteredSalaryData.map((salary) => (
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
                          {salaryData.length === 0 ? 'No salary data available' : 'No employees match the current filters'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Data Visualizations - Phase 3 */}
        <SalaryVisualizations 
          salaryData={filteredSalaryData}
          isLoading={isLoading}
        />
      </div>
      
      {/* Payment Confirmation Dialog */}
      <PaymentConfirmation 
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        totalAmount={stats.totalPayout}
        employeeCount={stats.employeeCount}
        onConfirm={confirmPayments}
      />
      
      {/* Quick Fix Dialog */}
      {selectedFixEmployee && (
        <QuickFixDialog
          isOpen={!!selectedFixEmployee}
          onClose={() => setSelectedFixEmployee(null)}
          employeeId={selectedFixEmployee.id}
          employeeName={selectedFixEmployee.name}
          currentSalaryPlanId={selectedFixEmployee.salaryPlanId}
          onSuccess={handleFixSuccess}
        />
      )}
    </div>
  );
}; 
