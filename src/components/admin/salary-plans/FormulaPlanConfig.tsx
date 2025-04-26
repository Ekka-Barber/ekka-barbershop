import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormulaPlanBuilder } from './FormulaPlanBuilder';
import { FormulaPlan } from '@/lib/salary/types/salary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormulaJsonEditor } from './FormulaJsonEditor';

interface FormulaPlanConfigProps {
  planId?: string;
  initialConfig?: Record<string, unknown>;
  onSave?: (config: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
}

export const FormulaPlanConfig = ({
  planId,
  initialConfig,
  onSave,
  onCancel
}: FormulaPlanConfigProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('visual');
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse initial formula from config if available
  const initialFormula = initialConfig?.formula as FormulaPlan | undefined;
  
  const handleFormulaSave = async (formula: FormulaPlan) => {
    if (!onSave) {
      // If no onSave callback is provided, save directly to the database
      try {
        setIsLoading(true);
        
        if (!planId) {
          toast({
            title: 'Error',
            description: 'No plan ID provided for saving formula',
            variant: 'destructive'
          });
          return;
        }
        
        // Save the formula configuration to the database
        const updatedConfig = {
          ...initialConfig,
          formula: JSON.parse(JSON.stringify(formula)) // Convert to plain JSON object
        };
        
        const { error } = await supabase
          .from('salary_plans')
          .update({ config: updatedConfig })
          .eq('id', planId);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Formula saved',
          description: 'The formula plan has been saved successfully'
        });
      } catch (error) {
        console.error('Error saving formula:', error);
        toast({
          title: 'Error saving formula',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // If an onSave callback is provided, use it
      try {
        setIsLoading(true);
        
        const updatedConfig = {
          ...initialConfig,
          formula: JSON.parse(JSON.stringify(formula)) // Convert to plain JSON object
        };
        
        await onSave(updatedConfig);
        
        toast({
          title: 'Formula saved',
          description: 'The formula plan has been saved successfully'
        });
      } catch (error) {
        console.error('Error saving formula:', error);
        toast({
          title: 'Error saving formula',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleJsonSave = async (formula: FormulaPlan) => {
    try {
      setIsLoading(true);
      
      const updatedConfig = {
        ...initialConfig,
        formula: JSON.parse(JSON.stringify(formula)) // Convert to plain JSON object
      };
      
      if (onSave) {
        await onSave(updatedConfig);
      } else if (planId) {
        const { error } = await supabase
          .from('salary_plans')
          .update({ config: updatedConfig })
          .eq('id', planId);
        
        if (error) {
          throw error;
        }
      } else {
        throw new Error('No plan ID or onSave callback provided');
      }
      
      toast({
        title: 'Formula saved',
        description: 'The formula JSON has been saved successfully'
      });
    } catch (error) {
      console.error('Error saving formula JSON:', error);
      toast({
        title: 'Error saving formula',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Formula-based Salary Plan</CardTitle>
        <CardDescription>
          Configure a custom formula to calculate employee salaries
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <Tabs defaultValue="visual" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="visual" className="flex-1">Visual Builder</TabsTrigger>
            <TabsTrigger value="raw" className="flex-1">Raw JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="visual" className="pt-2 sm:pt-4">
            <FormulaPlanBuilder 
              initialPlan={initialFormula}
              onSave={handleFormulaSave}
            />
          </TabsContent>
          <TabsContent value="raw" className="pt-2 sm:pt-4">
            <FormulaJsonEditor
              initialValue={initialFormula}
              onSave={handleJsonSave}
            />
          </TabsContent>
        </Tabs>
        
        {onCancel && (
          <div className="flex justify-end mt-4 sm:mt-6">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 