import React from 'react';
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
import { ArrowUp, ArrowDown, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { EmployeeSalary } from '../hooks/utils/salaryTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PayslipTemplateViewer from './PayslipTemplateViewer';
import { useSalaryData } from '../hooks/useSalaryData';
import { PayslipData } from '@/types/payslip';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const SalaryTable = ({
  salaryData,
  isLoading,
  onEmployeeSelect,
  getMonthlyChange
}: SalaryTableProps) => {
  const [selectedEmployeeForPayslip, setSelectedEmployeeForPayslip] = React.useState<string | null>(null);
  const [isPayslipLoading, setIsPayslipLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  
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
  const toggleCardExpansion = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setExpandedCards(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

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
              {/* Essential Information - Always Visible */}
              <div 
                className="flex items-center gap-3 mb-1"
                onClick={() => onEmployeeSelect(employee.id)}
              >
                {employeeDetails?.photo_url ? (
                  <div className="h-14 w-14 rounded-full border-2 border-muted/40 overflow-hidden flex-shrink-0">
                    <img
                      src={employeeDetails.photo_url}
                      alt={employee.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground flex-shrink-0 border-2 border-muted/40">
                    {employee.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0 pr-10">
                  <div className="font-semibold truncate text-base">{employee.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{getBranchNameAr(employeeDetails?.branch_id)}</div>
                </div>
                <Dialog
                  open={dialogOpen[employee.id]}
                  onOpenChange={(open) => {
                    setDialogOpen((prev) => ({ ...prev, [employee.id]: open }));
                    if (open) {
                      setSelectedEmployeeForPayslip(employee.id);
                      setIsPayslipLoading(true);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 absolute right-2 top-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Payslip for {employee.name}</DialogTitle>
                    </DialogHeader>
                    {isPayslipLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <Skeleton className="h-full w-full" />
                      </div>
                    ) : (
                      <PayslipTemplateViewer payslipData={buildPayslipData(employee)} />
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {/* Total Salary & Change - Always Visible */}
              <div className="flex justify-between items-center py-2 border-t border-b">
                <div>
                  <div className="text-xs text-muted-foreground">Total Salary</div>
                  <div className="text-xl font-bold">{employee.total.toLocaleString()} SAR</div>
                </div>
                {hasMonthlySalaryChange && (
                  <div className={`flex items-center ${monthlyChange! > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthlyChange! > 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {Math.abs(monthlyChange!).toLocaleString()} SAR
                    </span>
                  </div>
                )}
              </div>

              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-center py-1 mt-1 mb-0 w-full"
                onClick={(e) => toggleCardExpansion(employee.id, e)}
              >
                <span className="mr-1 text-xs">
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {/* Expanded Details - Only visible when expanded */}
              {isExpanded && (
                <div className="pt-2 space-y-3 text-sm animate-in fade-in-50 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Base Salary</div>
                      <div className="font-medium">{employee.baseSalary.toLocaleString()} SAR</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Commission</div>
                      <div className="font-medium">{employee.commission.toLocaleString()} SAR</div>
                    </div>
                    {(employee.bonus > 0 || employee.targetBonus > 0) && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-700">Bonuses</div>
                        <div className="font-medium text-green-700">
                          {((employee.bonus || 0) + (employee.targetBonus || 0)).toLocaleString()} SAR
                        </div>
                      </div>
                    )}
                    {(employee.deductions > 0 || employee.loans > 0) && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-xs text-red-700">Deductions & Loans</div>
                        <div className="font-medium text-red-700">
                          {(employee.deductions + employee.loans).toLocaleString()} SAR
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Sales Amount</span>
                      <span className="font-medium">{employee.salesAmount.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Net Salary</span>
                      <span className="font-bold">{employee.total.toLocaleString()} SAR</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View - Keep the existing table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Base Salary</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Bonus</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">MoM Change</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryData.map((employee) => {
              const monthlyChange = getMonthlyChange?.(employee.id);
              const hasMonthlySalaryChange = monthlyChange !== null && monthlyChange !== 0;
              
              return (
                <TableRow 
                  key={employee.id}
                  className="cursor-pointer"
                  onClick={() => onEmployeeSelect(employee.id)}
                >
                  <TableCell className="font-medium">
                    {employee.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.baseSalary.toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.commission.toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-right">
                    {((employee.bonus || 0) + (employee.targetBonus || 0)).toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {(employee.deductions + employee.loans).toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {employee.total.toLocaleString()} SAR
                  </TableCell>
                  <TableCell className="text-right">
                    {hasMonthlySalaryChange && (
                      <div className={`flex items-center justify-end ${monthlyChange! > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyChange! > 0 ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span>
                          {Math.abs(monthlyChange!).toLocaleString()} SAR
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={dialogOpen[employee.id]}
                      onOpenChange={(open) => {
                        setDialogOpen((prev) => ({ ...prev, [employee.id]: open }));
                        if (open) {
                          setSelectedEmployeeForPayslip(employee.id);
                          setIsPayslipLoading(true);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Payslip for {employee.name}</DialogTitle>
                        </DialogHeader>
                        {isPayslipLoading ? (
                          <div className="flex items-center justify-center h-64">
                            <Skeleton className="h-full w-full" />
                          </div>
                        ) : (
                          <PayslipTemplateViewer payslipData={buildPayslipData(employee)} />
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
