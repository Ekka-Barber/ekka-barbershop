import { DynamicField } from '@shared/types/business/calculations';

import { EmployeeCard } from '../inputs/EmployeeCard';

interface EmployeeInputsProps {
  salesInputs: Record<string, string>;
  deductionsFields: Record<string, DynamicField[]>;
  bonusFields: Record<string, DynamicField[]>;
  onSalesChange: (employeeName: string, value: string) => void;
  onAddDeduction: (employeeName: string) => void;
  onRemoveDeduction: (employeeName: string, index: number) => void;
  onDeductionDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onDeductionAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
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
  saveDeductions: (employeeName: string, deductions: DynamicField[]) => void;
  saveBonuses: (employeeName: string, bonuses: DynamicField[]) => void;
  employees: { id: string; name: string }[];
}

export const EmployeeInputs = ({
  salesInputs,
  deductionsFields,
  bonusFields,
  onSalesChange,
  onAddDeduction,
  onRemoveDeduction,
  onDeductionDescriptionChange,
  onDeductionAmountChange,
  onAddBonus,
  onRemoveBonus,
  onBonusDescriptionChange,
  onBonusAmountChange,
  saveDeductions,
  saveBonuses,
  employees = [],
}: EmployeeInputsProps) => {
  if (!employees.length) {
    return (
      <div className="text-center py-4">
        No employees found for the selected branch
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          salesInput={salesInputs[employee.name] || ''}
          onSalesChange={onSalesChange}
          deductionsFields={deductionsFields[employee.name] || []}
          bonusFields={bonusFields[employee.name] || []}
          onAddDeduction={() => onAddDeduction(employee.name)}
          onRemoveDeduction={(index) => onRemoveDeduction(employee.name, index)}
          onDeductionDescriptionChange={(index, value) =>
            onDeductionDescriptionChange(employee.name, index, value)
          }
          onDeductionAmountChange={(index, value) =>
            onDeductionAmountChange(employee.name, index, value)
          }
          onAddBonus={() => onAddBonus(employee.name)}
          onRemoveBonus={(index) => onRemoveBonus(employee.name, index)}
          onBonusDescriptionChange={(index, value) =>
            onBonusDescriptionChange(employee.name, index, value)
          }
          onBonusAmountChange={(index, value) =>
            onBonusAmountChange(employee.name, index, value)
          }
          saveDeductions={(deductions) =>
            saveDeductions(employee.name, deductions)
          }
          saveBonuses={(bonuses) => saveBonuses(employee.name, bonuses)}
        />
      ))}
    </div>
  );
};
