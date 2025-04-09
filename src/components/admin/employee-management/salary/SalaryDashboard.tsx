
import { useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSalaryData } from './hooks/useSalaryData';
import { SalaryBreakdown } from './SalaryBreakdown';
import { SalaryVisualizations } from './SalaryVisualizations';
import { SalaryFilters } from './SalaryFilters';
import { PaymentConfirmation } from './PaymentConfirmation';
import { QuickFixDialog } from './QuickFixDialog';
import { SalaryDashboardHeader } from './components/SalaryDashboardHeader';
import { SalaryDebugPanel } from './components/SalaryDebugPanel';
import { SalaryDashboardStats } from './components/SalaryDashboardStats';
import { SalaryTable } from './components/SalaryTable';
import { useSalaryFiltering } from './hooks/useSalaryFiltering';
import { useDashboardStats } from './hooks/useDashboardStats';
import { exportSalaryDataToCSV } from './utils/exportUtils';

interface SalaryDashboardProps {
  employees: Employee[];
  selectedBranch: string | null;
  refetchEmployees: () => void;
}

export const SalaryDashboard = ({ 
  employees, 
  selectedBranch,
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
  
  // Use the filtering hook
  const { filteredSalaryData } = useSalaryFiltering({
    salaryData,
    searchQuery,
    sortBy,
    minSalary,
    maxSalary
  });
  
  // Calculate statistics for quick info
  const stats = useDashboardStats(salaryData);
  
  // Export salary data to CSV
  const exportToCSV = () => {
    exportSalaryDataToCSV(salaryData, selectedMonth);
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
      {/* Header section with title and actions */}
      <SalaryDashboardHeader
        selectedMonth={selectedMonth}
        handleMonthChange={handleMonthChange}
        pickerDate={pickerDate}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
        handleProcessPayments={handleProcessPayments}
        showProcessButton={!isLoading && salaryData.length > 0}
      />
      
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
        <SalaryDebugPanel 
          calculationErrors={calculationErrors}
          zeroSalaryEmployees={zeroSalaryEmployees}
          isLoading={isLoading}
          handleRefresh={handleRefresh}
          onFixEmployee={setSelectedFixEmployee}
        />
      )}
      
      {/* Quick Stats */}
      {!isLoading && salaryData.length > 0 && (
        <SalaryDashboardStats
          totalPayout={stats.totalPayout}
          avgSalary={stats.avgSalary}
          employeeCount={stats.employeeCount}
        />
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
            
            <SalaryTable 
              salaryData={filteredSalaryData}
              isLoading={isLoading}
              onEmployeeSelect={handleEmployeeSelect}
            />
          </CardContent>
        </Card>
        
        {/* Data Visualizations */}
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
