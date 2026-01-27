import { Control } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

import type { DocumentFormValues } from './types';

import type { Employee } from '@/features/owner/employees/types';

interface EmployeeSelectProps {
  control: Control<DocumentFormValues>;
  employees: Employee[];
}

export const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  control,
  employees,
}) => {
  return (
    <FormField
      control={control}
      name="employee_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Employee *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
