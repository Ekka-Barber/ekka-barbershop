import { FormulaOperator, FormulaStep, FormulaPlan } from '../types/salary';

/**
 * Type for the formula evaluation context
 */
export interface EvaluationContext {
  [key: string]: number;
}

/**
 * Result of a step evaluation
 */
export interface StepEvaluationResult {
  stepId: string;
  stepName: string;
  result: number;
  resultVariable: string;
  inputs: Record<string, number>;
  executionTimeMs?: number;
}

/**
 * Result of the formula evaluation
 */
export interface FormulaEvaluationResult {
  finalResult: number;
  steps: StepEvaluationResult[];
  success: boolean;
  error?: string;
  totalExecutionTimeMs: number;
}

/**
 * Utility for evaluating formula plans with performance optimizations
 */
export class FormulaEvaluator {
  // Cache for memoizing operation results
  private static operationCache = new Map<string, number>();
  
  /**
   * Evaluates a formula plan with the given variable values
   * @param plan The formula plan to evaluate
   * @param initialContext The initial variable values
   * @returns The evaluation result
   */
  static evaluateFormula(
    plan: FormulaPlan, 
    initialContext: EvaluationContext
  ): FormulaEvaluationResult {
    const startTime = performance.now();
    const context: EvaluationContext = { ...initialContext };
    const stepResults: StepEvaluationResult[] = [];
    
    try {
      // Clear the cache for a new evaluation
      this.operationCache.clear();
      
      // Process each step in order
      for (const step of plan.steps) {
        const stepStartTime = performance.now();
        
        // Get inputs for this step
        const inputs = this.getStepInputs(step, context);
        
        // Calculate result for this step
        const result = this.evaluateStep(step, context);
        
        // Store the result in the context
        if (step.result) {
          context[step.result] = result;
        }
        
        const stepEndTime = performance.now();
        
        // Record step results for display
        stepResults.push({
          stepId: step.id,
          stepName: step.name,
          result,
          resultVariable: step.result || 'unknown',
          inputs,
          executionTimeMs: stepEndTime - stepStartTime
        });
      }
      
      // Get the final result
      const finalResult = plan.outputVariable ? context[plan.outputVariable] || 0 : 0;
      
      const endTime = performance.now();
      
      return {
        finalResult,
        steps: stepResults,
        success: true,
        totalExecutionTimeMs: endTime - startTime
      };
    } catch (error) {
      const endTime = performance.now();
      
      return {
        finalResult: 0,
        steps: stepResults,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        totalExecutionTimeMs: endTime - startTime
      };
    }
  }
  
  /**
   * Gets the input variables used by a step
   * @param step The formula step
   * @param context The evaluation context
   * @returns Record of input variables and their values
   */
  private static getStepInputs(step: FormulaStep, context: EvaluationContext): Record<string, number> {
    const inputs: Record<string, number> = {};
    
    // If operation is a string (variable reference)
    if (typeof step.operation === 'string' && !this.isNumeric(step.operation)) {
      inputs[step.operation] = context[step.operation] || 0;
      return inputs;
    }
    
    // If operation is a FormulaOperator
    if (typeof step.operation === 'object') {
      const operation = step.operation as FormulaOperator;
      
      // Process each parameter
      for (const param of operation.parameters) {
        if (typeof param === 'string' && !this.isNumeric(param)) {
          // It's a variable reference
          inputs[param] = context[param] || 0;
        }
        // Nested operations are handled recursively in the evaluateOperator function
      }
    }
    
    return inputs;
  }
  
  /**
   * Evaluates a formula step
   * @param step The formula step to evaluate
   * @param context The evaluation context
   * @returns The result of the step
   */
  private static evaluateStep(step: FormulaStep, context: EvaluationContext): number {
    // If the operation is just a string (variable reference) or number
    if (typeof step.operation === 'string') {
      if (this.isNumeric(step.operation)) {
        return parseFloat(step.operation);
      }
      return context[step.operation] || 0;
    }
    
    if (typeof step.operation === 'number') {
      return step.operation;
    }
    
    // Otherwise, it's an operation
    const operation = step.operation as FormulaOperator;
    return this.evaluateOperator(operation, context);
  }
  
