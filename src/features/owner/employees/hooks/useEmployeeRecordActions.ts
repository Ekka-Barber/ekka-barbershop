import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';
import { DynamicField } from '@shared/types/business';
import { Employee } from '@shared/types/domains';
import { logger } from '@shared/utils/logger';

// Employee is now imported from @/types/domains

export const useEmployeeRecordActions = (
  employees: Employee[],
  selectedMonth: string,
  clearDeductionsForEmployee?: (employeeName: string) => void,
  clearBonusesForEmployee?: (employeeName: string) => void,
  clearLoansForEmployee?: (employeeName: string) => void
) => {
  const { toast } = useToast();

  const saveDeductions = async (
    employeeName: string,
    deductions: DynamicField[]
  ) => {
    const employee = employees?.find((emp) => emp.name === employeeName);
    if (!employee || !deductions.length) return;

    const { error } = await supabase.from('employee_deductions').insert(
      deductions.map((deduction) => ({
        employee_id: employee.id,
        employee_name: employeeName,
        description: deduction.description,
        amount: Number(deduction.amount),
        date: new Date().toISOString(),
      }))
    );

    if (error) {
      logger.error('Error saving deductions:', { error: error.message });
      toast({
        title: 'Error',
        description: 'Failed to save deductions',
        variant: 'destructive',
      });
      return;
    }

    // Clear the form fields for this employee after successful save
    if (clearDeductionsForEmployee) {
      clearDeductionsForEmployee(employeeName);
    }

    toast({
      title: 'Success',
      description: 'Deductions saved successfully',
    });
  };

  const saveBonuses = async (employeeName: string, bonuses: DynamicField[]) => {
    const employee = employees?.find((emp) => emp.name === employeeName);
    if (!employee || !bonuses.length) return;

    const { error } = await supabase.from('employee_bonuses').insert(
      bonuses.map((bonus) => ({
        employee_id: employee.id,
        employee_name: employeeName,
        description: bonus.description,
        amount: Number(bonus.amount),
        date: new Date().toISOString(),
      }))
    );

    if (error) {
      logger.error('Error saving bonuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to save bonuses',
        variant: 'destructive',
      });
      return;
    }

    // Clear the form fields for this employee after successful save
    if (clearBonusesForEmployee) {
      clearBonusesForEmployee(employeeName);
    }

    toast({
      title: 'Success',
      description: 'Bonuses saved successfully',
    });
  };

  const saveLoans = async (employeeName: string, loans: DynamicField[]) => {
    const employee = employees?.find((emp) => emp.name === employeeName);
    if (!employee || !loans.length) return;

    const { error } = await supabase.from('employee_loans').insert(
      loans.map((loan) => ({
        employee_id: employee.id,
        employee_name: employeeName,
        description: loan.description,
        amount: Number(loan.amount),
        date: loan.date || new Date().toISOString(),
      }))
    );

    if (error) {
      logger.error('Error saving loans:', error);
      toast({
        title: 'Error',
        description: 'Failed to save loans',
        variant: 'destructive',
      });
      return;
    }

    // Clear the form fields for this employee after successful save
    if (clearLoansForEmployee) {
      clearLoansForEmployee(employeeName);
    }

    toast({
      title: 'Success',
      description: 'Loans saved successfully',
    });
  };

  const saveSales = async (salesInputs: Record<string, string>) => {
    try {
      const salesData = [];

      // Format date as YYYY-MM-01 for database consistency
      const formattedMonth = `${selectedMonth}-01`;

      // Prepare all sales data
      for (const employee of employees) {
        const salesAmount = Number(salesInputs[employee.name] || 0);
        if (salesAmount > 0) {
          // Only save non-zero sales
          salesData.push({
            employee_name: employee.name,
            month: formattedMonth,
            sales_amount: salesAmount,
          });
        }
      }

      if (salesData.length === 0) {
        toast({
          title: 'No sales to save',
          description: 'Please enter sales amounts before submitting.',
          variant: 'destructive',
        });
        return;
      }

      // Check for existing records first
      const existingChecks = await Promise.all(
        salesData.map((sale) =>
          supabase
            .from('employee_sales')
            .select()
            .eq('employee_name', sale.employee_name)
            .eq('month', sale.month)
            .maybeSingle()
        )
      );

      // Process results and prepare operations
      const operations = salesData.map((sale, index) => {
        const { data: existingRecord, error: fetchError } =
          existingChecks[index];

        if (fetchError) {
          logger.error('Error checking existing sales:', fetchError);
          throw fetchError;
        }

        if (existingRecord) {
          // Update existing record
          return supabase
            .from('employee_sales')
            .update({
              sales_amount: sale.sales_amount,
              updated_at: new Date().toISOString(),
            })
            .eq('employee_name', sale.employee_name)
            .eq('month', sale.month);
        } else {
          // Insert new record
          return supabase.from('employee_sales').insert(sale);
        }
      });

      // Execute all operations in parallel
      const results = await Promise.all(operations);

      // Check for errors
      for (const result of results) {
        if (result.error) {
          logger.error('Error saving sales:', result.error);
          throw result.error;
        }
      }

      toast({
        title: 'Success',
        description: 'Sales have been saved successfully.',
      });
    } catch (error) {
      logger.error('Error saving sales:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sales. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    saveDeductions,
    saveBonuses,
    saveLoans,
    saveSales,
  };
};
