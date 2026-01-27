import { DynamicField } from '@shared/types/business/calculations';
import { Card, CardContent } from '@shared/ui/components/card';

import { DynamicInputs } from '../components/DynamicInputs';

import { RecordsTable } from './RecordsTable';

// Generic type for records passed from the database (e.g., EmployeeDeduction, EmployeeLoan)
interface DbRecord {
  id: string;
  employee_name: string;
  description: string;
  amount: number | string;
  date: string;
  // plus any other fields like 'type' for deductions etc.
}

// Type for the state of the record being edited in the parent tab
// (typically has string amounts for form compatibility)
interface EditingUiRecord {
  id: string;
  description: string;
  amount: string;
  // 'date' could be part of this if the editing UI includes a date field,
  // for now, matches DeductionsTab's editingDeduction state.
  // If LoansTab needs date in its editing state, this might need to be generic or union.
}

interface RecordsTabLayoutProps<T extends DbRecord> {
  title: string;
  records: T[]; // Array of full records from DB
  fields: Record<string, DynamicField[]>; // For new entries via DynamicInputs
  onAdd: (employeeName: string) => void;
  onRemove: (employeeName: string, index: number) => void;
  onDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onAmountChange: (employeeName: string, index: number, value: string) => void;
  onDateChange?: (employeeName: string, index: number, value: string) => void;
  onSave: (employeeName: string, recordsToSave: DynamicField[]) => void; // For DynamicInputs save
  employees: { id: string; name: string }[];

  editingRecord: EditingUiRecord | null; // The record currently being edited (from parent tab's state)
  setEditingRecord: (record: EditingUiRecord | null) => void; // To update parent tab's state

  handleEdit: () => Promise<void>; // Action to save the edited record (uses parent's editingRecord state)
  handleDelete: (id: string) => Promise<void>; // Action to delete a record
  showDate?: boolean; // For DynamicInputs
  selectedMonth: string; // Added for filtering by month, e.g., "YYYY-MM"
}

export const RecordsTabLayout = <T extends DbRecord>({
  title,
  records,
  fields,
  onAdd,
  onRemove,
  onDescriptionChange,
  onAmountChange,
  onDateChange,
  onSave,
  employees,
  editingRecord, // This is EditingUiRecord | null
  setEditingRecord, // This is (record: EditingUiRecord | null) => void
  handleEdit,
  handleDelete,
  showDate = false,
  selectedMonth, // Added prop
}: RecordsTabLayoutProps<T>) => {
  if (!employees.length) {
    return (
      <div className="text-center py-4">
        No employees found for the selected branch
      </div>
    );
  }

  // Improved and simplified date filtering function
  const filterRecordsByMonth = (records: T[], selectedMonth: string) => {
    // Validate selectedMonth format
    if (!selectedMonth || !selectedMonth.match(/^\d{4}-\d{2}$/)) {
      return records; // If invalid format, return all records
    }

    const [targetYearStr, targetMonthStr] = selectedMonth.split('-');
    const targetYear = parseInt(targetYearStr, 10);
    const targetMonth = parseInt(targetMonthStr, 10);

    return records.filter((record) => {
      if (!record.date || typeof record.date !== 'string') {
        return false;
      }

      const dateStr = record.date.trim();

      // Handle DD/MM/YYYY format
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // In DD/MM/YYYY format, month is in position 1 (index 1)
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          return month === targetMonth && year === targetYear;
        }
      }

      // Handle YYYY-MM-DD format
      else if (dateStr.includes('-')) {
        // Check if it starts with the target year-month
        return dateStr.startsWith(selectedMonth);
      }

      return false;
    });
  };

  return (
    <div className="space-y-6">
      {employees.map((employee) => {
        const employeeDbRecords = records.filter(
          (r) => r.employee_name === employee.name
        );

        // Use the improved filtering function
        const monthlyFilteredRecords = filterRecordsByMonth(
          employeeDbRecords,
          selectedMonth
        );

        const tableDisplayRecords = monthlyFilteredRecords.map((dbRecord) => ({
          id: dbRecord.id,
          date: dbRecord.date,
          description: dbRecord.description,
          amount: dbRecord.amount, // RecordsTable's Record type takes string | number for amount
        }));

        // Transform RecordsTabLayout's editingRecord (EditingUiRecord)
        // to RecordsTable's editingRecord (EditingRecordInTable: {id, description, amount: string})
        // Ensure we only format for editing if the record is in the current monthly view
        const GetRecordsTableEditingFormat = () => {
          if (
            editingRecord &&
            editingRecord.id &&
            monthlyFilteredRecords.some((er) => er.id === editingRecord.id)
          ) {
            return {
              id: editingRecord.id,
              description: editingRecord.description,
              amount: String(editingRecord.amount), // Ensure amount is string
            };
          }
          return null;
        };
        const recordsTableEditingRecord = GetRecordsTableEditingFormat();

        return (
          <Card key={employee.id}>
            <CardContent className="p-4">
              <div className="space-y-4 w-full overflow-hidden">
                <h3 className="text-lg font-semibold">{employee.name}</h3>

                {tableDisplayRecords.length > 0 ? (
                  <div className="w-full overflow-hidden">
                    <RecordsTable
                      records={tableDisplayRecords}
                      editingRecord={recordsTableEditingRecord}
                      setEditingRecord={(rtEditingRecord) => {
                        // rtEditingRecord can be an object: {id, description, amount} | null
                        // OR a function: (prev: {id, description, amount} | null) => {id, description, amount} | null

                        if (typeof rtEditingRecord === 'function') {
                          // Pass the function directly to the parent state setter
                          // @ts-expect-error TypeScript can struggle to deeply reconcile these compatible functional update signatures.
                          setEditingRecord(rtEditingRecord);
                        } else if (rtEditingRecord) {
                          // rtEditingRecord is an object {id, description, amount}
                          setEditingRecord({
                            id: rtEditingRecord.id,
                            description: rtEditingRecord.description,
                            amount: rtEditingRecord.amount, // Already a string from RecordsTable
                          });
                        } else {
                          // rtEditingRecord is null
                          setEditingRecord(null);
                        }
                      }}
                      onSave={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ) : null}

                <DynamicInputs
                  title={title}
                  fields={fields[employee.name] || []}
                  onAdd={() => onAdd(employee.name)}
                  onRemove={(index) => onRemove(employee.name, index)}
                  onDescriptionChange={(index, value) =>
                    onDescriptionChange(employee.name, index, value)
                  }
                  onAmountChange={(index, value) =>
                    onAmountChange(employee.name, index, value)
                  }
                  onDateChange={
                    onDateChange &&
                    ((index, value) =>
                      onDateChange(employee.name, index, value))
                  }
                  onSubmit={() =>
                    onSave(employee.name, fields[employee.name] || [])
                  }
                  showDate={showDate}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
