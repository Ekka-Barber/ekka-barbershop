
import { CheckCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WorkingHours } from '@/types/service';
import { isValidWorkingHours } from '@/utils/workingHoursUtils';

interface ScheduleDisplayProps {
  workingHours: any; // Use any for now to handle Json type from Employee
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

  // Safely parse working hours
  const parsedWorkingHours: WorkingHours = typeof workingHours === 'object' ? workingHours : {};

  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {daysOfWeek.map((day) => {
        const isOffDay = offDays.includes(day.key);
        const dayHours = parsedWorkingHours[day.key] || [];
        
        // Handle both string[] and object formats
        const hasHours = Array.isArray(dayHours) 
          ? dayHours.length > 0 
          : (dayHours && typeof dayHours === 'object' && 'start' in dayHours);
        
        let hoursText = 'Off';
        if (hasHours) {
          if (Array.isArray(dayHours)) {
            hoursText = dayHours.join(', ');
          } else if (typeof dayHours === 'object' && 'start' in dayHours && 'end' in dayHours) {
            hoursText = `${dayHours.start} - ${dayHours.end}`;
          }
        }
        
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
