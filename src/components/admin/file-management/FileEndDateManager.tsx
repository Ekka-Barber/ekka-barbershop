
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock, X } from "lucide-react";
import { format } from "date-fns";

interface FileEndDateManagerProps {
  file: any;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (file: any) => void;
  handleRemoveEndDate: (fileId: string) => void;
}

export const FileEndDateManager = ({
  file,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleEndDateUpdate,
  handleRemoveEndDate
}: FileEndDateManagerProps) => {
  if (file.end_date) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Ends: {format(new Date(file.end_date), "PPp")}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0"
          onClick={() => handleRemoveEndDate(file.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="text-sm h-8"
            >
              <Clock className="mr-2 h-4 w-4" />
              Set end date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-[120px] h-8"
        />
        <Button 
          size="sm"
          onClick={() => handleEndDateUpdate(file)}
          className="h-8"
        >
          Save
        </Button>
      </div>
    </div>
  );
};
