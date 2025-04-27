import { useState, FormEvent, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, CircleDollarSign, Wallet, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { EmployeeBonus, EmployeeDeduction, EmployeeLoan } from '@/lib/salary/types/salary';
import { format, lastDayOfMonth } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface EmployeeFinancialsProps {
  employee: Employee;
  refetchEmployees?: () => void;
  selectedMonth?: string;
}

export const EmployeeFinancials = ({
  employee,
  refetchEmployees,
  selectedMonth
}: EmployeeFinancialsProps) => {
  const [activeTab, setActiveTab] = useState<string>('bonuses');
  const currentMonth = selectedMonth || format(new Date(), 'yyyy-MM');
  
  console.log('EmployeeFinancials component rendered with:', {
    employeeId: employee.id,
    selectedMonth,
    currentMonth
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="bonuses" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bonuses" className="flex items-center gap-1">
            <CircleDollarSign className="h-4 w-4" />
            <span>Bonuses</span>
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            <span>Deductions</span>
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Loans</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bonuses">
          <BonusesTab 
            employee={employee} 
            currentMonth={currentMonth}
            refetchEmployees={refetchEmployees}
          />
        </TabsContent>
        
        <TabsContent value="deductions">
          <DeductionsTab 
            employee={employee} 
            currentMonth={currentMonth}
            refetchEmployees={refetchEmployees}
          />
        </TabsContent>
        
        <TabsContent value="loans">
          <LoansTab 
            employee={employee} 
            currentMonth={currentMonth}
            refetchEmployees={refetchEmployees}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface FinancialTabProps {
  employee: Employee;
  currentMonth: string;
  refetchEmployees?: () => void;
}

// Define interfaces for submission data
interface SubmitBonusData {
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
}

interface SubmitDeductionData {
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
}

interface SubmitLoanData {
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
  source: string;
  branch_id: string | null;
  cash_deposit_id: string | null;
}

const BonusesTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps): JSX.Element => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  console.log('BonusesTab rendered with:', {
    employeeId: employee.id,
    currentMonth
  });
  
  const { data: bonuses = [] } = useQuery({
    queryKey: ['employee-bonuses', employee.id, currentMonth],
    queryFn: async () => {
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = format(lastDayOfMonth(new Date(currentMonth)), 'yyyy-MM-dd');
      
      console.log('Fetching bonuses with date range:', {
        employeeId: employee.id,
        startOfMonth,
        endOfMonth
      });
      
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('created_at', { ascending: false });
      
      console.log('Bonuses fetch result:', {
        data,
        error
      });
        
      if (error) throw error;
      return data as EmployeeBonus[];
    }
  });
  
  const addBonusMutation = useMutation({
    mutationFn: async (newBonus: SubmitBonusData) => {
      console.log('Sending bonus data to Supabase:', newBonus);
      setErrorMessage(null);
      
      try {
        const { data, error } = await supabase
          .from('employee_bonuses')
          .insert([newBonus])
          .select()
          .single();
          
        if (error) {
          console.error('Supabase error when adding bonus:', error);
          setErrorMessage(`Error adding bonus: ${error.message}`);
          throw error;
        }
        
        console.log('Bonus added successfully:', data);
        return data;
      } catch (error) {
        console.error('Exception when adding bonus:', error);
        if (error instanceof Error) {
          setErrorMessage(`Error: ${error.message}`);
        } else {
          setErrorMessage('An unknown error occurred');
        }
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Bonus mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['employee-bonuses', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
      setIsAddDialogOpen(false);
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error('Bonus mutation error in onError handler:', error);
      if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  });
  
  const deleteBonusMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_bonuses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-bonuses', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
    }
  });
  
  const handleAddBonus = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    
    console.log('Bonus submission data:', {
      description,
      amount,
      date: selectedDate,
      formattedDate: format(selectedDate, 'yyyy-MM-dd'),
      employeeId: employee.id,
      employeeName: employee.name
    });
    
    if (!description) {
      console.error('Bonus submission error: Description is required');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      console.error('Bonus submission error: Invalid amount');
      return;
    }
    
    try {
      const bonusData: SubmitBonusData = {
        employee_id: employee.id,
        employee_name: employee.name,
        description,
        amount,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      addBonusMutation.mutate(bonusData);
    } catch (error) {
      console.error('Bonus submission mutation error:', error);
    }
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
          <h3 className="text-sm font-medium">Employee Bonuses</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {bonuses.reduce((sum, bonus) => sum + bonus.amount, 0).toFixed(2)} SAR
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Bonus</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bonus</DialogTitle>
            </DialogHeader>
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            <form 
              id="bonusForm"
              onSubmit={handleAddBonus} 
              className="space-y-4 mt-2"
            >
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Bonus submit button clicked');
                    
                    const description = document.querySelector<HTMLInputElement>('#bonusForm input[name="description"]')?.value;
                    const amountStr = document.querySelector<HTMLInputElement>('#bonusForm input[name="amount"]')?.value;
                    const amount = amountStr ? parseFloat(amountStr) : NaN;
                    
                    if (!description) {
                      console.error('Manual bonus submission: Description is required');
                      return;
                    }
                    
                    if (isNaN(amount) || amount <= 0) {
                      console.error('Manual bonus submission: Invalid amount');
                      return;
                    }
                    
                    try {
                      const bonusData: SubmitBonusData = {
                        employee_id: employee.id,
                        employee_name: employee.name,
                        description,
                        amount,
                        date: format(selectedDate, 'yyyy-MM-dd')
                      };
                      addBonusMutation.mutate(bonusData);
                    } catch (err) {
                      console.error('Manual bonus submission error:', err);
                    }
                  }}
                >
                  Add Bonus
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {bonuses.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>No bonuses found for this month</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {bonuses.map((bonus) => (
              <Card key={bonus.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{bonus.description}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(bonus.date), 'MMM d, yyyy')}
                        </Badge>
                      </div>
                      <p className="text-2xl font-semibold mt-1 text-green-600">
                        {bonus.amount.toFixed(2)} SAR
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteBonusMutation.mutate(bonus.id)}
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

const DeductionsTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps): JSX.Element => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: deductions = [] } = useQuery({
    queryKey: ['employee-deductions', employee.id, currentMonth],
    queryFn: async () => {
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = format(lastDayOfMonth(new Date(currentMonth)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as EmployeeDeduction[];
    }
  });
  
  const addDeductionMutation = useMutation({
    mutationFn: async (newDeduction: SubmitDeductionData) => {
      console.log('Sending deduction data to Supabase:', newDeduction);
      setErrorMessage(null);
      
      try {
        const { data, error } = await supabase
          .from('employee_deductions')
          .insert([newDeduction])
          .select()
          .single();
          
        if (error) {
          console.error('Supabase error when adding deduction:', error);
          setErrorMessage(`Error adding deduction: ${error.message}`);
          throw error;
        }
        
        console.log('Deduction added successfully:', data);
        return data;
      } catch (error) {
        console.error('Exception when adding deduction:', error);
        if (error instanceof Error) {
          setErrorMessage(`Error: ${error.message}`);
        } else {
          setErrorMessage('An unknown error occurred');
        }
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Deduction mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
      setIsAddDialogOpen(false);
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error('Deduction mutation error in onError handler:', error);
      if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  });
  
  const deleteDeductionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_deductions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
    }
  });
  
  const handleAddDeduction = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    
    console.log('Deduction submission data:', {
      description,
      amount,
      date: selectedDate,
      formattedDate: format(selectedDate, 'yyyy-MM-dd'),
      employeeId: employee.id,
      employeeName: employee.name
    });
    
    if (!description) {
      console.error('Deduction submission error: Description is required');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      console.error('Deduction submission error: Invalid amount');
      return;
    }
    
    try {
      const deductionData: SubmitDeductionData = {
        employee_id: employee.id,
        employee_name: employee.name,
        description,
        amount,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      addDeductionMutation.mutate(deductionData);
    } catch (error) {
      console.error('Deduction submission mutation error:', error);
    }
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
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            <form 
              id="deductionForm"
              onSubmit={handleAddDeduction} 
              className="space-y-4 mt-2"
            >
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input 
                  id="description" 
                  name="description" 
                  placeholder="Enter deduction description" 
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Deduction submit button clicked');
                    
                    const description = document.querySelector<HTMLInputElement>('#deductionForm input[name="description"]')?.value;
                    const amountStr = document.querySelector<HTMLInputElement>('#deductionForm input[name="amount"]')?.value;
                    const amount = amountStr ? parseFloat(amountStr) : NaN;
                    
                    if (!description) {
                      console.error('Manual deduction submission: Description is required');
                      return;
                    }
                    
                    if (isNaN(amount) || amount <= 0) {
                      console.error('Manual deduction submission: Invalid amount');
                      return;
                    }
                    
                    try {
                      const deductionData: SubmitDeductionData = {
                        employee_id: employee.id,
                        employee_name: employee.name,
                        description,
                        amount,
                        date: format(selectedDate, 'yyyy-MM-dd')
                      };
                      addDeductionMutation.mutate(deductionData);
                    } catch (err) {
                      console.error('Manual deduction submission error:', err);
                    }
                  }}
                >
                  Add Deduction
                </Button>
              </DialogFooter>
            </form>
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

const LoansTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps): JSX.Element => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loanSource, setLoanSource] = useState<'other' | 'cash_deposit'>('other');
  const [cashDeposits, setCashDeposits] = useState<Array<{ id: string, balance: number }>>([]);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch cash deposits when source is 'cash_deposit' and dialog is open
  useEffect(() => {
    if (isAddDialogOpen && loanSource === 'cash_deposit') {
      fetchCashDeposits();
    }
  }, [isAddDialogOpen, loanSource]);
  
  const fetchCashDeposits = async () => {
    setIsLoadingDeposits(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase
        .from('cash_deposits')
        .select('id, balance')
        .gt('balance', 0)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching cash deposits:', error);
        setErrorMessage(`Error fetching cash deposits: ${error.message}`);
        setCashDeposits([]);
        setSelectedDepositId(null);
        return;
      }
      
      setCashDeposits(data || []);
      if (data && data.length > 0) {
        setSelectedDepositId(data[0].id);
      } else {
        setSelectedDepositId(null);
      }
    } catch (err) {
      console.error('Exception fetching cash deposits:', err);
      setErrorMessage('Error fetching cash deposits');
      setCashDeposits([]);
      setSelectedDepositId(null);
    } finally {
      setIsLoadingDeposits(false);
    }
  };
  
  const { data: loans = [] } = useQuery({
    queryKey: ['employee-loans', employee.id, currentMonth],
    queryFn: async () => {
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = format(lastDayOfMonth(new Date(currentMonth)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as EmployeeLoan[];
    }
  });
  
  const addLoanMutation = useMutation({
    mutationFn: async (newLoan: Omit<SubmitLoanData, 'cash_deposit_id'>) => {
      console.log('Sending loan data to Supabase:', newLoan);
      setErrorMessage(null);
      
      try {
        if (newLoan.source === 'cash_deposit') {
          if (!selectedDepositId) {
            throw new Error('No cash deposit selected');
          }
          
          const selectedDeposit = cashDeposits.find(d => d.id === selectedDepositId);
          if (!selectedDeposit) {
            throw new Error('Selected deposit not found');
          }
          
          if (selectedDeposit.balance < newLoan.amount) {
            throw new Error(`Insufficient balance in deposit (${selectedDeposit.balance} SAR)`);
          }
          
          // For cash deposit loans, we'll use RPC or a trigger in the database to handle the balance update
          // Here we just attach the deposit ID
          const loanData: SubmitLoanData = {
            ...newLoan,
            cash_deposit_id: selectedDepositId
          };
          
          const { data, error } = await supabase
            .from('employee_loans')
            .insert([loanData])
            .select()
            .single();
            
          if (error) {
            console.error('Supabase error when adding loan from deposit:', error);
            setErrorMessage(`Error adding loan: ${error.message}`);
            throw error;
          }
          
          console.log('Loan from deposit added successfully:', data);
          
          // We would also need to update the deposit balance, if there's no trigger for this in the DB
          // This could be done here or through a stored procedure
          
          return data;
        } else {
          // Regular loan (not from deposit)
          const loanData: SubmitLoanData = {
            ...newLoan,
            cash_deposit_id: null
          };

          const { data, error } = await supabase
            .from('employee_loans')
            .insert([loanData])
            .select()
            .single();
            
          if (error) {
            console.error('Supabase error when adding loan:', error);
            setErrorMessage(`Error adding loan: ${error.message}`);
            throw error;
          }
          
          console.log('Loan added successfully:', data);
          return data;
        }
      } catch (error) {
        console.error('Exception when adding loan:', error);
        if (error instanceof Error) {
          setErrorMessage(`Error: ${error.message}`);
        } else {
          setErrorMessage('An unknown error occurred');
        }
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Loan mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['employee-loans', employee.id, currentMonth] });
      // Also invalidate cash deposits query if needed
      if (loanSource === 'cash_deposit') {
        queryClient.invalidateQueries({ queryKey: ['cash-deposits'] });
      }
      if (refetchEmployees) refetchEmployees();
      setIsAddDialogOpen(false);
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error('Loan mutation error in onError handler:', error);
      if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  });
  
  const deleteLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_loans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
    }
  });
  
  const handleAddLoan = (e: FormEvent<HTMLFormElement>) => {
    console.log('Form submission started:', e);
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    
    console.log('Loan submission data:', {
      description,
      amount,
      date: selectedDate,
      formattedDate: format(selectedDate, 'yyyy-MM-dd'),
      employeeId: employee.id,
      employeeName: employee.name,
      branchId: employee.branch_id,
      source: loanSource,
      selectedDepositId
    });
    
    if (!description) {
      console.error('Loan submission error: Description is required');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      console.error('Loan submission error: Invalid amount');
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
    
    try {
      console.log('Attempting to add loan...');
      const loanData: Omit<SubmitLoanData, 'cash_deposit_id'> = {
        employee_id: employee.id,
        employee_name: employee.name,
        description,
        amount,
        date: format(selectedDate, 'yyyy-MM-dd'),
        source: loanSource,
        branch_id: employee.branch_id || null
      };
      addLoanMutation.mutate(loanData);
      console.log('Loan mutation triggered successfully');
    } catch (error) {
      console.error('Loan submission mutation error:', error);
    }
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
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            <form 
              id="loanForm"
              onSubmit={handleAddLoan} 
              className="space-y-4 mt-2"
            >
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={loanSource === 'cash_deposit' && 
                    (cashDeposits.length === 0 || 
                     !selectedDepositId || 
                     isLoadingDeposits)}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Submit button clicked, attempting manual submission');
                    
                    const description = document.querySelector<HTMLInputElement>('#loanForm input[name="description"]')?.value;
                    const amountStr = document.querySelector<HTMLInputElement>('#loanForm input[name="amount"]')?.value;
                    const amount = amountStr ? parseFloat(amountStr) : NaN;
                    
                    console.log('Manual form values:', { 
                      description, 
                      amountStr, 
                      amount,
                      loanSource,
                      selectedDepositId 
                    });
                    
                    if (!description) {
                      console.error('Manual submission: Description is required');
                      setErrorMessage('Description is required');
                      return;
                    }
                    
                    if (isNaN(amount) || amount <= 0) {
                      console.error('Manual submission: Invalid amount');
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
                    
                    try {
                      console.log('Manual submission: Adding loan...');
                      const loanData: Omit<SubmitLoanData, 'cash_deposit_id'> = {
                        employee_id: employee.id,
                        employee_name: employee.name,
                        description,
                        amount,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        source: loanSource,
                        branch_id: employee.branch_id || null
                      };
                      addLoanMutation.mutate(loanData);
                      console.log('Manual submission: Mutation triggered');
                    } catch (err) {
                      console.error('Manual submission error:', err);
                    }
                  }}
                >
                  Add Loan
                </Button>
              </DialogFooter>
            </form>
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
