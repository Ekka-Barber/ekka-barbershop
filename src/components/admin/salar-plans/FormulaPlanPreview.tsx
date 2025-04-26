import { useState, useEffect } from 'react';
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
  RefreshCw
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
import { FormulaOperator, FormulaStep, FormulaPlan } from '@/lib/salary/types/salary';
import { FormulaValidator, ValidationResult } from '@/lib/salary/utils/FormulaValidator';

interface FormulaPlanPreviewProps {
  formulaPlan?: FormulaPlan;
  variables?: FormulaPlan['variables'];
  steps?: FormulaPlan['steps'];
  outputVariable?: string;
}

interface StepSimulationResult {
  stepId: string;
  stepName: string;
  result: number;
  resultVariable: string;
  inputs: Record<string, number>;
}

interface SimulationContext {
  [key: string]: number;
}

export const FormulaPlanPreview = ({ 
  formulaPlan,
  variables,
  steps,
  outputVariable
}: FormulaPlanPreviewProps) => {
  // Create a plan object if individual properties are provided
  const plan: FormulaPlan = formulaPlan || {
    variables: variables || [],
    steps: steps || [],
    outputVariable: outputVariable || ''
  };
  
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  
  const [sampleData, setSampleData] = useState<Record<string, number>>({});
  const [calculationResults, setCalculationResults] = useState<StepSimulationResult[]>([]);
  const [finalResult, setFinalResult] = useState<number | null>(null);
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
  
  // Run the formula simulation
  const simulateFormula = () => {
    setSimulating(true);
    
    try {
      // Initialize context with sample data
      const context: SimulationContext = { ...sampleData };
      const stepResults: StepSimulationResult[] = [];
      
      // Process each step in order
      for (const step of plan.steps) {
        // Get inputs for this step
        const inputs = getStepInputs(step, context);
        
        // Calculate result for this step
        const result = evaluateStep(step, context);
        
        // Store the result in the context
        if (step.result) {
          context[step.result] = result;
        }
        
        // Record step results for display
        stepResults.push({
          stepId: step.id,
          stepName: step.name,
          result,
          resultVariable: step.result || 'unknown',
          inputs
        });
      }
      
      // Update state with results
      setCalculationResults(stepResults);
      
      // Set final result
      if (plan.outputVariable && context[plan.outputVariable] !== undefined) {
        setFinalResult(context[plan.outputVariable]);
      } else {
        setFinalResult(null);
      }
      
      // Switch to the preview tab
      setActiveTab('preview');
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setSimulating(false);
    }
  };
  
  // Get inputs used by a step for display
  const getStepInputs = (step: FormulaStep, context: SimulationContext): Record<string, number> => {
    const inputs: Record<string, number> = {};
    
    // If operation is a string (variable reference)
    if (typeof step.operation === 'string' && !isNumeric(step.operation)) {
      inputs[step.operation] = context[step.operation] || 0;
      return inputs;
    }
    
    // If operation is a FormulaOperator
    if (typeof step.operation === 'object') {
      const operation = step.operation as FormulaOperator;
      
      // Process each parameter
      for (const param of operation.parameters) {
        if (typeof param === 'string' && !isNumeric(param)) {
          // It's a variable reference
          inputs[param] = context[param] || 0;
        }
        // Nested operations are handled recursively in the evaluateOperator function
      }
    }
    
    return inputs;
  };
  
  // Evaluate a formula step
  const evaluateStep = (step: FormulaStep, context: SimulationContext): number => {
    // If the operation is just a string (variable reference) or number
    if (typeof step.operation === 'string') {
      if (isNumeric(step.operation)) {
        return parseFloat(step.operation);
      }
      return context[step.operation] || 0;
    }
    
    if (typeof step.operation === 'number') {
      return step.operation;
    }
    
    // Otherwise, it's an operation
    const operation = step.operation as FormulaOperator;
    return evaluateOperator(operation, context);
  };
  
  // Evaluate a formula operator
  const evaluateOperator = (operator: FormulaOperator, context: SimulationContext): number => {
    const { type, parameters } = operator;
    
    // Evaluate parameters first (if they're nested operations)
    const evaluatedParams = parameters.map(param => {
      if (typeof param === 'object' && param !== null) {
        if ('operation' in param) {
          // This is a nested operation
          const nestedStep = param as unknown as FormulaStep;
          return evaluateStep(nestedStep, context);
        }
        return 0; // Default for unknown object types
      }
      
      if (typeof param === 'string') {
        return isNumeric(param) ? parseFloat(param) : (context[param] || 0);
      }
      
      return param as number;
    });
    
    // Execute the operation based on type
    switch (type) {
      case 'add':
        return evaluatedParams.reduce((sum, val) => sum + val, 0);
        
      case 'subtract':
        return evaluatedParams[0] - evaluatedParams.slice(1).reduce((sum, val) => sum + val, 0);
        
      case 'multiply':
        return evaluatedParams.reduce((product, val) => product * val, 1);
        
      case 'divide':
        if (evaluatedParams[1] === 0) {
          throw new Error('Division by zero');
        }
        return evaluatedParams[0] / evaluatedParams[1];
        
      case 'percent':
        return evaluatedParams[0] / 100;
        
      case 'round':
        return Math.round(evaluatedParams[0]);
        
      case 'abs':
        return Math.abs(evaluatedParams[0]);
        
      case 'min':
        return Math.min(...evaluatedParams);
        
      case 'max':
        return Math.max(...evaluatedParams);
        
      case 'equal':
        return evaluatedParams[0] === evaluatedParams[1] ? 1 : 0;
        
      case 'notEqual':
        return evaluatedParams[0] !== evaluatedParams[1] ? 1 : 0;
        
      case 'greaterThan':
        return evaluatedParams[0] > evaluatedParams[1] ? 1 : 0;
        
      case 'lessThan':
        return evaluatedParams[0] < evaluatedParams[1] ? 1 : 0;
        
      case 'greaterThanOrEqual':
        return evaluatedParams[0] >= evaluatedParams[1] ? 1 : 0;
        
      case 'lessThanOrEqual':
        return evaluatedParams[0] <= evaluatedParams[1] ? 1 : 0;
        
      case 'and':
        return evaluatedParams.every(val => val !== 0) ? 1 : 0;
        
      case 'or':
        return evaluatedParams.some(val => val !== 0) ? 1 : 0;
        
      case 'not':
        return evaluatedParams[0] === 0 ? 1 : 0;
        
      case 'if':
        return evaluatedParams[0] !== 0 ? evaluatedParams[1] : evaluatedParams[2];
        
      default:
        return 0;
    }
  };
  
  // Helper to check if a string is numeric
  const isNumeric = (value: string): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(Number(value));
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
            {calculationResults.length === 0 ? (
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
                    {finalResult !== null ? finalResult.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) : 'N/A'}
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="step-by-step">
                    <AccordionTrigger>Step-by-Step Calculation</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {calculationResults.map((stepResult, index) => (
                          <Card key={stepResult.stepId} className="overflow-hidden">
                            <CardHeader className="py-3 bg-gray-50">
                              <div className="flex items-start">
                                <Badge className="mr-2">{index + 1}</Badge>
                                <div>
                                  <CardTitle className="text-base">{stepResult.stepName}</CardTitle>
                                  <CardDescription>Result stored in: <code>{stepResult.resultVariable}</code></CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="py-3">
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="text-sm font-medium">Input Variables:</div>
                                <div className="text-sm">
                                  {Object.entries(stepResult.inputs).length > 0 ? (
                                    <div className="space-y-1">
                                      {Object.entries(stepResult.inputs).map(([name, value]) => (
                                        <div key={name} className="flex justify-between">
                                          <span>{name}:</span>
                                          <span className="font-mono">{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">No input variables</span>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">Result:</div>
                                <div className="text-sm font-mono">{stepResult.result}</div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
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