  /**
   * Evaluates a formula operator with memoization
   * @param operator The operator to evaluate
   * @param context The evaluation context
   * @returns The result of the operation
   */
  private static evaluateOperator(operator: FormulaOperator, context: EvaluationContext): number {
    const { type, parameters } = operator;
    
    // Create a cache key based on the operation type and parameters
    const cacheKey = this.createCacheKey(operator, context);
    
    // Check if the result is already in cache
    if (this.operationCache.has(cacheKey)) {
      return this.operationCache.get(cacheKey)!;
    }
    
    // Evaluate parameters first (if they're nested operations)
    const evaluatedParams = parameters.map(param => {
      if (typeof param === 'object' && param !== null) {
        if ('operation' in param) {
          // This is a nested operation
          const nestedStep = param as unknown as FormulaStep;
          return this.evaluateStep(nestedStep, context);
        }
        return 0; // Default for unknown object types
      }
      
      if (typeof param === 'string') {
        return this.isNumeric(param) ? parseFloat(param) : (context[param] || 0);
      }
      
      return param as number;
    });
    
    // Execute the operation based on type
    let result = 0;
    
    switch (type) {
      case 'add':
        result = evaluatedParams.reduce((sum, val) => sum + val, 0);
        break;
        
      case 'subtract':
        result = evaluatedParams[0] - evaluatedParams.slice(1).reduce((sum, val) => sum + val, 0);
        break;
        
      case 'multiply':
        result = evaluatedParams.reduce((product, val) => product * val, 1);
        break;
        
      case 'divide':
        if (evaluatedParams[1] === 0) {
          throw new Error('Division by zero');
        }
        result = evaluatedParams[0] / evaluatedParams[1];
        break;
        
      case 'percent':
        result = evaluatedParams[0] / 100;
        break;
        
      case 'round':
        result = Math.round(evaluatedParams[0]);
        break;
        
      case 'abs':
        result = Math.abs(evaluatedParams[0]);
        break;
        
      case 'min':
        result = Math.min(...evaluatedParams);
        break;
        
      case 'max':
        result = Math.max(...evaluatedParams);
        break;
        
      case 'equal':
        result = evaluatedParams[0] === evaluatedParams[1] ? 1 : 0;
        break;
        
      case 'notEqual':
        result = evaluatedParams[0] !== evaluatedParams[1] ? 1 : 0;
        break;
        
      case 'greaterThan':
        result = evaluatedParams[0] > evaluatedParams[1] ? 1 : 0;
        break;
        
      case 'lessThan':
        result = evaluatedParams[0] < evaluatedParams[1] ? 1 : 0;
        break;
        
      case 'greaterThanOrEqual':
        result = evaluatedParams[0] >= evaluatedParams[1] ? 1 : 0;
        break;
        
      case 'lessThanOrEqual':
        result = evaluatedParams[0] <= evaluatedParams[1] ? 1 : 0;
        break;
        
      case 'and':
        result = evaluatedParams.every(val => val !== 0) ? 1 : 0;
        break;
        
      case 'or':
        result = evaluatedParams.some(val => val !== 0) ? 1 : 0;
        break;
        
      case 'not':
        result = evaluatedParams[0] === 0 ? 1 : 0;
        break;
        
      case 'if':
        result = evaluatedParams[0] !== 0 ? evaluatedParams[1] : evaluatedParams[2];
        break;
        
      default:
        result = 0;
    }
    
    // Store the result in cache
    this.operationCache.set(cacheKey, result);
    
    return result;
  }
  
  /**
   * Creates a cache key for an operation
   * @param operator The operator
   * @param context The context
   * @returns A string cache key
   */
  private static createCacheKey(operator: FormulaOperator, context: EvaluationContext): string {
    const { type, parameters } = operator;
    
    // Create parameter keys
    const paramKeys = parameters.map(param => {
      if (typeof param === 'object' && param !== null) {
        if ('operation' in param) {
          // This is a nested operation, so we use its ID as a key
          const nestedStep = param as unknown as FormulaStep;
          return `s:${nestedStep.id}`;
        }
        return 'obj';
      }
      
      if (typeof param === 'string') {
        if (this.isNumeric(param)) {
          return `n:${param}`;
        }
        // It's a variable, so include its current value in the key
        return `v:${param}:${context[param] || 0}`;
      }
      
      return `n:${param}`;
    });
    
    return `${type}(${paramKeys.join(',')})`;
  }
  
  /**
   * Checks if a string is numeric
   * @param value The string to check
   * @returns Whether the string is numeric
   */
  private static isNumeric(value: string): boolean {
    return !isNaN(parseFloat(value)) && isFinite(Number(value));
  }
} 
