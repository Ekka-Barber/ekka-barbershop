import { useState, FormEvent } from 'react';
import { Employee } from '@/types/employee';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, CircleDollarSign, Wallet, CreditCard } from 'lucide-react';
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
import { format } from 'date-fns';

interface EmployeeFinancialsProps {
  employee: Employee;
  refetchEmployees?: () => void;
}

export const EmployeeFinancials = ({
  employee,
  refetchEmployees
}: EmployeeFinancialsProps) => {
  const [activeTab, setActiveTab] = useState<string>('bonuses');
  const currentMonth = format(new Date(), 'yyyy-MM');

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
  const queryClient = useQueryClient();
  
  const { data: bonuses = [] } = useQuery({
    queryKey: ['employee-bonuses', employee.id, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', currentMonth)
        .order('created_at', { ascending: false });
        
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
      date: currentMonth
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Employee Bonuses</h3>
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
        <div className="space-y-3">
          {bonuses.map((bonus) => (
            <Card key={bonus.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{bonus.description}</h4>
                    <p className="text-2xl font-semibold mt-1">{bonus.amount.toFixed(2)}</p>
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
      )}
    </div>
  );
};

const DeductionsTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: deductions = [] } = useQuery({
    queryKey: ['employee-deductions', employee.id, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', currentMonth)
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
      date: currentMonth
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Employee Deductions</h3>
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
        <div className="space-y-3">
          {deductions.map((deduction) => (
            <Card key={deduction.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{deduction.description}</h4>
                    <p className="text-2xl font-semibold mt-1 text-destructive">{deduction.amount.toFixed(2)}</p>
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
      )}
    </div>
  );
};

const LoansTab = ({ employee, currentMonth, refetchEmployees }: FinancialTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: loans = [] } = useQuery({
    queryKey: ['employee-loans', employee.id, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .eq('employee_id', employee.id)
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
    const date = formData.get('date') as string || currentMonth;
    
    if (!description || isNaN(amount)) return;
    
    addLoanMutation.mutate({
      employee_id: employee.id,
      employee_name: employee.name,
      description,
      amount,
      date,
      source: 'manual',
      branch_id: employee.branch_id
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Employee Loans</h3>
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
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <Input 
                  id="date" 
                  name="date" 
                  type="month" 
                  defaultValue={currentMonth}
                  required 
                />
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
          <p>No loans found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => (
            <Card key={loan.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{loan.description}</h4>
                      <span className="text-xs text-muted-foreground">
                        {loan.date}
                      </span>
                    </div>
                    <p className="text-2xl font-semibold mt-1 text-amber-500">{loan.amount.toFixed(2)}</p>
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
      )}
    </div>
  );
};
