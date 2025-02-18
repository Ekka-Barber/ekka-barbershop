
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash } from "lucide-react";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface HappyHourSectionProps {
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
}

export default function HappyHourSection({ value, onChange }: HappyHourSectionProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleAdd = () => {
    if (!startTime || !endTime || selectedDays.length === 0) return;
    
    const timeRange = `${startTime}-${endTime}`;
    const newValue = { ...value };
    
    selectedDays.forEach((day) => {
      newValue[day] = [...(newValue[day] || []), timeRange];
    });
    
    onChange(newValue);
    setSelectedDays([]);
    setStartTime("");
    setEndTime("");
  };

  const handleRemove = (day: string, timeRange: string) => {
    const newValue = { ...value };
    newValue[day] = newValue[day].filter((range) => range !== timeRange);
    if (newValue[day].length === 0) {
      delete newValue[day];
    }
    onChange(newValue);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="space-y-2">
            <div className="font-medium capitalize">{day}</div>
            <div className="pl-4 space-y-2">
              {value[day]?.map((timeRange) => (
                <div key={timeRange} className="flex items-center gap-2">
                  <div className="flex-1">{timeRange}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(day, timeRange)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={selectedDays.includes(day)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedDays([...selectedDays, day]);
                  } else {
                    setSelectedDays(selectedDays.filter((d) => d !== day));
                  }
                }}
              />
              <label
                htmlFor={day}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {day}
              </label>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-32"
          />
          <span>to</span>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-32"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAdd}
            disabled={!startTime || !endTime || selectedDays.length === 0}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
