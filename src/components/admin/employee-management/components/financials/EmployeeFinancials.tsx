import { useState, FormEvent } from 'react';
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

const BonusesTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
    mutationFn: async (newBonus: {
      employee_id: string;
      employee_name: string;
      description: string;
      amount: number;
      date: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_bonuses')
        .insert([newBonus])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-bonuses', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
      setIsAddDialogOpen(false);
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
    
    if (!description || isNaN(amount)) return;
    
    addBonusMutation.mutate({
      employee_id: employee.id,
      employee_name: employee.name,
      description,
      amount,
      date: format(selectedDate, 'yyyy-MM-dd')
    });
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
            <form onSubmit={handleAddBonus} className="space-y-4 mt-2">
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
                <Popover>
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
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
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

const DeductionsTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
    mutationFn: async (newDeduction: {
      employee_id: string;
      employee_name: string;
      description: string;
      amount: number;
      date: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_deductions')
        .insert([newDeduction])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
      setIsAddDialogOpen(false);
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
    
    if (!description || isNaN(amount)) return;
    
    addDeductionMutation.mutate({
      employee_id: employee.id,
      employee_name: employee.name,
      description,
      amount,
      date: format(selectedDate, 'yyyy-MM-dd')
    });
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
            <form onSubmit={handleAddDeduction} className="space-y-4 mt-2">
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
                <Popover>
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
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
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

const LoansTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  
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
    mutationFn: async (newLoan: {
      employee_id: string;
      employee_name: string;
      description: string;
      amount: number;
      date: string;
      source: string;
      branch_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_loans')
        .insert([newLoan])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans', employee.id, currentMonth] });
      if (refetchEmployees) refetchEmployees();
      setIsAddDialogOpen(false);
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
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    
    if (!description || isNaN(amount)) return;
    
    addLoanMutation.mutate({
      employee_id: employee.id,
      employee_name: employee.name,
      description,
      amount,
      date: format(selectedDate, 'yyyy-MM-dd'),
      source: 'manual',
      branch_id: employee.branch_id
    });
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
            <form onSubmit={handleAddLoan} className="space-y-4 mt-2">
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
                <Popover>
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
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
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
