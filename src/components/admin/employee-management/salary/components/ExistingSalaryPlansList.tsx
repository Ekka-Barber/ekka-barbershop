import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, PenSquare, Code, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { FormulaPlanConfig } from '@/components/admin/salary-plans/FormulaPlanConfig';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

/**
 * Component that displays all salary plans regardless of type,
 * and shows which employees are assigned to each plan.
 * Note: This component uses type assertions to handle database typing discrepancies.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
}

export const ExistingSalaryPlansList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SalaryPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rawConfig, setRawConfig] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'simple' | 'advanced'>('simple');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  
  // Simple form fields for fixed and dynamic_basic plans
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);
  const [bonusTiers, setBonusTiers] = useState<Array<{bonus: number, sales_target: number}>>([]);

  // Configure DnD sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px movement before drag starts
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // Wait 250ms before touch drag starts
      tolerance: 5, // 5px movement allowed before canceling tap
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to salary_plans table changes
    const salaryPlansSubscription = supabase
      .channel('salary-plans-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'salary_plans'
        },
        async (payload) => {
          console.log('Salary plan change detected:', payload);
          // Invalidate and refetch salary plans query
          await queryClient.invalidateQueries({ queryKey: ['all-salary-plans'] });
        }
      )
      .subscribe();

    // Subscribe to employees table changes (specifically salary_plan_id changes)
    const employeesSubscription = supabase
      .channel('employee-plan-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'employees',
          filter: 'salary_plan_id'
        },
        async (payload) => {
          console.log('Employee salary plan change detected:', payload);
          // Invalidate and refetch employees query
          await queryClient.invalidateQueries({ queryKey: ['employees-with-plans'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on component unmount
    return () => {
      salaryPlansSubscription.unsubscribe();
      employeesSubscription.unsubscribe();
    };
  }, [queryClient]);

  // Fetch ALL salary plans with refetching strategy
  const { data: salaryPlans = [], isLoading: isLoadingPlans, refetch: refetchPlans } = useQuery({
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
  
  // Fetch employees with their assigned plans
  const { data: employees = [], isLoading: isLoadingEmployees, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees-with-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('id, name, salary_plan_id, photo_url');
      if (error) throw error;
      return data as Employee[] || [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 // Consider data stale after 1 minute
  });

  // Add effect to refetch data when component mounts or gains focus
  useEffect(() => {
    refetchPlans();
    refetchEmployees();
  }, [refetchPlans, refetchEmployees]);

  // Group employees by plan ID
  const employeesByPlan = employees.reduce((acc: Record<string, Employee[]>, emp) => {
    if (emp.salary_plan_id) {
      if (!acc[emp.salary_plan_id]) acc[emp.salary_plan_id] = [];
      acc[emp.salary_plan_id].push(emp);
    }
    return acc;
  }, {});

  const handleEditPlan = (plan: SalaryPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
    setEditMode('simple');
    
    // Initialize the raw config editor with the stringified JSON
    setRawConfig(JSON.stringify(plan.config, null, 2));
    setJsonError(null);
    
    // Initialize simple form fields based on plan type and config
    if (plan.type === 'fixed') {
      // Extract base salary from fixed plan config
      try {
        const config = plan.config;
        let amount = 0;
        
        // Try to find the amount in different possible locations
        if (config.blocks && Array.isArray(config.blocks)) {
          for (const block of config.blocks) {
            if (block.type === 'fixed_amount' && block.config && block.config.amount) {
              amount = Number(block.config.amount);
              break;
            }
          }
        }
        
        // Fallbacks
        if (amount === 0) {
          amount = Number(
            config.base_salary || 
            config.base_amount || 
            config.amount || 
            config.salary || 
            config.fixed_amount ||
            0
          );
        }
        
        setBaseSalary(amount);
      } catch (e) {
        console.error('Error parsing fixed plan config', e);
        setBaseSalary(0);
      }
    } else if (plan.type === 'dynamic_basic') {
      try {
        const config = plan.config;
        let baseSalaryValue = 0;
        let commissionRateValue = 0;
        let thresholdValue = 0;
        let bonusTiersArray: Array<{bonus: number, sales_target: number}> = [];
        
        // Extract from blocks structure
        if (config.blocks && Array.isArray(config.blocks)) {
          for (const block of config.blocks) {
            // Parse base salary
            if (block.type === 'basic_salary' && block.config) {
              baseSalaryValue = Number(block.config.base_salary || 0);
              
              // Parse bonus tiers
              if (block.config.tiered_bonus && Array.isArray(block.config.tiered_bonus)) {
                bonusTiersArray = block.config.tiered_bonus.map((tier: any) => ({
                  bonus: Number(tier.bonus || 0),
                  sales_target: Number(tier.sales_target || 0)
                }));
              }
            }
            
            // Parse commission
            if (block.type === 'commission' && block.config) {
              commissionRateValue = Number(block.config.rate || 0) * 100; // Convert from decimal to percentage
              thresholdValue = Number(block.config.threshold || 0);
            }
          }
        }
        
        setBaseSalary(baseSalaryValue);
        setCommissionRate(commissionRateValue);
        setThreshold(thresholdValue);
        setBonusTiers(bonusTiersArray);
      } catch (e) {
        console.error('Error parsing dynamic_basic plan config', e);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPlan(null);
    setRawConfig('');
    setJsonError(null);
    setEditMode('simple');
    
    // Reset simple form fields
    setBaseSalary(0);
    setCommissionRate(0);
    setThreshold(0);
    setBonusTiers([]);
  };

  const handleSave = async (config: Record<string, unknown>) => {
    try {
      if (isEditing && selectedPlan) {
        const { error } = await supabase
          .from('salary_plans')
          .update({ config: config as any })
          .eq('id', selectedPlan.id);
          
        if (error) throw error;
        
        // Invalidate and refetch queries with correct syntax
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['all-salary-plans'] }),
          queryClient.invalidateQueries({ queryKey: ['employees-with-plans'] })
        ]);
        
        toast({
          title: 'Plan updated',
          description: 'The salary plan has been updated successfully'
        });
      }
      
      setIsEditing(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the salary plan',
        variant: 'destructive'
      });
    }
  };

  const handleSaveRawConfig = async () => {
    try {
      if (!selectedPlan) return;

      // Try to parse the JSON
      let parsedConfig: Record<string, unknown>;
      try {
        parsedConfig = JSON.parse(rawConfig);
        setJsonError(null);
      } catch {
        setJsonError('Invalid JSON format. Please check your syntax.');
        return;
      }

      // Update the plan with the new config
      const { error } = await supabase
        .from('salary_plans')
        .update({ config: parsedConfig as any })
        .eq('id', selectedPlan.id);
        
      if (error) throw error;
      
      toast({
        title: 'Plan updated',
        description: 'The salary plan has been updated successfully'
      });

      // Reset state and refetch data
      setIsEditing(false);
      setSelectedPlan(null);
      setRawConfig('');
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the salary plan',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSimpleForm = async () => {
    try {
      if (!selectedPlan) return;
      
      let newConfig: Record<string, unknown> = {};
      
      // Build config based on plan type
      if (selectedPlan.type === 'fixed') {
        newConfig = {
          name: selectedPlan.name,
          blocks: [
            {
              id: "1",
              type: "fixed_amount",
              config: {
                amount: baseSalary
              }
            }
          ],
          description: `Fixed monthly salary of ${baseSalary} SAR`
        };
      } else if (selectedPlan.type === 'dynamic_basic') {
        newConfig = {
          name: selectedPlan.name,
          blocks: [
            {
              id: "basic-salary",
              type: "basic_salary",
              config: {
                base_salary: baseSalary,
                tiered_bonus: bonusTiers
              }
            },
            {
              id: "commission",
              type: "commission",
              config: {
                rate: commissionRate / 100, // Convert percentage to decimal
                threshold: threshold
              }
            }
          ],
          description: `A plan with a fixed basic salary of ${baseSalary} SAR, ${commissionRate}% commission above ${threshold} SAR, and tiered bonuses for meeting sales targets.`
        };
      } else {
        // For other plan types, use the raw JSON config
        try {
          newConfig = JSON.parse(rawConfig);
        } catch {
          setJsonError('Invalid JSON format. Please check your syntax.');
          return;
        }
      }
      
      // Update the plan with the new config
      const { error } = await supabase
        .from('salary_plans')
        .update({ config: newConfig as any })
        .eq('id', selectedPlan.id);
        
      if (error) throw error;
      
      toast({
        title: 'Plan updated',
        description: 'The salary plan has been updated successfully'
      });

      // Reset state and refetch data
      setIsEditing(false);
      setSelectedPlan(null);
      setRawConfig('');
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the salary plan',
        variant: 'destructive'
      });
    }
  };
  
  // Handle adding a new bonus tier
  const handleAddBonusTier = () => {
    setBonusTiers([...bonusTiers, { bonus: 0, sales_target: 0 }]);
  };
  
  // Handle updating a bonus tier
  const handleUpdateBonusTier = (index: number, field: 'bonus' | 'sales_target', value: number) => {
    const newTiers = [...bonusTiers];
    newTiers[index][field] = value;
    setBonusTiers(newTiers);
  };
  
  // Handle removing a bonus tier
  const handleRemoveBonusTier = (index: number) => {
    const newTiers = [...bonusTiers];
    newTiers.splice(index, 1);
    setBonusTiers(newTiers);
  };

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

  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event;
    const employee = employees.find(emp => emp.id === active.id);
    setActiveId(active.id);
    if (employee) setDraggedEmployee(employee);
  };

  // Handle drag end
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const employeeId = active.id;
      const newPlanId = over.id;
      
      try {
        const { error } = await supabase
          .from('employees')
          .update({ salary_plan_id: newPlanId })
          .eq('id', employeeId);

        if (error) throw error;

        toast({
          title: 'Employee Updated',
          description: 'Successfully reassigned employee to new salary plan',
        });

        // Refetch data
        await queryClient.invalidateQueries({ queryKey: ['employees-with-plans'] });
      } catch (error) {
        console.error('Error updating employee:', error);
        toast({
          title: 'Error',
          description: 'Failed to update employee salary plan',
          variant: 'destructive',
        });
      }
    }
    
    setActiveId(null);
    setDraggedEmployee(null);
  };

  // Render form for fixed salary plan
  const renderFixedPlanForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="base-salary">Base Salary (SAR)</Label>
        <Input 
          id="base-salary"
          type="number" 
          value={baseSalary} 
          onChange={(e) => setBaseSalary(Number(e.target.value))}
          className="mt-1"
        />
      </div>
    </div>
  );
  
  // Render form for dynamic basic plan
  const renderDynamicBasicPlanForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Basic Salary</h3>
        <div>
          <Label htmlFor="base-salary">Base Salary (SAR)</Label>
          <Input 
            id="base-salary"
            type="number" 
            value={baseSalary} 
            onChange={(e) => setBaseSalary(Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Commission</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="commission-rate">Commission Rate (%)</Label>
            <Input 
              id="commission-rate"
              type="number" 
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="threshold">Threshold (SAR)</Label>
            <Input 
              id="threshold"
              type="number" 
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Bonus Tiers</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddBonusTier}
          >
            Add Tier
          </Button>
        </div>
        
        {bonusTiers.length > 0 ? (
          <div className="space-y-3">
            {bonusTiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 items-center border p-2 rounded-md">
                <div className="col-span-2">
                  <Label htmlFor={`bonus-${index}`}>Bonus Amount</Label>
                  <Input 
                    id={`bonus-${index}`}
                    type="number" 
                    value={tier.bonus} 
                    onChange={(e) => handleUpdateBonusTier(index, 'bonus', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`target-${index}`}>Sales Target</Label>
                  <Input 
                    id={`target-${index}`}
                    type="number" 
                    value={tier.sales_target} 
                    onChange={(e) => handleUpdateBonusTier(index, 'sales_target', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end items-end h-full">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveBonusTier(index)}
                    className="h-8 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md text-muted-foreground">
            No bonus tiers defined. Click "Add Tier" to add one.
          </div>
        )}
      </div>
    </div>
  );

  if (isEditing && selectedPlan) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Salary Plan</CardTitle>
          <CardDescription>Update configuration for {selectedPlan.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedPlan.type === 'formula' ? (
            <FormulaPlanConfig 
              planId={selectedPlan.id}
              initialConfig={selectedPlan.config}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <div className="space-y-4">
              {(selectedPlan.type === 'fixed' || selectedPlan.type === 'dynamic_basic') ? (
                <Tabs defaultValue="simple" value={editMode} onValueChange={(value) => setEditMode(value as 'simple' | 'advanced')}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="simple" className="flex items-center gap-1">
                      <FileText className="h-4 w-4 mr-1" />
                      Simple Editor
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-1">
                      <Code className="h-4 w-4 mr-1" />
                      Advanced (JSON)
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="simple" className="pt-4">
                    {selectedPlan.type === 'fixed' ? renderFixedPlanForm() : renderDynamicBasicPlanForm()}
                    
                    <div className="flex justify-end space-x-2 mt-8">
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSaveSimpleForm}>Save Changes</Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="pt-4">
                    <div className="text-sm mb-4 text-amber-600">
                      Warning: Advanced editing is for developers only. Incorrect JSON can break your salary plan.
                    </div>
                    <Textarea 
                      value={rawConfig}
                      onChange={(e) => setRawConfig(e.target.value)}
                      className="font-mono text-sm h-[400px]"
                    />
                    {jsonError && (
                      <div className="text-sm text-red-500 mt-2">{jsonError}</div>
                    )}
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSaveRawConfig}>Save Changes</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div>
                  <div className="text-sm mb-4">
                    Advanced editing for {getTypeDisplayName(selectedPlan.type)} plans is not yet supported with a visual editor.
                    You can edit the raw configuration below:
                  </div>
                  <Textarea 
                    value={rawConfig}
                    onChange={(e) => setRawConfig(e.target.value)}
                    className="font-mono text-sm h-[400px]"
                  />
                  {jsonError && (
                    <div className="text-sm text-red-500 mt-2">{jsonError}</div>
                  )}
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSaveRawConfig}>Save Changes</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

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
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryPlans.map((plan) => {
              const assignedEmployees = employeesByPlan[plan.id] || [];
              
              return (
                <div 
                  key={plan.id}
                  id={plan.id} // Required for drag and drop
                  className="border rounded-lg bg-card"
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
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(plan.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 min-h-[200px]">
                    <div className="text-sm font-medium mb-3">
                      Assigned Employees ({assignedEmployees.length})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {assignedEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          id={employee.id} // Required for drag and drop
                          className={`
                            flex items-center gap-2 bg-background p-2 rounded-md border
                            cursor-move hover:border-primary transition-colors
                            ${activeId === employee.id ? 'opacity-50' : ''}
                          `}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.photo_url || ''} alt={employee.name} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">{employee.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {draggedEmployee ? (
              <div className="flex items-center gap-2 bg-background p-2 rounded-md border shadow-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={draggedEmployee.photo_url || ''} alt={draggedEmployee.name} />
                  <AvatarFallback>{draggedEmployee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{draggedEmployee.name}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

// Add default export
export default ExistingSalaryPlansList; 