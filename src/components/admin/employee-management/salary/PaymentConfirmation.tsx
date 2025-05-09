import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from './SalaryUtils';
import { Loader2, CheckCircle, AlertCircle, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  employeeCount: number;
  onConfirm: (paymentDate: Date) => Promise<boolean>;
}

export const PaymentConfirmation = ({ 
  isOpen, 
  onClose, 
  totalAmount, 
  employeeCount,
  onConfirm
}: PaymentConfirmationProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Handle confirmation
  const handleConfirm = async () => {
    if (!hasAcknowledged || !paymentDate) return;
    
    setIsConfirming(true);
    setError(null);
    
    try {
      const success = await onConfirm(paymentDate);
      
      if (success) {
        setIsConfirmed(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          resetState();
          onClose();
        }, 3000);
      } else {
        setError('Failed to confirm payments. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Payment confirmation error:', err);
    } finally {
      setIsConfirming(false);
    }
  };
  
  // Reset state when closing dialog
  const resetState = () => {
    setIsConfirming(false);
    setIsConfirmed(false);
    setError(null);
    setHasAcknowledged(false);
    setPaymentDate(new Date()); // Reset date on close
    setIsDatePickerOpen(false);
  };
  
  // Handle dialog close
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setPaymentDate(date);
    }
    setIsDatePickerOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 sm:p-6 rounded-xl">
        <DialogHeader className="space-y-2 mb-2">
          <DialogTitle className="text-xl">Confirm Salary Payments</DialogTitle>
          <DialogDescription>
            You are about to confirm salary payments for {employeeCount} employee{employeeCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        
        {isConfirmed ? (
          <div className="py-8 flex flex-col items-center text-center space-y-5">
            <div className="bg-green-50 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <p className="font-medium text-lg">Payments Confirmed!</p>
            <p className="text-muted-foreground">
              Salary payments totaling {formatCurrency(totalAmount)} have been successfully processed.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 py-4">
              <div className="rounded-lg bg-muted p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Employees</span>
                  <span className="font-medium">{employeeCount}</span>
                </div>
                <div className="flex justify-between items-center border-t border-muted-foreground/20 pt-3">
                  <span>Total Amount</span>
                  <span className="font-semibold text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              
              {/* Date Picker */}
              <div className="grid gap-2">
                <label htmlFor="paymentDate" className="text-sm font-medium">
                  Payment Date
                </label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="paymentDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[1000]" align="start"> {/* Increased z-index */}
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date > new Date()} // Optional: disable future dates
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {error && (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
                  <AlertCircle className="h-6 w-6 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="flex items-start space-x-3 py-2">
                <Checkbox 
                  id="acknowledgement" 
                  checked={hasAcknowledged}
                  onCheckedChange={(checked) => {
                    setHasAcknowledged(checked as boolean);
                  }}
                  className="mt-1 h-5 w-5"
                />
                <label htmlFor="acknowledgement" className="text-sm">
                  I confirm that I have reviewed the salary information and wish to proceed with the payments.
                </label>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isConfirming}
                className="w-full sm:w-auto h-12 sm:h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!hasAcknowledged || !paymentDate || isConfirming}
                className="w-full sm:w-auto h-12 sm:h-10"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payments'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
        
      </DialogContent>
    </Dialog>
  );
}; 
