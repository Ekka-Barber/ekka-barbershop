import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, FileText, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';
import { EmployeeSalary } from '../hooks/utils/salaryTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PayslipTemplateViewer from './PayslipTemplateViewer';
import { useSalaryData } from '../hooks/useSalaryData';
import { PayslipData } from '@/types/payslip';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaymentConfirmation } from '../PaymentConfirmation';
import { format } from 'date-fns';

interface SalaryTableProps {
  salaryData: EmployeeSalary[];
  isLoading: boolean;
  onEmployeeSelect: (employeeId: string) => void;
  getMonthlyChange?: (employeeId: string) => number | null;
}

interface EmployeeQueryResult {
  id: string;
  name: string;
  name_ar?: string;
  branch_id?: string;
  role?: string;
  email?: string;
  salary_plan_id?: string;
  photo_url?: string;
}

export const SalaryTable = React.memo(({
  salaryData,
  isLoading,
  onEmployeeSelect,
  getMonthlyChange
}: SalaryTableProps) => {
  const [selectedEmployeeForPayslip, setSelectedEmployeeForPayslip] = useState<string | null>(null);
  const [isPayslipLoading, setIsPayslipLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState<Record<string, boolean>>({});
  
  // Get transactions for the selected employee and current month
  const { getEmployeeTransactions } = useSalaryData({
    employees: [],
    selectedMonth: new Date().toISOString().slice(0, 7) // YYYY-MM
  });
  
  // Fetch complete employee data
  const { data: employeesData = [] } = useQuery<EmployeeQueryResult[]>({
    queryKey: ['employees-for-payslip'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, name_ar, branch_id, role, email, salary_plan_id, photo_url');
      
      if (error) throw error;
      return (data || []) as unknown as EmployeeQueryResult[];
    }
  });

  // Fetch branches for getting proper branch names
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-for-payslip'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name_ar');
      if (error) throw error;
      return data || [];
    },
  });
  
  // Get branch name from ID
  const getBranchNameAr = (branchId?: string): string => {
    if (!branchId) return 'Unknown';
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name_ar : 'Unknown';
  };
  
  // Get employee details from ID
  const getEmployeeDetails = (id: string): EmployeeQueryResult | undefined => {
    return employeesData.find(emp => emp.id === id);
  };

  // Fetch salary plan for the selected employee
  const { data: salaryPlan, isLoading: isSalaryPlanLoading } = useQuery({
    queryKey: ['employee-salary-plan', selectedEmployeeForPayslip],
    queryFn: async () => {
      if (!selectedEmployeeForPayslip) return null;
      
      const employee = getEmployeeDetails(selectedEmployeeForPayslip);
      if (!employee?.salary_plan_id) return null;
      
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*')
        .eq('id', employee.salary_plan_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedEmployeeForPayslip
  });
  
  // Use effect to manage loading state
  React.useEffect(() => {
    if (!isSalaryPlanLoading) {
      setIsPayslipLoading(false);
    }
  }, [isSalaryPlanLoading]);
  
  // Reset payslip state when dialog closes
  React.useEffect(() => {
    // Check if any dialog was just closed
    const anyDialogOpen = Object.values(dialogOpen).some(isOpen => isOpen);
    if (!anyDialogOpen) {
      // Reset selected employee and loading state when all dialogs are closed
      setTimeout(() => {
        setSelectedEmployeeForPayslip(null);
        setIsPayslipLoading(false);
      }, 300); // Small delay to ensure dialog is fully closed
    }
  }, [dialogOpen]);
  
  // Build payslip data for the selected employee
  const buildPayslipData = (employee: EmployeeSalary): PayslipData | null => {
    if (!employee) return null;
    
    const transactions = getEmployeeTransactions(employee.id);
    const employeeDetails = getEmployeeDetails(employee.id);
    
    if (!employeeDetails) {
      console.error("Employee details not found for:", employee.id);
      return null;
    }
    
    // Format salary plan data correctly
    let formattedSalaryPlan = null;
    if (salaryPlan && selectedEmployeeForPayslip === employee.id) {
      formattedSalaryPlan = {
        id: salaryPlan.id,
        name: salaryPlan.name,
        type: salaryPlan.type as 'fixed' | 'dynamic_basic',
        config: salaryPlan.config
      };
    }
    
    return {
      companyName: 'Ekka Barbershop',
      companyLogoUrl: '/lovable-uploads/2ea1f72e-efd2-4345-bf4d-957efd873986.png',
      payPeriod: new Date().toISOString().slice(0, 7),
      issueDate: new Date().toISOString().slice(0, 10),
      employee: {
        nameAr: employeeDetails.name_ar || employeeDetails.name,
        branch: getBranchNameAr(employeeDetails.branch_id),
        role: employeeDetails.role || 'Employee',
        email: employeeDetails.email || '',
        salary_plan_id: employeeDetails.salary_plan_id || '',
        salaryPlan: formattedSalaryPlan
      },
      bonuses: transactions.bonuses.map(b => ({
        description: b.description,
        amount: b.amount,
        date: b.date,
      })),
      deductions: transactions.deductions.map(d => ({
        description: d.description,
        amount: d.amount,
        date: d.date,
      })),
      loans: transactions.loans.map(l => ({
        description: l.description,
        amount: l.amount,
        date: l.date,
      })),
      totalSales: transactions.salesData?.sales_amount || 0,
      summary: {
        totalEarnings: employee.baseSalary + employee.commission + (employee.bonus || 0) + (employee.targetBonus || 0),
        totalDeductions: employee.deductions + employee.loans,
        netSalary: employee.total,
      },
    };
  };

  // Toggle card expansion
  const toggleCardExpansion = useCallback((employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setExpandedCards(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  }, []);

  // Payment confirmation handler
  const handlePaymentConfirm = useCallback(
    async (paymentDate: Date, employeeId: string, employeeData: EmployeeSalary, employeeDetailsFromQuery: EmployeeQueryResult | undefined): Promise<boolean> => {
      if (!employeeId || !employeeData || !paymentDate) {
        console.error('[SalaryTable] Missing paymentDate, employeeId, or employeeData for payment confirmation.');
        return false;
      }

      // Validate critical numeric data
      if (isNaN(employeeData.baseSalary)) {
        console.error('[SalaryTable] baseSalary is NaN for employeeId:', employeeId, 'employeeData:', employeeData);
        return false;
      }
      // Add similar checks for other critical numeric fields if necessary, e.g., employeeData.total
      if (isNaN(employeeData.total)) {
        console.error('[SalaryTable] total salary is NaN for employeeId:', employeeId, 'employeeData:', employeeData);
        // total_salary is nullable in DB, but usually good to ensure it's a number if being processed
      }

      // Access salaryPlan state if the confirmed employee is the one selected for payslip
      const currentSalaryPlanName = 
        selectedEmployeeForPayslip === employeeId && salaryPlan 
        ? salaryPlan.name 
        : null;

      const recordToInsertObject = {
        employee_id: employeeId,
        employee_name: employeeData.name,
        effective_date: format(paymentDate, 'yyyy-MM-dd'),
        base_salary: employeeData.baseSalary,
        month: format(paymentDate, 'yyyy-MM'),
        change_type: 'salary_payout',
        commission: employeeData.commission || 0,
        bonus: (employeeData.bonus || 0) + (employeeData.targetBonus || 0),
        deductions: employeeData.deductions || 0,
        loans: employeeData.loans || 0,
        sales_amount: employeeData.salesAmount || 0,
        salary_plan_id: employeeDetailsFromQuery?.salary_plan_id || null,
        salary_plan_name: currentSalaryPlanName,
      };

      console.log('[SalaryTable] Attempting to insert into salary_history:', recordToInsertObject);

      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('[SalaryTable] Error fetching Supabase user before insert:', authError);
      } else if (!currentUser) {
        console.error('[SalaryTable] No Supabase user session found before insert. User is likely not authenticated.');
      } else {
        console.log('[SalaryTable] Current Supabase user before insert: ID:', currentUser.id, 'Role:', currentUser.role, 'Email:', currentUser.email);
      }

      try {
        const { data, error } = await supabase
          .from('salary_history')
          .insert([recordToInsertObject])
          .select();

        if (error) {
          console.error('[SalaryTable] Error saving payment to salary_history. Supabase error:', error);
          // Log all available error details
          console.error(`[SalaryTable] Supabase error details: Message: ${error.message}, Details: ${error.details}, Code: ${error.code}, Hint: ${error.hint}`);
          return false;
        }

        console.log('[SalaryTable] Payment saved to salary_history:', data);
        return true;
      } catch (err) {
        console.error('[SalaryTable] Unexpected error during payment confirmation:', err);
        return false;
      }
    },
    [supabase, selectedEmployeeForPayslip, salaryPlan] // Added dependencies
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (salaryData.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No salary data available for the selected month.
      </div>
    );
  }

  // MOBILE CARD VIEW
  return (
    <>
      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-4">
        {salaryData.map((employee) => {
          const monthlyChange = getMonthlyChange?.(employee.id);
          const hasMonthlySalaryChange = monthlyChange !== null && monthlyChange !== 0;
          const employeeDetails = getEmployeeDetails(employee.id);
          const isExpanded = expandedCards[employee.id] || false;
          
          return (
            <div
              key={employee.id}
              className="rounded-xl border bg-background p-4 flex flex-col gap-2 shadow-sm relative overflow-hidden"
            >
              {/* Profile Row */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onEmployeeSelect(employee.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onEmployeeSelect(employee.id)} aria-label={`Select employee ${employee.name}`}>
                <img 
                  src={employeeDetails?.photo_url || '/placeholder-avatar.png'} 
                  alt={employee.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-sm leading-tight">{employee.name}</h3>
                  <p className="text-xs text-muted-foreground leading-tight">{employeeDetails?.role || 'N/A'}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-sm">SAR {employee.total.toFixed(2)}</span>
                  {hasMonthlySalaryChange && (
                    <span className={`text-xs ${monthlyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {monthlyChange > 0 ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
                      {Math.abs(monthlyChange).toFixed(2)}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => toggleCardExpansion(employee.id, e)} className="ml-auto">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
              </div>

              {/* Expanded Content (Collapsible) */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-dashed">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="text-muted-foreground">Base Salary:</div>
                    <div className="text-right">SAR {employee.baseSalary.toFixed(2)}</div>
                    
                    <div className="text-muted-foreground">Commission:</div>
                    <div className="text-right">SAR {employee.commission.toFixed(2)}</div>

                    { (employee.bonus ?? 0) > 0 && (
                      <>
                        <div className="text-muted-foreground">Bonus:</div>
                        <div className="text-right">SAR {employee.bonus?.toFixed(2)}</div>
                      </>
                    )}
                    { (employee.targetBonus ?? 0) > 0 && (
                      <>
                        <div className="text-muted-foreground">Target Bonus:</div>
                        <div className="text-right">SAR {employee.targetBonus?.toFixed(2)}</div>
                      </>
                    )}

                    <div className="text-muted-foreground">Deductions:</div>
                    <div className="text-right text-red-500">SAR {employee.deductions.toFixed(2)}</div>

                    <div className="text-muted-foreground">Loans:</div>
                    <div className="text-right text-red-500">SAR {employee.loans.toFixed(2)}</div>

                    { (employee.salesAmount ?? 0) > 0 && (
                        <>
                            <div className="text-muted-foreground">Sales:</div>
                            <div className="text-right">SAR {employee.salesAmount?.toFixed(2)}</div>
                        </>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <Dialog 
                      open={dialogOpen[employee.id] || false} 
                      onOpenChange={(isOpen) => setDialogOpen(prev => ({ ...prev, [employee.id]: isOpen }))}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedEmployeeForPayslip(employee.id);
                            setIsPayslipLoading(true);
                          }}
                          aria-label={`View payslip for ${employee.name}`}
                          disabled={isPayslipLoading && selectedEmployeeForPayslip === employee.id}
                        >
                          {isPayslipLoading && selectedEmployeeForPayslip === employee.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                            </>
                          ) : (
                            <FileText size={16} className="mr-1.5" />
                          )}
                          Payslip
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Payslip - {employee.name}</DialogTitle>
                        </DialogHeader>
                        {selectedEmployeeForPayslip === employee.id && !isPayslipLoading && (
                          <PayslipTemplateViewer payslipData={buildPayslipData(employee)} />
                        )}
                        {(isPayslipLoading && selectedEmployeeForPayslip === employee.id) && <Skeleton className="w-full h-[500px]" />}
                      </DialogContent>
                    </Dialog>

                    {/* Button to trigger PaymentConfirmation dialog */}
                    <Button 
                      variant="default"
                      size="sm" 
                      aria-label={`Confirm payment for ${employee.name}`}
                      onClick={() => setPaymentConfirmationOpen(prev => ({ ...prev, [employee.id]: true}))}
                    >
                      <CheckSquare size={16} className="mr-1.5" />
                      Confirm Payment
                    </Button>

                    {/* PaymentConfirmation Dialog for mobile view*/}
                    <PaymentConfirmation
                      isOpen={paymentConfirmationOpen[employee.id] || false}
                      onClose={() => setPaymentConfirmationOpen(prev => ({ ...prev, [employee.id]: false }))}
                      totalAmount={employee.total}
                      employeeCount={1} // For a single employee
                      onConfirm={(paymentDateFromDialog) => 
                        handlePaymentConfirm(paymentDateFromDialog, employee.id, employee, getEmployeeDetails(employee.id))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Employee</TableHead>
              <TableHead className="text-right">Net Salary</TableHead>
              <TableHead className="text-right">Base Salary</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Bonus</TableHead>
              <TableHead className="text-right">Target Bonus</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Loans</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-center w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryData.map((employee) => {
              const monthlyChange = getMonthlyChange?.(employee.id);
              const hasMonthlySalaryChange = monthlyChange !== null && monthlyChange !== 0;
              const employeeDetails = getEmployeeDetails(employee.id);

              return (
                <TableRow 
                  key={employee.id} 
                  onClick={() => onEmployeeSelect(employee.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={employeeDetails?.photo_url || '/placeholder-avatar.png'} 
                        alt={employee.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-muted-foreground">{employeeDetails?.role || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">SAR {employee.total.toFixed(2)}</div>
                    {hasMonthlySalaryChange && (
                      <span className={`text-xs ${monthlyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {monthlyChange > 0 ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
                        {Math.abs(monthlyChange).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">SAR {employee.baseSalary.toFixed(2)}</TableCell>
                  <TableCell className="text-right">SAR {employee.commission.toFixed(2)}</TableCell>
                  <TableCell className="text-right">SAR {(employee.bonus || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">SAR {(employee.targetBonus || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right text-red-500">SAR {employee.deductions.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-red-500">SAR {employee.loans.toFixed(2)}</TableCell>
                  <TableCell className="text-right">SAR {(employee.salesAmount || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Dialog 
                        open={dialogOpen[`desktop-${employee.id}`] || false} 
                        onOpenChange={(isOpen) => setDialogOpen(prev => ({ ...prev, [`desktop-${employee.id}`]: isOpen }))}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployeeForPayslip(employee.id);
                              setIsPayslipLoading(true);
                              setDialogOpen(prev => ({ ...prev, [`desktop-${employee.id}`]: true }));
                            }}
                            aria-label={`View payslip for ${employee.name}`}
                            disabled={isPayslipLoading && selectedEmployeeForPayslip === employee.id}
                          >
                            {isPayslipLoading && selectedEmployeeForPayslip === employee.id ? (
                              <svg className="animate-spin h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <FileText size={16} />
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payslip - {employee.name}</DialogTitle>
                          </DialogHeader>
                          {selectedEmployeeForPayslip === employee.id && !isPayslipLoading && (
                            <PayslipTemplateViewer payslipData={buildPayslipData(employee)} />
                          )}
                          {(isPayslipLoading && selectedEmployeeForPayslip === employee.id) && <Skeleton className="w-full h-[500px]" />}
                        </DialogContent>
                      </Dialog>

                      {/* Button to trigger PaymentConfirmation dialog */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label={`Confirm payment for ${employee.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentConfirmationOpen(prev => ({ ...prev, [`desktop-${employee.id}`]: true}));
                        }}
                      >
                        <CheckSquare size={16} />
                      </Button>

                      {/* PaymentConfirmation Dialog for desktop view*/}
                      <PaymentConfirmation
                        isOpen={paymentConfirmationOpen[`desktop-${employee.id}`] || false}
                        onClose={() => setPaymentConfirmationOpen(prev => ({ ...prev, [`desktop-${employee.id}`]: false }))}
                        totalAmount={employee.total}
                        employeeCount={1} // For a single employee
                        onConfirm={(paymentDateFromDialog) => 
                          handlePaymentConfirm(paymentDateFromDialog, employee.id, employee, getEmployeeDetails(employee.id))
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
});

SalaryTable.displayName = 'SalaryTable';
