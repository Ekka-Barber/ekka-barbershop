import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';

interface EmployeeSalesInputProps {
  employeeName: string;
  value: string;
  onChange: (employeeName: string, value: string) => void;
}

export const EmployeeSalesInput = ({
  employeeName,
  value,
  onChange,
}: EmployeeSalesInputProps) => {
  return (
    <div>
      <Label htmlFor={`sales-${employeeName}`}>Sales Amount (SAR)</Label>
      <Input
        id={`sales-${employeeName}`}
        type="number"
        value={value}
        onChange={(e) => onChange(employeeName, e.target.value)}
        placeholder="0"
        className="mt-1"
      />
    </div>
  );
};
