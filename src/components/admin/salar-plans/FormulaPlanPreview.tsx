import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Check, 
  AlertTriangle, 
  PlayCircle, 
  Clock,
  Calculator
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
import { InteractiveSampleData } from './InteractiveSampleData';
import { StepDependencyVisualizer } from './StepDependencyVisualizer';

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
  
  // Run the formula simulation using the optimized evaluator
  const simulateFormula = () => {
    try {
      // Use the FormulaEvaluator to evaluate the formula
      const result = FormulaEvaluator.evaluateFormula(plan, sampleData);
      
      // Update state with results
      setEvaluationResult(result);
      
      // Switch to the preview tab
      setActiveTab('preview');
    } catch (error) {
      console.error('Simulation error:', error);
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
          <TabsList className="mb-4 flex flex-wrap w-full">
            <TabsTrigger value="validation" className="flex-1 min-w-[115px] text-xs sm:text-sm">
              Validation 
              {validationResult.errors.length > 0 && (
                <Badge variant="destructive" className="ml-1 sm:ml-2">{validationResult.errors.length}</Badge>
              )}
              {validationResult.errors.length === 0 && validationResult.warnings.length > 0 && (
                <Badge variant="outline" className="ml-1 sm:ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {validationResult.warnings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex-1 min-w-[100px] text-xs sm:text-sm">Simulation</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1 min-w-[100px] text-xs sm:text-sm">Results</TabsTrigger>
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
            <div className="space-y-6">
              {validationResult.isValid ? (
                <>
                  <InteractiveSampleData 
                    variables={plan.variables}
                    sampleData={sampleData}
                    onUpdate={setSampleData}
                    onSimulate={simulateFormula}
                  />
                  
                  <div className="mt-4">
                    <StepDependencyVisualizer
                      steps={plan.steps}
                      variables={plan.variables}
                      outputVariable={plan.outputVariable}
                    />
                  </div>
                </>
              ) : (
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Formula Invalid</AlertTitle>
                  <AlertDescription>
                    Please fix validation errors before simulating the formula.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {evaluationResult ? (
              <>
                <div className="mb-4 p-4 bg-muted/30 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Calculator className="mr-2 h-5 w-5 text-primary" />
                        Final Result
                      </h3>
                      <div className="mt-2 text-3xl font-bold">
                        {formatCurrency(evaluationResult.finalResult)}
                      </div>
                      {evaluationResult.totalExecutionTimeMs && (
                        <div className="mt-1 text-xs text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Calculated in {formatExecutionTime(evaluationResult.totalExecutionTimeMs)}
                        </div>
                      )}
                    </div>
                    <div className="border-l pl-4">
                      <h3 className="text-sm font-medium mb-2">Output Variables</h3>
                      {evaluationResult.steps
                        .filter(step => step.resultVariable)
                        .map(step => (
                          <div key={step.stepId} className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {step.resultVariable}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{step.stepName}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(step.result)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-base font-medium mb-2">Step-by-Step Execution</h3>
                <ScrollArea className="h-[300px]">
                  <Accordion type="multiple" className="w-full">
                    {evaluationResult.steps.map((step, index) => (
                      <AccordionItem key={step.stepId} value={step.stepId}>
                        <AccordionTrigger className="hover:bg-muted/40 px-3">
                          <div className="flex-1 flex items-center justify-between pr-4">
                            <div className="flex items-center">
                              <Badge className="mr-2">{index + 1}</Badge>
                              <span>{step.stepName}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge variant="outline" className="font-mono">
                                {formatCurrency(step.result)}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {formatExecutionTime(step.executionTimeMs)}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3">
                          <div className="text-sm space-y-3">
                            <div>
                              <h4 className="font-medium text-xs uppercase text-muted-foreground mb-1">Inputs</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(step.inputs).map(([name, value]) => (
                                  <div 
                                    key={name} 
                                    className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm"
                                  >
                                    <Badge variant="outline" className="font-mono">{name}</Badge>
                                    <span>{formatCurrency(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-xs uppercase text-muted-foreground mb-1">Result</h4>
                              <div className="p-2 rounded-md bg-green-50 border border-green-100 flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="mr-2">Stored as:</span>
                                  <Badge variant="outline" className="font-mono">{step.resultVariable}</Badge>
                                </div>
                                <span className="font-medium">{formatCurrency(step.result)}</span>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </>
            ) : (
              <div className="text-center py-12">
                <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Simulation Results</h3>
                <p className="text-muted-foreground mb-4">
                  Run a simulation to see the step-by-step results of your formula calculation.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActiveTab('simulation');
                  }}
                >
                  Go to Simulation
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
