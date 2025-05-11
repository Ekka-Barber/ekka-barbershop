import React from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Mail, X } from 'lucide-react';
import { EmployeeMonthlySalary } from '../types';

interface SalaryHistoryDetailDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  salaryRecord: EmployeeMonthlySalary | null;
  calculationDetails?: Record<string, unknown> | null;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const SalaryHistoryDetailDrawer: React.FC<SalaryHistoryDetailDrawerProps> = ({
  isOpen,
  onOpenChange,
  salaryRecord,
  calculationDetails
}) => {
  if (!salaryRecord) return null;

  // Format month/year for display
  const monthYear = salaryRecord.month_year;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [year, month] = monthYear.split('-');
  const monthName = monthNames[parseInt(month) - 1];
  const formattedMonthYear = `${monthName} ${year}`;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left border-b pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl">Salary Payment Details</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription className="mt-2">
            {salaryRecord.employee_name_snapshot} - {formattedMonthYear}
          </DrawerDescription>
        </DrawerHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)] px-6 py-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Payment Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employee</p>
                  <p className="font-medium">{salaryRecord.employee_name_snapshot}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{formatDate(salaryRecord.payment_confirmation_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pay Period</p>
                  <p className="font-medium">{formattedMonthYear}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Salary Plan</p>
                  <p className="font-medium">{salaryRecord.salary_plan_name_snapshot || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Salary Components</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Base Salary</p>
                  <p className="font-medium">{formatCurrency(salaryRecord.base_salary)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sales Amount</p>
                  <p className="font-medium">{formatCurrency(salaryRecord.sales_amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Commission</p>
                  <p className="font-medium">{formatCurrency(salaryRecord.commission_amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bonuses</p>
                  <p className="font-medium">{formatCurrency(salaryRecord.total_bonuses)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deductions</p>
                  <p className="font-medium">{formatCurrency(salaryRecord.total_deductions)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Loan Repayments</p>
                  <p className="font-medium">{formatCurrency(salaryRecord.total_loan_repayments)}</p>
                </div>
              </div>
              
              <div className="mt-4 bg-muted p-3 rounded-md flex justify-between items-center">
                <span className="font-semibold">Net Salary Paid</span>
                <span className="text-lg font-bold">{formatCurrency(salaryRecord.net_salary_paid)}</span>
              </div>
            </div>

            <Separator />

            {calculationDetails && (
              <div>
                <h3 className="text-lg font-medium mb-2">Calculation Details</h3>
                <div className="bg-muted/50 p-4 rounded-md">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(calculationDetails, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DrawerFooter className="border-t">
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download PDF Payslip</span>
            </Button>
            <Button className="w-full sm:w-auto flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Send Email Payslip</span>
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SalaryHistoryDetailDrawer; 