import type { EmployeeWithBranch, DynamicField } from '@shared/types/business';
import type { EmployeeBonus } from '@shared/types/domains';

export interface BonusesTabProps {
  bonusFields: Record<string, DynamicField[]>;
  onAddBonus: (employeeName: string) => void;
  onRemoveBonus: (employeeName: string, index: number) => void;
  onBonusDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onBonusAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onBonusDateChange?: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveBonuses: (employeeName: string, bonuses: DynamicField[]) => void;
  employees: EmployeeWithBranch[];
  monthlyBonuses: EmployeeBonus[];
  selectedMonth: string;
}

export interface BonusEditingRecord {
  id: string;
  description: string;
  amount: string;
  date: string;
}
