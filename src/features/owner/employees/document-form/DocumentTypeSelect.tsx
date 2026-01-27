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

import { DOCUMENT_TYPES } from '@/features/owner/employees/types';


interface DocumentTypeSelectProps {
  control: Control<DocumentFormValues>;
}

export const DocumentTypeSelect: React.FC<DocumentTypeSelectProps> = ({
  control,
}) => {
  return (
    <FormField
      control={control}
      name="document_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Document Type *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
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
