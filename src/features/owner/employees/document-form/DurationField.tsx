import { Control } from 'react-hook-form';

import { TIME } from '@shared/constants/time';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form';
import { Input } from '@shared/ui/components/input';

import type { DocumentFormValues } from './types';

interface DurationFieldProps {
  control: Control<DocumentFormValues>;
}

export const DurationField: React.FC<DurationFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="duration_months"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Duration (Months)</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              max="120"
              placeholder="12"
              className="h-12"
              {...field}
              onChange={(e) =>
                field.onChange(parseInt(e.target.value) || TIME.MONTHS_PER_YEAR)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
