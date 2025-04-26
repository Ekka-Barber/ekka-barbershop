import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowDown, 
  AlertCircle, 
  AlertTriangle,
  Check,
  Workflow
} from 'lucide-react';
import { FormulaStep } from '@/lib/salary/types/salary';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepDependencyVisualizerProps {
  steps: FormulaStep[];
  variables: Array<{ name: string; source?: string; category?: string }>;
  outputVariable: string;
  onStepClick?: (stepId: string) => void;
}

export const StepDependencyVisualizer = ({ 
  steps,
  variables,
  outputVariable,
  onStepClick 
}: StepDependencyVisualizerProps) => {
  // Map to store step dependencies (which step depends on which variables)
  const [stepDependencies, setStepDependencies] = useState<Record<string, string[]>>({});
  
  // Map to store variable dependencies (which variables are created by which steps)
  const [variableSources, setVariableSources] = useState<Record<string, string>>({});
  
  // Map to store step dependency chain (which steps depend on which other steps)
  const [stepChain, setStepChain] = useState<Record<string, string[]>>({});
  
  // Track circular dependencies
  const [circularDependencies, setCircularDependencies] = useState<string[][]>([]);
  
  // Build dependency maps when steps or variables change
  useEffect(() => {
    if (!steps || steps.length === 0) return;
    
    const dependencies: Record<string, string[]> = {};
    const sources: Record<string, string> = {};
    const chain: Record<string, string[]> = {};
    
    // First, build variable source map
    steps.forEach(step => {
      if (step.result) {
        sources[step.result] = step.id;
      }
    });
    
    // Then, extract dependencies for each step
    steps.forEach(step => {
      const usedVars = extractVariablesFromStep(step);
      dependencies[step.id] = usedVars;
      
      // Calculate step-to-step dependencies
      const dependentSteps: string[] = [];
      usedVars.forEach(variable => {
        if (sources[variable]) {
          // This step uses a variable created by another step
          dependentSteps.push(sources[variable]);
        }
      });
      
      chain[step.id] = dependentSteps;
    });
    
    setStepDependencies(dependencies);
    setVariableSources(sources);
    setStepChain(chain);
    
    // Detect circular dependencies
    const circular = detectCircularDependencies(chain);
    setCircularDependencies(circular);
    
  }, [steps, variables]);
  
  // Extract all variables used in a step
  const extractVariablesFromStep = (step: FormulaStep): string[] => {
    const variables: string[] = [];
    
    // If the operation is a simple string (variable reference)
    if (typeof step.operation === 'string' && !isNumeric(step.operation)) {
      variables.push(step.operation);
      return variables;
    }
    
    // If the operation is a complex operator with parameters
    if (typeof step.operation === 'object' && step.operation !== null) {
      // Iterate through parameters
      (step.operation.parameters || []).forEach(param => {
        if (typeof param === 'string' && !isNumeric(param)) {
          // It's a variable reference
          variables.push(param);
        } else if (typeof param === 'object' && param !== null && 'operation' in param) {
          // It's a nested operation, recursively extract variables
          const nestedStep = param as unknown as FormulaStep;
          const nestedVars = extractVariablesFromStep(nestedStep);
          variables.push(...nestedVars);
        }
      });
    }
    
    return [...new Set(variables)]; // Remove duplicates
  };
  
  // Check if a string is numeric
  const isNumeric = (value: string): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(Number(value));
  };
  
  // Detect circular dependencies in the step chain
  const detectCircularDependencies = (chain: Record<string, string[]>): string[][] => {
    const circular: string[][] = [];
    const visited: Record<string, boolean> = {};
    const stack: Record<string, boolean> = {};
    
    const dfs = (stepId: string, path: string[] = []): boolean => {
      if (stack[stepId]) {
        // Found a cycle
        const cycleStart = path.indexOf(stepId);
        if (cycleStart >= 0) {
          const cycle = path.slice(cycleStart).concat(stepId);
          circular.push(cycle);
        }
        return true;
      }
      
      if (visited[stepId]) return false;
      
      visited[stepId] = true;
      stack[stepId] = true;
      path.push(stepId);
      
      const dependencies = chain[stepId] || [];
      for (const dep of dependencies) {
        if (dfs(dep, [...path])) {
          return true;
        }
      }
      
      stack[stepId] = false;
      return false;
    };
    
    // Check each step for cycles
    Object.keys(chain).forEach(stepId => {
      if (!visited[stepId]) {
        dfs(stepId);
      }
    });
    
    return circular;
  };
  
  // Find the step that creates the output variable
  const outputStep = useMemo(() => {
    return steps.find(step => step.result === outputVariable);
  }, [steps, outputVariable]);
  
  // Get the name or ID for a step
  const getStepLabel = (stepId: string): string => {
    const step = steps.find(s => s.id === stepId);
    return step?.name || `Step ${stepId}`;
  };
  
  // Get variable category color
  const getVariableColor = (varName: string): string => {
    const variable = variables.find(v => v.name === varName);
    const category = variable?.category || 'custom';
    
    switch (category) {
      case 'base': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sales': return 'bg-green-50 text-green-700 border-green-200';
      case 'commission': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'bonus': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'deduction': return 'bg-red-50 text-red-700 border-red-200';
      case 'employee': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  // Render step with its dependencies
  const renderStepNode = (stepId: string, depth: number = 0, visited: Set<string> = new Set()) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return null;
    
    // Check for circular dependencies
    const isInCircular = circularDependencies.some(cycle => cycle.includes(stepId));
    const isVisited = visited.has(stepId);
    
    // Track visited steps to avoid infinite recursion
    const newVisited = new Set(visited);
    newVisited.add(stepId);
    
    // Get variables used by this step
    const usedVars = stepDependencies[stepId] || [];
    
    // Get steps this step depends on
    const dependsOn = stepChain[stepId] || [];
    
    return (
      <div 
        key={stepId} 
        className={cn(
          "rounded-md p-3 border mt-1", 
          isInCircular 
            ? "bg-red-50 border-red-200" 
            : isVisited 
              ? "bg-amber-50 border-amber-200" 
              : "bg-white border-gray-200"
        )}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs font-medium"
              onClick={() => onStepClick?.(stepId)}
            >
              {step.name || `Step ${stepId}`}
            </Button>
            
            {step.result && (
              <Badge variant="outline" className={getVariableColor(step.result)}>
                {step.result}
              </Badge>
            )}
            
            {isInCircular && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This step is part of a circular dependency!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {dependsOn.length > 0 && (
            <Badge variant="outline" className="text-xs bg-gray-50">
              {dependsOn.length} dependencies
            </Badge>
          )}
        </div>
        
        {usedVars.length > 0 && (
          <div className="mt-2 pl-2 border-l-2 border-gray-200">
            <div className="text-xs text-muted-foreground mb-1">Uses variables:</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {usedVars.map(varName => (
                <Badge 
                  key={varName} 
                  variant="outline" 
                  className={cn(
                    "text-xs", 
                    getVariableColor(varName),
                    variableSources[varName] ? "border-dashed" : ""
                  )}
                >
                  {varName}
                  {variableSources[varName] && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 opacity-70">↑</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Created by: {getStepLabel(variableSources[varName])}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Recursively render steps that this step depends on */}
        {dependsOn.length > 0 && !isVisited && (
          <div className="mt-2 pl-4 border-l border-dashed border-gray-300">
            <div className="text-xs text-muted-foreground flex items-center mb-1">
              <ArrowDown className="h-3 w-3 mr-1" />
              Depends on:
            </div>
            {dependsOn.map(depStepId => (
              renderStepNode(depStepId, depth + 1, newVisited)
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Workflow className="h-5 w-5 mr-2" />
            Step Dependencies
          </CardTitle>
          
          {circularDependencies.length > 0 ? (
            <Badge variant="destructive" className="font-normal">
              <AlertCircle className="h-3 w-3 mr-1" />
              Circular Dependencies
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal">
              <Check className="h-3 w-3 mr-1" />
              Valid Dependencies
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {circularDependencies.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Circular Dependencies Detected</AlertTitle>
            <AlertDescription>
              <div className="text-sm mt-1">
                These cycles create infinite loops that will cause calculation errors:
              </div>
              <ul className="list-disc pl-4 mt-1">
                {circularDependencies.map((cycle, i) => (
                  <li key={i}>
                    {cycle.map((stepId, j) => (
                      <span key={stepId}>
                        {j > 0 && <span className="mx-1">→</span>}
                        {getStepLabel(stepId)}
                      </span>
                    ))}
                    <span className="mx-1">→</span>
                    {getStepLabel(cycle[0])}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="h-[400px] pr-4">
          {steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No steps defined yet
            </div>
          ) : outputStep ? (
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center mb-2">
                <span>Starting from output variable: </span>
                <Badge variant="outline" className={`ml-2 ${getVariableColor(outputVariable)}`}>
                  {outputVariable}
                </Badge>
              </div>
              {renderStepNode(outputStep.id)}
            </div>
          ) : (
            <div className="space-y-2">
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>No Output Step</AlertTitle>
                <AlertDescription>
                  No step creates the output variable <Badge variant="outline">{outputVariable}</Badge>
                </AlertDescription>
              </Alert>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">All Steps:</h4>
                <div className="space-y-2">
                  {steps.map(step => (
                    <div key={step.id} className="border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{step.name || `Step ${step.id}`}</span>
                        {step.result && (
                          <Badge variant="outline" className={getVariableColor(step.result)}>
                            {step.result}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 