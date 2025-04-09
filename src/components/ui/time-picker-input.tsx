import React, { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { Clock } from 'lucide-react';

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimePickerInput = ({ value, onChange }: TimePickerInputProps) => {
  const [hours, minutes] = value.split(':').map(v => parseInt(v, 10));
  const [selectedHours, setSelectedHours] = useState<number>(isNaN(hours) ? 9 : hours);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(isNaN(minutes) ? 0 : minutes);
  
  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);
  
  const handleHourChange = (hour: number) => {
    setSelectedHours(hour);
    updateTime(hour, selectedMinutes);
  };
  
  const handleMinuteChange = (minute: number) => {
    setSelectedMinutes(minute);
    updateTime(selectedHours, minute);
  };
  
  const updateTime = (hour: number, minute: number) => {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    onChange(`${formattedHour}:${formattedMinute}`);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const timeValue = e.target.value;
    
    if (timeRegex.test(timeValue)) {
      const [hours, minutes] = timeValue.split(':').map(v => parseInt(v, 10));
      setSelectedHours(hours);
      setSelectedMinutes(minutes);
      onChange(timeValue);
    }
  };
  
  return (
    <div className="flex flex-col p-4 w-full min-w-[280px]">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder="HH:MM"
          className="w-full"
        />
      </div>
      
      <div className="flex space-x-2">
        <div className="w-1/2">
          <div className="text-sm font-medium mb-2">Hours</div>
          <ScrollArea className="h-52 rounded-md border">
            <div className="p-1">
              {hoursArray.map((hour) => (
                <Button
                  key={hour}
                  variant={selectedHours === hour ? "secondary" : "ghost"}
                  onClick={() => handleHourChange(hour)}
                  className="w-full justify-start mb-1"
                >
                  {hour.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="w-1/2">
          <div className="text-sm font-medium mb-2">Minutes</div>
          <ScrollArea className="h-52 rounded-md border">
            <div className="p-1">
              {minutesArray.map((minute) => (
                <Button
                  key={minute}
                  variant={selectedMinutes === minute ? "secondary" : "ghost"}
                  onClick={() => handleMinuteChange(minute)}
                  className="w-full justify-start mb-1"
                >
                  {minute.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}; 
