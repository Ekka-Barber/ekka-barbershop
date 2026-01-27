import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Control, UseFormReturn } from 'react-hook-form';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/components/button';
import { Calendar } from '@shared/ui/components/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/ui/components/popover';
import {
  formatDateForInput,
  formatDateFromCalendar,
} from '@shared/utils/date/dateUtils';

import type { DocumentFormValues } from './types';

interface DatePickerFieldProps {
  control: Control<DocumentFormValues>;
  form: UseFormReturn<DocumentFormValues>;
  name: 'issue_date' | 'expiry_date';
  label: string;
  placeholder: string;
  isRequired?: boolean;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  control,
  form,
  name,
  label,
  placeholder,
  isRequired = false,
}) => {
  const isIssueDate = name === 'issue_date';

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label}
            {isRequired && ' *'}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal h-12',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), 'PPP')
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formatDateForInput(field.value)}
                onSelect={(date) => {
                  field.onChange(formatDateFromCalendar(date));
                }}
                disabled={(date) => {
                  if (isIssueDate) {
                    // Issue date cannot be in the future
                    return date > new Date();
                  } else {
                    // Expiry date cannot be before issue date
                    const issueDate = form.getValues('issue_date');
                    return issueDate ? date <= new Date(issueDate) : false;
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
