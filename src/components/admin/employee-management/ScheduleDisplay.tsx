import { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WorkingHours } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ScheduleDisplayProps {
  workingHours: WorkingHours | Record<string, string[] | { start: string; end: string }>;
  offDays: string[];
}

export const ScheduleDisplay = ({ workingHours, offDays = [] }: ScheduleDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Create an array with the days of the week, starting with Saturday (Middle Eastern week)
  const daysOfWeek = [
    { key: 'saturday', label: 'Sat', fullName: 'Saturday' },
    { key: 'sunday', label: 'Sun', fullName: 'Sunday' },
    { key: 'monday', label: 'Mon', fullName: 'Monday' },
    { key: 'tuesday', label: 'Tue', fullName: 'Tuesday' },
    { key: 'wednesday', label: 'Wed', fullName: 'Wednesday' },
    { key: 'thursday', label: 'Thu', fullName: 'Thursday' },
    { key: 'friday', label: 'Fri', fullName: 'Friday' }
  ];

  // Safely parse working hours
  const parsedWorkingHours: WorkingHours = typeof workingHours === 'object' ? workingHours : {};

  // Function to get hours text for a day
  const getHoursText = (day: string) => {
    const dayHours = parsedWorkingHours[day] || [];
    
    // Handle both string[] and object formats
    const hasHours = Array.isArray(dayHours) 
      ? dayHours.length > 0 
      : (dayHours && typeof dayHours === 'object' && 'start' in dayHours);
    
    if (!hasHours) return 'Off';
    
    if (Array.isArray(dayHours)) {
      return dayHours.join(', ');
    } else if (typeof dayHours === 'object' && 'start' in dayHours && 'end' in dayHours) {
      return `${dayHours.start} - ${dayHours.end}`;
    }
    
    return 'Off';
  };

  // Function to get hours as array with start and end times
  const getHoursArray = (day: string): [string, string] | null => {
    const dayHours = parsedWorkingHours[day] || [];
    
    // Handle both string[] and object formats
    if (Array.isArray(dayHours) && dayHours.length > 0) {
      // For array format, assume first and last elements are start/end
      return [dayHours[0], dayHours[dayHours.length - 1]];
    } else if (typeof dayHours === 'object' && 'start' in dayHours && 'end' in dayHours) {
      return [dayHours.start, dayHours.end];
    }
    
    return null;
  };

  // Get today's day of week
  const today = new Date().getDay();
  // Convert to our day index (where Saturday is 0)
  const todayIndex = (today + 1) % 7;

  // Get data for today
  const todayKey = daysOfWeek[todayIndex].key;
  const isTodayOff = offDays.includes(todayKey);
  const todayHoursText = getHoursText(todayKey);
  const isTodayWorking = !isTodayOff && todayHoursText !== 'Off';

  return (
    <>
      {/* Mobile View - Collapsible Schedule */}
      <div className="block sm:hidden">
        <Collapsible 
          open={isOpen} 
          onOpenChange={setIsOpen}
          className="border rounded-lg overflow-hidden"
        >
          <div className="bg-primary/5 p-4 flex items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full mr-3 ${
                  isTodayWorking ? 'bg-green-100' : 'bg-red-50'
                }`}>
                  {isTodayWorking ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center">
                    <div className="font-medium">{daysOfWeek[todayIndex].fullName}</div>
                    <div className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Today</div>
                  </div>
                  <div className={`text-sm ${isTodayWorking ? 'text-green-600' : 'text-red-500'}`}>
                    {isTodayWorking ? (
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {todayHoursText}
                      </div>
                    ) : (
                      'Closed today'
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle schedule</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="divide-y">
              {daysOfWeek.map((day, index) => {
                if (index === todayIndex) return null; // Skip today as it's already shown
                
                const isOffDay = offDays.includes(day.key);
                const hoursText = getHoursText(day.key);
                const isWorking = !isOffDay && hoursText !== 'Off';
                const hours = getHoursArray(day.key);
                
                // Calculate a visual representation of the working hours in a 24-hour day
                let startPercent = 0;
                let widthPercent = 0;
                
                if (isWorking && hours) {
                  const [startTime, endTime] = hours;
                  const startHour = parseInt(startTime.split(':')[0]);
                  const endHour = parseInt(endTime.split(':')[0]);
                  
                  startPercent = (startHour / 24) * 100;
                  widthPercent = ((endHour - startHour) / 24) * 100;
                  
                  // Handle overnight shifts
                  if (widthPercent < 0) {
                    widthPercent = ((24 - startHour) / 24) * 100;
                  }
                }
                
                return (
                  <div key={day.key} className="px-4 py-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-medium">{day.fullName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isWorking 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {isWorking ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    
                    {isWorking ? (
                      <>
                        <div className="text-sm text-muted-foreground mb-1.5">
                          {hoursText}
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full w-full relative">
                          <div 
                            className="absolute top-0 h-2 bg-green-400/70 rounded-full" 
                            style={{ 
                              left: `${startPercent}%`, 
                              width: `${widthPercent}%` 
                            }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <div className="h-2 bg-red-100 rounded-full w-full relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="border-t border-red-300 w-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop View - Grid View */}
      <div className="hidden sm:grid grid-cols-7 gap-1 text-center">
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
                    <span className="font-semibold">{day.fullName}:</span>{' '}
                    {isOffDay ? 'Off day' : hoursText}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </>
  );
};
