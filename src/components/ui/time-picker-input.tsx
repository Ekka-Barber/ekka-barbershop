import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimePickerInput = ({ value, onChange }: TimePickerInputProps) => {
  // Split the input value into hours and minutes
  const parseTime = (timeString: string) => {
    const [h, m] = timeString.split(':').map(v => parseInt(v, 10));
    return {
      hours: isNaN(h) ? 9 : h,
      minutes: isNaN(m) ? 0 : m
    };
  };

  const initialTime = parseTime(value);
  const [selectedHours, setSelectedHours] = useState<number>(initialTime.hours);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(initialTime.minutes);
  
  // Make sure component state updates when prop value changes
  useEffect(() => {
    const { hours, minutes } = parseTime(value);
    setSelectedHours(hours);
    setSelectedMinutes(minutes);
  }, [value]);
  
  const updateTime = (hour: number, minute: number) => {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    const formattedTime = `${formattedHour}:${formattedMinute}`;
    onChange(formattedTime);
  };
  
  const handleHourClick = (hour: number) => {
    setSelectedHours(hour);
    updateTime(hour, selectedMinutes);
  };
  
  const handleMinuteClick = (minute: number) => {
    setSelectedMinutes(minute);
    updateTime(selectedHours, minute);
  };
  
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Validate input as a time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    
    if (timeRegex.test(inputValue)) {
      const { hours, minutes } = parseTime(inputValue);
      setSelectedHours(hours);
      setSelectedMinutes(minutes);
      onChange(inputValue);
    }
  };

  // Common hour presets for quick selection
  const hourPresets = [0, 6, 9, 12, 15, 18, 21];
  
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center space-x-2 mb-2">
        <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <Input
          value={value}
          onChange={handleManualInput}
          placeholder="HH:MM"
          className="w-full text-base font-medium"
          type="time"
        />
      </div>
      
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-1">Quick select</h4>
        
        <div className="grid grid-cols-4 gap-1 mb-3">
          {hourPresets.map((hour) => (
            <Button
              key={hour}
              type="button"
              variant={selectedHours === hour ? "secondary" : "outline"}
              onClick={() => handleHourClick(hour)}
              className="h-9 text-center font-medium"
            >
              {hour.toString().padStart(2, '0')}:00
            </Button>
          ))}
        </div>
        
        <div className="flex flex-col mt-2">
          <h4 className="text-sm font-medium mb-1">Hours</h4>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 24 }, (_, i) => (
              <Button
                key={i}
                type="button"
                variant={selectedHours === i ? "secondary" : "outline"}
                onClick={() => handleHourClick(i)}
                className={cn(
                  "h-9 w-9 p-0 text-center",
                  selectedHours === i && "font-bold"
                )}
              >
                {i.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col mt-3">
          <h4 className="text-sm font-medium mb-1">Minutes</h4>
          <div className="grid grid-cols-4 gap-1">
            {[0, 15, 30, 45].map((minute) => (
              <Button
                key={minute}
                type="button"
                variant={selectedMinutes === minute ? "secondary" : "outline"}
                onClick={() => handleMinuteClick(minute)}
                className={cn(
                  "h-9 text-center font-medium",
                  selectedMinutes === minute && "font-bold"
                )}
              >
                :{minute.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-6 gap-1 mt-1">
            {[5, 10, 20, 25, 35, 40, 50, 55].map((minute) => (
              <Button
                key={minute}
                type="button"
                variant={selectedMinutes === minute ? "secondary" : "outline"}
                onClick={() => handleMinuteClick(minute)}
                className={cn(
                  "h-9 w-9 p-0 text-center",
                  selectedMinutes === minute && "font-bold"
                )}
              >
                {minute.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 
