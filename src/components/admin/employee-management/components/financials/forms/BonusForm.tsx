import { FormEvent } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface BonusFormProps {
  selectedDate: Date;
  isDatePopoverOpen: boolean;
  setIsDatePopoverOpen: (open: boolean) => void;
  handleSelectDate: (date: Date | undefined) => void;
  handleAddBonus: (e: FormEvent<HTMLFormElement>) => void;
  errorMessage: string | null;
  onCancel: () => void;
}

export const BonusForm = ({
  selectedDate,
  isDatePopoverOpen,
  setIsDatePopoverOpen,
  handleSelectDate,
  handleAddBonus,
  errorMessage,
  onCancel
}: BonusFormProps) => {
  return (
    <form 
      id="bonusForm"
      onSubmit={handleAddBonus} 
      className="space-y-4 mt-2"
    >
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
      
      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Input 
          id="description" 
          name="description" 
          placeholder="Enter bonus description" 
          required 
        />
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Amount
        </label>
        <Input 
          id="amount" 
          name="amount" 
          type="number" 
          placeholder="Enter amount" 
          required 
        />
      </div>
      
      <div className="grid gap-2">
        <label className="text-sm font-medium">Date</label>
        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Bonus
        </Button>
      </div>
    </form>
  );
}; 