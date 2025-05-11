import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, AlertCircle } from "lucide-react";
import FormulaPlanConfig from '@/components/admin/salary-plans/FormulaPlanConfig';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from "@/components/ui/alert";

const FormulaSalaryPlanList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'subscribed' | 'error' | 'none'>('none');

  // Set up real-time subscription for formula salary plans
  useEffect(() => {
    try {
      const channel = supabase
        .channel('formula-salary-plans-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'salary_plans',
            filter: "type=eq.formula",
          },
          (payload) => {
            // Invalidate and refetch formula plans
            queryClient.invalidateQueries({ queryKey: ['formula-salary-plans'] });
            
            // Show notification
            toast({
              title: 'Formula salary plan updated',
              description: `${payload.eventType} at ${new Date().toLocaleTimeString()}`,
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setSubscriptionStatus('subscribed');
          } else {
            setSubscriptionStatus('error');
            console.error('Failed to subscribe to formula salary plan changes:', status);
          }
        });

      // Clean up subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      setSubscriptionStatus('error');
      console.error('Error setting up formula salary plan subscription:', error);
    }
  }, [queryClient, toast]);

  const handleAddNew = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleSave = async () => {
    toast({
      title: "Plan created",
      description: "Your formula salary plan has been created successfully."
    });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <FormulaPlanConfig
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Formula-based Salary Plans
          {subscriptionStatus === 'subscribed' && (
            <span className="ml-2 text-xs text-green-600">
              • Real-time updates enabled
            </span>
          )}
        </h3>
        <Button onClick={handleAddNew} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Plan
        </Button>
      </div>
      
      {subscriptionStatus === 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to real-time updates. Changes to formula plans may not appear immediately.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold mb-2">New Formula Builder Available</h3>
            <p className="text-muted-foreground mb-6">
              You can now create powerful, customizable salary formulas with our new simplified formula builder.
            </p>
            <Button onClick={handleAddNew} className="mx-auto">
              <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Formula Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormulaSalaryPlanList;
