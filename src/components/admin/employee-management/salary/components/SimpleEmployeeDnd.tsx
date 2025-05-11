import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, PenSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SalaryPlan {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  name: string;
  salary_plan_id: string;
  photo_url?: string;
  is_archived?: boolean;
}

export const SimpleEmployeeDnd = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [employeesByPlan, setEmployeesByPlan] = useState<Record<string, Employee[]>>({});
  
  // Fetch ALL salary plans
  const { data: salaryPlans = [], isLoading: isLoadingPlans, error: plansError } = useQuery({
    queryKey: ['all-salary-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salary_plans').select('*');
      if (error) throw error;
      return data as SalaryPlan[] || [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 // Consider data stale after 1 minute
  });
  
  // Fetch employees with their assigned plans - ADDING FILTER FOR ARCHIVED EMPLOYEES
  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useQuery({
    queryKey: ['employees-with-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, salary_plan_id, photo_url, is_archived')
        .eq('is_archived', false); // Only fetch non-archived employees
      
      if (error) throw error;
      return data as Employee[] || [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 // Consider data stale after 1 minute
  });

  // Group employees by plan after employees are loaded
  useEffect(() => {
    const groupedEmployees = employees.reduce((acc: Record<string, Employee[]>, emp) => {
      if (emp.salary_plan_id) {
        if (!acc[emp.salary_plan_id]) acc[emp.salary_plan_id] = [];
        acc[emp.salary_plan_id].push(emp);
      }
      return acc;
    }, {});
    setEmployeesByPlan(groupedEmployees);
  }, [employees, updateKey]);

  // Display error toasts if queries fail
  useEffect(() => {
    if (plansError) {
      toast({
        title: "Error loading salary plans",
        description: plansError.message || "Failed to load salary plans",
        variant: "destructive"
      });
    }
    
    if (employeesError) {
      toast({
        title: "Error loading employees",
        description: employeesError.message || "Failed to load employees",
        variant: "destructive"
      });
    }
  }, [plansError, employeesError, toast]);

  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      'fixed': 'Fixed Salary',
      'commission': 'Commission',
      'dynamic_basic': 'Dynamic Basic',
      'commission_only': 'Commission Only',
      'tiered_commission': 'Tiered Commission', 
      'team_commission': 'Team Commission',
      'formula': 'Formula'
    };
    return typeMap[type] || type;
  };

  const getBadgeVariant = (type: string) => {
    const variantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'fixed': 'outline',
      'commission': 'default', 
      'dynamic_basic': 'secondary',
      'formula': 'default'
    };
    return variantMap[type] || 'outline';
  };

  // Handle employee dragging
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, employeeId: string) => {
    event.dataTransfer.setData('text/plain', employeeId);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Allow dropping on a salary plan
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Handle dropping an employee on a plan
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, planId: string) => {
    event.preventDefault();
    const employeeId = event.dataTransfer.getData('text/plain');
    
    if (!employeeId || !planId) return;
    
    try {
      // Get the original plan ID before update for optimistic UI update
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;
      
      const originalPlanId = employee.salary_plan_id;
      
      // Start updating
      setIsUpdatingEmployee(true);
      console.log(`Moving employee ${employeeId} from plan ${originalPlanId} to plan ${planId}`);
      
      // Optimistic UI update before the actual API call
      const updatedEmployees = employees.map(emp => 
        emp.id === employeeId ? { ...emp, salary_plan_id: planId } : emp
      );
      
      // Manually update the query cache to immediately reflect changes
      queryClient.setQueryData(['employees-with-plans'], updatedEmployees);
      
      // Force UI to update by incrementing the key
      setUpdateKey(prevKey => prevKey + 1);
      
      const { error } = await supabase
        .from('employees')
        .update({ salary_plan_id: planId })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: 'Employee Updated',
        description: 'Successfully reassigned employee to new salary plan',
      });

      // Force refetch to ensure data consistency
      await queryClient.refetchQueries({ queryKey: ['employees-with-plans'], type: 'active' });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update employee salary plan',
        variant: 'destructive',
      });
      
      // Refetch to revert any optimistic updates in case of error
      await queryClient.refetchQueries({ queryKey: ['employees-with-plans'] });
    } finally {
      setIsUpdatingEmployee(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">All Salary Plans</h2>
          <p className="text-muted-foreground">
            Manage existing salary plans and assign employees using drag and drop
          </p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-muted rounded-md border">
        <p className="text-sm flex items-center">
          <span className="mr-2">💡</span>
          <strong>Tip:</strong> Drag and drop employees between salary plans to reassign them.
        </p>
      </div>

      {isLoadingPlans || isLoadingEmployees ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : salaryPlans.length === 0 ? (
        <div className="text-center py-6">
          <PenSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No salary plans found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create a salary plan to start assigning employees
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salaryPlans.map((plan) => {
            const assignedEmployees = employeesByPlan[plan.id] || [];
            
            return (
              <div 
                key={plan.id}
                className="border rounded-lg bg-card transition-all overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, plan.id)}
              >
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <Badge variant={getBadgeVariant(plan.type)}>
                        {getTypeDisplayName(plan.type)}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(plan.updated_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 min-h-[200px]" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, plan.id)}>
                  <div className="text-sm font-medium mb-3">
                    Assigned Employees ({assignedEmployees.length})
                  </div>
                  {assignedEmployees.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {assignedEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center gap-2 bg-background p-2 rounded-md border cursor-grab hover:border-primary transition-colors select-none"
                          draggable
                          onDragStart={(e) => handleDragStart(e, employee.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.photo_url || ''} alt={employee.name} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">{employee.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[150px] border border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Drag employees here to assign them to this plan
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Loading overlay for employee updates */}
      {isUpdatingEmployee && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-md shadow-lg">
            <p>Updating employee assignment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleEmployeeDnd; 