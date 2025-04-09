import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { TimePickerInput } from '@/components/ui/time-picker-input';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { TimeRange } from '@/types/employee';
import { cn } from '@/lib/utils';

interface DayScheduleGridProps {
  day: {
    key: string;
    label: string;
  };
  timeRanges: TimeRange[];
  isWorkingDay: boolean;
  onDayScheduleChange: (day: string, timeRanges: TimeRange[], isWorkingDay: boolean) => void;
}

export const DayScheduleGrid = ({ 
  day, 
  timeRanges, 
  isWorkingDay,
  onDayScheduleChange 
}: DayScheduleGridProps) => {
  const handleToggleWorkingDay = (checked: boolean) => {
    onDayScheduleChange(day.key, timeRanges, checked);
  };

  const handleAddTimeRange = () => {
    const newRanges = [...timeRanges, "09:00-17:00"];
    onDayScheduleChange(day.key, newRanges, isWorkingDay);
  };

  const handleRemoveTimeRange = (index: number) => {
    if (timeRanges.length <= 1) {
      // Don't remove the last time range, just toggle the day off instead
      onDayScheduleChange(day.key, timeRanges, false);
      return;
    }
    
    const newRanges = timeRanges.filter((_, i) => i !== index);
    onDayScheduleChange(day.key, newRanges, isWorkingDay);
  };

  const handleTimeChange = (index: number, type: 'start' | 'end', time: string) => {
    if (!timeRanges[index]) return;
    
    const newRanges = [...timeRanges];
    const [start, end] = newRanges[index].split('-');
    
    if (type === 'start' && time >= end) {
      // If start time is after end time, adjust end time
      const endHour = parseInt(time.split(':')[0]) + 8; // 8 hours shift
      const endTime = endHour >= 24 ? '23:59' : `${endHour}:00`;
      newRanges[index] = `${time}-${endTime}`;
    } else if (type === 'end' && time <= start) {
      // If end time is before start time, assume it crosses midnight
      newRanges[index] = `${start}-${time}`;
    } else {
      newRanges[index] = type === 'start' ? `${time}-${end}` : `${start}-${time}`;
    }
    
    onDayScheduleChange(day.key, newRanges, isWorkingDay);
  };

  return (
    <Card className={cn(
      "w-full",
      !isWorkingDay && "bg-muted/30"
    )}>
      <CardHeader className="py-2 px-3 bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">{day.label}</h3>
          <div className="flex items-center space-x-2">
            <Switch
              id={`working-day-${day.key}`}
              checked={isWorkingDay}
              onCheckedChange={handleToggleWorkingDay}
              aria-label={`Toggle ${day.label} working status`}
            />
            <Label htmlFor={`working-day-${day.key}`} className="text-xs">
              {isWorkingDay ? 'Working' : 'Off'}
            </Label>
          </div>
        </div>
      </CardHeader>
      {isWorkingDay && (
        <CardContent className="py-3 px-3">
          <div className="space-y-4">
            {timeRanges.map((range, index) => {
              const [start, end] = range.split('-');
              return (
                <div key={index} className="flex flex-col gap-3">
                  <div className="flex-1">
                    <Label className="text-xs mb-2 block">Start Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="default" 
                          className="w-full justify-start h-10 text-base"
                          aria-label={`Set start time for ${day.label}`}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {start || "09:00"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[320px] p-4 max-h-[420px] overflow-auto" 
                        align="center"
                        sideOffset={5}
                        side="bottom"
                      >
                        <TimePickerInput
                          value={start || "09:00"}
                          onChange={(time) => handleTimeChange(index, 'start', time)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-2 block">End Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="default" 
                          className="w-full justify-start h-10 text-base"
                          aria-label={`Set end time for ${day.label}`}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {end || "17:00"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[320px] p-4 max-h-[420px] overflow-auto" 
                        align="center"
                        sideOffset={5}
                        side="bottom"
                      >
                        <TimePickerInput
                          value={end || "17:00"}
                          onChange={(time) => handleTimeChange(index, 'end', time)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveTimeRange(index)}
                      aria-label={`Remove time range for ${day.label}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
            
            <Button
              variant="outline"
              size="default"
              className="w-full mt-4 h-10 text-base"
              onClick={handleAddTimeRange}
              aria-label={`Add another time range for ${day.label}`}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Time Range
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 
