import { useState, useEffect, useRef } from 'react';
import { FormulaStep, FormulaPlan } from '@/lib/salary/types/salary';
import { 
  ArrowDown, 
  Calculator, 
  ChevronsUpDown, 
  ArrowRight, 
  PlusCircle, 
  Workflow
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { FormulaValidator } from '@/lib/salary/utils/FormulaValidator';

interface FormulaPlanFlowchartProps {
  formulaPlan?: FormulaPlan;
  variables?: FormulaPlan['variables'];
  steps?: FormulaPlan['steps'];
  outputVariable?: string;
  onStepClick?: (stepId: string) => void;
}

type StepNode = {
  id: string;
  name: string;
  result: string;
  inputs: string[];
  hasErrors: boolean;
};

export const FormulaPlanFlowchart = ({ 
  formulaPlan,
  variables = [],
  steps = [],
  outputVariable = '',
  onStepClick
}: FormulaPlanFlowchartProps) => {
  const plan: FormulaPlan = formulaPlan || {
    variables,
    steps,
    outputVariable
  };
  
  const [stepNodes, setStepNodes] = useState<StepNode[]>([]);
  const [variableNodes, setVariableNodes] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<{[key: string]: string[]}>({}); 
  const [validationResult, setValidationResult] = useState<{[key: string]: boolean}>({});
  const flowchartRef = useRef<HTMLDivElement>(null);
  
  // Analyze the formula and build the graph data
  useEffect(() => {
    // Extract used variables and step inputs/outputs
    const usedVars = new Set<string>();
    const stepDependencies: {[key: string]: string[]} = {};
    
    // Create the step nodes with their dependencies
    const nodes: StepNode[] = plan.steps.map(step => {
      const inputs = extractInputVariables(step);
      
      // Add to used variables
      inputs.forEach(v => usedVars.add(v));
      
      // Track which variables are used by which steps
      stepDependencies[step.id] = inputs;
      
      return {
        id: step.id,
        name: step.name,
        result: step.result || '',
        inputs,
        hasErrors: false
      };
    });
    
    // Validate the plan and mark nodes with errors
    const validationResult = FormulaValidator.validateFormulaPlan(plan);
    const nodeValidation: {[key: string]: boolean} = {};
    
    // Mark steps with errors
    validationResult.errors.forEach(error => {
      if (error.stepId) {
        nodeValidation[error.stepId] = false;
      }
    });
    
    // Update nodes with validation info
    const validatedNodes = nodes.map(node => ({
      ...node,
      hasErrors: nodeValidation[node.id] === false
    }));
    
    setStepNodes(validatedNodes);
    setDependencies(stepDependencies);
    setVariableNodes([...usedVars]);
    setValidationResult(nodeValidation);
  }, [plan]);
  
  // Extract all input variables used in a step
  const extractInputVariables = (step: FormulaStep): string[] => {
    const variables: string[] = [];
    
    // If the operation is a simple variable reference
    if (typeof step.operation === 'string' && !isNumeric(step.operation)) {
      variables.push(step.operation);
      return variables;
    }
    
    // If the operation is a complex operator
    if (typeof step.operation === 'object' && step.operation !== null) {
      // Iterate through parameters
      step.operation.parameters.forEach(param => {
        if (typeof param === 'string' && !isNumeric(param)) {
          // It's a variable reference
          variables.push(param);
        } else if (typeof param === 'object' && param !== null && 'operation' in param) {
          // It's a nested operation, recursively extract its variables
          const nestedVariables = extractInputVariables(param);
          variables.push(...nestedVariables);
        }
      });
    }
    
    return [...new Set(variables)]; // Remove duplicates
  };
  
  // Helper to check if a string is numeric
  const isNumeric = (value: string): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(Number(value));
  };
  
  // Handle step node click
  const handleStepClick = (stepId: string) => {
    if (onStepClick) {
      onStepClick(stepId);
    } else {
      // Find the step
      const step = plan.steps.find(s => s.id === stepId);
      if (step) {
        toast({
          title: step.name,
          description: step.description || 'No description provided'
        });
      }
    }
  };
  
  // Calculate which steps are intermediate and which are final
  const isIntermediateStep = (stepId: string): boolean => {
    // A step is intermediate if its result is used as input in another step
    return plan.steps.some(step => {
      const inputs = extractInputVariables(step);
      const resultVar = plan.steps.find(s => s.id === stepId)?.result;
      return resultVar ? inputs.includes(resultVar) : false;
    });
  };

  // Is this the final output step?
  const isOutputStep = (stepId: string): boolean => {
    const step = plan.steps.find(s => s.id === stepId);
    return step?.result === plan.outputVariable;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Workflow className="h-5 w-5 mr-2" />
            <h3 className="text-sm font-medium">Formula Flow Visualization</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {stepNodes.length} Steps
          </Badge>
        </div>
        
        <ScrollArea className="h-[500px] w-full" ref={flowchartRef}>
          <div className="p-4 flex flex-col items-center">
            {/* Variables section */}
            {variableNodes.length > 0 && (
              <div className="mb-8 w-full">
                <div className="text-xs text-muted-foreground mb-2">Input Variables</div>
                <div className="flex flex-wrap gap-2">
                  {variableNodes.map(variable => (
                    <Badge 
                      key={variable} 
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Steps flowchart */}
            <div className="flex flex-col items-center space-y-8 w-full">
              {stepNodes.map((node, index) => (
                <div key={node.id} className="w-full flex flex-col items-center">
                  {/* Step card */}
                  <div 
                    className={`
                      w-4/5 max-w-md p-3 rounded-md cursor-pointer
                      border transition-all hover:shadow-md
                      ${node.hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                      ${isOutputStep(node.id) ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                    onClick={() => handleStepClick(node.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{node.name}</div>
                        {node.result && (
                          <div className="text-xs text-muted-foreground">
                            Result: <span className="font-mono">{node.result}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {node.inputs.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {node.inputs.length} inputs
                          </Badge>
                        )}
                        {isOutputStep(node.id) && (
                          <Badge className="bg-blue-500 text-xs">
                            Output
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Inputs display */}
                    {node.inputs.length > 0 && (
                      <div className="mt-2 pl-2 border-l-2 border-gray-200">
                        <div className="text-xs text-muted-foreground mb-1">Inputs:</div>
                        <div className="flex flex-wrap gap-1">
                          {node.inputs.map(input => {
                            // Determine if this input is a result from a previous step
                            const isStepResult = plan.steps.some(step => step.result === input);
                            return (
                              <Badge 
                                key={input} 
                                variant={isStepResult ? "default" : "outline"}
                                className="text-xs px-2 py-0"
                              >
                                {input}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Connector arrow if not the last step */}
                  {index < stepNodes.length - 1 && (
                    <div className="my-2 text-muted-foreground">
                      <ArrowDown className="h-5 w-5" />
                    </div>
                  )}
                  
                  {/* Final result indicator */}
                  {isOutputStep(node.id) && index === stepNodes.length - 1 && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-md border border-blue-200 text-center">
                      <div className="text-xs text-blue-700 mb-1">Final Result</div>
                      <div className="font-medium">{plan.outputVariable}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 