import { DynamicField } from '@shared/types/business/calculations';
import { Card, CardContent } from '@shared/ui/components/card';

import { DynamicInputs } from '../components/DynamicInputs';

import { EmployeeSalesInput } from './EmployeeSalesInput';

interface EmployeeCardProps {
  employee: { id: string; name: string };
  salesInput: string;
  onSalesChange: (employeeName: string, value: string) => void;
  deductionsFields: DynamicField[];
  bonusFields: DynamicField[];
  onAddDeduction: () => void;
  onRemoveDeduction: (index: number) => void;
  onDeductionDescriptionChange: (index: number, value: string) => void;
  onDeductionAmountChange: (index: number, value: string) => void;
  onAddBonus: () => void;
  onRemoveBonus: (index: number) => void;
  onBonusDescriptionChange: (index: number, value: string) => void;
  onBonusAmountChange: (index: number, value: string) => void;
  saveDeductions: (deductions: DynamicField[]) => void;
  saveBonuses: (bonuses: DynamicField[]) => void;
}

export const EmployeeCard = ({
  employee,
  salesInput,
  onSalesChange,
  deductionsFields,
  bonusFields,
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
}: EmployeeCardProps) => {
  return (
    <Card key={employee.id}>
      <CardContent className="p-4">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">{employee.name}</h3>
          <EmployeeSalesInput
            employeeName={employee.name}
            value={salesInput}
            onChange={onSalesChange}
          />
          <DynamicInputs
            title="Deduction"
            fields={deductionsFields}
            onAdd={onAddDeduction}
            onRemove={onRemoveDeduction}
            onDescriptionChange={onDeductionDescriptionChange}
            onAmountChange={onDeductionAmountChange}
            onSubmit={() => saveDeductions(deductionsFields)}
          />
          <DynamicInputs
            title="Bonus"
            fields={bonusFields}
            onAdd={onAddBonus}
            onRemove={onRemoveBonus}
            onDescriptionChange={onBonusDescriptionChange}
            onAmountChange={onBonusAmountChange}
            onSubmit={() => saveBonuses(bonusFields)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
