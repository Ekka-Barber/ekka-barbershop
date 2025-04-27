import { FormEvent } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CashDeposit } from '../types/financials';

interface LoanFormProps {
  selectedDate: Date;
  isDatePopoverOpen: boolean;
  setIsDatePopoverOpen: (open: boolean) => void;
  handleSelectDate: (date: Date | undefined) => void;
  handleAddLoan: (e: FormEvent<HTMLFormElement>) => void;
  errorMessage: string | null;
  onCancel: () => void;
  loanSource: 'other' | 'cash_deposit';
  setLoanSource: (source: 'other' | 'cash_deposit') => void;
  cashDeposits: CashDeposit[];
  selectedDepositId: string | null;
  isLoadingDeposits: boolean;
}

export const LoanForm = ({
  selectedDate,
  isDatePopoverOpen,
  setIsDatePopoverOpen,
  handleSelectDate,
  handleAddLoan,
  errorMessage,
  onCancel,
  loanSource,
  setLoanSource,
  cashDeposits,
  selectedDepositId,
  isLoadingDeposits
}: LoanFormProps) => {
  return (
    <form 
      id="loanForm"
      onSubmit={handleAddLoan} 
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
          placeholder="Enter loan description" 
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
          <PopoverContent className="w-auto p-0 z-[100]">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid gap-2">
        <label className="text-sm font-medium">Source</label>
        <RadioGroup
          value={loanSource}
          onValueChange={(value: 'other' | 'cash_deposit') => setLoanSource(value)}
          className="mt-2 space-y-2"
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <RadioGroupItem value="cash_deposit" id="cash_deposit" />
            <Label htmlFor="cash_deposit">From Cash Deposit</Label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other Source</Label>
          </div>
        </RadioGroup>
      </div>
      
      {loanSource === 'cash_deposit' && !isLoadingDeposits && cashDeposits.length > 0 && (
        <div className="mt-2 p-4 bg-green-50 rounded-lg">
          <Label className="block mb-2">Available Balance</Label>
          <div className="text-lg font-bold text-green-700">
            {cashDeposits[0].balance.toLocaleString()} SAR
          </div>
        </div>
      )}
      
      {loanSource === 'cash_deposit' && isLoadingDeposits && (
        <div className="mt-2 p-4 bg-blue-50 rounded-lg text-blue-700">
          Loading available deposits...
        </div>
      )}
      
      {loanSource === 'cash_deposit' && !isLoadingDeposits && cashDeposits.length === 0 && (
        <div className="mt-2 p-4 bg-yellow-50 rounded-lg text-yellow-800">
          No cash deposits available with sufficient balance
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={loanSource === 'cash_deposit' && 
            (cashDeposits.length === 0 || 
             !selectedDepositId || 
             isLoadingDeposits)}
        >
          Add Loan
        </Button>
      </div>
    </form>
  );
}; 