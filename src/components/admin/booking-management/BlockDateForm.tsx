
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { BlockedDateInput } from "@/types/admin";

interface BlockDateFormProps {
  selectedDate: Date | undefined;
  onBlockDate: (data: BlockedDateInput) => Promise<void>;
}

export const BlockDateForm = ({ selectedDate, onBlockDate }: BlockDateFormProps) => {
  const [reason, setReason] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setIsSubmitting(true);
    try {
      await onBlockDate({
        date: selectedDate,
        reason,
        is_recurring: isRecurring
      });
      setReason('');
    } catch (error) {
      console.error('Error blocking date:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedDate) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Separator className="my-4" />
      <h3 className="text-sm font-medium">Block with details</h3>
      
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
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : `Block ${format(selectedDate, "MMMM d, yyyy")}`}
      </Button>
    </form>
  );
};
