import { useState, FormEvent, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { LoanForm } from '../forms/LoanForm';
import { useLoans } from '../hooks/useLoans';
import { FinancialTabProps } from '../types/financials';

export const LoansTab = ({ employee, currentMonth }: FinancialTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  
  const {
    loans,
    errorMessage,
    setErrorMessage,
    loanSource,
    setLoanSource,
    cashDeposits,
    selectedDepositId,
    isLoadingDeposits,
    fetchCashDeposits,
    addLoanMutation,
    deleteLoanMutation
  } = useLoans(employee.id, currentMonth);

  useEffect(() => {
    if (isAddDialogOpen && loanSource === 'cash_deposit') {
      fetchCashDeposits();
    }
  }, [isAddDialogOpen, loanSource]);

  const handleAddLoan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    
    if (!description) {
      setErrorMessage('Description is required');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Amount must be a positive number');
      return;
    }
    
    if (loanSource === 'cash_deposit') {
      if (!selectedDepositId) {
        setErrorMessage('No cash deposit selected');
        return;
      }
      
      const selectedDeposit = cashDeposits.find(d => d.id === selectedDepositId);
      if (!selectedDeposit) {
        setErrorMessage('Selected deposit not found');
        return;
      }
      
      if (selectedDeposit.balance < amount) {
        setErrorMessage(`Insufficient balance in deposit (${selectedDeposit.balance} SAR)`);
        return;
      }
    }
    
    const loanData = {
      employee_id: employee.id,
      employee_name: employee.name,
      description,
      amount,
      date: format(selectedDate, 'yyyy-MM-dd'),
      source: loanSource,
      branch_id: employee.branch_id || null
    };
    
    addLoanMutation.mutate(loanData);
    setIsAddDialogOpen(false);
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsDatePopoverOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Employee Loans</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {loans.reduce((sum, loan) => sum + loan.amount, 0).toFixed(2)} SAR
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Loan</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Loan</DialogTitle>
            </DialogHeader>
            <LoanForm
              selectedDate={selectedDate}
              isDatePopoverOpen={isDatePopoverOpen}
              setIsDatePopoverOpen={setIsDatePopoverOpen}
              handleSelectDate={handleSelectDate}
              handleAddLoan={handleAddLoan}
              errorMessage={errorMessage}
              onCancel={() => setIsAddDialogOpen(false)}
              loanSource={loanSource}
              setLoanSource={setLoanSource}
              cashDeposits={cashDeposits}
              selectedDepositId={selectedDepositId}
              isLoadingDeposits={isLoadingDeposits}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {loans.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>No loans found for this month</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {loans.map((loan) => (
              <Card key={loan.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{loan.description}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(loan.date), 'MMM d, yyyy')}
                        </Badge>
                      </div>
                      <p className="text-2xl font-semibold mt-1 text-amber-600">
                        {loan.amount.toFixed(2)} SAR
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteLoanMutation.mutate(loan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}; 