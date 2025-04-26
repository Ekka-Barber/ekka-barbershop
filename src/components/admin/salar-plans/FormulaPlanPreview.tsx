import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Check, 
  AlertTriangle, 
  PlayCircle, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger
} from '@/components/ui/accordion';
import { FormulaPlan } from '@/lib/salary/types/salary';
import { FormulaValidator, ValidationResult } from '@/lib/salary/utils/FormulaValidator';
import { FormulaEvaluator, FormulaEvaluationResult } from '@/lib/salary/utils/FormulaEvaluator';

interface FormulaPlanPreviewProps {
  formulaPlan?: FormulaPlan;
  variables?: FormulaPlan['variables'];
  steps?: FormulaPlan['steps'];
  outputVariable?: string;
}

export const FormulaPlanPreview = ({ 
  formulaPlan,
  variables,
  steps,
  outputVariable
}: FormulaPlanPreviewProps) => {
  // Create a plan object if individual properties are provided
  const plan: FormulaPlan = useMemo(() => formulaPlan || {
    variables: variables || [],
    steps: steps || [],
    outputVariable: outputVariable || ''
  }, [formulaPlan, variables, steps, outputVariable]);
  
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  
  const [sampleData, setSampleData] = useState<Record<string, number>>({});
  const [evaluationResult, setEvaluationResult] = useState<FormulaEvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState('validation');
  const [simulating, setSimulating] = useState(false);
  
  // Validate formula plan when it changes
  useEffect(() => {
    const result = FormulaValidator.validateFormulaPlan(plan);
    setValidationResult(result);
    
    // Initialize sample data with default values for variables
    const initialData: Record<string, number> = {};
    for (const variable of plan.variables) {
      initialData[variable.name] = variable.defaultValue || 0;
    }
    setSampleData(initialData);
  }, [plan]);
  
  // Handle updating sample data
  const handleSampleDataChange = (variableName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSampleData({
      ...sampleData,
      [variableName]: numValue
    });
  };
  
  // Run the formula simulation using the optimized evaluator
  const simulateFormula = () => {
    setSimulating(true);
    
    try {
      // Use the FormulaEvaluator to evaluate the formula
      const result = FormulaEvaluator.evaluateFormula(plan, sampleData);
      
      // Update state with results
      setEvaluationResult(result);
      
      // Switch to the preview tab
      setActiveTab('preview');
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setSimulating(false);
    }
  };
  
  // Format a number as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format execution time in milliseconds
  const formatExecutionTime = (ms: number) => {
    if (ms < 1) {
      return '< 1 ms';
    }
    return `${ms.toFixed(2)} ms`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Formula Preview & Validation</CardTitle>
        <CardDescription>Validate and test your formula with sample data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="validation">
              Validation 
              {validationResult.errors.length > 0 && (
                <Badge variant="destructive" className="ml-2">{validationResult.errors.length}</Badge>
              )}
              {validationResult.errors.length === 0 && validationResult.warnings.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {validationResult.warnings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="preview">Results Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="validation">
            {validationResult.errors.length === 0 && validationResult.warnings.length === 0 ? (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4" />
                <AlertTitle>Valid Formula</AlertTitle>
                <AlertDescription>
                  Your formula is valid and ready to use.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {validationResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      Please fix the following errors before using this formula:
                    </AlertDescription>
                  </Alert>
                )}
                
                {validationResult.errors.length > 0 && (
                  <ScrollArea className="h-60 border rounded-md p-4">
                    {validationResult.errors.map((error, index) => (
                      <div key={`error-${index}`} className="flex items-start space-x-2 mb-2 pb-2 border-b last:border-0">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <div className="font-medium">{error.message}</div>
                          {error.stepId && <div className="text-sm text-gray-500">Step: {error.stepId}</div>}
                          {error.variableName && <div className="text-sm text-gray-500">Variable: {error.variableName}</div>}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warnings</AlertTitle>
                    <AlertDescription>
                      Consider addressing these warnings for a more robust formula:
                    </AlertDescription>
                  </Alert>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <ScrollArea className="h-40 border rounded-md p-4">
                    {validationResult.warnings.map((warning, index) => (
                      <div key={`warning-${index}`} className="flex items-start space-x-2 mb-2 pb-2 border-b last:border-0">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <div className="font-medium">{warning.message}</div>
                          {warning.stepId && <div className="text-sm text-gray-500">Step: {warning.stepId}</div>}
                          {warning.variableName && <div className="text-sm text-gray-500">Variable: {warning.variableName}</div>}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="simulation">
            <div className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-sm font-medium">Sample Data</h3>
                <p className="text-sm text-muted-foreground">
                  Enter sample values for the variables to simulate the formula calculation.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.variables.map((variable) => (
                    <div key={variable.name} className="flex items-center space-x-2">
                      <Label htmlFor={`sim-${variable.name}`} className="w-1/3">{variable.name}:</Label>
                      <Input
                        id={`sim-${variable.name}`}
                        type="number"
                        value={sampleData[variable.name] || 0}
                        onChange={(e) => handleSampleDataChange(variable.name, e.target.value)}
                        className="w-2/3"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={simulateFormula} 
                disabled={simulating || validationResult.errors.length > 0}
                className="mt-4"
              >
                {simulating ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Simulating...</>
                ) : (
                  <><PlayCircle className="mr-2 h-4 w-4" /> Run Simulation</>
                )}
              </Button>
              
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Cannot Run Simulation</AlertTitle>
                  <AlertDescription>
                    Please fix the validation errors before running the simulation.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {!evaluationResult ? (
              <div className="text-center py-8">
                <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Run a simulation first to see the calculation results.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('simulation')} 
                  className="mt-4"
                >
                  Go to Simulation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Final Result: {plan.outputVariable}</h3>
                  <div className="text-2xl font-bold">
                    {formatCurrency(evaluationResult.finalResult)}
                  </div>
                  <div className="flex items-center text-xs text-blue-500 mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Execution time: {formatExecutionTime(evaluationResult.totalExecutionTimeMs)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Calculation Steps</h3>
                  <Accordion type="multiple" defaultValue={["0"]}>
                    {evaluationResult.steps.map((step, index) => (
                      <AccordionItem 
                        key={step.stepId} 
                        value={String(index)}
                        className="border rounded-md mb-2 overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-2 hover:bg-slate-50">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Badge className="mr-2">{index + 1}</Badge>
                              <span>{step.stepName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Result: {formatCurrency(step.result)}
                              </Badge>
                              {step.executionTimeMs && (
                                <Badge variant="outline" className="text-xs text-slate-500">
                                  {formatExecutionTime(step.executionTimeMs)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 pt-1">
                          <div className="space-y-2 text-sm">
                            <div>
                              <div className="mb-1 font-medium">Inputs:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(step.inputs).map(([key, value]) => (
                                  <div key={key} className="flex justify-between space-x-2 px-2 py-1 bg-gray-50 rounded">
                                    <span>{key}:</span>
                                    <span className="font-medium">{formatCurrency(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span>Stores result in:</span>
                              <Badge variant="secondary">{step.resultVariable}</Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('simulation')}
                  className="mt-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Modify Sample Data
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Preview helps you validate and test your formula before saving.
        </div>
      </CardFooter>
    </Card>
  );
}; 
