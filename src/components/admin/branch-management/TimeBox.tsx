
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface TimeBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimeBox = ({ value, onChange }: TimeBoxProps) => {
  // Parse start and end times from value (format: "HH:MM-HH:MM")
  const [startTime, endTime] = value.split('-');
  
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${e.target.value}-${endTime}`);
  };
  
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${startTime}-${e.target.value}`);
  };

  return (
    <div className="flex items-center space-x-2 flex-1">
      <Input
        type="time"
        value={startTime}
        onChange={handleStartTimeChange}
        className="w-full"
      />
      <span className="text-sm">to</span>
      <Input
        type="time"
        value={endTime}
        onChange={handleEndTimeChange}
        className="w-full"
      />
    </div>
  );
};
