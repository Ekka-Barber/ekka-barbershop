import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

import type { SelectOption } from '../types';

interface FilterControlProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const FilterControl: React.FC<FilterControlProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface FilterControlsProps {
  employeeId: string;
  employees: Array<{ id: string; name: string }>;
  documentType: string;
  documentTypeOptions: SelectOption[];
  status: string;
  statusOptions: SelectOption[];
  onEmployeeChange: (value: string) => void;
  onDocumentTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  employeeId,
  employees,
  documentType,
  documentTypeOptions,
  status,
  statusOptions,
  onEmployeeChange,
  onDocumentTypeChange,
  onStatusChange,
}) => {
  const employeeOptions: SelectOption[] = [
    { value: 'all', label: 'All employees' },
    ...employees.map((employee) => ({
      value: employee.id,
      label: employee.name,
    })),
  ];

  const documentOptions: SelectOption[] = [
    { value: 'all', label: 'All types' },
    ...documentTypeOptions,
  ];

  const statusFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All statuses' },
    ...statusOptions,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FilterControl
        label="Employee"
        value={employeeId}
        options={employeeOptions}
        onChange={onEmployeeChange}
        placeholder="All employees"
      />

      <FilterControl
        label="Document Type"
        value={documentType}
        options={documentOptions}
        onChange={onDocumentTypeChange}
        placeholder="All types"
      />

      <FilterControl
        label="Status"
        value={status}
        options={statusFilterOptions}
        onChange={onStatusChange}
        placeholder="All statuses"
      />
    </div>
  );
};
