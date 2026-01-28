
import type { EmployeeWithBranch, DynamicField } from '@shared/types/business';
import type { EmployeeBonus } from '@shared/types/domains';

import { BonusesTab as BonusesTabComponent } from '../bonuses-tab/BonusesTab';

interface BonusesTabProps {
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
  onBonusDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveBonuses: (employeeName: string, bonuses: DynamicField[]) => void;
  employees: EmployeeWithBranch[];
  monthlyBonuses: EmployeeBonus[];
  selectedMonth: string;
}

export const BonusesTab: React.FC<BonusesTabProps> = (props) => {
  return <BonusesTabComponent {...props} />;
};
