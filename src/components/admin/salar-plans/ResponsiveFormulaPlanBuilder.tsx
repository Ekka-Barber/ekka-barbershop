import { useState, useEffect } from 'react';
import { FormulaVariable, FormulaStep, FormulaPlan } from '@/lib/salary/types/salary';
import { v4 as uuidv4 } from 'uuid';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Save,
  Eye,
  Workflow,
  ListFilter,
  Copy
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { DraggableStepList } from './DraggableStepList';
import { FormulaPlanPreview } from './FormulaPlanPreview';
import { FormulaPlanFlowchart } from './FormulaPlanFlowchart';
import { FormulaValidator } from '@/lib/salary/utils/FormulaValidator';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ResponsiveFormulaPlanBuilderProps {
  initialPlan?: FormulaPlan;
  onSave: (plan: FormulaPlan) => void;
}

export const ResponsiveFormulaPlanBuilder = ({ 
  initialPlan, 
  onSave 
}: ResponsiveFormulaPlanBuilderProps) => {
  const [variables, setVariables] = useState<FormulaVariable[]>(
    initialPlan?.variables || []
  );
  
  const [steps, setSteps] = useState<FormulaStep[]>(
    initialPlan?.steps || []
  );
  
  const [outputVariable, setOutputVariable] = useState<string>(
    initialPlan?.outputVariable || ''
  );
  
  const [activeTab, setActiveTab] = useState<string>('build');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});
  
  // Validate the formula plan
  useEffect(() => {
    validateFormula();
  }, [variables, steps, outputVariable]);
  
  // Validate the formula and organize errors
  const validateFormula = () => {
    const formulaPlan: FormulaPlan = {
      variables,
      steps,
      outputVariable
    };
    
    const validationResult = FormulaValidator.validateFormulaPlan(formulaPlan);
    
    // Group errors by step ID, variable name, or general
    const errors: {[key: string]: string[]} = {};
    
    // Process errors
    validationResult.errors.forEach(error => {
      if (error.stepId) {
        if (!errors[error.stepId]) {
          errors[error.stepId] = [];
        }
        errors[error.stepId].push(error.message);
      } else if (error.variableName) {
        if (!errors[error.variableName]) {
          errors[error.variableName] = [];
        }
        errors[error.variableName].push(error.message);
      } else {
        if (!errors['general']) {
          errors['general'] = [];
        }
        errors['general'].push(error.message);
      }
    });
    
    setValidationErrors(errors);
  };
  
  // Add a new step
  const addStep = () => {
    const newStep: FormulaStep = {
      id: uuidv4(),
      name: `Step ${steps.length + 1}`,
      description: 'New calculation step',
      operation: {
        type: 'add',
        parameters: ['0', '0']
      },
      result: `result${steps.length + 1}`
    };
    
    setSteps([...steps, newStep]);
  };
  
  // Add a new variable
  const addVariable = () => {
    const newVariable: FormulaVariable = {
      name: `variable${variables.length + 1}`,
      description: 'New variable',
      source: 'constant',
      defaultValue: '0'
    };
    
    setVariables([...variables, newVariable]);
  };
  
  // Handle step changes from the draggable list
  const handleStepChange = (updatedSteps: FormulaStep[]) => {
    setSteps(updatedSteps);
  };
  
  // Edit a step
  const handleEditStep = (stepId: string) => {
    setEditingStepId(stepId);
  };
  
  // Delete a step
  const handleDeleteStep = (stepId: string) => {
    // Check if this step's result is used in other steps
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    
    const isResultUsed = steps.some(s => {
      if (s.id === stepId) return false;
      
      // Check if the result is used in other steps
      if (typeof s.operation === 'string') {
        return s.operation === step.result;
      }
      
      if (typeof s.operation === 'object' && s.operation !== null) {
        return s.operation.parameters.some(p => 
          typeof p === 'string' && p === step.result
        );
      }
      
      return false;
    });
    
    if (isResultUsed) {
      toast({
        title: 'Cannot delete step',
        description: `The result "${step.result}" is used in other steps`,
        variant: 'destructive'
      });
      return;
    }
    
    // If it's the output variable, warn
    if (step.result === outputVariable) {
      toast({
        title: 'Cannot delete output step',
        description: `This step produces the output variable "${outputVariable}"`,
        variant: 'destructive'
      });
      return;
    }
    
    // Remove the step
    setSteps(steps.filter(s => s.id !== stepId));
  };
  
  // Save the formula plan
  const handleSave = () => {
    // Check if there are validation errors
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (hasErrors) {
      toast({
        title: 'Validation errors',
        description: 'Please fix all validation errors before saving',
        variant: 'destructive'
      });
      return;
    }
    
    // Save the plan
    onSave({
      variables,
      steps,
      outputVariable
    });
    
    toast({
      title: 'Formula saved',
      description: 'Your formula plan has been saved successfully'
    });
  };
  
  // Copy the formula as JSON
  const handleCopyAsJson = () => {
    const formulaJson = JSON.stringify({
      variables,
      steps,
      outputVariable
    }, null, 2);
    
    navigator.clipboard.writeText(formulaJson).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'Formula JSON copied to clipboard'
      });
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="build">
              <ListFilter className="h-4 w-4 mr-2" />
              Build
            </TabsTrigger>
            <TabsTrigger value="visualize">
              <Workflow className="h-4 w-4 mr-2" />
              Visualize
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyAsJson}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
            <Button 
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Formula
            </Button>
          </div>
        </div>
        
        {/* Build Tab */}
        <TabsContent value="build" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Variables Panel */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Variables</CardTitle>
                  <Button variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                <CardDescription>
                  Define variables used in your formula
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {variables.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No variables defined yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {variables.map((variable, index) => (
                      <div
                        key={index}
                        className="p-2 border rounded-md flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-sm">{variable.name}</div>
                          <div className="text-xs text-muted-foreground">{variable.description}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {variable.source || 'constant'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Steps Panel */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Steps</CardTitle>
                  <Button variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                <CardDescription>
                  Define the calculation steps of your formula
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DraggableStepList 
                  steps={steps}
                  validationErrors={validationErrors}
                  onStepChange={handleStepChange}
                  onEditStep={handleEditStep}
                  onDeleteStep={handleDeleteStep}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Output Variable */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Output</CardTitle>
              <CardDescription>
                Select the final output variable for your formula
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label htmlFor="output-var" className="min-w-32">Final Output Variable:</Label>
                <Select
                  value={outputVariable}
                  onValueChange={setOutputVariable}
                >
                  <SelectTrigger className="w-64" id="output-var">
                    <SelectValue placeholder="Select output variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {steps
                      .filter(step => step.result)
                      .map(step => (
                        <SelectItem key={step.id} value={step.result || ''}>
                          {step.result} (from {step.name})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Visualize Tab */}
        <TabsContent value="visualize">
          <FormulaPlanFlowchart 
            variables={variables}
            steps={steps}
            outputVariable={outputVariable}
            onStepClick={handleEditStep}
          />
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview">
          <FormulaPlanPreview 
            variables={variables}
            steps={steps}
            outputVariable={outputVariable}
          />
        </TabsContent>
      </Tabs>
      
      {/* Step Editor Sheet */}
      {editingStepId && (
        <Sheet open={!!editingStepId} onOpenChange={(open) => !open && setEditingStepId(null)}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Edit Step</SheetTitle>
              <SheetDescription>
                Edit the properties of this calculation step
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <div className="space-y-4">
                {/* Step editor UI would go here */}
                <div className="text-center py-8 text-muted-foreground">
                  Step editor interface would be integrated here
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setEditingStepId(null)} className="mr-2">
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}; 
