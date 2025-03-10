
import { CheckCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WorkingHours } from '@/types/service';
import { isValidWorkingHours } from '@/utils/workingHoursUtils';

interface ScheduleDisplayProps {
  workingHours: WorkingHours;
  offDays: string[];
}

export const ScheduleDisplay = ({ workingHours, offDays = [] }: ScheduleDisplayProps) => {
  // Create an array with the days of the week, starting with Saturday (Middle Eastern week)
  const daysOfWeek = [
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' }
  ];

  // Validate working hours format
  const validWorkingHours = isValidWorkingHours(workingHours) ? workingHours : {};

  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {daysOfWeek.map((day) => {
        const isOffDay = offDays.includes(day.key);
        const hours = validWorkingHours[day.key] || [];
        const hasHours = Array.isArray(hours) && hours.length > 0;
        const hoursText = hasHours ? hours.join(', ') : 'Off';
        
        return (
          <TooltipProvider key={day.key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <div className="text-xs font-medium mb-1">{day.label}</div>
                  <div className={`${isOffDay || !hasHours ? 'text-red-500' : 'text-green-500'}`}>
                    {isOffDay || !hasHours ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  <span className="font-semibold">{day.label}:</span>{' '}
                  {isOffDay ? 'Off day' : hoursText}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};
