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

interface NotificationFieldProps {
  control: Control<DocumentFormValues>;
}

export const NotificationField: React.FC<NotificationFieldProps> = ({
  control,
}) => {
  return (
    <FormField
      control={control}
      name="notification_threshold_days"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notification Threshold (Days)</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              max="365"
              placeholder="30"
              className="h-12"
              {...field}
              onChange={(e) =>
                field.onChange(
                  parseInt(e.target.value) || TIME.DAYS_PER_MONTH_APPROX
                )
              }
            />
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground">
            Days before expiry to show warning notifications
          </p>
        </FormItem>
      )}
    />
  );
};
