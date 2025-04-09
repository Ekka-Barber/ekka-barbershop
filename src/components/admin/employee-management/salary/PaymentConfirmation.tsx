import { useState } from 'react';
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
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  employeeCount: number;
  onConfirm: () => Promise<boolean>;
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
  
  // Handle confirmation
  const handleConfirm = async () => {
    if (!hasAcknowledged) return;
    
    setIsConfirming(true);
    setError(null);
    
    try {
      const success = await onConfirm();
      
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
  };
  
  // Handle dialog close
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Salary Payments</DialogTitle>
          <DialogDescription>
            You are about to confirm salary payments for {employeeCount} employee{employeeCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        
        {isConfirmed ? (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="font-medium text-lg">Payments Confirmed!</p>
            <p className="text-muted-foreground">
              Salary payments totaling {formatCurrency(totalAmount)} have been successfully processed.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Employees</span>
                  <span className="font-medium">{employeeCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Amount</span>
                  <span className="font-semibold text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="acknowledgement" 
                  checked={hasAcknowledged}
                  onCheckedChange={(checked) => {
                    setHasAcknowledged(checked as boolean);
                  }}
                />
                <label htmlFor="acknowledgement" className="text-sm">
                  I confirm that I have reviewed the salary information and wish to proceed with the payments.
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!hasAcknowledged || isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
