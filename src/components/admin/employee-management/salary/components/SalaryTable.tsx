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
import { ArrowUp, ArrowDown, FileText } from 'lucide-react';
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
          return (
            <div
              key={employee.id}
              className="rounded-xl border bg-background p-4 flex flex-col gap-2 shadow-sm"
              tabIndex={0}
              aria-label={`Salary card for ${employee.name}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {employeeDetails?.photo_url ? (
                  <img
                    src={employeeDetails.photo_url}
                    alt={employee.name}
                    className="h-12 w-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {employee.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{employee.name}</div>
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
                      className="h-11 w-11"
                      aria-label="View Payslip"
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-full max-h-[90vh] p-0 rounded-t-2xl sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Payslip - {employee.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      {isPayslipLoading || isSalaryPlanLoading ? (
                        <div className="flex justify-center py-8">
                          <Skeleton className="h-96 w-full" />
                        </div>
                      ) : (
                        <PayslipTemplateViewer
                          key={`payslip-${employee.id}`}
                          payslipData={buildPayslipData(employee)}
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Sales</div>
                  <div className="font-medium">{employee.salesAmount ? `${employee.salesAmount.toLocaleString()} SAR` : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Base Salary</div>
                  <div className="font-medium">{employee.baseSalary.toLocaleString()} SAR</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Commission</div>
                  <div className="font-medium">{employee.commission.toLocaleString()} SAR</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Bonuses</div>
                  <div className="font-medium">{(employee.bonus || 0) + (employee.targetBonus || 0) > 0 ? `${((employee.bonus || 0) + (employee.targetBonus || 0)).toLocaleString()} SAR` : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Deductions</div>
                  <div className="font-medium">{employee.deductions > 0 ? `${employee.deductions.toLocaleString()} SAR` : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Loans</div>
                  <div className="font-medium">{employee.loans > 0 ? `${employee.loans.toLocaleString()} SAR` : '-'}</div>
                </div>
                <div className="col-span-2 flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="flex items-center gap-1 font-bold text-base">
                    {employee.total.toLocaleString()} SAR
                    {hasMonthlySalaryChange && (
                      <span
                        className={monthlyChange && monthlyChange > 0 ? 'text-green-600' : 'text-red-600'}
                        title={`Change from previous month: ${monthlyChange?.toLocaleString()} SAR`}
                      >
                        {monthlyChange && monthlyChange > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Desktop Table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Base Salary</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Bonuses</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Loans</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryData.map((employee) => {
              const monthlyChange = getMonthlyChange?.(employee.id);
              const hasMonthlySalaryChange = monthlyChange !== null && monthlyChange !== 0;
              return (
                <TableRow key={employee.id}>
                  <TableCell
                    className="font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    {employee.name}
                  </TableCell>
                  <TableCell
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    {employee.salesAmount ? `${employee.salesAmount.toLocaleString()} SAR` : '-'}
                  </TableCell>
                  <TableCell
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    {employee.baseSalary.toLocaleString()} SAR
                  </TableCell>
                  <TableCell
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    {employee.commission.toLocaleString()} SAR
                  </TableCell>
                  <TableCell
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    {(employee.bonus || 0) + (employee.targetBonus || 0) > 0
                      ? `${((employee.bonus || 0) + (employee.targetBonus || 0)).toLocaleString()} SAR`
                      : '-'
                    }
                  </TableCell>
                  <TableCell
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    {employee.deductions > 0 ? `${employee.deductions.toLocaleString()} SAR` : '-'}
                  </TableCell>
                  <TableCell
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    {employee.loans > 0 ? `${employee.loans.toLocaleString()} SAR` : '-'}
                  </TableCell>
                  <TableCell
                    className="text-right font-medium cursor-pointer hover:bg-muted/50"
                    onClick={() => onEmployeeSelect(employee.id)}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {employee.total.toLocaleString()} SAR
                      {hasMonthlySalaryChange && (
                        <span
                          className={monthlyChange && monthlyChange > 0 ? 'text-green-600' : 'text-red-600'}
                          title={`Change from previous month: ${monthlyChange?.toLocaleString()} SAR`}
                        >
                          {monthlyChange && monthlyChange > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Dialog
                        open={dialogOpen[employee.id]}
                        onOpenChange={(open) => {
                          setDialogOpen(prev => ({ ...prev, [employee.id]: open }));
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
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Payslip - {employee.name}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            {isPayslipLoading || isSalaryPlanLoading ? (
                              <div className="flex justify-center py-8">
                                <Skeleton className="h-96 w-full" />
                              </div>
                            ) : (
                              <PayslipTemplateViewer
                                key={`payslip-${employee.id}`}
                                payslipData={buildPayslipData(employee)}
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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
};
