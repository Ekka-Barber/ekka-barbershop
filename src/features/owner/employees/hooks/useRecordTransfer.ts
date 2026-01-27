import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { supabase } from '@shared/lib/supabase/client';
import type { EmployeeBonus, EmployeeDeduction, EmployeeLoan } from '@shared/types/domains';

type TransferRecord = EmployeeDeduction | EmployeeLoan | EmployeeBonus;
type SourceTable = 'employee_deductions' | 'employee_loans' | 'employee_bonuses';
type TargetTable = 'employee_deductions' | 'employee_loans' | 'employee_bonuses';

interface TransferRecordData {
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
}

export const useRecordTransfer = () => {
  const queryClient = useQueryClient();
  const [isTransferring, setIsTransferring] = useState(false);

  const transferRecord = async (
    sourceRecord: TransferRecord,
    sourceTable: SourceTable,
    targetTable: TargetTable,
    targetMonth: string
  ): Promise<void> => {
    setIsTransferring(true);

    try {
      // Prepare the transfer data
      const transferData: TransferRecordData = {
        employee_id: sourceRecord.employee_id,
        employee_name: sourceRecord.employee_name,
        description: sourceRecord.description,
        amount: sourceRecord.amount,
        date: targetMonth, // Use the selected month
      };

      // Add table-specific fields for loans
      const insertData: TransferRecordData & {
        source?: string;
        branch_id?: string | null;
      } = { ...transferData };
      if (targetTable === 'employee_loans') {
        // For loans, we need to get the employee's branch_id
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('branch_id')
          .eq('id', sourceRecord.employee_id)
          .single();

        if (employeeError) {
          throw new Error(`Failed to fetch employee branch: ${employeeError.message}`);
        }

        insertData.source = 'other'; // Use 'other' as allowed by check constraint
        insertData.branch_id = employeeData?.branch_id || null;
      }

      // Start a transaction-like operation (Supabase doesn't support explicit transactions)
      // First, insert into target table
      const { data: newRecord, error: insertError } = await supabase
        .from(targetTable)
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to insert into ${targetTable}: ${insertError.message}`);
      }

      // Then delete from source table
      const { error: deleteError } = await supabase
        .from(sourceTable)
        .delete()
        .eq('id', sourceRecord.id);

      if (deleteError) {
        // If delete fails, try to rollback the insert
        await supabase.from(targetTable).delete().eq('id', newRecord.id);
        throw new Error(`Failed to delete from ${sourceTable}: ${deleteError.message}`);
      }

      // Success - invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['employee_deductions'] }),
        queryClient.invalidateQueries({ queryKey: ['employee_loans'] }),
        queryClient.invalidateQueries({ queryKey: ['employee_bonuses'] }),
      ]);

      // Get table names for toast message
      const sourceTableName = getTableDisplayName(sourceTable);
      const targetTableName = getTableDisplayName(targetTable);

      toast.success(`Record transferred from ${sourceTableName} to ${targetTableName}`, {
        duration: 5000, // Show for 5 seconds
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      toast.error(`Transfer Failed: ${errorMessage}`, {
        duration: 7000, // Show error for longer
      });

      throw error; // Re-throw to allow parent components to handle
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transferRecord,
    isTransferring,
  };
};

function getTableDisplayName(table: SourceTable | TargetTable): string {
  switch (table) {
    case 'employee_deductions':
      return 'Deductions';
    case 'employee_loans':
      return 'Loans';
    case 'employee_bonuses':
      return 'Bonuses';
    default:
      return 'Unknown';
  }
}
