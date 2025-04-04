
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TimeBox } from './TimeBox';
import { Plus, Trash2 } from 'lucide-react';

interface WorkingHoursEditorProps {
  workingHours: Record<string, any>;
  onChange: (workingHours: Record<string, any>) => void;
}

type DayConfig = {
  label: string;
  key: string;
};

const days: DayConfig[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const WorkingHoursEditor = ({ workingHours, onChange }: WorkingHoursEditorProps) => {
  const [isOpenByDay, setIsOpenByDay] = useState<Record<string, boolean>>(
    days.reduce((acc, day) => {
      acc[day.key] = Boolean(workingHours[day.key] && workingHours[day.key].length > 0);
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Check if the workingHours is in the old format (array of time ranges) or new format (object with start/end)
  const getWorkingHoursForDay = (day: string): string[] => {
    const hoursForDay = workingHours[day];
    if (!hoursForDay) return [];
    if (Array.isArray(hoursForDay)) return hoursForDay;
    if (hoursForDay.start && hoursForDay.end) return [`${hoursForDay.start}-${hoursForDay.end}`];
    return [];
  };

  const handleDayToggle = (day: string, isOpen: boolean) => {
    const newIsOpenByDay = { ...isOpenByDay, [day]: isOpen };
    setIsOpenByDay(newIsOpenByDay);
    
    if (!isOpen) {
      // If turning off, clear the hours
      const newWorkingHours = { ...workingHours };
      newWorkingHours[day] = [];
      onChange(newWorkingHours);
    } else if (!workingHours[day] || workingHours[day].length === 0) {
      // If turning on and no hours exist, add a default time slot
      const newWorkingHours = { ...workingHours };
      newWorkingHours[day] = ['10:00-22:00'];
      onChange(newWorkingHours);
    }
  };

  const handleAddTimeRange = (day: string) => {
    const newWorkingHours = { ...workingHours };
    const dayHours = getWorkingHoursForDay(day);
    newWorkingHours[day] = [...dayHours, '10:00-22:00'];
    onChange(newWorkingHours);
  };

  const handleRemoveTimeRange = (day: string, index: number) => {
    const newWorkingHours = { ...workingHours };
    const dayHours = getWorkingHoursForDay(day);
    newWorkingHours[day] = dayHours.filter((_, i) => i !== index);
    onChange(newWorkingHours);
  };

  const handleTimeChange = (day: string, index: number, value: string) => {
    const newWorkingHours = { ...workingHours };
    const dayHours = [...getWorkingHoursForDay(day)];
    dayHours[index] = value;
    newWorkingHours[day] = dayHours;
    onChange(newWorkingHours);
  };

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <Card key={day.key} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${day.key}-toggle`}
                  checked={isOpenByDay[day.key]}
                  onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
                />
                <Label htmlFor={`${day.key}-toggle`} className="font-medium">
                  {day.label}
                </Label>
              </div>
              
              <div>
                {isOpenByDay[day.key] ? (
                  <span className="text-sm text-green-600 font-medium">Open</span>
                ) : (
                  <span className="text-sm text-rose-600 font-medium">Closed</span>
                )}
              </div>
            </div>
            
            {isOpenByDay[day.key] && (
              <div className="space-y-2">
                {getWorkingHoursForDay(day.key).map((timeRange, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <TimeBox
                      value={timeRange}
                      onChange={(value) => handleTimeChange(day.key, index, value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleRemoveTimeRange(day.key, index)}
                      className="h-9 w-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTimeRange(day.key)}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Time Range
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
