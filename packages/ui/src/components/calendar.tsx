import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@shared/lib/utils';
import { buttonVariants } from '@shared/ui/components/button-variants';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const IconLeft = ({ ..._props }: React.ComponentProps<'svg'>) => (
  <ChevronLeft className="h-5 w-5" />
);

const IconRight = ({ ..._props }: React.ComponentProps<'svg'>) => (
  <ChevronRight className="h-5 w-5" />
);

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-xl font-semibold text-foreground',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 bg-transparent p-0 hover:opacity-75 transition-opacity'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-10 font-normal text-[0.9rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 rounded-md',
          'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          'h-10 w-10 items-center justify-center'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/50 rounded-md transition-colors'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
        day_today: 'bg-accent text-accent-foreground rounded-md',
        day_outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground rounded-md',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft,
        IconRight,
      }}
      {...props}
    />
  );
};

export { Calendar };
export const CalendarCell = Calendar;
export const CalendarGrid = Calendar;
export const CalendarGridBody = Calendar;
export const CalendarGridHeader = Calendar;
export const CalendarHeaderCell = Calendar;
export const CalendarHeading = Calendar;
export const RangeCalendar = Calendar;
