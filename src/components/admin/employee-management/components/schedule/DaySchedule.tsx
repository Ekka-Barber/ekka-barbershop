
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { TimePickerInput } from '@/components/ui/time-picker-input';

interface DayScheduleProps {
  day: {
    key: string;
    label: string;
  };
  schedule: {
    isWorkingDay: boolean;
    startTime: string;
    endTime: string;
  };
  onScheduleChange: (day: string, key: string, value: boolean | string) => void;
}

export const DaySchedule = ({ day, schedule, onScheduleChange }: DayScheduleProps) => {
  return (
    <Card key={day.key} className="overflow-hidden">
      <CardHeader className="py-2 px-3 bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">{day.label}</h3>
          <div className="flex items-center space-x-2">
            <Switch
              id={`working-day-${day.key}`}
              checked={schedule?.isWorkingDay || false}
              onCheckedChange={(checked) => 
                onScheduleChange(day.key, 'isWorkingDay', checked)
              }
            />
            <Label htmlFor={`working-day-${day.key}`} className="text-xs">
              {schedule?.isWorkingDay ? 'Working' : 'Off'}
            </Label>
          </div>
        </div>
      </CardHeader>
      {schedule?.isWorkingDay && (
        <CardContent className="py-3 px-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Clock className="mr-2 h-3 w-3" />
                    {schedule?.startTime || "09:00"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <TimePickerInput
                    value={schedule?.startTime || "09:00"}
                    onChange={(time) => onScheduleChange(day.key, 'startTime', time)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Clock className="mr-2 h-3 w-3" />
                    {schedule?.endTime || "17:00"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <TimePickerInput
                    value={schedule?.endTime || "17:00"}
                    onChange={(time) => onScheduleChange(day.key, 'endTime', time)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
