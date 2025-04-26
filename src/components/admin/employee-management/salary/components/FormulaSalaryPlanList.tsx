/**
 * Formula Salary Plan List
 * 
 * Note: This component works with 'formula' as a salary calculation type,
 * which is defined in the database but not yet reflected in TypeScript type definitions.
 * We use type assertions to handle this discrepancy, and have disabled the ESLint rules
 * for explicit any types throughout this file.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Calculator } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { FormulaPlanConfig } from '@/components/admin/salary-plans/FormulaPlanConfig';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SalaryPlan {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const FormulaSalaryPlanList = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SalaryPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // Fetch salary plans
  const { data: salaryPlans = [], isLoading, refetch } = useQuery({
    queryKey: ['formula-salary-plans'],
    queryFn: async () => {
      // Using PostgrestFilterBuilder<unknown> to bypass type checking
      // TS doesn't know about 'formula' type yet but it exists in the database
      const query = supabase
        .from('salary_plans')
        .select('*') as any;
      
      const { data, error } = await query.eq('type', 'formula');
      
      if (error) throw error;
      return data as SalaryPlan[] || [];
    }
  });

  const handleEditPlan = (plan: SalaryPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsCreating(true);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('salary_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      
      toast({
        title: 'Plan deleted',
        description: 'The formula salary plan has been deleted successfully'
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the salary plan',
        variant: 'destructive'
      });
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleSave = async (config: Record<string, unknown>) => {
    try {
      if (isCreating) {
        // Create a new plan with the formula type
        const query = supabase
          .from('salary_plans')
          .insert({
            name: 'New Formula Plan',
            type: 'formula',
            config: config as any
          }) as any;
        
        const { error } = await query;
        
        if (error) throw error;
        
        toast({
          title: 'Plan created',
          description: 'The formula salary plan has been created successfully'
        });
      } else if (isEditing && selectedPlan) {
        // Update existing plan
        const query = supabase
          .from('salary_plans')
          .update({ 
            config: config as any 
          })
          .eq('id', selectedPlan.id) as any;
          
        const { error } = await query;
        
        if (error) throw error;
        
        toast({
          title: 'Plan updated',
          description: 'The formula salary plan has been updated successfully'
        });
      }
      
      // Reset state and refetch data
      setIsCreating(false);
      setIsEditing(false);
      setSelectedPlan(null);
      refetch();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the salary plan',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedPlan(null);
  };

  // Filter to just show formula plans
  const formulaPlans = salaryPlans.filter(plan => plan.type === 'formula');

  if (isCreating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Formula Salary Plan</CardTitle>
          <CardDescription>Configure a new formula-based salary plan</CardDescription>
        </CardHeader>
        <CardContent>
          <FormulaPlanConfig 
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    );
  }

  if (isEditing && selectedPlan) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Formula Salary Plan</CardTitle>
          <CardDescription>Update the formula for {selectedPlan.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormulaPlanConfig 
            planId={selectedPlan.id}
            initialConfig={selectedPlan.config}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Formula Salary Plans</CardTitle>
          <CardDescription>Manage your formula-based salary calculation plans</CardDescription>
        </div>
        <Button onClick={handleCreatePlan} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : formulaPlans.length === 0 ? (
          <div className="text-center py-6">
            <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No formula salary plans found</p>
            <Button onClick={handleCreatePlan} variant="outline" className="mt-4">
              Create your first plan
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {formulaPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <div className="font-medium flex items-center">
                      {plan.name}
                      <Badge variant="outline" className="ml-2">Formula</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date(plan.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeletingPlanId(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <AlertDialog open={!!deletingPlanId} onOpenChange={(open) => !open && setDeletingPlanId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the formula salary plan
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingPlanId && handleDeletePlan(deletingPlanId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}; 
