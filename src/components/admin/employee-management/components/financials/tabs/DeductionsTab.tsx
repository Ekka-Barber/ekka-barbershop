import { useState, FormEvent } from 'react';
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
import { DeductionForm } from '../forms/DeductionForm';
import { useDeductions } from '../hooks/useDeductions';
import { FinancialTabProps } from '../types/financials';

export const DeductionsTab = ({ employee, currentMonth }: FinancialTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  
  const {
    deductions,
    errorMessage,
    setErrorMessage,
    addDeductionMutation,
    deleteDeductionMutation
  } = useDeductions(employee.id, currentMonth);

  const handleAddDeduction = (e: FormEvent<HTMLFormElement>) => {
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
    
    const deductionData = {
      employee_id: employee.id,
      employee_name: employee.name,
      description,
      amount,
      date: format(selectedDate, 'yyyy-MM-dd')
    };
    
    addDeductionMutation.mutate(deductionData);
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
          <h3 className="text-sm font-medium">Employee Deductions</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {deductions.reduce((sum, deduction) => sum + deduction.amount, 0).toFixed(2)} SAR
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Deduction</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Deduction</DialogTitle>
            </DialogHeader>
            <DeductionForm
              selectedDate={selectedDate}
              isDatePopoverOpen={isDatePopoverOpen}
              setIsDatePopoverOpen={setIsDatePopoverOpen}
              handleSelectDate={handleSelectDate}
              handleAddDeduction={handleAddDeduction}
              errorMessage={errorMessage}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {deductions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>No deductions found for this month</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {deductions.map((deduction) => (
              <Card key={deduction.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{deduction.description}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(deduction.date), 'MMM d, yyyy')}
                        </Badge>
                      </div>
                      <p className="text-2xl font-semibold mt-1 text-red-600">
                        {deduction.amount.toFixed(2)} SAR
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteDeductionMutation.mutate(deduction.id)}
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