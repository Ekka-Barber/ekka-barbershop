import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileEndDateManagerProps } from "@/types/file-management";

export const FileEndDateManager = ({
  file,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleEndDateUpdate,
  handleRemoveEndDate,
  dialogOpen,
  setDialogOpen,
}: FileEndDateManagerProps) => {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Expiration Date</DialogTitle>
          <DialogDescription>
            Set an expiration date and time for "{file.file_name}". The file will automatically 
            expire on the selected date and time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="expiration-date" className="text-sm font-medium">
              Expiration Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="expiration-time" className="text-sm font-medium">
              Expiration Time
            </label>
            <Select
              value={selectedTime || "23:59"}
              onValueChange={setSelectedTime}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(24)].map((_, hour) => (
                  <>
                    <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {hour.toString().padStart(2, '0')}:00
                    </SelectItem>
                    <SelectItem key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                      {hour.toString().padStart(2, '0')}:30
                    </SelectItem>
                  </>
                ))}
              </SelectContent>
            </Select>
          </div>

          {file.end_date && (
            <div className="text-sm text-muted-foreground">
              <p>Current expiration: {format(new Date(file.end_date), "PPP p")}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          {file.end_date ? (
            <Button
              variant="outline"
              className="mr-auto"
              onClick={() => {
                handleRemoveEndDate(file.id);
                setDialogOpen(false);
              }}
            >
              Remove Expiration
            </Button>
          ) : (
            <div />
          )}
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedDate}
              onClick={() => {
                handleEndDateUpdate(file.id);
                setDialogOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
