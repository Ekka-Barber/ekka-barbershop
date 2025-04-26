import { useState, useEffect } from 'react';
import { FormulaVariable, FormulaStep, FormulaPlan } from '@/lib/salary/types/salary';
import { StoredFormulaPlan } from '@/lib/salary/api/formulaPlanService';
import { useFormulaPlanApi } from '@/lib/salary/hooks/useFormulaPlanApi';
import { v4 as uuidv4 } from 'uuid';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Copy,
  FileArchive,
  MoreHorizontal,
  Trash2,
  Undo2,
  History
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResponsiveFormulaPlanBuilderProps {
  initialPlan?: FormulaPlan;
  onSave?: (plan: FormulaPlan) => void;
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
  
  // API integration
  const {
    templates,
    selectedPlan,
    versions,
    isLoading,
    loadPlans,
    loadTemplates,
    loadPlan,
    loadVersions,
    savePlan,
    deletePlan,
  } = useFormulaPlanApi();

  // State for save dialog
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [planName, setPlanName] = useState(initialPlan?.name || '');
  const [planDescription, setPlanDescription] = useState(initialPlan?.description || '');
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  
  // Load plans and templates on mount
  useEffect(() => {
    loadPlans();
    loadTemplates();
  }, [loadPlans, loadTemplates]);
  
  // Set the selected plan when it changes
  useEffect(() => {
    if (selectedPlan) {
      setVariables(selectedPlan.variables);
      setSteps(selectedPlan.steps);
      setOutputVariable(selectedPlan.outputVariable);
      setPlanName(selectedPlan.name);
      setPlanDescription(selectedPlan.description || '');
    }
  }, [selectedPlan]);
  
  // Set initial name and description from props
  useEffect(() => {
    if (initialPlan) {
      if ('name' in initialPlan) {
        setPlanName(initialPlan.name as string);
      }
      if ('description' in initialPlan) {
        setPlanDescription(initialPlan.description as string);
      }
    }
  }, [initialPlan]);
  
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
      defaultValue: 0
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
  
  // Open save dialog
  const handleOpenSaveDialog = () => {
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
    
    setIsSaveDialogOpen(true);
  };
  
  // Save the formula plan
  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please provide a name for your formula plan',
        variant: 'destructive'
      });
      return;
    }
    
    // Create the plan object
    const plan: FormulaPlan = {
      id: selectedPlan?.id,
      variables,
      steps,
      outputVariable,
      version: selectedPlan?.version || 0,
      createdAt: selectedPlan?.createdAt,
    };
    
    try {
      const saved = await savePlan(plan, planName, planDescription);
      
      if (saved) {
        setIsSaveDialogOpen(false);
        
        toast({
          title: 'Formula saved',
          description: 'Your formula plan has been saved successfully'
        });
        
        // Call the onSave callback if provided
        if (onSave) {
          onSave(saved);
        }
      } else {
        toast({
          title: 'Save failed',
          description: 'There was an error saving your formula plan',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Save error',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };
  
  // Load a plan
  const loadSelectedPlan = (id: string) => {
    loadPlan(id);
  };
  
  // Load a template
  const handleLoadTemplate = (template: StoredFormulaPlan) => {
    // Create a new plan from the template
    const newPlan: FormulaPlan = {
      variables: template.variables,
      steps: template.steps,
      outputVariable: template.outputVariable,
    };
    
    setVariables(newPlan.variables);
    setSteps(newPlan.steps);
    setOutputVariable(newPlan.outputVariable);
    setPlanName(`${template.name} (Copy)`);
    setPlanDescription(template.description || '');
    
    setIsTemplatesDialogOpen(false);
    
    toast({
      title: 'Template loaded',
      description: `Template "${template.name}" has been loaded`
    });
  };
  
  // Load a specific version
  const handleLoadVersion = (version: StoredFormulaPlan) => {
    loadPlan(version.id);
    setIsVersionsDialogOpen(false);
  };
  
  // View version history
  const handleViewVersions = (id: string) => {
    loadVersions(id);
    setIsVersionsDialogOpen(true);
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
              onClick={() => setIsTemplatesDialogOpen(true)}
            >
              <FileArchive className="h-4 w-4 mr-2" />
              Templates
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleCopyAsJson}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as JSON
                </DropdownMenuItem>
                {selectedPlan && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewVersions(selectedPlan.id)}>
                      <History className="h-4 w-4 mr-2" />
                      Version History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => loadSelectedPlan(selectedPlan.id)}>
                      <Undo2 className="h-4 w-4 mr-2" />
                      Revert Changes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      if (confirm(`Are you sure you want to delete "${selectedPlan.name}"?`)) {
                        deletePlan(selectedPlan.id);
                      }
                    }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Plan
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={handleOpenSaveDialog}
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
            {selectedPlan && (
              <CardFooter className="pt-0">
                <div className="text-sm text-muted-foreground">
                  {selectedPlan.name} {selectedPlan.version ? `(v${selectedPlan.version})` : ''}
                </div>
              </CardFooter>
            )}
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
            <SheetFooter>
              <Button variant="outline" onClick={() => setEditingStepId(null)}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Formula Plan</DialogTitle>
            <DialogDescription>
              Provide a name and optional description for your formula plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input 
                id="plan-name" 
                value={planName} 
                onChange={(e) => setPlanName(e.target.value)} 
                placeholder="Enter formula plan name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-description">Description (optional)</Label>
              <Textarea 
                id="plan-description" 
                value={planDescription} 
                onChange={(e) => setPlanDescription(e.target.value)} 
                placeholder="Enter plan description" 
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading || !planName.trim()}
            >
              {isLoading ? 'Saving...' : 'Save Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Templates Dialog */}
      <Dialog open={isTemplatesDialogOpen} onOpenChange={setIsTemplatesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Formula Templates</DialogTitle>
            <DialogDescription>
              Select a template to use as a starting point for your formula plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No templates available
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleLoadTemplate(template)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground">{template.description || 'No description available'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {template.variables.length} Variables
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.steps.length} Steps
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplatesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Versions Dialog */}
      <Dialog open={isVersionsDialogOpen} onOpenChange={setIsVersionsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and restore previous versions of your formula plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No version history available
              </div>
            ) : (
              <div className="space-y-4">
                {versions
                  .sort((a, b) => b.version - a.version)
                  .map((version) => (
                    <Card key={version.id} className="hover:bg-slate-50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-md">Version {version.version}</CardTitle>
                          <Badge>{new Date(version.updatedAt).toLocaleDateString()}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          {version.variables.length} Variables, {version.steps.length} Steps
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleLoadVersion(version)}
                        >
                          <Undo2 className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 
