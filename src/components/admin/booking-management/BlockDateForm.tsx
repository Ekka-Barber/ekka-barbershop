
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { BlockedDateInput } from "@/types/admin";
import { Calendar } from "@/components/ui/calendar";

interface BlockDateFormProps {
  selectedDate: Date | undefined;
  onBlockDate: (data: BlockedDateInput) => Promise<void>;
}

export const BlockDateForm = ({ selectedDate, onBlockDate }: BlockDateFormProps) => {
  const [reason, setReason] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);

  // When selectedDate changes from parent, update our selectedDates array
  React.useEffect(() => {
    if (selectedDate && !showMultiSelect) {
      setSelectedDates([selectedDate]);
    }
  }, [selectedDate, showMultiSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) return;

    setIsSubmitting(true);
    try {
      // Process each selected date
      for (const date of selectedDates) {
        await onBlockDate({
          date,
          reason,
          is_recurring: isRecurring
        });
      }
      setReason('');
      setSelectedDates([]);
      if (showMultiSelect) {
        setShowMultiSelect(false);
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (!showMultiSelect && selectedDate) {
      setSelectedDates([selectedDate]);
    } else {
      setSelectedDates([]);
    }
  };

  const handleCalendarSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
    setSelectedDates(dates);
  };

  if (!selectedDate && !showMultiSelect) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Separator className="my-4" />
      <h3 className="text-sm font-medium">Block with details</h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="multi-select">Multi-select mode</Label>
          <p className="text-xs text-muted-foreground">
            Select multiple dates to block
          </p>
        </div>
        <Switch
          id="multi-select"
          checked={showMultiSelect}
          onCheckedChange={toggleMultiSelect}
        />
      </div>
      
      {showMultiSelect && (
        <div className="border rounded-md p-2">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleCalendarSelect}
            className="rounded-md border"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input
          id="reason"
          placeholder="e.g., Holiday, Maintenance"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="recurring">Recurring</Label>
          <p className="text-xs text-muted-foreground">
            Block this date every year
          </p>
        </div>
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting || selectedDates.length === 0}>
        {isSubmitting ? "Saving..." : selectedDates.length > 1 
          ? `Block ${selectedDates.length} selected dates` 
          : selectedDates.length === 1 
            ? `Block ${format(selectedDates[0], "MMMM d, yyyy")}` 
            : "Select dates to block"}
      </Button>
    </form>
  );
};
