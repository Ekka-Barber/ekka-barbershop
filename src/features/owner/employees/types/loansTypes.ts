import { DynamicField } from '@shared/types/business';
import { EmployeeLoan } from '@shared/types/domains';

// EmployeeLoan is now imported from @/types/domains

export interface LoansTabProps {
  loanFields: Record<string, DynamicField[]>;
  onAddLoan: (employeeName: string) => void;
  onRemoveLoan: (employeeName: string, index: number) => void;
  onLoanDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveLoans: (employeeName: string, loans: DynamicField[]) => void;
  employees: { id: string; name: string; branches?: { name: string } }[];
  monthlyLoans: EmployeeLoan[];
  selectedMonth: string;
}

export interface LoanEditingRecord {
  id: string;
  description: string;
  amount: string;
  date: string;
}

export interface EmployeeLoanCardProps {
  employee: { id: string; name: string; branches?: { name: string } };
  employeeLoans: EmployeeLoan[];
  pendingLoans: DynamicField[];
  totalLoans: number;
  editingLoan: LoanEditingRecord | null;
  isEditing: boolean;
  isDeletingId: string | null;
  isSavingEmployee: string | null;
  onEditLoan: (loan: EmployeeLoan) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDeleteLoan: (id: string) => void;
  onAddLoan: (employeeName: string) => void;
  onRemoveLoan: (employeeName: string, index: number) => void;
  onLoanDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onSaveLoans: (employeeName: string, loans: DynamicField[]) => void;
  onEditingLoanChange: (loan: LoanEditingRecord) => void;
  onTransfer?: (loan: EmployeeLoan) => void;
}

export interface ExistingLoansAccordionProps {
  employeeLoans: EmployeeLoan[];
  editingLoan: LoanEditingRecord | null;
  isEditing: boolean;
  isDeletingId: string | null;
  onEditLoan: (loan: EmployeeLoan) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDeleteLoan: (id: string) => void;
  onEditingLoanChange: (loan: LoanEditingRecord) => void;
  onTransfer?: (loan: EmployeeLoan) => void;
}

export interface NewLoansAccordionProps {
  employeeName: string;
  pendingLoans: DynamicField[];
  isSavingEmployee: string | null;
  onAddLoan: (employeeName: string) => void;
  onRemoveLoan: (employeeName: string, index: number) => void;
  onLoanDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onSaveLoans: (employeeName: string, loans: DynamicField[]) => void;
}
