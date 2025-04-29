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
import { ArrowUp, ArrowDown, ChevronRight, FileText } from 'lucide-react';
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
        .select('id, name, name_ar, branch_id, role, email, salary_plan_id');
      
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

  return (
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
            <TableRow key={employee.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEmployeeSelect(employee.id)}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell className="text-right">
                {employee.salesAmount ? `${employee.salesAmount.toLocaleString()} SAR` : '-'}
              </TableCell>
              <TableCell className="text-right">{employee.baseSalary.toLocaleString()} SAR</TableCell>
              <TableCell className="text-right">{employee.commission.toLocaleString()} SAR</TableCell>
              <TableCell className="text-right">
                {(employee.bonus || 0) + (employee.targetBonus || 0) > 0
                  ? `${((employee.bonus || 0) + (employee.targetBonus || 0)).toLocaleString()} SAR`
                  : '-'
                }
              </TableCell>
              <TableCell className="text-right">
                {employee.deductions > 0 ? `${employee.deductions.toLocaleString()} SAR` : '-'}
              </TableCell>
              <TableCell className="text-right">
                {employee.loans > 0 ? `${employee.loans.toLocaleString()} SAR` : '-'}
              </TableCell>
              <TableCell className="text-right font-medium">
                <div className="flex items-center justify-end gap-1">
                  {employee.total.toLocaleString()} SAR
                  {hasMonthlySalaryChange && (
                    <span 
                      className={monthlyChange && monthlyChange > 0 ? "text-green-600" : "text-red-600"}
                      title={`Change from previous month: ${monthlyChange?.toLocaleString()} SAR`}
                    >
                      {monthlyChange && monthlyChange > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end">
                  <Dialog open={dialogOpen[employee.id]} onOpenChange={(open) => {
                    setDialogOpen(prev => ({ ...prev, [employee.id]: open }));
                    if (open) {
                      setSelectedEmployeeForPayslip(employee.id);
                      setIsPayslipLoading(true);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDialogOpen(prev => ({ ...prev, [employee.id]: true }));
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl" onPointerDownOutside={(e) => {
                      e.preventDefault();
                    }}>
                      <DialogHeader>
                        <DialogTitle>Payslip - {employee.name}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
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
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
